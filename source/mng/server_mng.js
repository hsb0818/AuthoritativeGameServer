'use strict';

const UPDATE_TIME_FREQ = 4;
const GFPS = 15;
const SFPS = 1000 / 3;
const JSTICK_MIN = 16;

class ServerMng {
  constructor() {
    this.GDT = 1 / 66.6;
    this.localtime = 0;
    this.dt = new Date().getTime();
    this.dte = this.dt;
    this.ServerStart = ServerStart;
    this.GameStart = GameStart;

    setInterval(() => {
      const time = new Date().getTime();
      this.dt = time - this.dte;
      this.dte = time;
      this.localtime += this.dt * 0.001;
    }, UPDATE_TIME_FREQ);

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
