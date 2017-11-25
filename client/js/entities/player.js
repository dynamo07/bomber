// https://github.com/cstuncsik/phaser-es6-demo/tree/master/src

import Info from './info';

const PING = 100 // - Need to be depended on positionUpdaterLoop
const TILE_SIZE = 35

const SPEED = 0
const POWER = 1
const DELAY = 2

const MAX_SPEED = 350
const STEP_SPEED = 50
const INITIAL_SPEED = 150

const MIN_DELAY = 500
const STEP_DELAY = 500
const INITIAL_DELAY = 2000

const INITIAL_POWER = 1
const STEP_POWER = 1

export default class Player extends Phaser.Sprite {

  constructor({ game, id, spawn, color }) {
    super(game, spawn.x, spawn.y, 'bomberman_' + color);

    this.game = game;
    this.id = id;

    this.prevPosition = { x: spawn.x, y: spawn.y };

    this.delay = INITIAL_DELAY;
    this.power = INITIAL_POWER;
    this.speed = INITIAL_SPEED;
    this._lastBombTime = 0;

    this.game.add.existing(this);
    this.game.physics.arcade.enable(this);
    this.body.setSize(20, 20, 0, 0);

    game.time.events.loop(PING , this.positionUpdaterLoop.bind(this));

    this.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
    this.animations.add('down', [8, 9, 10, 11, 12, 13, 14, 15], 15, true);
    this.animations.add('right', [16, 17, 18, 19, 20, 21, 22, 23], 15, true);
    this.animations.add('left', [24, 25, 26, 27, 28, 29, 30, 31], 15, true);

    this.info = new Info({ game: this.game, player: this });
  }

  update () {
    this.handleMoves()
    this.handleBombs()

    this.game.debug.body(this);
    this.game.debug.spriteInfo(this, 32, 32);
  }

  handleMoves () {
    this.body.velocity.set(0);

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.body.velocity.x = -this.speed;
      this.animations.play('left');
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.body.velocity.x = this.speed;
      this.animations.play('right');
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.body.velocity.y = -this.speed;
      this.animations.play('up');
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.body.velocity.y = this.speed;
      this.animations.play('down')
    } else {
      this.animations.stop();
    }
  }

  handleBombs() {
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      let now = this.game.time.now;

      if (now > this._lastBombTime) {
        this._lastBombTime = now + this.delay;

        clientSocket.emit('create bomb', { col: this.currentCol(), row: this.currentRow() });
      }
    }
  }

  currentCol() {
    return Math.floor(this.body.position.x / TILE_SIZE)
  }

  currentRow() {
    return Math.floor(this.body.position.y / TILE_SIZE)
  }


  positionUpdaterLoop() {
    let newPosition = { x: this.position.x, y: this.position.y }

    if (this.prevPosition.x !== newPosition.x || this.prevPosition.y !== newPosition.y) {
      clientSocket.emit('update player position', newPosition);
      this.prevPosition = newPosition;
    }
  }

  pickSpoil( spoil_type ){
    if ( spoil_type === SPEED ){ this.increaseSpeed() }
    if ( spoil_type === POWER ){ this.increasePower() }
    if ( spoil_type === DELAY ){ this.increaseDelay() }

    // DRAW something or play something
  }

  increaseSpeed(){
    if (this.speed < MAX_SPEED) {
      this.speed = this.speed + STEP_SPEED;
      this.info.refreshStatistic();
    }
  }

  increaseDelay(){
    if (this.delay > MIN_DELAY){
      this.delay -= STEP_DELAY;
      this.info.refreshStatistic();
    }
  }

  increasePower(){
    this.power += STEP_POWER;
    this.info.refreshStatistic();
  }
}
