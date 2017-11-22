const express = require('express');
const request = require('request');
const Log = require("log");
const log = new Log("debug");
const app = express();
const cors = require('cors');

app.use(cors());

const key_eventful = "WSpR5fzQ69N3w2FL";
const url_eventful = "http://api.eventful.com/json/events/search?app_key=" + key_eventful +
"&location=Switzerland&category=music,festivals_parades&page_size=100&date=future&sort_order";


app.get('/events', function(req, res) {
	let events = [];
	request(url_eventful, function (error, response, body) {
		if (error) {
			log.error("Error : ", error);
		}
		else {
			log.debug('statusCode:', response.statusCode);
			if (body) {
				let b = JSON.parse(body);
				b.events.event.forEach(e => {
					events.push({id : e.id, title: e.title, city_name: e.city_name});
				});
				let ret = {"error" : false, "error_message" : "", "events" : events};
				res.type('json');
				res.end(JSON.stringify(ret));
			}
			else {
				log.error("eventful sucks");
				res.type('json');
				res.end(JSON.stringify({"error" : true, "error_message" : "eventful sucks", "events" : []}));
			}
		}
	});
});

/**
 * @api {get} /events/artist=:artist?/location=:location? Return futur events in function of artist and location
 * @apiName GetEvents
 * @apiGroup events
 * @apiVersion  0.1.0
 * 
 * @apiParam  {String} artist Optional artist name
 * @apiParam  {String} location Optional location name
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
 * @apiSuccess {String}   events.performers.music_kind Performer's kind of music (short)
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
 *           "music_kind": "Metal / Rock",
 *           "thumb": "https://s3.amazonaws.com/bit-photos/thumb/6874519.jpeg",
 *           "image": "https://s3.amazonaws.com/bit-photos/large/6874519.jpeg",
 *           "facebook": ""
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
app.get('/events/artist=:artist?/location=:location?', function(req, res) {
	console.log(req.params);
	let artist = req.params.artist;
	let location = req.params.location;

	if (artist == undefined && location == undefined) {
		res.send({"events": {}});
	}
	else {
		res.send({});
	}
});

/**
 * @api {get} /infos/artist=:artist Return infos of the artist
 * @apiName GetInfos
 * @apiGroup infos
 * @apiVersion  0.1.0
 * 
 * 
 * @apiParam  {String} artist Artist name
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
app.get('/infos/artist=:artist', function(req, res) {

});

/**
 * @api {get} /tracks/artist=:artist Return the top-tracks infos for this artist. Also contains the track preview's URL
 * @apiName GetTracks
 * @apiGroup tracks
 * @apiVersion  0.1.0
 *
 * @apiParam  {String} artist The artist name
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
app.get('/tracks/artist=:artist', function(req, res) {

});

app.listen(8080);
