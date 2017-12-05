const globals = require('../utilities/globals');
const use = require('../utilities/use');

// We store queries results for one week
const collection = db.get("infos");
const time = 7 * 24 * 3600;
collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: time });

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

            // To be as good as possible to get the good wiki,
            // we send get request with artist name and variants.
            return axios.all([
                axios.get(wiki_url, use.wiki_params(artist)),
                axios.get(wiki_url, use.wiki_params(spotify_artist.name)),
                axios.get(wiki_url, use.wiki_params(artist + "_(band)")),
                axios.get(wiki_url, use.wiki_params(artist + "_(group)")),
                axios.get(wiki_url, use.wiki_params(artist + "_(singer)")),
                axios.get(music_brainz_url + artist),
                axios.get(use.url_bands_in_town(artist, "asdf"))
            ]);
        })
        .then(axios.spread((wk, wk_spotify, wk_band, wk_group, wk_singer, mb, bit) => {

            // And then, with the two next functions, we check if the first paragraph
            // contains words about music and song.
            let check_words = function(str) {
                if (str) {
                    str = str.toLowerCase();
                    let test =
                        str.includes(" band") ||
                        str.includes(" song") ||
                        str.includes(" singer") ||
                        str.includes(" music group");
                    return test;
                }
                return false;
            };
    
            let check_wiki = function(wk) {
                if (wk.data) {
                    if (wk.data.query.pages) {
                        const id = wk.data.query.pageids[0];
                        const wiki = wk.data.query.pages[id];
                        if (check_words(wiki.extract)) {
                            infos.description = wiki.extract;
                        }
                    }
                }
            };

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

            check_wiki(wk);
            check_wiki(wk_spotify);
            check_wiki(wk_band);
            check_wiki(wk_group);
            check_wiki(wk_singer);

            log.debug("infos\n", infos);
            res.status(200).end(JSON.stringify({infos: infos}));

            // In fine, we insert new data in database
            collection.insert({
                artist: artist,
                infos: infos,
                createdAt: new Date()
            });
            log.debug("insert in mongodb");
        }))
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
