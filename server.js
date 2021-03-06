var express     = require('express');
var cors        = require('cors');
var bodyParser  = require('body-parser');
var mongodb     = require('mongodb');
var request     = require('request');
var app         = express();

// naming the db collection
var EVENTS_COLLECTION = 'events';

// let's add the ability ajax to our server from anywhere!
app.use(cors());

// extended:true = put it in an obj
app.use(bodyParser.urlencoded({extended: true}));

// MongoClient lets us interface/connect to mongodb
var MongoClient = mongodb.MongoClient;

// Connection url where your mongodb server is running.
// var mongoUrl = 'mongodb://localhost:27017/api-project';
var mongoUrl ='mongodb://heroku_2h5q2kgp:75ftd74bc6npsaja2pbb0a9d4q@ds027145.mlab.com:27145/heroku_2h5q2kgp';
mongodb.MongoClient.connect(mongoUrl, function(err, database){
    if (err) {
        console.log(err);
        process.exit(1);
    }

    // name the db
    db = database;
    console.log('Database ready');
});

// bands in town api artist events search
app.post('/planner/search', function(req, res) {

  var endpoint = 'http://api.bandsintown.com/artists/';
  var searchInput = req.body.artist
  var format = '/events.json?api_version=2.0&app_id=';
  var end = 'BAND_PLANNER_APP';
  var fullQuery = endpoint + searchInput + format + end;
  console.log('fullQuery:', fullQuery);

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
}); // end post request

// spotify api id search
app.post('/artist/id', function(req, res) {

  var baseUrl = 'https://api.spotify.com/v1';
  var searchInput = req.body.artist
  var endpoint = '/search?q=' + searchInput + '&type=artist';
  var fullQuery = baseUrl + endpoint;
  console.log('fullQuery:', fullQuery); // prints to terminal

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
}); // end post request

/* spotify api artist top-tracks search
https://api.spotify.com/v1/artists/{id}/top-tracks */
app.post('/artist/name', function(req, res) {

  var baseUrl = 'https://api.spotify.com/v1';
  var endpoint = '/artists/' + req.body.id + '/top-tracks' + '?country=US';
  var fullQuery = baseUrl + endpoint;
  console.log('SPOT:', fullQuery);

  request({
    url: fullQuery,
    method: 'GET',
    callback: function(error, response, body) {
      // console.log(body);
      res.send(body);
    }
  })
})

// post new event to db
app.post('/events/new', function(req, res) {
  var newEvent = req.body;
  var id = req.body.eventId;
  // console.log('ID:', id);

  // update allows us to add to db only if the obj doesn't already exist in db
  db.collection(EVENTS_COLLECTION).update({eventId: id}, {$setOnInsert: newEvent}, {upsert: true}, function(err, result) {
    if (err) {
      console.log("Error: " + err);
      res.json('Error');
    } else {
      console.log('Event added');
      res.json(result);
    }
  });
})

// view all events stored in db
app.get('/events', function(req, res) {
  db.collection(EVENTS_COLLECTION).find({}).toArray(function(error, result) {
    if (error) {
      console.log('Failed to find events', error);
      res.json('Error finding events');
    } else {
      console.log('Event results found');
      res.json(result);
    }
  })
})

// delete an event by eventId
app.delete('/events/:eventId', function(req, res) {
  console.log('REQ.PARAMS:', req.params)
  db.collection(EVENTS_COLLECTION).remove(req.params, function(error, numRemoved) {
    console.log('numRemoved:', numRemoved);
    if (error) {
      console.log('Error', error);
      res.json('Error');
    } else {
      console.log('Success');
      res.json('Removal successful');
    }
  });
});

// listen on port 3000 for dev; use PORT var for deply
// app.listen(3000, function() {
//     console.log('listen to events on a "port".')
// });

PORT = process.env.PORT || 80;
app.listen(PORT, function() {
    console.log('listen to events on a "port".')
});
