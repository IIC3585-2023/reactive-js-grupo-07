import { Canvas } from './canvas.js';
import {
  CELL_SIZE,
  DIMENSION,
  MAP,
  INITIAL_DIRECTION,
  FPS,
  P1DIRECTIONS,
  P2DIRECTIONS,
} from './constants.js';
import { createPlayers, createEnemies, createBomb } from './utils.js';

const { fromEvent, interval, combineLatest } = rxjs;
const { map, filter, startWith, distinctUntilChanged,  } = rxjs.operators;
const start_btn = document.getElementById('start_btn');

const setDirections = () => {
  const keyDown$ = fromEvent(document, 'keydown');
  const tick$ = interval(1000 / FPS);

  let enemyDirection$ = tick$.pipe(
    map(() => P1DIRECTIONS[Math.floor(Math.random() * 4) + 37]),
    filter((direction) => !!direction),
    startWith(INITIAL_DIRECTION),
    distinctUntilChanged()
  );

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

  return [enemyDirection$, player1Direction$ , player2Direction$]
}

const setHtmlElements = () => {
  const player1Image = document.getElementById('player1Image');
  const player2Image = document.getElementById('player2Image');
  const player1BombsElement = document.getElementById('player1Bombs');
  const player2BombsElement = document.getElementById('player2Bombs');
  const player1ScoreElement = document.getElementById('player1Score');
  const player2ScoreElement = document.getElementById('player2Score');
  const enemieImage = document.getElementById('enemieImage');
  const bombImage = document.getElementById('bombImage');

  const htmlElements = {
    enemieImage: enemieImage,
    bombImage: bombImage,
    player1Elements: {
      image: player1Image,
      bombs: player1BombsElement,
      score: player1ScoreElement,
    },
    player2Elements: {
      image: player2Image,
      bombs: player2BombsElement,
      score: player2ScoreElement,
    }
  }

  return htmlElements;
}

const applyDirections = (players, playersDirection, enemies, enemyDirection$) => {
  players.map((player, idx) => {
    playersDirection[idx].subscribe((e) => {
      if (player.direction != e) {
        player.changeDirection(e);
      }
    });
  });

  enemies.map((enemy, idx) => {
    enemyDirection$.subscribe((e) => {
      if (enemy.direction != e) {
        enemy.changeDirection(e);
      }
    });
  });
}

const startGame = (canvas) => {
  const start_warning = document.getElementById('start_warning');
  const mode = document.getElementById('mode');
  const level = document.getElementById('level');
  let playing = true;

  if (level.value == 'Level' || mode.value == 'Mode') {
    start_warning.style.display = 'block';
    return;
  }
  let enemyNumber = level.value * 2;
  document.getElementById('enemyNumber').textContent = enemyNumber;
  start_warning.style.display = 'none';
  start_btn.disabled
    ? (start_btn.disabled = false)
    : (start_btn.disabled = true);

  const htmlElements = setHtmlElements()

  let players = createPlayers(
    canvas,
    htmlElements.player1Elements,
    htmlElements.player2Elements,
    mode.value
  );
  let enemies = createEnemies(canvas, htmlElements.enemieImage, enemyNumber);
  let bomb = createBomb(canvas, htmlElements.bombImage);

  canvas.resetBitmap();

  let [enemyDirection$,  player1Direction$, player2Direction$] = setDirections()
  const playersDirection = [player1Direction$, player2Direction$];
  applyDirections(players, playersDirection, enemies, enemyDirection$)

  let entities = players.concat(enemies);
  let positionObservable = entities.map((player) => {
    return player.getPosition$();
  });
  const latestPositions$ = combineLatest(...positionObservable);
  latestPositions$.subscribe((observables) => {

    observables.map((observable, idx) => {
      canvas.changeElementPosition({
        initialPos: observable.initialPosition,
        finalPos: observable.finalPosition,
        entity: entities[idx],
        bombImage: bombImage,
      });
    });

    const bombPos = bomb.getPosition();
    observables.map((value, index) => {
      if (canvas.checkCollision(value.finalPosition, bombPos)) {
        const entity = entities[index];
        if (entity.isAlly) {
          entity.takeBomb();
          bomb = createBomb(canvas, bombImage);
        }
      }
    });

    observables.map((value, index) => {
      observables.map((value2, index2) => {
        if (playing) {
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
                    playing = false;
                    location.reload();
                  }
                  else if (players.filter((player) => player.isLive).length == 0) {
                    alert('Lamentablemente, ha'+ (mode.value == 2 ? 'n': 's')+' sido derrotado'+ (mode.value == 2 ? 's': '')+' :(');
                    entities.map((entity) => entity.isLive = false);
                    playing = false;
                    location.reload();
                  }
                }
              }
            }
          }
      });
    });
  });
};

const main = () => {
  const canvasElement = document.getElementById('canvas');
  const cloudImage = document.getElementById('cloudImage');

  const canvas = new Canvas(CELL_SIZE, MAP, canvasElement, DIMENSION);
  canvas.createMap(cloudImage);

  start_btn.onclick = function () {
    startGame(canvas);
  };
};


main();
