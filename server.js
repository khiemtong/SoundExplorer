var express = require('express');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static(__dirname + '/public'));


var server = app.listen(3000);

var io = socketio.listen(server);
io.on('connection', function(socket) {

  console.log('client connected');
  socket.broadcast.emit('server ready', { 'message' : 'ok' });

});

app.use(bodyParser.json());

app.get('/api/tracks/:id', function(req, res, next) {

      var trackId = req.params.id;
      io.sockets.emit('new song', { 'trackId' : trackId });

      res.end("success");
});
