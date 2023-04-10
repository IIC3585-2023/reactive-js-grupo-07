const { Observable, interval } = rxjs;
const { map, combineLatest } = rxjs.operators;
import { DIRECTIONS } from './constants.js';

// Player object
export class Player {
  constructor(x, y, direction, speed) {
    this.x = x;
    this.y = y;
    this.direction = direction; // Canvas tiene que elegir dirección posible para partir
    this.speed = speed;
    this.isLive = true;
    this.n_bombs = 0;
    this.isAlly = false;
  }
  move() {
    this.x += DIRECTIONS[this.direction].x * this.speed;
    this.y += DIRECTIONS[this.direction].y * this.speed;
  }
  changeDirection(direction) {
    this.direction = direction;
  }
  getDestroyed() {
    this.isLive = false;
  }
  getPosition$() {
    return interval(1000) // 60 fps
      .pipe(
        map(() => {
          this.move();
          return { x: this.x, y: this.y };
        })
      );
  }
}

// Ally subclass
export class Ally extends Player {
  constructor(x, y, direction, speed, id) {
    super(x, y, direction, speed);
    this.id = id;
    this.isAlly = true;
    this.kills = 0;
  }
  takeBomb() {
    this.n_bombs += 1;
  }
  attackOtherPlayer(opponentPilot) {
    if (opponentPilot.isAlly) return;
    if (this.n_bombs > 0) {
      opponentPilot.getDestroyed();
      this.n_bombs -= 1;
      this.kills += 1;
    } else {
      this.getDestroyed();
    }
  }
}

// Enemy subclass. It moves faster than the ally
export class Enemy extends Player {
  constructor(x, y, direction, speed) {
    super(x, y, direction, speed);
  }
}
