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

const bands_in_town_url = "https://rest.bandsintown.com/artists/";

function url_bands_in_town(artist, app_id) {
   return bands_in_town_url + artist + "?app_id=" + app_id;
}

const music_brainz_url = "http://musicbrainz.org/ws/2/artist/?fmt=json&query=";

/**
 * @api {get} /events/artist=:artist?/location=:location? Return futur events in function of artist and location
 * @apiName GetEvents
 * @apiGroup events
 * @apiVersion  0.1.0
 * 
 * @apiUse DefGetEvents
 */
app.get('/events/artist=:artist?/location=:location?', function(req, res) {
	const artist = req.params.artist;
	const location = req.params.location;

	if (artist == undefined && location == undefined) {
		log.error("NoParam");
		res.type('json');		
		res.end(JSON.stringify({"NoParam": true}));
	}
	else {
      let events = [];

      // First get request to obtain pages number
      // of eventful data
		axios.get(events_search_eventful, {
			params: {
				app_key: key_eventful,
				keywords: artist,
				location: location,
				category: "music,festivals_parades",
            date: "future",
            sort_order: "popularity",
				page_size: page_size,
				count_only: true
			}
		})
		.then(count => {
			let items = parseInt(count.data.total_items);
         let page_number = -1;
         res.type('json');         

			if (items >= 0) {
            // If there is items, an array of params of get URL
            // is created, for every page of eventful, a request
            // will be send
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
                     sort_order: "popularity",
							page_size: page_size,
							page_number: i
						}
					});
				}

            // With axios, we can perform multiple requests and 
            // process them all when they are all finished
				let promise_array = params_array.map(p => axios.get(events_search_eventful, p));
				axios.all(promise_array)
				.then(results => {
               // Eventfull processing
					results.map(r => r.data.events.event).forEach(events_set => {
						events_set.forEach(event => {
							if (event.performers != null) {
                        let performers = [];
                        let contains = false;

                        // performers property of eventful is a little dumb
                        // I think, if multiple performers it's an array, 
                        // else only one object
								if (Array.isArray(event.performers.performer)) {
									event.performers.performer.forEach(p => {
                              // eventful keywords is not really top for this 
                              // case, it match too many results with an artist name,
                              // it checks his description of events. We are only 
                              // interested by the name of performers. So we check
                              // if the name is include in performers name.
                              if ((artist != undefined && p.name.includes(artist)) || artist == undefined) {
                                 performers.push({
                                    name: p.name,
                                    short_bio: p.short_bio
                                 });
                                 contains = true;
                              }
									});
								}
								else {
                           let perf = event.performers.performer;
                           if ((artist != undefined && perf.name.includes(artist)) || artist == undefined) {
                              performers.push({
                                 name: perf.name,
                                 short_bio: perf.short_bio
                              });
                              contains = true;
                           }
                        }

                        if (contains) {
                           events.push({
                              id: event.id,
                              title: event.title,
                              venue: event.venue_name,
                              date: event.start_time,
                              address: event.venue_address,
                              city: event.city_name,
                              region: event.region_name,
                              postal_code: event.postal_code,
                              country: event.country_name,
                              latitude: event.latitude,
                              longitude: event.longitude,
                              offer: event.url,
                              performers: performers
                           });
                        }
							}
						});
               });
               
               // BandsInTown comes into play
               if (artist != undefined) {
                  axios.get(url_bands_in_town(artist, "asdf"))
                  .then(resp => {
                     events.forEach(event => {
                        event.performers.forEach(perf => {
                           perf.thumb = resp.data.thumb_url;
                           perf.image = resp.data.image_url;
                           perf.facebook = resp.data.facebook_page_url;
                        });
                     });

                     res.end(JSON.stringify({events: events}));                     
                  })
                  .catch(err => {
                     res.end({error: err});
                     log.error(err);
                  });
               }
               else {
                  res.end(JSON.stringify({events: events}));                  

                  // it's a mess to set data from BandsInTown
                  // if artist is undefined, to discuss
                  // Maybe set this infos in route 'infos'

                  // let names = new Set();
                  // events.forEach(event => {
                  //    event.performers.forEach(perf => {
                  //       log.debug(perf.name);
                  //       names.add(perf.name);
                  //    });
                  // });

                  // log.debug(names);
                  // let promise_array = [];
                  // names.forEach(name => {
                  //    promise_array.push(axios.get(url_bands_in_town(name, "asdf")));
                  // });
                  // log.debug(promise_array);               
                  // axios.all(promise_array)
                  // .then(results => {
                  //    results.map(resp => resp.data).forEach(events_set => {
                  //       events.forEach(event => {
                  //          event.performers.thumb = resp.thumb_url;
                  //          event.performers.image = resp.image_url;
                  //          event.performers.facebook = resp.facebook_page_url;
                  //       });
                  //    });
                  //    res.end(JSON.stringify({events: events}));
                  // })
                  // .catch(err => {
                  //    res.end({error: err});
                  //    log.error(err);
                  // });
               }
				})
				.catch(err => {
					res.end({error: err});
					log.error(err);
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
   const artist = req.params.artist;
   if (artist != undefined) {
      res.type('json');
      axios.all([
         axios.get(music_brainz_url + artist),
         axios.get(url_bands_in_town(artist, "asdf"))
      ]).then(axios.spread((response1, response2) => {
         let infos = {
            name: response1.data.artists[0].name,
            type: response1.data.artists[0].type,
            country: response1.data.artists[0].country,
            disambiguation: response1.data.artists[0].disambiguation,
            // See later, ReferenceError: span is not defined ???
            // He doesn't like the "-" in "life-span"

            // life_span: {
            //    ended: response1.data.artists[0].life-span.ended,
            //    begin: response1.data.artists[0].life-span.begin,
            //    end: response1.data.artists[0].life-span.end
            // }
            image: response2.data.image_url,
            thumb: response2.data.thumb_url,
            facebook: response2.data.facebook_page_url
         };
         res.end(JSON.stringify(infos));
      })).catch(error => {
         log.error(error);
         res.end(JSON.stringify({ArtistNotFound: true}));
      });
   }
   else {
      log.error("NoArtist");
		res.type('json');
		res.end(JSON.stringify({"NoArtist": true}));
   }
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
