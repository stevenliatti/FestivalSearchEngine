# FestivalSearchEngine

## APIs and Keys
- [Google Maps](https://developers.google.com/maps/)
    - Key : AIzaSyAi-HRdOq1ggyGoDwyqSSNtwo-GyvIcmNA

- [Spotify](https://developer.spotify.com/)
    - Client ID : bfa3df6d31284912b0ed76fa6c5673b5
    - Client Secret : 523fc42e0bf94723b542930fbe5cf38e

- [BandsInTown](https://app.swaggerhub.com/apis/Bandsintown/PublicAPI/3.0.0)

- [EventFul](http://api.eventful.com/)
    - Key : WSpR5fzQ69N3w2FL
    - oAuth Consumer Key : 9426e2640370827b058f
    - oAuth Consumer Secret : 3815c5e7b5fb427aebf6

- [JamBase](http://developer.jambase.com/io-docs)
    - Key : naq556zv89ywpap6qfeu7b34

- [MusicBrainz](https://musicbrainz.org/doc/Development)

### Accounts and authentification
When needed (except GMAPS) :
- user : hpsms@slipry.net or hpsms (https://slippery.email/inbox/hpsms/v2SC9G7RlWq84ZKA#)
- password : 7DwMx3wU#BfhH2pK

## Features
- Welcome page with a search textbox and a swiss google map with a cached list of all main swiss festival as markers
	- API Route : Eventful (GET /events/search (position, categories, dates))
	- Search : Eventful for performers, BandsInTown for artist's Facebook or images, MusicBrainz (maybe for later) to get more important stuff. Use Eventful for date and BandsInTown can complement Eventful, especially when searching a venue.
	- BandsInTown also helps to get thumb images of groups.
- Hovering over a marker displays in a bubble main infos about the Festival
	- API : Google map for marker hover and Eventful infos to display
- Clicking on a marker displays informations about the event, the lineup, and plays a preview song of one artist of the lineup in a mini player
	- Eventful to get artist ressources and MusicBrainz for important informations
- Search can be made by artist, date, location and updates the markers displayed on the map
	- (See above : Eventful and MusicBrainz depending on the search)

### Optional features
- Perform a search by radius with Eventful
- Click on the artist of a displayed lineup to perform a search with this artist

## Technical stuff
- Frontend will be coded in HTML and JS mainly
- Backend will be done through node JS. The server will be connected to a SQL database to cache the previews URL
- We decided not to use JamBase as it is not free and seems to give less informations than Eventful. We'll manage to go through the categories of the search.
