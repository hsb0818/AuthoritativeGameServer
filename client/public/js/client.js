var Client = {
  pingtime: 0.0,
  latency: 0.0,
  SeqNum: (() => {
    let seqnum = 0;
    return () => { return seqnum++; };
  })(),
  seqnum_last: 0,
  UpdatePing: () => {
    this.latency = Date.now() - this.pingtime;
  },
  server_state: {x:0, y:0, seqnum:0},
  predicted_state: {x:0, y:0, seqnum:0},
  InterpolateEntity: () => {
  }
};

const ClientInputs = new Queue();

Client.socket = io('121.161.72.118:9209', {
  path: '/game'
});

Client.socket.on(protocol.CONNECT, (packet) => {
  alert(packet.system);
});

Client.socket.on(protocol.PING, () => {
  Client.UpdatePing();
});

Client.socket.on(protocol.NEWUSER, (player) => {
  Client.server_state.x = player.pos.x;
  Client.server_state.y = player.pos.y;

  Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
});

Client.socket.on(protocol.LOADALLPLAYER, (packet) => {
  alert('myid : ' + packet.myid);

  Game.myid = packet.myid;
  for(let player of packet.players){
    Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
  }
});

Client.socket.on(protocol.REMOVEPLAYER, (id) => { Game.removePlayer(id); });
Client.socket.on(protocol.GAMESTART, () => { Game.Play(); });

Client.Ping = () => {
  setTimeout(() => {
    Client.pingtime = Date.now();
    Client.socket.emit(protocol.PING);
    Client.Ping();
  }, CONFIG.PING_INTERVAL);
};

Client.GameReady = () => { Client.socket.emit(protocol.GAMEREADY); };
Client.NewUser = () => { Client.socket.emit(protocol.NEWUSER); };

Client.Input = (type) => {
  ClientInputs.Enque(type);
  Client.UpdatePredictedState();

  Client.seqnum_last = Client.SeqNum();
  Client.socket.emit(protocol.UPDATEMOVEMENT, {
    seqnum: Client.seqnum_last,
    deltatime: type.deltatime,
    type: type.type
  });
};

Client.Move = (prev_state, type, deltatime) => {
  let delta = {x:0, y:0};

  const hero = Game.player_map[Game.myid];
  const player = hero.player;

  switch (type) {
    case MOVEMENT.LEFT: {
      delta.x = -player.speed * deltatime;
      break;
    }
    case MOVEMENT.RIGHT: {
      delta.x = +player.speed * deltatime;
      break;
    }
    case MOVEMENT.UP: {
      delta.y = -player.speed * deltatime;
      break;
    }
    case MOVEMENT.DOWN: {
      delta.y = +player.speed * deltatime;
      break;
    }
  }

  return {
    seqnum: prev_state.seqnum + 1,
    x: prev_state.x + delta.x,
    y: prev_state.y + delta.y
  };
};

Client.socket.on(protocol.UPDATEMOVEMENTANOTHER, (state) => {
  const hero = Game.player_map[state.id];
  hero.x = state.x;
  hero.y = state.y;
});

Client.socket.on(protocol.UPDATEMOVEMENT, (state) => {
  if (ClientInputs.IsEmpty())
    return;

  Client.server_state = state;

  // delete prev state
  while (ClientInputs.Count() > (Client.seqnum_last - Client.server_state.seqnum)) {
    ClientInputs.Deque();
  }

  Client.UpdatePredictedState();
});

Client.SyncState = (player_id) => {
  const apply_state = Client.predicted_state;
  const hero = Game.player_map[Game.myid];

  hero.x = apply_state.x;
  hero.y = apply_state.y;
};

Client.UpdatePredictedState = () => {
  Client.predicted_state = Client.server_state;
  ClientInputs.ForEach((key, val) => {
    Client.predicted_state = Client.Move(Client.predicted_state, val.type, val.deltatime);
  });

  Client.SyncState();
};
