const express = require('express');
const app = express();
const axios = require('axios');
const Log = require("log");
const log = new Log("debug");
const cors = require('cors');

app.use(cors());

const key_eventful = "WSpR5fzQ69N3w2FL";
const events_search_eventful = "http://api.eventful.com/json/events/search";
const page_size = 250;

/**
 * @api {get} /events/artist=:artist?/location=:location? Return futur events in function of artist and location
 * @apiName GetEvents
 * @apiGroup events
 * @apiVersion  0.1.0
 * 
 * @apiUse DefGetEvents
 */
app.get('/events/artist=:artist?/location=:location?', function(req, res) {
	log.debug(req.params);
	let artist = req.params.artist;
	let location = req.params.location;

	if (artist == undefined && location == undefined) {
		log.error("NoParam");
		res.type('json');		
		res.send(JSON.stringify({"NoParam": true}));
	}
	else {
		axios.get(events_search_eventful, {
			params: {
				app_key: key_eventful,
				keywords: artist,
				location: location,
				category: "music,festivals_parades",
				date: "future",
				page_size: page_size,
				count_only: true
			}
		})
		.then(count => {
			log.debug("in first ", count.data);

			let items = parseInt(count.data.total_items);
			let page_number = -1;
			if (items >= 0) {
				page_number = Math.ceil(items / page_size);

				let params_array = [];
				for (let i = 1; i <= page_number; i++) {
					params_array.push({
						params: {
							app_key: key_eventful,
							keywords: artist,
							location: location,
							category: "music,festivals_parades",
							date: "future",
							page_size: page_size,
							page_number: i
						}
					});
				}

				let promise_array = params_array.map(p => axios.get(events_search_eventful, p));
				axios.all(promise_array)
				.then(function(results) {
					let final_events = [];
					let temp = results.map(r => r.data.events.event).forEach(events_set => {
						events_set.forEach(event => {
							if (event.performers != null) {
								let performers = [];
								if (Array.isArray(event.performers.performer)) {
									event.performers.performer.forEach(p => {
										performers.push({
											name: p.name,
											short_bio: p.short_bio
										});
									});
								}
								else {
									performers.push({
										name: event.performers.performer.name,
										short_bio: event.performers.performer.short_bio
									});
								}
								final_events.push({
									id: event.id,
									title: event.title,
									venue: event.venue_name,
									date: event.start_time,
									address: event.venue_address,
									city: event.city_name,
									region: event.region_name,
									postal_code: event.postal_code,
									latitude: event.latitude,
									longitude: event.longitude,
									offer: event.url,
									performers: performers
								});
							}
						});
					});
					res.type('json');
					res.end(JSON.stringify({events: final_events}));
				})
				.catch(errr => {
					res.end({error: errr});
					log.error(errr);
				});
			}
		})
		.catch(err => {
			res.end({error: err});
			log.error(err);
		});
	}
});

/**
 * @api {get} /infos/artist=:artist Return infos of the artist
 * @apiName GetInfos
 * @apiGroup infos
 * @apiVersion  0.1.0
 *
 * @apiUse DefGetInfos
 */
app.get('/infos/artist=:artist', function(req, res) {

});

/**
 * @api {get} /tracks/artist=:artist Return the top-tracks infos for this artist. Also contains the track preview's URL
 * @apiName GetTracks
 * @apiGroup tracks
 * @apiVersion  0.1.0
 *
 * @apiUse DefGetTracks
 */
app.get('/tracks/artist=:artist', function(req, res) {

});

app.listen(8080);
