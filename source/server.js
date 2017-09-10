const protocol = require('../public/protocol');
const Player = require('./lib/player');
const MyMath = require('./lib/mymath');
const RoomMng = require('./mng/room_mng');
const ServerUpdater = require('./mng/server_updater');
const ServerMng = require('./mng/server_mng');
const SnapShot = require('./lib/snapshot');
const PerformanceNow = require("performance-now");

module.exports = (io, socket) => {
  RoomMng.Enter(socket.id, socket);
  const user = RoomMng.FindUserByID(socket.id);
  const room = RoomMng.FindRoom(user.m_room);
  socket.user = user;

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
      server_time: Date.now(),
    });
  });

  socket.on(protocol.PONG, (server_time) => {
    console.log(Date.now(), server_time);
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

    socket.on(protocol.UPDATEACTION, (packet) => {
      ServerUpdater.cinput_queue.Enque({
        socket: socket,
        room: user.m_room,
        player: user.m_player,
        seqnum: packet.seqnum,
        type: packet.type,
        angle: packet.angle,
        server_time: packet.server_time,
        deltatime: packet.deltatime,
      });

      ServerUpdater.snap_queue.Enque(new SnapShot(
        socket,
        room,
        packet.player,
        packet.type,
        packet.angle,
        packet.server_time));
    });

    socket.on(protocol.SNAPSHOT, (packet) => {
      
    });
  });
};
