'use strict';

const protocol = require('../../public/protocol');
const SCENARIO = require('../define').SCENARIO;
const UUID = require('node-uuid');
const Queue = require('../../public/queue');
const NPC = require('../lib/npc');
const MyMath = require('../lib/mymath');
const SnapShotNPC = require('../lib/snapshot_npc');

class Game {
  constructor(_sockio, _room) {
    this.sockio = _sockio;
    this.room = _room;
    this.npcs = {};
  }

  Update(deltaTime) {
    for (const key in this.npcs) {
      const npc = this.npcs[key];
      npc.Update(deltaTime);
    }
  }

  CreateNPC(socket, npc) {
    if (this.npcs.hasOwnProperty(npc.id))
      return false;

    this.npcs[npc.id] = npc;
    socket.emit(protocol.NEWNPC, npc);
    console.log('new npc broadcasted!');
    return true;
  }

  UpdateNPC(socket, user, state) {
    if (this.npcs.hasOwnProperty(state.targetID) === false) {
      console.log('UpdateNPC] target is none in npcs');
      return false;
    }

    const npc = this.npcs[state.targetID];
    npc.UpdateState(state, user.m_player.power);

    socket.broadcast.to(this.room.GetKey()).emit(protocol.SNAPSHOT_BULLET, {
      alive: false,
      bulletID: state.bulletID,
      id: user.m_player.id,
    });

    if (npc.hp <= 0) {
      this.RemoveNPC(npc.id);
    }
    else {
      this.sockio.sockets.in(this.room.GetKey()).emit(protocol.SNAPSHOT_NPC,
        new SnapShotNPC(npc, Date.now()));
    }

    return true;
  }

  RemoveNPC(id) {
    if (this.npcs.hasOwnProperty(id) === false)
      return false;

    delete this.npcs[id];
    this.sockio.sockets.in(this.room.GetKey()).emit(protocol.REMOVE_NPC, id);
    return true;
  }
}

class GameMng {
  constructor() {
    let games = {};

    const self = this;

    this.Exist = (room_key) => {
      return games.hasOwnProperty(room_key);
    };

    this.Insert = (sockio, room) => {
      if (self.Exist(room.GetKey()))
        return false;

      games[room.GetKey()] = new Game(sockio, room);
      return true;
    };

    this.Games = () => { return games; };
    this.Get = (room_key) => {
      if (self.Exist(room_key) === false)
        return null;

      return games[room_key];
    };
  }

  Update(deltaTime) {
    for (const key in this.Games()) {
      const game = this.Games()[key];
      game.Update(deltaTime);
    }
  }

  NextScenario(socket, room_key, scenario) {
    const game = this.Get(room_key);
    if (game === null)
      return false;

    switch(scenario) {
      case SCENARIO.NEW_NPC1: {
        if (game.npcs.hasOwnProperty(SCENARIO.NEW_NPC1)) {
          socket.emit(protocol.NEWNPC, game.npcs[SCENARIO.NEW_NPC1]);
        }
        else {
          game.CreateNPC(socket, new NPC(SCENARIO.NEW_NPC1, 'npc1', MyMath.RandomInt(200, 800), MyMath.RandomInt(200, 800), 150, 500, 800));
        }
        break;
      }
    }

    return true;
  }
}

GameMng.instance = null;
GameMng.GetInstance = () => {
  if (GameMng.instance === null) {
    GameMng.instance = new GameMng();
  }

  return GameMng.instance;
};

module.exports = GameMng.GetInstance();
