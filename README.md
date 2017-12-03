# Festival Search Engine

## Installation and run
You can access it via [this URL](http://ec2-34-215-131-174.us-west-2.compute.amazonaws.com:8080). 
Examples of routes and doc are [here](http://ec2-34-215-131-174.us-west-2.compute.amazonaws.com:8080/routes).

To run locally, you need Node.js with npm and MongoDB installed. In terminal, move to `src` and run :
  ```
  npm install
  npm start
  ```
You need to have an instance of MongoDB running too.
Next, open `http://localhost:8080/` in your browser.

## Features
![Mock up](mockup/homepage.png)

- Welcome page with a search textbox and a swiss google map with a (cached) list of all main swiss festival as markers

  - API Route : Eventful (GET /events/search with this parameters : position, categories, dates)
  - Search : Eventful for performers, BandsInTown for artist's Facebook or images, MusicBrainz (maybe for later) to get more important stuff. Use Eventful for date and BandsInTown can complement Eventful, especially when searching an artist. Search can be made by artist, date, location and updates the markers displayed on the map. API Routes :
    - Artist : 
      - Eventful : GET /performers/search
      - BandsInTown : GET /artists/{artistname}/events
      - MusicBrainz : GET /ws/2/artist/?query=artist:<artist>
    - Date :
      - Eventful : GET /events/search
      - BandsInTown : GET /artists/{artistname}/events (artist id get from Eventful)
    - Location : 
      - Eventful : GET /venues/search
  - BandsInTown also helps to get thumb images of groups.

![bubble](mockup/bubble.png)

- Hovering over a marker displays in a bubble main infos about the Festival

  - API : Google map for marker hover and Eventful infos to display

- Clicking on a marker displays informations about the event, the lineup, and plays a preview song of one artist of the lineup in a mini player
  - Eventful to get artist ressources and MusicBrainz for important informations


### Optional features
- Perform a search by radius with Eventful
- Click on the artist of a displayed lineup to perform a search with this artist
- Check top tracks and artists on Spotify to complete list markers on map

## Technical stuff
- Frontend will be coded in HTML and JS mainly
- Backend will be done through Node.js and Express. The server will be connected to a MongoDB database to cache the previews URL and maybe other stuff.
- We decided not to use JamBase as it is not free and seems to give less informations than Eventful. We'll manage to go through the categories of the search.
