const globals = require('../utilities/globals');
const use = require('../utilities/use');

// We store queries results for one week
const collection = db.get("tracks");
const time = 7 * 24 * 3600;
collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: time });

exports.tracks = function(req, res) {
    log.debug("request url", req.url);
    log.debug("request params", req.params);
    let artist = req.params.artist;
    let country_code = req.params.country_code;
    let spotify_artist = undefined;
    res.type('json');

    if (artist != undefined && country_code != undefined) {
        artist = use.dia(artist).toLowerCase();
        country_code = use.dia(country_code).toLowerCase();

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
            return collection.findOne({artist: artist, country_code: country_code});
        })
        .then(doc => {
            return new Promise((resolve, reject) => {
                if (doc) {
                    log.debug("from mongodb");
                    log.debug("tracks\n", doc.tracks);
                    log.debug("tracks length", doc.tracks.length);
                    res.status(200).end(JSON.stringify({tracks: doc.tracks}));
                    reject(false);
                }
                else {
                    resolve();
                }
            });
        })
        // If no database results, we make request to Spotify to get top tracks.
        .then(data => {
            return spotifyApi.getArtistTopTracks(spotify_artist.id, country_code);
        })
        .then(data => {
            let preview = false;

            let tracks = [];
            data.body.tracks.forEach(track => {
                if (!preview) {
                    preview = track.preview_url != null ? true : false;
                }
                tracks.push({
                    id: use.is_defined(track.id),
                    name: use.is_defined(track.name),
                    album: use.is_defined(track.album).name,
                    preview_url: use.is_defined(track.preview_url),
                    popularity: use.is_defined(track.popularity)
                });
            });

            // We send results only if there is preview's URL.
            if (preview) {
                tracks.sort(function(a, b) {
                    return b.popularity - a.popularity;
                });
                log.debug("tracks\n", tracks);
                log.debug("tracks length", tracks.length);
                res.status(200).end(JSON.stringify({tracks: tracks}));

                // In fine, we insert new data in database
                collection.insert({
                    artist: artist,
                    country_code: country_code,
                    tracks: tracks,
                    createdAt: new Date()
                });
                log.debug("insert in mongodb");
            }
            else {
                log.error("preview_not_found");
                res.status(404).end(JSON.stringify({preview_not_found: true}));
            }
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
        log.error("no_artist_and_code_provided");
        res.status(404).end(JSON.stringify({no_artist_and_code_provided: true}));
    }
};
