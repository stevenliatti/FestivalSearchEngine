const globals = require("./utilities/globals");
const use = require("./utilities/use");
const events = require("./routes/events");
const infos = require("./routes/infos");
const tracks = require("./routes/tracks");

const path = require("path");

app.use(cors());
app.use("/doc", express.static(path.join(__dirname, "doc")));

app.get("/doc", function(req, res) {
    log.debug("doc");
    res.sendFile(path.join(__dirname, "doc/index.html"));
});

/**
 * @api {get} /events/artist=:artist?/location=:location? 
 * 
 * @apiName GetEvents
 * @apiGroup events
 * @apiVersion  0.1.0
 * 
 * @apiDescription Return futur events in function of artist and location from Eventful and BandsInTown.
 * Artist and location params cannot be empty at same time (no_params_provided error).
 * To note that all string fields can be string empty ("").
 * 
 * @apiParam  {String} artist Optional artist name
 * @apiParam  {String} location Optional location name
 *
 * @apiSuccess {Object[]} events Array of events (it can be empty)
 * @apiSuccess {String}   events.id Event"s id
 * @apiSuccess {String}   events.title Event"s title
 * @apiSuccess {String}   events.venue Event"s venue
 * @apiSuccess {String}   events.date Event"s date, format : "YYYY-MM-DD hh:mm:ss"
 * @apiSuccess {String}   events.address Event"s postal address
 * @apiSuccess {String}   events.city Event"s city
 * @apiSuccess {String}   events.region Event"s region
 * @apiSuccess {String}   events.postal_code Event"s postal code
 * @apiSuccess {String}   events.country Event"s country
 * @apiSuccess {String}   events.latitude Event"s latitude
 * @apiSuccess {String}   events.longitude Event"s longitude
 * @apiSuccess {String}   events.offer Event"s offer URL to buy ticket for example
 *
 * @apiSuccess {Object[]} events.performers Event"s performers
 * @apiSuccess {String}   events.performers.name Performer"s name
 * @apiSuccess {String}   events.performers.short_bio Performer"s kind of music (short)
 * @apiSuccess {String}   events.performers.thumb Little image URL of the artist
 * @apiSuccess {String}   events.performers.image Image URL of the artist
 * @apiSuccess {String}   events.performers.facebook Facebook URL of the artist
 *
 * @apiError no_params_provided {Boolean} No location nor artist was given to the API
 * @apiError no_events {Boolean} No events found
 * 
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Metallica",
 *   "location": "Genève"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "events": [
 *     {
 *       "id": "E0-001-101271887-2",
 *       "title": "Metallica",
 *       "venue": "Geneva Palexpo",
 *       "date": "2018-04-11 00:00:00",
 *       "address": "Case Postale 112 Grand-Saconnex",
 *       "city": "Geneva",
 *       "region": "Genève",
 *       "postal_code": "CH-1218",
 *       "country": "Switzerland",
 *       "latitude": "46.2",
 *       "longitude": "6.16667",
 *       "offer": "http://eventful.com/events/metallica-/E0-001-101271887-2?utm_source=apis&utm_medium=apim&utm_campaign=apic",
 *       "performers": [
 *         {
 *           "name": "Metallica",
 *           "short_bio": "Metal / Rock",
 *           "thumb": "https://s3.amazonaws.com/bit-photos/thumb/6874519.jpeg",
 *           "image": "https://s3.amazonaws.com/bit-photos/large/6874519.jpeg",
 *           "facebook": ""
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * @apiErrorExample {json} No params provided
 * HTTP/1.1 404 Not Found
 * {
 *   "no_params_provided": true
 * }
 * 
 * @apiErrorExample {json} No events
 * HTTP/1.1 404 Not Found
 * {
 *   "no_events": true
 * }
 */
app.get("/events/artist=:artist?/location=:location?", events.events);

 /**
 * @api {get} /infos/artist=:artist 
 * 
 * @apiName GetInfos
 * @apiGroup infos
 * @apiVersion  0.1.0
 * 
 * @apiDescription Return infos about artist from Wikipedia, MusicBrainz and BandsInTown.
 * To note that all string fields can be string empty ("").
 * 
 * @apiParam  {String} artist Artist name
 *
 * @apiSuccess {Object}    artist Artist object
 * @apiSuccess {String}    artist.name Artist"s name
 * @apiSuccess {String}    artist.description Artist"s description (from wikipedia)
 * @apiSuccess {String}    artist.type Information to know if it"s a band or single artist
 * @apiSuccess {String}    artist.country Artist"s country origin
 * @apiSuccess {String}    artist.disambiguation Artist"s disambiguation = kind of music
 * @apiSuccess {Object}    artist.life_span Infos about life span of artist
 * @apiSuccess {Boolean}   artist.life_span.ended If the artist/group don"t exist anymore
 * @apiSuccess {String}    artist.life_span.begin Begin date of artist/group, format : "YYYY-MM-DD" or "YYYY-MM" or "YYYY"
 * @apiSuccess {String}    artist.life_span.end End date of artist/group, format : "YYYY-MM-DD" or "YYYY-MM" or "YYYY"
 * @apiSuccess {String}    artist.image Image URL
 * @apiSuccess {String}    artist.thumb Thumb URL
 * @apiSuccess {String}    artist.facebook Facebook URL
 * @apiSuccess {String[]}  artist.genres Array of string containing genres from Spotify
 * @apiSuccess {String}    artist.id Spotify"s id
 * @apiSuccess {Object[]}  artist.images Additionnal images from Spotify
 * @apiSuccess {Integer}   artist.images.height Height of image
 * @apiSuccess {Integer}   artist.images.width Width of image
 * @apiSuccess {String}    artist.images.url URL of image
 * 
 * @apiError artist_not_found {Boolean} The given artist wasn"t found
 * @apiError no_artist_provided {Boolean} No artist was given to the API
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Nirvana"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   infos : {
 *     "name": "Nirvana",
 *     "description": "",
 *     "type": "Group",
 *     "country": "US",
 *     "disambiguation": "90s US grunge band",
 *     "life_span": {
 *        "ended": true,
 *        "begin": "1988-02",
 *        "end": "1994-04-05"
 *      },
 *      "image": "https://s3.amazonaws.com/bit-photos/large/267414.jpeg",
 *      "thumb": "https://s3.amazonaws.com/bit-photos/thumb/267414.jpeg",
 *      "facebook": "https://www.facebook.com/pages/Nervana/409308175799582"
 *   }
 * }
 * 
 * @apiErrorExample {json} Artist not found
 * HTTP/1.1 404 Not Found
 * {
 *   "artist_not_found": true
 * }
 * 
 * @apiErrorExample {json} No artist provided
 * HTTP/1.1 404 Not Found
 * {
 *   "no_artist_provided": true
 * }
 */
app.get("/infos/artist=:artist?", infos.infos);

/**
 * @api {get} /tracks/artist=:artist/country_code=:country_code
 * 
 * @apiName GetTracks
 * @apiGroup tracks
 * @apiVersion  0.1.0
 *
 * @apiDescription Return the top-tracks infos for this artist and country code from Spotify.
 * Also contains the track preview"s URL if existent.
 * To note that all string fields can be string empty ("").
 * 
 * @apiParam  {String} artist The artist name
 * @apiParam  {String} country_code The country"s code (ISO 3166-1 alpha-2)
 *
 * @apiSuccess {Object[]} tracks Array of tracks
 * @apiSuccess {String}   tracks.id Tracks"s id
 * @apiSuccess {String}   tracks.name Tracks"s title
 * @apiSuccess {String}   tracks.album Name of the album the track"s in
 * @apiSuccess {String}   tracks.preview_url URL of the track preview
 * @apiSuccess {Number}   tracks.popularity Spotify"s popularity rank
 *
 * @apiError artist_not_found {Boolean} The given artist wasn"t found
 * @apiError no_artist_and_code_provided {Boolean} No artist and code was given to the API 
 * @apiError preview_not_found {Boolean} No top tracks has preview
 * 
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Metallica",
 *   "country_code": "US"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "tracks": [
 *     {
 *       "id": "10igKaIKsSB6ZnWxPxPvKO",
 *       "name": "Nothing Else Matters",
 *       "album": "Metallica",
 *       "preview_url": "https://p.scdn.co/mp3-preview/a2a9c13416fc981d035e75f16ec63b0d8e6486ba?cid=bfa3df6d31284912b0ed76fa6c5673b5",
 *       "popularity": 68
 *     }
 *   ]
 * }
 * 
 * @apiErrorExample {json} Artist not found
 * HTTP/1.1 404 Not Found
 * {
 *   "artist_not_found": true
 * }
 * 
 * @apiErrorExample {json} No artist and code provided
 * HTTP/1.1 404 Not Found
 * {
 *   "no_artist_and_code_provided": true
 * }
 * 
 * @apiErrorExample {json} No top tracks has preview
 * HTTP/1.1 404 Not Found
 * {
 *   "preview_not_found": true
 * }
 */
app.get("/tracks/artist=:artist?/country_code=:country_code?", tracks.tracks);

app.all("*", function(req, res) {
	log.error("Requested:", req.url);
	res.status(404).send("404 Page not found.");
});

app.listen(8080);
