/* Server-side Development */

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//Twilio
var twilio = require('twilio');

// Geocoder
var geocoder = require('geocoder');

// our db model
var Bird = require("../models/bird.js");

/**
 * GET '/'
 * Default home route. Just relays a success message back.
 * @param  {Object} req
 * @return {Object} json
 */
router.get('/', function(req, res) {

  var jsonData = {
  	'name': 'the-social-conure',
  	'api-status':'OK',
    'instructions': "Text your bird post to (856)-288-2761",
    'format': 'type,name,location'
  }

  // respond with json data
  res.json(jsonData)
});


// Twilio callback route
// This gets called every time an incoming message is received
router.post('/twilio-callback', function(req,res){

  // there's lots contained in the body
  console.log(req.body);

  // the actual message is contained in req.body.Body
  var incomingMsg = req.body.Body;
  console.log(incomingMsg);

  var incomingNum = req.body.From;

  // now, let's save it to our Database
  var msgToSave = {
    status: incomingMsg,
    from: incomingNum
  }

  var status = new Bird(msgToSave)

  status.save(function(err,data){
    // set up the twilio response
    var twilioResp = new twilio.TwimlResponse();
    if(err){
      // respond to user
      twilioResp.sms('Oops! We couldn\'t save status --> ' + incomingMsg);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());
    }
    else {
      // respond to user
      twilioResp.sms('Successfully saved status! --> ' + incomingMsg);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());
    }
  })
})

// a different twilio callback, this one for our bird posts
router.post('/twilio-callback2', function(req,res){

  // there's lots contained in the body
  console.log(req.body);

  // the actual message is contained in req.body.Body
  var incomingMsg = req.body.Body;
  console.log(incomingMsg);


  // we don't want to save the entire body as one thing
  // we want to break it up into fields based on a structure of:
  // breakfast,3,My House,Brooklyn
  // which maps to:
  // type: breakfast
  // rating: 3,
  // place: My House
  // location: Brooklyn

  // the first thing we need to do is separate the big string into individual parts
  // we can do that by splitting at the commas
  var msgArray =  incomingMsg.split(',');

  // now it would look like [breakfast,3,My House,Brooklyn]
  console.log(msgArray);

  // now we can get the value
  var location = msgArray[3];

  // set up our data
  var saveBirdLocation = {
    location: location
  }

  // now, let's geocode the location
  geocoder.geocode(location, function (err,data) {

    // set up the twilio response
    var twilioResp = new twilio.TwimlResponse();

    // if we get an error, or don't have any results, respond back with error
    if (!data || data==null || err || data.status == 'ZERO_RESULTS'){
      // respond to user
      twilioResp.sms('Oops! We couldn\'t save bird post.. couldn\'t find location -->'  + location);
      // respond to twilio
      res.set('Content-Type', 'text/xml');
      res.send(twilioResp.toString());
    }

    // else, let's pull put the lat lon from the results
    var lon = data.results[0].geometry.location.lng;
    var lat = data.results[0].geometry.location.lat;

    // now, let's add this to our animal object from above
    saveBirdLocation.location = {
      geo: [lon,lat], // need to put the geo co-ordinates in a lng-lat array for saving
      name: data.results[0].formatted_address // the location name
    }

      var location = new Bird(saveBirdLocation)

      location.save(function(err,data){
        if(err){
          // respond to user
          twilioResp.sms('Oops! We couldn\'t save bird location --> ' + incomingMsg);
          // respond to twilio
          res.set('Content-Type', 'text/xml');
          res.send(twilioResp.toString());
        }
        else {
          // respond to user
          twilioResp.sms('Successfully saved bird location! --> ' + incomingMsg);
          // respond to twilio
          res.set('Content-Type', 'text/xml');
          res.send(twilioResp.toString());
        }
      })
  });
})

router.get('/api/get',function(req,res){

  Status.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        statuses: data
      }
      res.json(jsonData);
    }
  })
})

router.get('/api/get/latest',function(req,res){

  Status.find().sort('-dateAdded').exec(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        status: data[0]
      }
      res.send(data[0].status);
    }
  })
})


router.get('/api/get/bird',function(req,res){

  Bird.find(function(err,data){
    if(err){
      var error = {
        status: "ERROR",
        message: err
      }
      res.json(error);
    }
    else {
      var jsonData = {
        status: "OK",
        birds: data
      }
      res.json(jsonData);
    }
  })
})



module.exports = router;
