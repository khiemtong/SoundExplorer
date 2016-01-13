var express = require('express');
var socketio = require('socket.io');
//var scApi = require('soundclouder');
var config = require('config');
var bodyParser = require('body-parser');
var passport = require('passport');
var SoundCloudStrategy = require('passport-soundcloud').Strategy;
var app = express();



//app.use(express.logger());
//app.use(express.cookieParser());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

// session setup

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var currentTrackId;
var currentTrack;
var songPlayTime = {};
var songQueue = [];
var songEndTimer;

var server = app.listen(3000);
var scConfig = config.get('SoundCloud');

scApi.init(scConfig.clientId, scConfig.clientSecret, scConfig.redirectUrl);

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

passport.use(new SoundCloudStrategy({
                                      clientID: scConfig.clientId,
                                      clientSecret: scConfig.clientSecret,
                                      callbackURL: scConfig.redirectUrl
                                    }, function(accessToken, refreshToken, profile, done) {

                                      process.nextTick(function() {
                                        return done(null, profile);
                                      });

                                    }
));

app.get('/auth/soundcloud',
  passport.authenticate('soundcloud'),
  function(req, res){
    // The request will be redirected to SoundCloud for authentication, so this
    // function will not be called.
  });

app.get('/auth/soundcloud/callback',
  passport.authenticate('soundcloud', { failureRedirect: '/login.html' }),
  function(req, res) {
    res.redirect('/');
  }
);


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login.html');
}

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

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

  var nextTrack = songQueue.shift();
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
