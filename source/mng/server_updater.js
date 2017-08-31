'use strict';

const ClientInputQueue = require('../../public/cinput_queue');
const protocol = require('../../public/protocol');
const ServerMng = require('./server_mng');

class ServerUpdater {
  constructor () {
    this.Server = Server;
    this.Game = Game;

    function Server(deltatime, io) {
      UpdateInput(ServerMng.GDT, io);
    }

    function UpdateInput(deltatime, io) {
      let input = ClientInputQueue.DequeClientInput();
      while (input !== null) {
        input.player.Move(input.type, input.deltatime);
        console.log(input.seqnum + '/ ' + input.type + ': ' + input.deltatime +
          ': ' + input.player.pos.x +
          ', ' + input.player.pos.y);

        input.socket.broadcast.to(input.room).emit(protocol.UPDATEMOVEMENTANOTHER, {
          id: input.player.id,
          x: input.player.pos.x,
          y: input.player.pos.y
        });

        input.socket.emit(protocol.UPDATEMOVEMENT, {
          seqnum: input.seqnum,
          x: input.player.pos.x,
          y: input.player.pos.y
        });

        input = ClientInputQueue.DequeClientInput();
      }
    }

    function Game(deltatime) {
    }

  }
}

ServerUpdater.instance = null;
ServerUpdater.GetInstance = () => {
  if (ServerUpdater.instance === null) {
    ServerUpdater.instance = new ServerUpdater();
  }

  return ServerUpdater.instance;
};

module.exports = ServerUpdater.GetInstance();
