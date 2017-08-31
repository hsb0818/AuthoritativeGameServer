const Game = {
  started: false,
  myid: null,
  player_map: {},
  input_types: {},
};

Game.Play = () => {
  console.log('game start');
  Game.started = true;
};

Game.init = () => {
  phaser.state.disableVisibilityChange = true;
};

Game.preload = () => {
  phaser.load.tilemap('map', './assets/map/testmap.json', null, Phaser.Tilemap.TILED_JSON);
  phaser.load.spritesheet('tileset', './assets/map/tilesheet.png', 32, 32);
  phaser.load.image('sprite','./assets/img/sprite.png');
};

Game.create = () => {
  let map = phaser.add.tilemap('map');
  map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
  let layer;
  for(var i = 0; i < map.layers.length; i++) {
      layer = map.createLayer(i);
  }
  layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer

  Game.input_types[Phaser.Keyboard.LEFT] = MOVEMENT.LEFT;
  Game.input_types[Phaser.Keyboard.RIGHT] = MOVEMENT.RIGHT;
  Game.input_types[Phaser.Keyboard.UP] = MOVEMENT.UP;
  Game.input_types[Phaser.Keyboard.DOWN] = MOVEMENT.DOWN;

  client.NewUser();
//  Client.Ping();
  client.GameReady();
};

let fps_timer = 0;
let sps_timer = 0;
Game.update = () => {
  if (Game.started !== true)
    return;

  const time = Date.now();
  if (time - fps_timer >= CONFIG.FPS) {
    PhysicsUpdate();
    fps_timer = time;
  }
  else
    fps_timer += phaser.time.elapsedMS;

  if (sps_timer >= CONFIG.SPS) {
    ServerUpdate();
    sps_timer -= CONFIG.SPS;
  }
  else
    sps_timer += phaser.time.elapsedMS;
};

Game.addNewPlayer = function(id, x, y) {
  Game.player_map[id] = phaser.add.sprite(x, y, 'sprite');
  Game.player_map[id].player = new Player(id, x, y);
};

Game.removePlayer = (id) => {
  if (Game.player_map.hasOwnProperty(id) === false)
    return;

  Game.player_map[id].destroy();
  delete Game.player_map[id];
};

function PhysicsUpdate() {
  InputManager();
}

function ServerUpdate() {
}

function InputManager() {
  const deltatime = phaser.time.elapsedMS / 1000;
  const hero = Game.player_map[Game.myid];

  for (const type in Game.input_types) {
    if (phaser.input.keyboard.isDown(type))
      client.Input({
        type: Game.input_types[type],
        deltatime: deltatime
      });
  }
}
