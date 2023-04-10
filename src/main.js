import { Canvas } from './canvas.js';
import {
  CELL_SIZE,
  DIMENSION,
  MAP,
  SPEED,
  INITIAL_DIRECTION,
} from './constants.js';
import { nextDirection } from './utils.js';

const { fromEvent, Observable, interval } = rxjs;
const {
  map,
  filter,
  startWith,
  scan,
  distinctUntilChanged,
  pipe,
  combineLatest,
  withLatestFrom,
} = rxjs.operators;

const start_btn = document.getElementById('start_btn');
let keyDown$ = fromEvent(document.body, 'keydown');

let tick$ = interval(SPEED);

let direction$ = keyDown$.pipe(
  map((e) => DIRECTIONS[e.keyCode]),
  filter((direction) => !!direction),
  startWith(INITIAL_DIRECTION),
  scan(nextDirection),
  distinctUntilChanged()
);

let randomDirection$ = interval(1000).pipe(
  map(() => DIRECTIONS[Math.floor(Math.random() * 4) + 37]),
  filter((direction) => !!direction),
  startWith(INITIAL_DIRECTION),
  scan(nextDirection),
  distinctUntilChanged()
);

const main = () => {
  const canvasElement = document.getElementById('canvas');
  const cloudImage = document.getElementById('cloudImage');

  const canvas = new Canvas(CELL_SIZE, MAP, canvasElement, DIMENSION);
  canvas.createMap(cloudImage);

  start_btn.onclick = function () {
    startGame(canvas);
  };
};

const startGame = (canvas) => {
  const start_warning = document.getElementById('start_warning');
  const mode = document.getElementById('mode');
  const level = document.getElementById('level');

  if (level.value == 'Level' || mode.value == 'Mode') {
    start_warning.style.display = 'block';
    return;
  }

  const player1Image = document.getElementById('player1Image');
  const player2Image = document.getElementById('player2Image');
  const enemieImage = document.getElementById('enemieImage');
  const bombImage = document.getElementById('bombImage');
  let enemyNumber = level.value * 2;

  start_warning.style.display = 'none';
  let players = canvas.createPlayers(
    player1Image,
    mode.value == 2 ? player2Image : false
  );
  let enemiesArr = canvas.createEnemies(enemieImage, enemyNumber);
  document.getElementById('enemyNumber').textContent = enemyNumber;
  canvas.createMissile(bombImage);
  start_btn.disabled
    ? (start_btn.disabled = false)
    : (start_btn.disabled = true);

  let position$ = players[0].getPosition$();
  position$.subscribe((e) =>
    canvas.drawAlly({ x: e.x, y: e.y, image: player1Image })
  );
  //position$.subscribe((e) => console.log(e.x));

  // position$.subscribe((e) => console.log(e));

  // // Create an observable for each enemy's position
  // const enemies$ = enemiesArr.map((enemy) => {
  //   return interval(16).pipe(() => {
  //     enemy.move();
  //     return { x: enemy.x, y: enemy.y };
  //   });
  // });

  // // Combine the direction$ observable with each enemy's position observable
  // const enemiesWithDirection$ = enemiesArr.map((enemy, i) => {
  //   return randomDirection$.combineLatest(
  //     enemies$[i],
  //     (direction, position) => {
  //       enemy.changeDirection(direction);
  //       return position;
  //     }
  //   );
  // });

  // // Subscribe to each enemy's observable to update their position on the canvas
  // enemiesWithDirection$.forEach((enemy$) => {
  //   enemy$.subscribe((position) => {
  //     // Update enemy's position on the canvas
  //     canvas.drawEnemy({ x: position.x, y: position.y, image: enemieImage });
  //   });
  // });
};

main();
