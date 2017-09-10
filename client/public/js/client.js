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
  Game.addNewPlayer(player.id, player.pos, player.angle, player.bulletspeed, player.firerate);
});

client.m_socket.on(protocol.LOADALLPLAYER, (packet) => {
  alert('myid : ' + packet.myid);

  Game.myid = packet.myid;
  for(let player of packet.players) {
    client.NewUserInit(player.id, player.pos, player.angle);
    Game.addNewPlayer(player.id, player.pos, player.angle, player.bulletspeed, player.firerate);
  }
});

client.m_socket.on(protocol.REMOVEPLAYER, (id) => { Game.removePlayer(id); });
client.m_socket.on(protocol.GAMESTART, () => { Game.Play(); });
client.m_socket.on(protocol.UPDATEACTIONANOTHER, (state) => {
  client.m_extra[state.id].updates.Enque(state);
});

client.m_socket.on(protocol.UPDATEACTION, (state) => {
  client.ReConciliation(state);
});

client.m_socket.on(protocol.SNAPSHOT, (state) => {
  client.Fire(state.id, state.type);
});
