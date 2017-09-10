class ClientMng {
  constructor() {
    const self = this;

    this.SFPS = 200;
    this.m_socket = io('127.0.0.1:9209', {
      path: '/game'
    });
    this.m_inputs = new Queue();
    this.m_extra = {};
    this.m_server_state = {x:0, y:0, angle:0, seqnum:0};
    this.m_predicted_state = {x:0, y:0, angle:0, seqnum:0};

    let server_time = 0;
    let c2s_delta = 0;
    let s2c_delta = 0;
    let round_trip = 0;
    let latency = 0;
    let input_seqnum = 0;
    let input_seqnum_last = 0;

    this.InputSeqNumLast = () => { return input_seqnum_last; };
    this.InputSeqNum = () => {
      input_seqnum_last = input_seqnum;
      return input_seqnum++;
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

  NewUserInit(id, pos, angle) {
    this.m_extra[id] = {
      updates: new Queue(),
      threshold: 0
    };

    this.m_server_state.x = pos.x;
    this.m_server_state.y = pos.y;
    this.m_server_state.angle = angle;
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

    const input_snapshot = {
      seqnum: this.InputSeqNum(),
      type: input_info.type,
      angle: input_info.angle,
      server_time: Date.now() + this.C2SDelta(),
      deltatime: input_info.deltatime
    };

    this.m_socket.emit(protocol.UPDATEACTION, input_snapshot);
  }

  SyncState(player_id) {
    const apply_state = this.m_predicted_state;
    const hero = Game.player_map[Game.myid];

    hero.x = apply_state.x;
    hero.y = apply_state.y;
    hero.angle = apply_state.angle;
  }

  UpdatePredictedState() {
    this.m_predicted_state = this.m_server_state;
    this.m_inputs.ForEach(function(key, val) {
      if (val.type <= ACTION.ROTATE) {
        this.m_predicted_state = this.Action(this.m_predicted_state,
          val.type, val.deltatime);
        }
    }.bind(this));

    this.SyncState();
  }

  ReConciliation(state) {
    if (client.m_inputs.IsEmpty())
      return;

    this.m_server_state = state;

//    console.log(state.seqnum + '] pos : ' + state.x + ', ' + state.y);

    // delete prev state
    while (this.m_inputs.Count() >
      (this.InputSeqNumLast() - this.m_server_state.seqnum)) {
      this.m_inputs.Deque();
    }

    this.UpdatePredictedState();
  }

  InterpolateEntity() {
    const _InterPolateEntity = function(id) {
      const cur = Date.now() + this.C2SDelta() - this.SFPS * 1.5;
      const FindThreshold = function() {
        let threshold = 0;
        this.m_extra[id].updates.ForEach((i, state) => {
          if (state.server_time < cur)
            threshold++;
          else
            return null;
        });

        return threshold;
      }.bind(this);

      const hero = Game.player_map[id];

      let threshold = FindThreshold();
      if (threshold === 0)
        return;
      else if (threshold === this.m_extra[id].updates.Count()) {
        const last = this.m_extra[id].updates.Back();
        this.m_extra[id].updates.Remove(threshold);
        this.m_extra[id].threshold = 0;

        hero.x = last.x;
        hero.y = last.y;
        hero.angle = last.angle;
        return;
      }

      if (this.m_extra[id].threshold > 0 &&
        threshold !== this.m_extra[id].threshold) {
        this.m_extra[id].updates.Remove(this.m_extra[id].threshold);
        threshold = FindThreshold();
      }
      this.m_extra[id].threshold = threshold;

      const before = this.m_extra[id].updates.Value(threshold -1);
      const after = this.m_extra[id].updates.Value(threshold);
      const total = (after.server_time - before.server_time);

      let t = 0;
      if (total === 0)
        t = 1;
      else
        t = (cur - before.server_time) / total;

      const new_pos = MyMath.Lerp2(before, after, t);
      const new_angle = MyMath.Lerp(before.angle, after.angle, t);

      hero.x = new_pos.x;
      hero.y = new_pos.y;
      hero.angle = new_angle;

    }.bind(this);

    for (const id in this.m_extra) {
      _InterPolateEntity(id);
    }
  }

  Action(prev_state, type, deltatime) {
    const hero = Game.player_map[Game.myid];
    const player = hero.player;

    let delta = new Vector2();
    switch (type) {
      case ACTION.LEFT: {
        delta.x = -player.speed * deltatime;
        break;
      }
      case ACTION.RIGHT: {
        delta.x = +player.speed * deltatime;
        break;
      }
      case ACTION.UP: {
        delta.y = -player.speed * deltatime;
        break;
      }
      case ACTION.DOWN: {
        delta.y = + player.speed * deltatime;
        break;
      }
    }

    return {
      seqnum: prev_state.seqnum + 1,
      x: prev_state.x + delta.x,
      y: prev_state.y + delta.y,
      angle: prev_state.angle,
    };
  }

  Fire(id, type) {
    const server_time = Date.now() + this.C2SDelta();
    const hero = Game.player_map[id];

    if (id === Game.myid) {
      this.m_socket.emit(protocol.SNAPSHOT, {
        type: type,
        angle: hero.angle,
        server_time: server_time,
      });
    }

    hero.weapon.fire();
  }
}
