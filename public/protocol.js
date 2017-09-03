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
  UPDATEMOVEMENT: 'UPDATEMOVEMENT',
  UPDATEMOVEMENTANOTHER: 'UPDATEMOVEMENTANOTHER'
};

if (typeof module !== 'undefined') {
  module.exports = protocol;
}
