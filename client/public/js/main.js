var phaser = new Phaser.Game(CONFIG.SCREEN_WIDTH, CONFIG.SCREEN_HEIGHT, Phaser.CANVAS, document.getElementById('game'));
phaser.state.add('Game', Game);
phaser.state.start('Game');
