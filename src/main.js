import { Canvas } from './canvas.js';
import { Ally, Enemy } from './player.js';
import {
  CELL_SIZE,
  DIMENSION,
  MAP,
  INITIAL_DIRECTION,
  FPS,
  P1DIRECTIONS,
  P2DIRECTIONS,
} from './constants.js';
import { createPlayers, createEnemies, createMissile } from './utils.js';

const { fromEvent, Observable, interval, combineLatest, zip } = rxjs;
const { map, filter, startWith, distinctUntilChanged, partition } =
  rxjs.operators;

const start_btn = document.getElementById('start_btn');

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
  const player1BombsElement = document.getElementById('player1Bombs');
  const player2BombsElement = document.getElementById('player2Bombs');
  const player1ScoreElement = document.getElementById('player1Score');
  const player2ScoreElement = document.getElementById('player2Score');
  const player1Elements = {
    image: player1Image,
    bombs: player1BombsElement,
    score: player1ScoreElement,
  };
  const player2Elements = {
    image: player2Image,
    bombs: player2BombsElement,
    score: player2ScoreElement,
  };
  const enemieImage = document.getElementById('enemieImage');
  const bombImage = document.getElementById('bombImage');
  let enemyNumber = level.value * 2;

  start_warning.style.display = 'none';

  let players = createPlayers(
    canvas,
    player1Elements,
    player2Elements,
    mode.value
  );
  let enemies = createEnemies(canvas, enemieImage, enemyNumber);
  let missile = createMissile(canvas, bombImage);

  canvas.resetBitmap();

  document.getElementById('enemyNumber').textContent = enemyNumber;

  start_btn.disabled
    ? (start_btn.disabled = false)
    : (start_btn.disabled = true);

  // Create observables for key presses and game ticks
  const keyDown$ = fromEvent(document, 'keydown');
  const tick$ = interval(1000 / FPS);

  let randomDirection$ = interval(1000 / FPS).pipe(
    map(() => P1DIRECTIONS[Math.floor(Math.random() * 4) + 37]),
    filter((direction) => !!direction),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
  );

  // Create direction observables for each player
  let player1Direction$ = keyDown$.pipe(
    map((e) => P1DIRECTIONS[e.keyCode]),
    filter((direction) => !!direction),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
  );

  let player2Direction$ = keyDown$.pipe(
    map((e) => P2DIRECTIONS[e.keyCode]),
    filter((direction) => !!direction),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
  );

  const playersDirection = [player1Direction$, player2Direction$];

  // Create an observable for each player's position
  players.map((player, idx) => {
    playersDirection[idx].subscribe((e) => {
      if (player.direction != e) {
        player.changeDirection(e);
      }
    });
  });

  enemies.map((enemy, idx) => {
    randomDirection$.subscribe((e) => {
      if (enemy.direction != e) {
        enemy.changeDirection(e);
      }
    });
  });

  let entities = players.concat(enemies);

  let positionObservable = entities.map((player) => {
    return player.getPosition$();
  });

  const latestPositions$ = combineLatest(...positionObservable);
  const enemyLastPositions$ = combineLatest(
    positionObservable.slice(mode.value)
  );

  latestPositions$.subscribe((observables) => {
    // movimientos de personajes
    observables.map((observable, idx) => {
      canvas.changeElementPosition({
        initialPos: observable.initialPosition,
        finalPos: observable.finalPosition,
        entity: entities[idx],
        bombImage: bombImage,
      });
    });

    // Logica para agarrar misil
    const missilePos = missile.getPosition();
    observables.map((value, index) => {
      if (canvas.checkCollision(value.finalPosition, missilePos)) {
        const entity = entities[index];
        if (!entity.isAlly) {
          canvas.drawElement({
            x: missilePos.x,
            y: missilePos.y,
            image: bombImage,
          });
        } else {
          entity.takeBomb();
          missile = createMissile(canvas, bombImage);
        }
      }
    });

    // Logica para choque entre personajes ally vs enemy
    observables.map((value, index) => {
      observables.map((value2, index2) => {
        if (index != index2) {
          if (
            canvas.checkCollision(value.finalPosition, value2.finalPosition)
          ) {
            const entity = entities[index];
            if (entity.isAlly) {
              entity.attackOtherPlayer(entities[index2]);
              enemies = enemies.filter((enemy) => enemy.isLive);
              document.getElementById('enemyNumber').textContent = enemies.length;
              if (enemies.length == 0) {
                alert('Felicitaciones! Ha'+ (mode.value == 2 ? 'n': 's')+' conseguido matar a todos los enemigos');
                entities.map((entity) => entity.isLive = false);
                location.reload();
              }
              else if (players.filter((player) => player.isLive).length == 0) {
                alert('Lamentablemente, ha'+ (mode.value == 2 ? 'n': 's')+' sido derrotado'+ (mode.value == 2 ? 's': '')+' :(');
                entities.map((entity) => entity.isLive = false);
                location.reload();
              }
            }
          }
        }
      });
    });
  });
};

main();
