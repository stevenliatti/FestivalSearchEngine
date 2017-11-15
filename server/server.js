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

app
.get('/events', function(req, res) {
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
})

;

app.listen(8080);
