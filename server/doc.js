/**
 * @apiDefine DefGetEvents
 *
 * @apiParam  {String} artist Optional artist name
 * @apiParam  {String} location Optional location name
 *
 * @apiError NoParam No location nor artist was given to the API
 * @apiError ArtistNotFound The given artist wasn't found
 * @apiError LocationNotFound The given location wasn't found
 *
 * @apiSuccess {Object[]} events Array of events
 * @apiSuccess {String}   events.id Event's id
 * @apiSuccess {String}   events.title Event's title
 * @apiSuccess {String}   events.venue Event's venue
 * @apiSuccess {String}   events.date Event's date, format : "YYYY-MM-DD hh:mm:ss"
 * @apiSuccess {String}   events.address Event's postal address
 * @apiSuccess {String}   events.city Event's city
 * @apiSuccess {String}   events.region Event's region
 * @apiSuccess {String}   events.postal_code Event's postal code
 * @apiSuccess {String}   events.latitude Event's latitude
 * @apiSuccess {String}   events.longitude Event's longitude
 * @apiSuccess {String}   events.offer Event's offer URL to buy ticket for example
 *
 * @apiSuccess {Object[]} events.performers Event's performers
 * @apiSuccess {String}   events.performers.name Performer's name
 * @apiSuccess {String}   events.performers.short_bio Performer's kind of music (short)
 * @apiSuccess {String}   events.performers.thumb Little image URL of the artist
 * @apiSuccess {String}   events.performers.image Image URL of the artist
 * @apiSuccess {String}   events.performers.facebook Facebook URL of the artist
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Metallica",
 *   "location": "Geneva"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "events": [
 *     {
 *       "id": "42",
 *       "title": "Metallica",
 *       "venue": "Geneva Palexpo",
 *       "date": "2018-04-11 00:00:00",
 *       "address": "Case Postale 112 Grand-Saconnex",
 *       "city": "Geneva",
 *       "region": "Genève",
 *       "postal_code": "CH-1218",
 *       "latitude": "46.2",
 *       "longitude": "6.16667",
 *       "offer": "https://www.bandsintown.com/t/17938982?app_id=hehe&came_from=267",
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
 */
 
 /**
 * @apiDefine DefGetInfos
 *
 * @apiParam  {String} artist Artist name
 *
 * @apiError ArtistNotFound The given artist wasn't found
 * @apiError NoArtist No artist was given to the API
 *
 * @apiSuccess {Object}  artist Artist object
 * @apiSuccess {String}  artist.name Artist's name
 * @apiSuccess {String}  artist.type Information to know if it's a band or single artist
 * @apiSuccess {String}  artist.country Artist's country origin
 * @apiSuccess {String}  artist.disambiguation Artist's disambiguation = kind of music
 * @apiSuccess {Object}  artist.life_span Infos about life span of artist
 * @apiSuccess {Boolean} artist.life_span.ended If the artist/group don't exist anymore
 * @apiSuccess {String}  artist.life_span.begin Begin date of artist/group, format : "YYYY-MM-DD" or "YYYY-MM" or "YYYY"
 * @apiSuccess {String}  artist.life_span.end End date of artist/group, format : "YYYY-MM-DD" or "YYYY-MM" or "YYYY"
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Nirvana"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "name": "Nirvana",
 *   "type": "Group",
 *   "country": "US",
 *   "disambiguation": "90s US grunge band",
 *   "life_span": {
 *      "ended": true,
 *      "begin": "1988-02",
 *      "end": "1994-04-05"
 *    },
 * }
 */

 /**
 * @apiDefine DefGetTracks
 *
 * @apiParam  {String} artist The artist name
 *
 * @apiError ArtistNotFound The given artist wasn't found
 * @apiError NoPreview No top tracks has preview
 *
 * @apiSuccess {Object[]} tracks Array of tracks
 * @apiSuccess {String}   tracks.id Tracks's id
 * @apiSuccess {String}   tracks.name Tracks's title
 * @apiSuccess {String}   tracks.album Name of the album the track's in
 * @apiSuccess {String}   tracks.preview_url URL of the track preview
 *
 *
 * @apiParamExample  {json} Request-Example:
 * {
 *   "artist": "Metallica"
 * }
 *
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "tracks": [
 *     {
 *       "id": "42",
 *       "name": "Au pays des toupoutous",
 *		 "album": "Coucou les loulous",
 *       "preview_url": "www.republiquedesmangues.com"
 *     }
 *   ]
 * }
 */
