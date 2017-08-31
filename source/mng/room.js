'use strict';

const User = require('./user');

class Room {
  constructor(full) {
    let m_users = {};
    let m_key = null;

    this.Join = _Join;
    this.Leave = _Leave;
    this.FindUserByID = _FindUserByID;
    this.FindUserByName = _FindUserByName;
    this.FindAnotherUsers = _FindAnotherUsers;
    this.GetKey = _GetKey;
    this.SetKey = _SetKey;
    this.GetUserCount = _GetUserCount;
    this.IsFulled = _IsFulled;
    this.IsEmpty = _IsEmpty;

    function _Join(name, socket) {
      if (_GetKey() === null)
        _SetKey(socket.id);

      m_users[socket.id] = new User(name, _GetKey(), socket);
      socket.join(_GetKey());

      return _GetKey();
    }

    function _Leave(socket) {
      if (m_users.hasOwnProperty(socket.id) === false)
        return false;

      socket.leave(_GetKey());
      delete m_users[socket.id];
      return true;
    }

    function _FindUserByID(id) {
      if (m_users.hasOwnProperty(id))
        return m_users[id];

      return null;
    }

    function _FindUserByName(name) {
      for (const id in m_users) {
        if (m_users[id].m_name !== name)
          continue;

        return m_users[id];
      }

      return null;
    }

    function _FindAnotherUsers(myid) {
      const users = [];
      for (const id in m_users) {
        if (myid === id)
          continue;

        users.push(m_users[id]);
      }

      return users;
    }

    function _GetKey() {
      return m_key;
    }

    function _SetKey(key) {
      m_key = key;
    }

    function _GetUserCount() {
      return Object.keys(m_users).length;
    }

    function _IsFulled() {
      if (_GetUserCount() >= full)
        return true;

      return false;
    }

    function _IsEmpty() {
      if (m_users.length === 0)
        return true;

      return false;
    }
  }
}

module.exports = Room;
