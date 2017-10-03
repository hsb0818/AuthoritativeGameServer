'use strict';

const Queue = require('../../public/queue');
const protocol = require('../../public/protocol');
const ServerMng = require('./server_mng');
const BulletMng = require('./bullet_mng');
const GameMng = require('./game_mng');

class ServerUpdater {
  constructor () {
    const self = this;

    this.Server = Server;
    this.Game = Game;
    this.inputQueue = new Queue();
    this.snapQueue = new Queue();

    function Server(deltaTime, io) {
      UpdateInput(ServerMng.GDT(), io);
      UpdateSnapshot();
      GameMng.ServerUpdate(deltaTime, io);
    }

    function Game(deltaTime) {
      UpdateBullet(deltaTime);
      GameMng.PhysicsUpdate(deltaTime);
    }

    function UpdateInput(deltaTime, io) {
      if (self.inputQueue.IsEmpty()) {
        return;
      }

      let input = self.inputQueue.Deque();
      while (input !== null) {
        self.snapQueue.Enque(input);

        input.player.Action(input.type, input.angle, input.deltaTime);

        input.socket.broadcast.to(input.room).emit(protocol.SNAPSHOT_MOVEMENT_ANOTHER, {
          serverTime: input.serverTime,
          id: input.player.id,
          x: input.player.pos.x,
          y: input.player.pos.y,
          angle: input.player.angle,
        });

        input.socket.emit(protocol.SNAPSHOT_MOVEMENT, {
          seqnum: input.seqnum,
          x: input.player.pos.x,
          y: input.player.pos.y,
          angle: input.player.angle,
        });

        input = self.inputQueue.Deque();
      }
    }

    //retain only young states by the max-latency.
    function UpdateSnapshot() {
      if (self.snapQueue.IsEmpty())
        return;

      const state = self.snapQueue.Front();
      if (state.serverTime <= Date.now() - ServerMng.MAX_LATENCY()) {
        return;
      }

      let threshold = 0;
      self.snapQueue.ForEach((i, state) => {
        if (state.serverTime > Date.now() - ServerMng.MAX_LATENCY()) {
          threshold++;
        }
        else
          return null;
      });

      self.snapQueue.Remove(threshold);
    }

    function UpdateBullet(deltaTime) {
      if(BulletMng.list.IsEmpty())
        return;

      BulletMng.list.ForEach((idx, state) => {
        if (state.alive === 0) {
          state.alive = 1;
          state.socket.broadcast.to(state.room).emit(protocol.SNAPSHOT_BULLET, {
            id:state.player.id,
            type: state.type,
            serverTime: state.serverTime
          });
        }
        else if (state.alive < 0) {
          BulletMng.list.RemoveIdx(idx);
          console.log('bullet count : ' + BulletMng.list.Count());
        }
      });
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
