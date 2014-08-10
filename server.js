var express = require('express');
var socketio = require('socket.io');
var scApi = require('soundclouder');
var config = require('config');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));


var currentTrackId;
var currentTrack;
var songPlayTime = {};

var server = app.listen(3000);
var scConfig = config.get('SoundCloud');
scApi.init(scConfig.clientId, scConfig.clientSecret, scConfig.redirectUrl);


var io = socketio.listen(server);
io.on('connection', function(socket) {

  console.log('client connected');
  socket.broadcast.emit('server ready', { 'message' : 'ok' });

  if (currentTrackId) {

    var currentTime = (new Date()).getTime();
    var songPlayedTime = songPlayTime[currentTrackId];
    var playedTime = currentTime - songPlayedTime;

    console.log("currentTime " + currentTime + ", songPlayedtime " + songPlayedTime + ", playedTime " + playedTime + ", song duration " + currentTrack.duration);
    console.log("sending song " + currentTrackId + " to newly connected client");

    if (playedTime < currentTrack.duration) {
      socket.emit('new song', { 'trackId' : currentTrackId, 'position' : playedTime, 'title' : currentTrack.title });
    }
  }

});

app.use(bodyParser.json());

app.put('/api/request', function(req, res, next) {

      var track = req.body;
      var trackId = req.body.id;
      var currentTime = (new Date()).getTime();

      currentTrackId = trackId;
      currentTrack = track;

      songPlayTime[currentTrackId] = currentTime;

      console.log("Start playing trackId " + currentTrackId + " at " + currentTime);

      io.sockets.emit('new song', track);

      res.end("success");
});
