let socket = null;
let game = null;
let myname = GetCookie('username');
let heros = {};
let is_gamestart = false;

const CONFIG = {
  FPS: 15.0, // frame for physics update
  SPS: 45.0, // frame for synchronize
  SCREEN_WIDTH:1024,
  SCREEN_HEIGHT:768,
  PING_INTERVAL: 5000,
  PAST: 100,
};
