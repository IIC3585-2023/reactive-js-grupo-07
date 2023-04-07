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
const { map, filter, startWith, scan, distinctUntilChanged } = rxjs.operators;

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

  start_warning.style.display = 'none';
  canvas.createPlayers(player1Image, mode.value == 2 ? player2Image : false);
  canvas.createEnemies(enemieImage, level.value);
  canvas.createMissile(bombImage);
};

main();
