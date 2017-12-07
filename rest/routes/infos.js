const globals = require('../utilities/globals');
const use = require('../utilities/use');

// We store queries results for one week
const collection = db.get("infos");
const time = 7 * 24 * 3600;
collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: time });

const criteria = [/\bband\b/, /\bsong\b/, /\bsinger\b/, /\bmusic group\b/, /\bsongwriter\b/, /\brapper\b/];

// Create URL parameters for get Wikipedia page
let wiki_page = function(id) {
    let p = {
        params: {
            format: "json",
            action: "query",
            prop: "extracts|pageviews",
            exintro: "",
            explaintext: "",
            indexpageids: "",
            pageids: id
        }
    };
    return p;
};

exports.infos = function(req, res) {
    log.debug("request url", req.url);
    log.debug("request params", req.params);
    let artist = req.params.artist;
    let spotify_artist = undefined;
    res.type("json");

    if (artist != undefined) {
        artist = use.dia(artist).toLowerCase();

        let infos = {
            name: "",
            description: "",
            type: "",
            country: "",
            disambiguation: "",
            life_span: {
                ended: "",
                begin: "",
                end: ""
            },
            image: "",
            thumb: "",
            facebook: "",
            genres: [],
            id: "",
            images: []
        };

        // First, we correct the name of given artist by making 
        // a request to Spotify. If there is not artist, we send error.
        use.check_spotify_token()
        .then(() => {
            return spotifyApi.searchArtists(artist);
        })
        .then(data => {
            log.debug("token spotify", spotifyApi.getAccessToken());
            return new Promise((resolve, reject) => {
                if (data.body.artists.total === 0) {
                    reject(true);
                }
                else {
                    spotify_artist = data.body.artists.items[0];
                    artist = spotify_artist.name.toLowerCase();
                    resolve();
                }
            });
        })
        // We look in database if there is already results for this query
        .then(() => {
            return collection.findOne({artist: artist});
        })
        .then(doc => {
            return new Promise((resolve, reject) => {
                if (doc) {
                    log.debug("from mongodb");
                    log.debug("infos\n", doc.infos);
                    res.status(200).end(JSON.stringify({infos: doc.infos}));
                    reject(false);
                }
                else {
                    resolve();
                }
            });
        })
        // If no database results, we make multiple requests to get infos
        // from Wikipedia, MusicBrainz and BandsInTown.
        .then(() => {
            infos.name = spotify_artist.name;
            infos.genres = spotify_artist.genres;
            infos.id = spotify_artist.id;
            infos.images = spotify_artist.images;

            // We send get request with artist name and variants to wiki search
            return axios.all([
                axios.get(wiki_url, {
                    params: {
                        format: "json",
                        action: "query",
                        list: "search",
                        srlimit: 20,
                        srsearch: spotify_artist.name
                    }
                }),
                axios.get(music_brainz_url + artist),
                axios.get(use.url_bands_in_town(artist, "asdf"))
            ]);
        })
        .then(axios.spread((wk, mb, bit) => {
            // We set infos from BandsInTown and MusicBrainz
            infos.image = use.is_defined(bit.data.image_url);
            infos.thumb = use.is_defined(bit.data.thumb_url);
            infos.facebook = use.is_defined(bit.data.facebook_page_url);

            if (mb.data) {
                if (mb.data.artists.length >=0) {
                    const mb_artist = mb.data.artists[0];
                    const mb_life_span = mb_artist["life-span"];
                    
                    infos.type = use.is_defined(mb_artist.type);
                    infos.country = use.is_defined(mb_artist.country);
                    infos.disambiguation = use.is_defined(mb_artist.disambiguation);
                    infos.life_span.ended = use.is_defined(mb_life_span.ended);
                    infos.life_span.begin = use.is_defined(mb_life_span.begin);
                    infos.life_span.end = use.is_defined(mb_life_span.end);
                }
            }
    
            // Next, foreach page id receive from Wikipedia, we check if the snippet
            // meets several criteria and add it to an array of get requests (pageids)
            if (wk.data.query.searchinfo.totalhits != 0) {
                let pageids = [];
                const pages = wk.data.query.search;
                
                for (let page of pages) {
                    const contain_criteria = criteria.some(c => c.test(page.snippet));
                    const contain_genres = new RegExp(infos.genres.join("|"), "i").test(page.snippet);
                    const contain_name = new RegExp(spotify_artist.name, "i").test(page.title);
                    
                    if ((contain_criteria || contain_genres) && contain_name) {
                        pageids.push(axios.get(wiki_url, wiki_page(page.pageid)));
                    }
                }

                // If there is pageids, we send more requests to Wikipedia
                if (pageids.length > 0) { return axios.all(pageids); }
                else { return new Promise((resolve, reject) => { resolve(); }); }
            }
            else { return new Promise((resolve, reject) => { resolve(); }); }
        }))
        .then(results => {
            // Finally (with Wikipedia), we compute a "score" from each page, based on
            // the number of views for each page. To set infos.description, we take the 
            // page with best score.
            if (results != undefined) {
                let pages = [];
                results.map(r => r.data.query).forEach(page => {
                    let id = page.pageids[0];
                    let sum = 0;
                    let pageviews = page.pages[id].pageviews;
                    for (let c in pageviews) {
                        sum += pageviews[c] != null ? pageviews[c] : 0;
                    }
                    pages.push({score: sum, extract: page.pages[id].extract});
                });
                pages.sort(function(a, b) {
                    return b.score - a.score;
                });
                infos.description = pages[0].extract;
            }

            log.debug("infos\n", infos);
            res.status(200).end(JSON.stringify({infos: infos}));

            // In fine, we insert new data in database
            collection.insert({
                artist: artist,
                infos: infos,
                createdAt: new Date()
            });
            log.debug("insert in mongodb");
        })
        .catch(error => {
            if (error) {
                log.error(error);
                log.error("artist_not_found");
                res.status(404).end(JSON.stringify({artist_not_found: true}));
            }
        });
    }
    else {
        log.error("no_artist_provided");
        res.status(404).end(JSON.stringify({no_artist_provided: true}));
    }
};
