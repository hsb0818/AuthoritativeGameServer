const client = new ClientMng();

client.m_socket.on(protocol.CONNECT, (SFPS) => {
  client.SFPS = SFPS;
  console.log('SFPS:' + SFPS);
});

client.m_socket.on(protocol.PONG, (packet) => {
  client.CalcTimeDelta(packet);
});

client.m_socket.on(protocol.NEWUSER, (player) => {
  client.NewUserInit(player.id, player.pos, player.angle);
  Game.addNewPlayer(player.id, player.pos, player.angle, player.bulletSpeed, player.fireRate);
});

client.m_socket.on(protocol.LOADALLPLAYER, (packet) => {
  alert('myid : ' + packet.myid);

  Game.myid = packet.myid;
  for(let player of packet.players) {
    client.NewUserInit(player.id, player.pos, player.angle);
    Game.addNewPlayer(player.id, player.pos, player.angle, player.bulletSpeed, player.fireRate);
  }
});

client.m_socket.on(protocol.REMOVEPLAYER, (id) => {
  Game.removePlayer(id);
  client.RemoveUser(id);
});

client.m_socket.on(protocol.GAMESTART, () => {
  Game.Play();
  client.m_socket.emit(protocol.GAMESTART);
});

client.m_socket.on(protocol.SNAPSHOT_MOVEMENT_ANOTHER, (state) => {
  client.UpdateAnotherUser(state);
});

client.m_socket.on(protocol.SNAPSHOT_MOVEMENT, (state) => {
  client.ReConciliation(state);
});

client.m_socket.on(protocol.SNAPSHOT_BULLET, (state) => {
  client.Fire(state.id, state.type);
});
