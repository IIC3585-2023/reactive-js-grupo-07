import { Ally, Enemy } from './player.js';

export const createPlayers = (
  canvas,
  player1Image,
  player2Image,
  n_players
) => {
  let players = [];
  do {
    const cell = canvas.getAvailableCell();
    const image = players.length === 0 ? player1Image : player2Image;
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
        image
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
  return { x: cell.col, y: cell.row };
};

export const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
