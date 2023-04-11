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
import {
  createPlayers,
  createEnemies,
  createMissile
} from './utils.js';

const { fromEvent, Observable, interval, combineLatest} = rxjs;
const { map, filter, startWith, distinctUntilChanged } = rxjs.operators;

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
    score: player1ScoreElement
  }
  const player2Elements = {
    image: player2Image, 
    bombs: player2BombsElement, 
    score: player2ScoreElement
  }
  const enemieImage = document.getElementById('enemieImage');
  const bombImage = document.getElementById('bombImage');
  let enemyNumber = level.value * 2;

  start_warning.style.display = 'none';

  let players = createPlayers(canvas, player1Elements, player2Elements, mode.value);
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

  let randomDirection$ = interval(10).pipe(
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

  // let playersObservable = players.map((player) => {
  //   return player.getPosition$();
  // });
  // let combined$;
  // if (mode.value == 1) {
  //   combined$ = playersObservable[0];
  // } else {
  //   combined$ = playersObservable[0].pipe(
  //     combineLatest(playersObservable[1], (p1, p2) => {
  //       return [p1, p2];
  //     })
  //   );
  // }
  // combined$.pipe(scan((takeBomb, createMissile(canvas, bombImage))));
  // combined$.subscribe((e) => console.log(e));


  // const missileObservable$ = missile.getPosition$()
  // missileObservable$.subscribe((position) => {
  //   entities.map((entity) => {
  //     if (entity.x == position.x && entity.y == position.y) {
  //       if(!entity.isAlly){
  //         canvas.drawElement({ x: position.x, y: position.y, image: bombImage})
  //       }
  //       else{
  //         entity.takeBomb()
  //         missile = createMissile(canvas, bombImage)
  //       }
  //     }
  //   });
  // })

  const latestPositions$ = combineLatest(...positionObservable);

  latestPositions$.subscribe((observables) => {

    // movimientos de personajes
    observables.map((observable, idx) => {
      canvas.changeElementPosition({
        initialPos: observable.initialPosition,
        finalPos: observable.finalPosition,
        image: entities[idx].image,
      });
    });

    // Logica para agarrar misil
    const missilePos = missile.getPosition()
    observables.map((value, index) => {
      if(value.finalPosition.x == missilePos.x && value.finalPosition.y == missilePos.y){
        const entity = entities[index]
        if(!entity.isAlly){
          canvas.drawElement({ x: value.finalPosition.x , y: value.finalPosition.y, image: bombImage})
        }
        else{
          entity.takeBomb()
          missile = createMissile(canvas, bombImage)
        }
      }
    })
  });

  //position$.subscribe((e) => console.log(e));

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
  //     canvas.drawElement({ x: position.x, y: position.y, image: enemieImage });
  //   });
  // });
};

main();
