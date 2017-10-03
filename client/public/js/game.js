const Game = {
  started: false,
  myid: null,
  playerMap: {},
  inputTypes: {},
  npcMap: {},
  bulletMap: {},
  npcGroup: null,
  playerGroup: null,
};

Game.Play = () => {
  console.log('game start');
  Game.started = true;
};

Game.init = () => {
  phaser.stage.backgroundColor = "#000000";
  phaser.stage.disableVisibilityChange = true;
};

Game.preload = () => {
//  phaser.load.tilemap('map', './assets/map/testmap.json', null, Phaser.Tilemap.TILED_JSON);
//  phaser.load.spritesheet('tileset', './assets/map/tilesheet.png', 32, 32);
  phaser.load.image('blueship','./assets/img/playerShip1_blue.png');
  phaser.load.image('greenship','./assets/img/playerShip1_green.png');
  phaser.load.image('bluebullet1','./assets/img/Bullet1_blue.png');
  phaser.load.image('npc1','./assets/img/ufo_yel.png');
};

Game.create = () => {
  /*
  let map = phaser.add.tilemap('map');
  map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
  let layer;
  for(var i = 0; i < map.layers.length; i++) {
      layer = map.createLayer(i);
  }
  layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
  */

  Game.playerGroup = phaser.add.group();
  Game.playerGroup.enableBody = true;
  Game.playerGroup.physicsBodyType = Phaser.Physics.ARCADE;

  Game.npcGroup = phaser.add.group();
  Game.npcGroup.enableBody = true;
  Game.npcGroup.physicsBodyType = Phaser.Physics.ARCADE;

  Game.inputTypes[Phaser.Keyboard.LEFT] = ACTION.LEFT;
  Game.inputTypes[Phaser.Keyboard.RIGHT] = ACTION.RIGHT;
  Game.inputTypes[Phaser.Keyboard.UP] = ACTION.UP;
  Game.inputTypes[Phaser.Keyboard.DOWN] = ACTION.DOWN;

  client.NewUser();
  client.Ping();
  client.GameReady();
};

let fps_timer = 0;
let sps_timer = 0;
Game.update = () => {
  if (Game.started !== true)
    return;

  const time = Date.now();
  if (time - fps_timer >= CONFIG.FPS) {
    PhysicsUpdate(phaser.time.elapsedMS);
    fps_timer = time;
  }
  else
    fps_timer += phaser.time.elapsedMS;

  if (sps_timer >= CONFIG.SPS) {
    ServerUpdate(phaser.time.elapsedMS);
    sps_timer -= CONFIG.SPS;
  }
  else
    sps_timer += phaser.time.elapsedMS;
};

Game.render = () => {
  if (Game.started !== true)
    return;
};

Game.addNewNPC = function(id, spriteName, pos, speed, fireRate, bulletSpeed, hp, power) {
  let sprite = Game.npcGroup.create(pos.x, pos.y, spriteName);
  sprite.name = id.toString();
  sprite.anchor.setTo(0.5, 0.5);

  Game.npcMap[id] = sprite;

  const npc = new NPC(sprite, id, speed, fireRate, bulletSpeed,
    hp, power, phaser.add.group());

  npc.LoadBullet('bluebullet1', Phaser.Physics.ARCADE);

  Game.npcMap[id].npc = npc;
};

Game.addNewPlayer = function(id, pos, speed, angle, fireRate, bulletSpeed, hp, power) {
  let sprite = null;
  if (id == Game.myid) {
    sprite = Game.playerGroup.create(pos.x, pos.y, 'blueship');
  }
  else
    sprite = Game.playerGroup.create(pos.x, pos.y, 'greenship');

  sprite.name = id.toString();
  sprite.anchor.setTo(0.5, 0.5);

  Game.playerMap[id] = sprite;

  const player = new Player(sprite, id, speed, fireRate, bulletSpeed,
    hp, power, phaser.add.group());

  player.LoadBullet('bluebullet1', Phaser.Physics.ARCADE);

  Game.playerMap[id].player = player;
};

Game.removeNPC = (id) => {
  if (Game.npcMap.hasOwnProperty(id) === false)
    return;

  Game.npcMap[id].destroy();
  delete Game.npcMap[id];
};

Game.removePlayer = (id) => {
  if (Game.playerMap.hasOwnProperty(id) === false)
    return;

  Game.playerMap[id].destroy();
  delete Game.playerMap[id];
};

Game.removeBullet = (playerId, bulletID) => {
  const idx = parseInt(bulletID); // id is order on bullet array.
  const player = Game.playerMap[playerId].player;
  const bullet = player.bulletGroup.children[idx];
  bullet.kill();
};

Game.UpdateNPC = (snapshot) => {
  if (Game.npcMap.hasOwnProperty(snapshot.id) === false)
    return false;

  const npc = Game.npcMap[snapshot.id].npc;
  npc.UpdateState(snapshot);

  return true;
};

function PhysicsUpdate(deltaMS) {
  client.InterpolateEntity();
  InputManager();
  CollisionDetection();
}

function ServerUpdate(deltaMS) {
}

function CollisionDetection() {
  const player = Game.playerMap[Game.myid].player;
  phaser.physics.arcade.overlap(player.bulletGroup, Game.npcGroup, CollisionHandlerBullet);
}

function InputManager() {
  const deltaTime = phaser.time.elapsedMS / 1000;
  const hero = Game.playerMap[Game.myid];

  if (phaser.input.activePointer.isDown) {
    client.Fire(Game.myid, ACTION.FIRE);
  }

  const angle = phaser.physics.arcade.angleToPointer(hero) * 180 / Math.PI;

  for (const type in Game.inputTypes) {
    if (phaser.input.keyboard.isDown(type)) {
      client.Input({
        type: Game.inputTypes[type],
        angle: angle,
        deltaTime: deltaTime,
      });
    }
  }

  client.Input({
    type: ACTION.ROTATE,
    angle: angle,
    deltaTime: deltaTime,
  });
}

function CollisionHandlerBullet(bullet, target) {
  client.CollisionHandlerBullet(bullet, target);
  bullet.kill();
}
