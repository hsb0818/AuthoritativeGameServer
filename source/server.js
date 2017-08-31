const protocol = require('../public/protocol');
const Player = require('./lib/player');
const MyMath = require('./lib/mymath');
const RoomMng = require('./mng/room_mng');
const ClientInputQueue = require('../public/cinput_queue');

module.exports = (io, socket) => {
  RoomMng.Enter(socket.id, socket);
  const user = RoomMng.FindUserByID(socket.id);
  const room = RoomMng.FindRoom(user.m_room);
  socket.user = user;

  console.log('joined room users : ' + RoomMng.GetUserCount(user.m_room));

//  socket.emit(protocol.CONNECT, {system:'welcome!'});
  socket.on(protocol.DISCONNECT, (packet) => {
    RoomMng.Leave(user);
    io.sockets.in(user.m_room).emit(protocol.REMOVEPLAYER, user.m_player.id);
    console.log(user.m_name + ' leave from room...');
    console.log(RoomMng.GetUserCount(user.m_room) + ' peoples left..');
  });

  socket.on(protocol.PING, () => {
    socket.emit(protocol.PING);
  });

  socket.on(protocol.NEWUSER, (packet) => {
    user.m_player = new Player(
      MyMath.RandomInt(100, 400),
      MyMath.RandomInt(100, 400)
    );

    socket.emit(protocol.LOADALLPLAYER, (() => {
      const users = room.FindAnotherUsers(user.m_socket.id);
      const players = [];
      for (const id in users) {
        players.push(users[id].m_player);
      }

      return {
        myid: user.m_player.id,
        players: players
      };
    })());

    io.sockets.in(user.m_room).emit(protocol.NEWUSER, {
        id : user.m_player.id,
        pos : user.m_player.pos
      });
  });

  socket.on(protocol.GAMEREADY, () => {
    socket.emit(protocol.GAMESTART);
    socket.on(protocol.UPDATEMOVEMENT, (packet) => {
      ClientInputQueue.EnqueClientInput({
        socket: socket,
        room: user.m_room,
        player: user.m_player,
        type: packet.type,
        deltatime: packet.deltatime,
        seqnum: packet.seqnum
      });
    });
  });
};
