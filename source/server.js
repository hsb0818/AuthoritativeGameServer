const protocol = require('../public/protocol');
const Player = require('./lib/player');
const MyMath = require('./lib/mymath');
const RoomMng = require('./mng/room_mng');
const ServerUpdater = require('./mng/server_updater');
const ServerMng = require('./mng/server_mng');
const BulletMng = require('./mng/bullet_mng');
const SnapShot = require('./lib/snapshot');
const PerformanceNow = require("performance-now");
const GameMng = require('./mng/game_mng');
const NPC = require('../public/npc');
const SCENARIO = require('./define').SCENARIO;

module.exports = (io, socket) => {
  RoomMng.Enter(socket.id, socket);
  const user = RoomMng.FindUserByID(socket.id);
  const room = RoomMng.FindRoom(user.m_room);

  if (GameMng.Exist(room.GetKey()) === false)
    GameMng.Insert(io, room);

  console.log('joined room users : ' + RoomMng.GetUserCount(user.m_room));
  socket.emit(protocol.CONNECT, ServerMng.SFPS());
  socket.on(protocol.DISCONNECT, (packet) => {
    RoomMng.Leave(user);

    io.sockets.in(user.m_room).emit(protocol.REMOVEPLAYER, user.m_player.id);
    console.log(user.m_name + ' leave from room...');
    console.log(RoomMng.GetUserCount(user.m_room) + ' peoples left..');
  });

  socket.on(protocol.PING, (client_time) => {
    socket.emit(protocol.PONG, {
      client_time: client_time,
      serverTime: Date.now(),
    });
  });

  socket.on(protocol.PONG, (serverTime) => {
    console.log(Date.now(), serverTime);
  });

  socket.on(protocol.NEWUSER, (packet) => {
    user.m_player = new Player(
      MyMath.RandomInt(100, 400),
      MyMath.RandomInt(100, 400),
      MyMath.RandomInt(0, 90)
    );

    const data = (() => {
      const users = room.FindAnotherUsers(user.m_socket.id);
      const players = [];
      for (const id in users) {
        players.push(users[id].m_player);
      }

      return {
        myid: user.m_player.id,
        players: players
      };
    })();

    socket.emit(protocol.LOADALLPLAYER, data);
    io.sockets.in(user.m_room).emit(protocol.NEWUSER, user.m_player);
  });

  socket.on(protocol.GAMEREADY, () => {
    socket.emit(protocol.GAMESTART);
    socket.on(protocol.GAMESTART, () => {
      console.log('game started');

      GameMng.NextScenario(socket, room.GetKey(), SCENARIO.NEW_NPC1);

      socket.on(protocol.SNAPSHOT_MOVEMENT, (packet) => {
        ServerUpdater.inputQueue.Enque(new SnapShot(
          socket,
          user.m_room,
          user.m_player,
          packet.seqnum,
          packet.type,
          packet.angle,
          packet.serverTime,
          packet.deltaTime)
        );
      });

      socket.on(protocol.SNAPSHOT_BULLET, (state) => {
        BulletMng.list.Enque({
          alive: 0,
          socket: socket,
          room: user.m_room,
          player: user.m_player,
          type: state.type,
          angle: state.angle,
          serverTime: state.serverTime,
        });
      });
    });
  });
};
