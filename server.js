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
var songQueue = [];
var songEndTimer;

var server = app.listen(3000);
//var scConfig = config.get('SoundCloud');
//scApi.init(scConfig.clientId, scConfig.clientSecret, scConfig.redirectUrl);


var io = socketio.listen(server);
io.on('connection', function(socket) {

  console.log('client connected');
  if (currentTrackId) {

    var currentTime = (new Date()).getTime();
    var songPlayedTime = songPlayTime[currentTrackId];
    var playedTime = currentTime - songPlayedTime;

    console.log("currentTime " + currentTime + ", songPlayedtime " + songPlayedTime + ", playedTime " + playedTime + ", song duration " + currentTrack.duration);
    console.log("sending song " + currentTrackId + " to newly connected client");

    if (playedTime < currentTrack.duration) {

      currentTrack.position = playedTime;
      socket.emit('new song', currentTrack);
      //res.json(currentTrack);
    }
  }

});

app.use(bodyParser.json());

app.get('/api/current', function(req, res, next) {

//socket.broadcast.emit('server ready', { 'message' : 'ok' });

  if (currentTrackId) {

    var currentTime = (new Date()).getTime();
    var songPlayedTime = songPlayTime[currentTrackId];
    var playedTime = currentTime - songPlayedTime;

    console.log("currentTime " + currentTime + ", songPlayedtime " + songPlayedTime + ", playedTime " + playedTime + ", song duration " + currentTrack.duration);
    console.log("sending song " + currentTrackId + " to newly connected client");

    if (playedTime < currentTrack.duration) {
      //socket.emit('new song', { 'trackId' : currentTrackId, 'position' : playedTime, 'title' : currentTrack.title });
      currentTrack.position = playedTime;
      res.json(currentTrack);
    }
  }

});

app.get('/api/queue', function(req, res, next) {
  res.json(songQueue);
});

app.get('/api/skip', function(req, res, next) {

  currentTrackId = null;
  currentTrack = null;

  if (songQueue.length > 0) {

    console.log("Playing next track that's enqueued");
    playNextTrack();

    res.json({status: 'skipped to next song'});

  } else {

    // stop current track
    io.sockets.emit('stop current', {});
    res.json({status: 'stopping current song, none to move to'});
  }
});

app.put('/api/request', function(req, res, next) {

      var track = req.body;
      var trackId = req.body.id;

      // if no songs in queue
      if (!currentTrack) {

        songQueue.push(track);
        playNextTrack();
        res.json({ status: "success"});

      } else if (songQueue.length > 50) {

        res.json({ status: "queue full"});

      } else {

        // add to queue
        songQueue.push(track);
        io.sockets.emit('update queue', songQueue);
        res.json({ status: "song added"});

      }

});

function playNextTrack() {

  var nextTrack = songQueue.pop();
  io.sockets.emit('update queue', songQueue);

  // then play
  clearTimeout(songEndTimer);
  var currentTime = (new Date()).getTime();

  currentTrackId = nextTrack.id;
  currentTrack = nextTrack;

  songPlayTime[currentTrackId] = currentTime;

  songEndTimer = setTimeout(function() {

    currentTrackId = null;
    currentTrack = null;

    if (songQueue.length > 0) {
      console.log("Playing next enqueued track");
      playNextTrack();
    }

  }, nextTrack.duration);

  console.log("Start playing trackId " + currentTrackId + " at " + currentTime);

  io.sockets.emit('new song', nextTrack);

}
