class Client {
  constructor() {
    const self = this;

    this.m_socket = io('121.161.72.118:9209', {
      path: '/game'
    });
    this.m_inputs = new Queue();
    this.m_server_state = {x:0, y:0, seqnum:0};
    this.m_predicted_state = {x:0, y:0, seqnum:0};

    let pingtime = 0.0;
    let latency = 0.0;
    let seqnum = 0;
    let seqnum_last = 0;

    this.SeqNumLast = () => { return seqnum_last; };
    this.SeqNum = () => {
      seqnum_last = seqnum;
      return seqnum++;
    };

    this.Latency = () => { return latency; };
    this.UpdateLatency = () => { latency = Date.now() - pingtime; };
    this.Ping = () => {
      setTimeout(() => {
        pingtime = Date.now();
        self.m_socket.emit(protocol.PING);
        self.Ping();
      }, CONFIG.PING_INTERVAL);
    };
  }

  GameReady() {
    this.m_socket.emit(protocol.GAMEREADY);
  }

  NewUser() {
    this.m_socket.emit(protocol.NEWUSER);
  }

  Input(type) {
    this.m_inputs.Enque(type);
    this.UpdatePredictedState();

    this.m_socket.emit(protocol.UPDATEMOVEMENT, {
      seqnum: this.SeqNum(),
      deltatime: type.deltatime,
      type: type.type
    });
  }

  SyncState(player_id) {
    const apply_state = this.m_predicted_state;
    const hero = Game.player_map[Game.myid];

    hero.x = apply_state.x;
    hero.y = apply_state.y;
  }

  UpdatePredictedState() {
    this.m_predicted_state = this.m_server_state;
    this.m_inputs.ForEach((key, val) => {
      this.m_predicted_state = this.Move(this.m_predicted_state,
        val.type, val.deltatime);
    });

    this.SyncState();
  }

  ReConciliation(state) {
    if (client.m_inputs.IsEmpty())
      return;

    this.m_server_state = state;

    console.log(state.seqnum + '] pos : ' + state.x + ', ' + state.y);

    // delete prev state
    while (this.m_inputs.Count() >
      (this.SeqNumLast() - this.m_server_state.seqnum)) {
      this.m_inputs.Deque();
    }

    this.UpdatePredictedState();
  }

  Move(prev_state, type, deltatime) {
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
  }
}

const client = new Client();

client.m_socket.on(protocol.CONNECT, (packet) => {
  alert(packet.system);
});

client.m_socket.on(protocol.PING, () => {
  client.UpdatePing();
});

client.m_socket.on(protocol.NEWUSER, (player) => {
  client.m_server_state.x = player.pos.x;
  client.m_server_state.y = player.pos.y;

  Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
});

client.m_socket.on(protocol.LOADALLPLAYER, (packet) => {
  alert('myid : ' + packet.myid);

  Game.myid = packet.myid;
  for(let player of packet.players){
    Game.addNewPlayer(player.id, player.pos.x, player.pos.y);
  }
});

client.m_socket.on(protocol.REMOVEPLAYER, (id) => { Game.removePlayer(id); });
client.m_socket.on(protocol.GAMESTART, () => { Game.Play(); });
client.m_socket.on(protocol.UPDATEMOVEMENTANOTHER, (state) => {
  const hero = Game.player_map[state.id];
  hero.x = state.x;
  hero.y = state.y;
});

client.m_socket.on(protocol.UPDATEMOVEMENT, (state) => {
  client.ReConciliation(state);
});
