const path = require('path');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const ServerMng = require('./source/mng/server_mng');
const ServerUpdater = require('./source/mng/server_updater');

require('./config')(app);

const io = require('socket.io')(server, {
  path: '/game',
  serveClient: false,
  // below are engine.IO options
//  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
});

server.listen(app.get('port'), (req, res) => {
  console.log('listening on port ' + app.get('port'));
  ServerMng.ServerStart(ServerUpdater.Server, io);
  ServerMng.GameStart(ServerUpdater.Game);
});

app.get('/', (req, res) => {
  res.render('index');
});

io.on('connect', function(socket) {
  require('./source/server')(io, socket);
});
