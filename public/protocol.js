/*
 * protocols of server & client.
*/

const protocol = {
  DISCONNECT: 'disconnect',
  CONNECT: 'CONNECT',
  PING: 'PING',
  PONG: 'PONG',
  SYNCTIME: 'SYNCTIME',
  NEWUSER: 'NEWUSER',
  LOADALLPLAYER: 'LOADALLPLAYER',
  REMOVEPLAYER: 'REMOVEPLAYER',
  GAMEREADY: 'GAMEREADY',
  GAMESTART: 'GAMESTART',
  UPDATEACTION: 'UPDATEACTION',
  UPDATEACTIONANOTHER: 'UPDATEACTIONANOTHER'
};

if (typeof module !== 'undefined') {
  module.exports = protocol;
}
