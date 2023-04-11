const { Observable, interval } = rxjs;
const { map, combineLatest } = rxjs.operators;
import { P1DIRECTIONS, P2DIRECTIONS, FPS } from './constants.js';

// Player object
export class Player {
  constructor(x, y, direction, canvas, image) {
    this.x = x;
    this.y = y;
    this.direction = { x: 1, y: 0 }; // Canvas tiene que elegir dirección posible para parti4
    this.canvas = canvas;
    this.image = image;
    this.isLive = true;
  }
  move() {
    const tempx = this.x + this.direction.x;
    const tempy = this.y + this.direction.y;
    if (!this.canvas.wallCollision({ x: tempx, y: tempy })) {
      this.x = tempx;
      this.y = tempy;
    }
  }
  changeDirection(direction) {
    this.direction = direction;
  }
  getDestroyed() {
    this.isLive = false;
  }
  getPosition$() {
    return interval(1000 / FPS) // 30 fps
      .pipe(
        map(() => {
          const initialPosition = { x: this.x, y: this.y };
          this.move();
          const finalPosition = { x: this.x, y: this.y };
          return { initialPosition, finalPosition };
        })
      );
  }
}

// Ally subclass
export class Ally extends Player {
  constructor(x, y, direction, id, canvas, image) {
    super(x, y, direction, canvas, image);
    this.id = id;
    this.isAlly = true;
    this.kills = 0;
    this.n_bombs = 0;
  }
  takeBomb() {
    this.n_bombs += 1;
  }
  changeDirection(direction) {
    this.direction = direction;
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
  constructor(x, y, direction, canvas, image) {
    super(x, y, direction, canvas, image);
    console.log(this.direction);
    this.isAlly = false;
  }
  changeDirection(direction) {
    const pos = { x: this.x + this.direction.x, y: this.y + this.direction.y };
    if (this.canvas.wallCollision(pos)) {
      this.direction = direction;
    }
  }
}
