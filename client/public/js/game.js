const Game = {
  started: false,
  myid: null,
  playerMap: {},
  inputTypes: {},
  npcMap: {},
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

Game.addNewNPC = function(id, spriteName, pos, speed, fireRate, bulletSpeed) {
  let sprite = phaser.add.sprite(pos.x, pos.y, spriteName);

  sprite.anchor.setTo(0.5, 0.5);
  phaser.physics.arcade.enable(sprite);

  Game.npcMap[id] = sprite;
  Game.npcMap[id].npc = new NPC(id, spriteName, pos.x, pos.y, speed, fireRate, bulletSpeed);
};

Game.addNewPlayer = function(id, pos, angle, bulletspeed, firerate) {
  let sprite = null;
  if (id == Game.myid) {
    sprite = phaser.add.sprite(pos.x, pos.y, 'blueship');
  }
  else
    sprite = phaser.add.sprite(pos.x, pos.y, 'greenship');

  sprite.anchor.setTo(0.5, 0.5);
  phaser.physics.arcade.enable(sprite);

  const player = new Player(id);
  player.InitWeapon(sprite,
    phaser.add.weapon(10, 'bluebullet1'),
    Phaser.Weapon.KILL_WORLD_BOUNDS,
    bulletspeed,
    firerate);

  Game.playerMap[id] = sprite;
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

function PhysicsUpdate(deltaMS) {
  client.InterpolateEntity();
  InputManager();
}

function ServerUpdate(deltaMS) {
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
