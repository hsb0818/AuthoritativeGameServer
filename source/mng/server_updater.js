'use strict';

const Queue = require('../../public/queue');
const protocol = require('../../public/protocol');
const ServerMng = require('./server_mng');

class ServerUpdater {
  constructor () {
    const self = this;

    this.Server = Server;
    this.Game = Game;
    this.cinput_queue = new Queue(); // for client self
    this.snap_queue = new Queue(); // for another client

    function Server(deltatime, io) {
      UpdateInput(ServerMng.GDT(), io);
      UpdateSnapshot();
    }

    function UpdateInput(deltatime, io) {
      let input = self.cinput_queue.Deque();
      if (input === null) {
        return;
      }

      while (input !== null) {
        input.player.Move(input.type, input.deltatime);

        input.socket.broadcast.to(input.room).emit(protocol.UPDATEACTIONANOTHER, {
          server_time: input.server_time,
          id: input.player.id,
          x: input.player.pos.x,
          y: input.player.pos.y
        });

        input.socket.emit(protocol.UPDATEACTION, {
          seqnum: input.seqnum,
          x: input.player.pos.x,
          y: input.player.pos.y
        });

        input = self.cinput_queue.Deque();
      }
    }

    //retain only young states by the max-latency.
    function UpdateSnapshot() {
      if (self.snap_queue.IsEmpty())
        return;

      const state = self.snap_queue.Front();
      if (state.server_time <= Date.now() - ServerMng.MAX_LATENCY()) {
        return;
      }

      let threshold = 0;
      self.snap_queue.ForEach((i, state) => {
        if (state.server_time > Date.now() - ServerMng.MAX_LATENCY()) {
          threshold++;
        }
        else
          return null;
      });

      self.snap_queue.Remove(threshold);
    }

    function Game(deltatime) {
      UpdateHit();
    }

    function UpdateHit() {

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
