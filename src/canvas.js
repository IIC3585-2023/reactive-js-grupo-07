import { getRandomNumber } from './utils.js';

export class Canvas {
  constructor(cellSize, map, canvasElement, dimension) {
    this.canvas = this.createCanvas(canvasElement);
    this.rows = this.convertMap(map);
    this.map = map;
    this.cellSize = cellSize;
    this.width = this.cellSize * this.rows[0].length;
    this.height = this.cellSize * this.rows.length;
    this.cellOcupied = this.createBitmap(map);
    this.ctx = canvas.getContext(dimension);
  }

  createCanvas(canvasElement) {
    canvasElement.setAttribute('width', this.width);
    canvasElement.setAttribute('height', this.height);
    return canvasElement;
  }

  convertMap(map) {
    return map.split('\n').filter((row) => row != '');
  }

  createBitmap(map) {
    const cellOcupied = map
      .split('\n')
      .filter((row) => row != '')
      .map((row) => row.split('').map((el) => (el === '-' ? true : false)));
    return cellOcupied;
  }

  resetBitmap() {
    this.cellOcupied = this.createBitmap(this.map);
  }

  renderGame(scene) {
    this.renderMap(ctx);
    this.renderPlayers(ctx, scene.players);
    this.renderEnemies(ctx, scene.enemies);
    this.renderMissiles(ctx, scene.missiles);
    this.renderScore(ctx, scene.score);
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
          this.drawElement({ x: colIndex, y: rowIndex, image: cloudImage });
        }
      });
    });
  }

  renderMap() {
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.cellOcupied.map((row, rowIndex) => {
      row.map((cell, colIndex) => {
        if (cell) {
          this.drawElement({ x: colIndex, y: rowIndex, image: cloudImage });
        }
      });
    });
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

  drawElement(element) {
    const { x, y, image } = element;
    this.ctx.drawImage(
      image,
      x * this.cellSize + 0.1 * this.cellSize,
      y * this.cellSize + 0.1 * this.cellSize,
      0.7 * this.cellSize,
      0.8 * this.cellSize
    );
  }

  deleteElement(pos){
    const { x, y} = pos;
    this.ctx.clearRect(
      x * this.cellSize,
      y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
    this.ctx.fillStyle = 'lightblue';
    this.ctx.fillRect(
      x * this.cellSize,
      y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
  }
  changeElementPosition(element) {
    const { initialPos, finalPos, image } = element;
    this.deleteElement({x: initialPos.x, y: initialPos.y})
    this.drawElement({ x: finalPos.x, y: finalPos.y, image: image });
  }

  checkCollision(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  wallCollision(pos) {
    return (
      pos.y < 0 ||
      pos.y >= this.height ||
      pos.x < 0 ||
      pos.x >= this.width ||
      this.cellOcupied[pos.y][pos.x]
    );
  }
}
