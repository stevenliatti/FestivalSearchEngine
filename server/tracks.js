const consts = require('./consts');
const use = require('./use');

exports.tracks = function(req, res) {
    log.debug("request url", req.url);
    log.debug("request params", req.params);
    let artist = req.params.artist;
    let country_code = req.params.country_code;
    res.type('json');

    if (artist != undefined && country_code != undefined) {
        artist = artist != undefined ? use.dia(artist).toLowerCase() : undefined;
        country_code = country_code != undefined ? use.dia(country_code).toLowerCase() : undefined;

        spotifyApi.clientCredentialsGrant()
        .then(data => {
            spotifyApi.setAccessToken(data.body['access_token']);
            return spotifyApi.searchArtists(artist);
        })
        .then(data => {
            log.debug(spotifyApi.getAccessToken());
            const spotify_artist = data.body.artists.items[0];
            return spotifyApi.getArtistTopTracks(spotify_artist.id, country_code);
        })
        .then(data => {
            let preview = false;

            let tracks = [];
            data.body.tracks.forEach(track => {
                preview = track.preview_url != null ? true : false;
                tracks.push({
                    id: use.is_defined(track.id),
                    name: use.is_defined(track.name),
                    album: use.is_defined(track.album).name,
                    preview_url: use.is_defined(track.preview_url),
                    popularity: use.is_defined(track.popularity)
                });
            });

            if (preview) {
                log.debug("tracks\n", tracks);
                log.debug("tracks length", tracks.length);
                res.status(200).end(JSON.stringify({tracks: tracks}));
            }
            else {
                log.error("preview_not_found");
                res.status(404).end(JSON.stringify({preview_not_found: true}));
            }
        })
        .catch(error => {
            log.error(error);
            log.error("artist_not_found");
            res.status(404).end(JSON.stringify({artist_not_found: true}));
        });
    }
    else {
        log.error("no_artist_and_code_provided");
        res.status(404).end(JSON.stringify({no_artist_and_code_provided: true}));
    }
};
