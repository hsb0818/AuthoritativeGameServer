'use strict';
const PerformanceNow = require("performance-now");

class ServerMng {
  constructor() {
    const self = this;
    const UPDATE_TIME_FREQ = 4;
    const GFPS = 15;
    const SFPS = 1000 / 22;
    const JSTICK_MIN = 16;
    const GDT = 1 / 66.6;
    const MAX_LATENCY = 1000;

    this.UPDATE_TIME_FREQ = () => { return UPDATE_TIME_FREQ; };
    this.GFPS = () => { return GFPS; };
    this.SFPS = () => { return SFPS; };
    this.JSTICK_MIN = () => { return JSTICK_MIN; };
    this.GDT = () => { return GDT; };
    this.MAX_LATENCY = () => { return MAX_LATENCY; };

    this.ServerStart = ServerStart;
    this.GameStart = GameStart;
    this.ServerTime = (() => {
      let start_ms = Date.now();
      return () => {
        return (Date.now() - start_ms) * 0.001;
      };
    })();

    function ServerStart(UpdateFunc, io) {
      let fps = 0;
      let prevtime = Date.now();

      (function ServerLoop() {
        fps++;
        let now = Date.now();
        if (prevtime + SFPS <= now) {
          let deltatime = (now - prevtime) / 1000;
          prevtime = now;

          UpdateFunc(deltatime, io);
          fps = 0;
        }

        const elapsed_tick = now - prevtime;
        if (elapsed_tick < SFPS - JSTICK_MIN) {
          setTimeout(ServerLoop);
        }
        else {
          setImmediate(ServerLoop);
        }
      })();
    }

    function GameStart(UpdateFunc) {
      let fps = 0;
      let prevtime = Date.now();

      (function GameLoop() {
        fps++;
        let now = Date.now();
        if (prevtime + GFPS <= now) {
          let deltatime = (now - prevtime) / 1000;
          prevtime = now;

          UpdateFunc(deltatime);
          fps = 0;
        }

        const elapsed_tick = now - prevtime;
        if (elapsed_tick < GFPS - JSTICK_MIN) {
          setTimeout(GameLoop);
        }
        else {
          setImmediate(GameLoop);
        }
      })();
    }
  }
}

ServerMng.instance = null;
ServerMng.GetInstance = () => {
  if (ServerMng.instance === null) {
    ServerMng.instance = new ServerMng();
  }

  return ServerMng.instance;
};

module.exports = ServerMng.GetInstance();
