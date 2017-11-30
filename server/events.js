const consts = require('./consts');
const use = require('./use');

exports.events = function(req, res) {
    log.debug("request url", req.url);
    log.debug("request params", req.params);
    let artist = req.params.artist;
    let location = req.params.location;
    res.type('json');

    if (artist == undefined && location == undefined) {
        log.error("no_param_provided");
        res.status(404).end(JSON.stringify({no_param_provided: true}));
    }
    else {
        let events = [];
        artist = artist != undefined ? use.dia(artist).toLowerCase() : undefined;
        location = location != undefined ? use.dia(location).toLowerCase() : undefined;

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
                                        if ((artist != undefined && p.name.toLowerCase().includes(artist)) || artist == undefined) {
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
                                    if ((artist != undefined && perf.name.toLowerCase().includes(artist)) || artist == undefined) {
                                        performers.push({
                                            name: perf.name,
                                            short_bio: perf.short_bio
                                        });
                                        contains = true;
                                    }
                                }

                                // Construction of object response
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
                        axios.get(use.url_bands_in_town(artist, "asdf"))
                        .then(resp => {
                            events.forEach(event => {
                                event.performers.forEach(perf => {
                                    perf.thumb = resp.data.thumb_url;
                                    perf.image = resp.data.image_url;
                                    perf.facebook = resp.data.facebook_page_url;
                                });
                            });

                            res.status(200).end(JSON.stringify({events: events}));
                        })
                        .catch(error => {
                            res.status(404).end({artist_or_location_not_found: error});
                            log.error(error);
                        });
                    }
                    else {
                        res.status(200).end(JSON.stringify({events: events}));
                    }
                    log.debug("events\n", events);
                    log.debug("events length", events.length);
                })
                .catch(error => {
                    res.status(404).end({artist_or_location_not_found: error});
                    log.error(error);
                });
            }
        })
        .catch(error => {
            res.status(404).end({artist_or_location_not_found: error});
            log.error(error);
        });
    }
};
