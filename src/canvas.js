import { getRandomNumber } from './utils.js';

export class Canvas {
  constructor(cellSize, map, canvasElement, dimension) {
    this.cellSize = cellSize;
    this.canvas = canvasElement;
    this.ctx = canvas.getContext(dimension);
    this.rows = map.split('\n').filter((row) => row != '');
    this.width = this.cellSize * this.rows[0].length;
    this.height = this.cellSize * this.rows.length;
    this.cellOcupied = this.createBitmap(map);
  }

  createBitmap(map) {
    const cellOcupied = map
      .split('\n')
      .filter((row) => row != '')
      .map((row) => row.split('').map((el) => (el === '-' ? true : false)));
    return cellOcupied;
  }

  createMap(cloudImage) {
    // set dimensions and background color
    const canvas = this.canvas;
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // create clouds
    this.rows.map((row, rowIndex) => {
      const columns = row.split('');
      columns.map((cell, colIndex) => {
        if (cell === '-') {
          this.ctx.drawImage(
            cloudImage,
            colIndex * this.cellSize,
            rowIndex * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      });
    });
  }

  createPlayers(player1Image, player2Image = false) {
    const cell = this.getAvailableCell();
    this.ctx.drawImage(
      player1Image,
      cell.col * this.cellSize + 0.1 * this.cellSize,
      cell.row * this.cellSize + 0.1 * this.cellSize,
      0.7 * this.cellSize,
      this.cellSize
    );
    // Falta caso para jugador 2 e instanciar al jugador (crear clase)
  }

  createEnemies(enemieImage, level) {
    const cell = this.getAvailableCell();
    console.log(cell);
    this.ctx.drawImage(
      enemieImage,
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
    // Falta instanciar al enemie y ver cuantos crear segun el nivel(crear clase)
  }

  createMissile(missileImage) {
    const cell = this.getAvailableCell();
    this.ctx.drawImage(
      missileImage,
      cell.col * this.cellSize,
      cell.row * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }

  getAvailableCell() {
    let row, col;
    do {
      row = getRandomNumber(0, this.rows.length - 1);
      col = getRandomNumber(0, this.rows[0].length - 1);
    } while (this.cellOcupied[row][col]);
    return { row, col };
  }
}
