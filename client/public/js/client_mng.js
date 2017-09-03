class ClientMng {
  constructor() {
    const self = this;

    this.SFPS = 200;
    this.m_socket = io('14.38.188.194:9209', {
      path: '/game'
    });
    this.m_inputs = new Queue();
    this.m_extrainputs = new Queue();
    this.m_threshold = 0;
    this.m_server_state = {x:0, y:0, seqnum:0};
    this.m_predicted_state = {x:0, y:0, seqnum:0};

    let server_time = 0;
    let c2s_delta = 0;
    let s2c_delta = 0;
    let round_trip = 0;
    let latency = 0;
    let seqnum = 0;
    let seqnum_last = 0;

    this.SeqNumLast = () => { return seqnum_last; };
    this.SeqNum = () => {
      seqnum_last = seqnum;
      return seqnum++;
    };

    this.ServerTime = () => { return Date.now() + this.C2SDelta(); };
    this.C2SDelta = () => { return c2s_delta; };
    this.S2CDelta = () => { return s2c_delta; };
    this.Latency = () => { return latency; };
    this.CalcTimeDelta = (packet) => {
      const now = Date.now();
      round_trip = now - packet.client_time;
      latency = round_trip / 2;
      c2s_delta = packet.server_time - now + latency;
      s2c_delta = now - packet.server_time + latency;
    };

    this.Ping = () => {
      setTimeout(() => {
        self.m_socket.emit(protocol.PING, Date.now());
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

  Input(input_info) {
    this.m_inputs.Enque(input_info);
    this.UpdatePredictedState();

    this.m_socket.emit(protocol.UPDATEMOVEMENT, {
      seqnum: this.SeqNum(),
      type: input_info.type,
      server_time: Date.now() + this.C2SDelta(),
      deltatime: input_info.deltatime
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

//    console.log(state.seqnum + '] pos : ' + state.x + ', ' + state.y);

    // delete prev state
    while (this.m_inputs.Count() >
      (this.SeqNumLast() - this.m_server_state.seqnum)) {
      this.m_inputs.Deque();
    }

    this.UpdatePredictedState();
  }

  InterpolateEntity() {
    const cur = Date.now() + this.C2SDelta() - this.SFPS * 1.5;
    const FindThreshold = function() {
      let threshold = 0;
      this.m_extrainputs.ForEach((i, state) => {
        if (state.server_time < cur)
          threshold++;
        else
          return null;
      });

      return threshold;
    }.bind(this);

    let threshold = FindThreshold();
    if (threshold === 0)
      return;
    else if (threshold === this.m_extrainputs.Count()) {
      const last = this.m_extrainputs.Back();
      this.m_extrainputs.Remove(threshold);
      this.m_threshold = 0;

      Game.player_map[last.id].x = last.x;
      Game.player_map[last.id].y = last.y;
      return;
    }

    if (this.m_threshold > 0 &&
      threshold !== this.m_threshold) {
      this.m_extrainputs.Remove(this.m_threshold);
      threshold = FindThreshold();
    }
    this.m_threshold = threshold;

    const before = this.m_extrainputs.Value(threshold -1);
    const after = this.m_extrainputs.Value(threshold);
    const total = (after.server_time - before.server_time);

    let t = 0;
    if (total === 0)
      t = 1;
    else
      t = (cur - before.server_time) / total;

    const new_pos = MyMath.Lerp2(before, after, t);
    Game.player_map[before.id].x = new_pos.x;
    Game.player_map[before.id].y = new_pos.y;
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