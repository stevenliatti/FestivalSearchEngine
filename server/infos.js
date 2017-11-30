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
            let infos = undefined;

            if (wk.data) {
                const id = wk.data.query.pageids[0];
                const wiki = wk.data.query.pages[id];

                let description = "";
                // this test to discrimine if there is another page with same name
                if (wiki.extract.length >= artist.length * 2) {
                    description = wiki.extract;
                }

                infos = {
                    name: wiki.title,
                    description: description,
                    type: "",
                    country: "",
                    disambiguation: "",
                    life_span: {
                        ended: "",
                        begin: "",
                        end: ""
                    }
                };
            }
            else {
                const mb_artist = mb.data.artists[0];
                const mb_life_span = mb_artist["life-span"];
                infos = {
                    name: mb_artist.name,
                    description: "",
                    type: mb_artist.type ? mb_artist.type : "",
                    country: mb_artist.country ? mb_artist.country : "",
                    disambiguation: mb_artist.disambiguation ? mb_artist.disambiguation : "",
                    life_span: {
                        ended: mb_life_span.ended ? mb_life_span.ended : "",
                        begin: mb_life_span.begin ? mb_life_span.begin : "",
                        end: mb_life_span.end ? mb_life_span.end : ""
                    }
                };
            }
            infos.image = bit.data.image_url;
            infos.thumb = bit.data.thumb_url;
            infos.facebook = bit.data.facebook_page_url;
            
            log.debug("infos\n", infos);
            res.status(200).end(JSON.stringify({infos: infos}));
        }))
        .catch(error => {
            log.error(error);
            res.status(404).end(JSON.stringify({
                artist_not_found: error,
                artist_request: artist
            }));
        });
    }
    else {
        log.error("no_artist_provided");
        res.status(404).end(JSON.stringify({no_artist_provided: true}));
    }
};
