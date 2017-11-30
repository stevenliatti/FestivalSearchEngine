const consts = require('./consts');
const use = require('./use');

exports.infos = function(req, res) {
    log.debug("request url", req.url);
    log.debug("request params", req.params);
    let artist = req.params.artist;
    res.type('json');

    if (artist != undefined) {
        artist = artist != undefined ? use.dia(artist).toLowerCase() : undefined;

        axios.all([
            axios.get("https://en.wikipedia.org/w/api.php", {
                params: {
                    format: "json",
                    action: "query",
                    prop: "extracts",
                    exintro: "",
                    explaintext: "",
                    indexpageids: "",
                    titles: artist
                }
            }),
            axios.get(music_brainz_url + artist),
            axios.get(use.url_bands_in_town(artist, "asdf"))
        ])
        .then(axios.spread((wk, mb, bit) => {
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
                image: use.is_defined(bit.data.image_url),
                thumb: use.is_defined(bit.data.thumb_url),
                facebook: use.is_defined(bit.data.facebook_page_url)
            };

            if (wk.data) {
                if (wk.data.query.pages.length > 0) {
                    const id = wk.data.query.pageids[0];
                    const wiki = wk.data.query.pages[id];

                    let description = "";
                    // this test to discrimine if there is another page with same name
                    if (wiki.extract.length >= artist.length * 2) {
                        description = wiki.extract;
                    }

                    infos.name = use.is_defined(wiki.title);
                    infos.description = description;
                }
            }
            else {
                if (mb.data && mb.data.artists.length >=0) {
                    const mb_artist = mb.data.artists[0];
                    const mb_life_span = mb_artist["life-span"];
                    
                    infos.name = use.is_defined(mb_artist.name);
                    infos.type = use.is_defined(mb_artist.type);
                    infos.country = use.is_defined(mb_artist.country);
                    infos.disambiguation = use.is_defined(mb_artist.disambiguation);
                    infos.life_span.ended = use.is_defined(mb_life_span.ended);
                    infos.life_span.begin = use.is_defined(mb_life_span.begin);
                    infos.life_span.end = use.is_defined(mb_life_span.end);
                }
            }
            
            log.debug("infos\n", infos);
            res.status(200).end(JSON.stringify({infos: infos}));
        }))
        .catch(error => {
            log.error(error);
            res.status(404).end(JSON.stringify({artist_not_found: true}));
        });
    }
    else {
        log.error("no_artist_provided");
        res.status(404).end(JSON.stringify({no_artist_provided: true}));
    }
};
