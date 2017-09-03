const client = new ClientMng();

client.m_socket.on(protocol.CONNECT, (SFPS) => {
  client.SFPS = SFPS;
  console.log('SFPS:' + SFPS);
});

client.m_socket.on(protocol.PONG, (packet) => {
  client.CalcTimeDelta(packet);
//  client.m_socket.emit(protocol.PONG, Date.now() + client.C2SDelta() + client.Latency());
});

client.m_socket.on(protocol.NEWUSER, (player) => {
  client.m_server_state.x = player.pos.x;
  client.m_server_state.y = player.pos.y;

  Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
});

client.m_socket.on(protocol.LOADALLPLAYER, (packet) => {
  alert('myid : ' + packet.myid);

  Game.myid = packet.myid;
  for(let player of packet.players) {
    Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
  }
});

client.m_socket.on(protocol.REMOVEPLAYER, (id) => { Game.removePlayer(id); });
client.m_socket.on(protocol.GAMESTART, () => { Game.Play(); });
client.m_socket.on(protocol.UPDATEMOVEMENTANOTHER, (state) => {
  client.m_extrainputs.Enque(state);
});

client.m_socket.on(protocol.UPDATEMOVEMENT, (state) => {
  client.ReConciliation(state);
});
