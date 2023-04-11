import { getRandomNumber } from './utils.js';
import { Ally, Enemy } from './player.js';

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
          this.drawElement({ x: colIndex, y: rowIndex, image: cloudImage })
        }
      });
    });
  }

  createPlayers(player1Image, player2Image = false) {
    let players = [];
    const player1Cell = this.getAvailableCell();
    this.drawElement({ x: player1Cell.col, y: player1Cell.row, image: player1Image })
    players.push(new Ally(player1Cell.col, player1Cell.row, 39, 1, 1));
    
    if (player2Image) {
      const player2Cell = this.getAvailableCell();
      this.drawElement({ x: player2Cell.col, y: player2Cell.row, image: player2Image })
      players.push(new Ally(player2Cell.col, player2Cell.row, 39, 1, 2));
    }
    // Falta instanciar al jugador (crear clase)
    return players;
  }

  createEnemies(enemieImage, level) {
    let enemies = [];
    let enemyNumber = level;
    do {
      const cell = this.getAvailableCell();
      this.drawElement({ x: cell.col, y: cell.row, image: enemieImage })
      enemyNumber -= 1;
      enemies.push(new Enemy(cell.col, cell.row, 39, 1));
    } while (enemyNumber > 0);
    // Falta instanciar al enemie
  }

  createMissile(missileImage) {
    const cell = this.getAvailableCell();
    this.drawElement({ x: cell.col, y: cell.row, image: missileImage })
  }

  getAvailableCell() {
    let row, col;
    do {
      row = getRandomNumber(0, this.rows.length - 1);
      col = getRandomNumber(0, this.rows[0].length - 1);
    } while (this.cellOcupied[row][col]);
    this.cellOcupied[row][col] = true;
    return { row, col };
  }

  drawElement(element){
    const { x, y, image } = element;
    this.ctx.drawImage(
      image,
      x * this.cellSize + 0.1 * this.cellSize,
      y * this.cellSize + 0.1 * this.cellSize,
      0.7 * this.cellSize,
      0.8 *this.cellSize
    );
  }

  changeElementPosition(initialPos, finalPos, image){
    console.log(initialPos,this.cellSize)
    this.ctx.clearRect(initialPos.x * this.cellSize, initialPos.y * this.cellSize, this.cellSize, this.cellSize);
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(initialPos.x * this.cellSize, initialPos.y * this.cellSize, this.cellSize, this.cellSize);

    this.drawElement({ x: finalPos.x, y: finalPos.y, image: image })
  }

  movePlayer(element){
    const { x, y, player, image} = element;
    const initialPos = {x: player.x , y: player.y}
    const finalPos = {x: x, y: y}
    this.changeElementPosition(initialPos, finalPos, image)
    player.move(x, y)
  }
}
