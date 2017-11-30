express = require('express'),
app = express(),

axios = require('axios'),

Log = require("log"),
log = new Log("debug"),

cors = require('cors'),

SpotifyWebApi = require('spotify-web-api-node'),
clientId = 'bfa3df6d31284912b0ed76fa6c5673b5',
clientSecret = '523fc42e0bf94723b542930fbe5cf38e',
// Create the api object with the credentials
spotifyApi = new SpotifyWebApi({
    clientId : clientId,
    clientSecret : clientSecret
}),

key_eventful = "WSpR5fzQ69N3w2FL",
events_search_eventful = "http://api.eventful.com/json/events/search",
page_size = 250,

bands_in_town_url = "https://rest.bandsintown.com/artists/",
music_brainz_url = "http://musicbrainz.org/ws/2/artist/?fmt=json&query=";

module.exports = {};
