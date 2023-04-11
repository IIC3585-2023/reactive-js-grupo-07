import { Ally, Enemy, Missile } from './player.js';

export const createPlayers = (
  canvas,
  player1Elements,
  player2Elements,
  n_players
) => {
  let players = [];
  do {
    const cell = canvas.getAvailableCell();
    const image = players.length === 0 ? player1Elements.image : player2Elements.image;
    const bombElement = players.length === 0 ? player1Elements.bombs : player2Elements.bombs;
    const scoreElement = players.length === 0 ? player1Elements.score : player2Elements.score;
    canvas.drawElement({
      x: cell.col,
      y: cell.row,
      image: image,
    });
    players.push(
      new Ally(
        cell.col,
        cell.row,
        39,
        n_players - players.length,
        canvas,
        image,
        bombElement,
        scoreElement
      )
    );
  } while (players.length < n_players);
  return players;
};

export const createEnemies = (canvas, enemieImage, enemyNumber) => {
  let enemies = [];
  do {
    const cell = canvas.getAvailableCell();
    canvas.drawElement({ x: cell.col, y: cell.row, image: enemieImage });
    enemies.push(new Enemy(cell.col, cell.row, 39, canvas, enemieImage));
  } while (enemies.length < enemyNumber);
  return enemies;
};

export const createMissile = (canvas, missileImage) => {
  const cell = canvas.getAvailableCell();
  canvas.drawElement({ x: cell.col, y: cell.row, image: missileImage });
  canvas.resetBitmap();
  const missile = new Missile(cell.col, cell.row, canvas, missileImage);
  return missile;
};

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
