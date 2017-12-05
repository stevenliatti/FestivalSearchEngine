express = require('express'),
app = express(),

axios = require('axios'),

fs = require('fs'),
log = new Log("debug", fs.createWriteStream("fse.log")),
log = new Log("debug"),

cors = require('cors'),

MongoClient = require("mongodb").MongoClient,
mongo_url = 'mongodb://localhost:27017/fse',

monk = require('monk'),
db = monk(mongo_url),

SpotifyWebApi = require('spotify-web-api-node'),
clientId = 'bfa3df6d31284912b0ed76fa6c5673b5',
clientSecret = '523fc42e0bf94723b542930fbe5cf38e',
// Create the api object with the credentials
spotifyApi = new SpotifyWebApi({
    clientId : clientId,
    clientSecret : clientSecret
}),
manage_token = {
    access_token: "",
    expires_in: 0
},

key_eventful = "WSpR5fzQ69N3w2FL",
events_search_eventful = "http://api.eventful.com/json/events/search",
page_size = 250,

bands_in_town_url = "https://rest.bandsintown.com/artists/",
music_brainz_url = "http://musicbrainz.org/ws/2/artist/?fmt=json&query=",

wiki_url = "https://en.wikipedia.org/w/api.php";

module.exports = {};
