class SnapShotNPC {
  constructor(npc, _serverTime) {
    for (const key in npc) {
      this[key] = npc[key];
    }

    this.serverTime = _serverTime;
  }
}

module.exports = SnapShotNPC;
