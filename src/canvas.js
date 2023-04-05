
export class Canvas {
    constructor(cellSize, map, canvasElement, dimension) {
        this.cellSize = cellSize;
        this.canvas = canvasElement;
        this.ctx = canvas.getContext(dimension);
        this.rows =  map.split('\n').filter((row) => row != '' );
        this.width = this.cellSize * this.rows[0].length;
        this.height = this.cellSize * this.rows.length 
    }

    createMap(cloudImage) {
        // set dimensions and background color
        const canvas = this.canvas;
        canvas.setAttribute('width', this.width);
        canvas.setAttribute('height', this.height);
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(
            0,
            0,
            this.width,
            this.height
        );
        
        // create clouds 
        this.rows.map((row, rowIndex) => {
            const columns = row.split('')
            columns.map((cell, colIndex) => {
                if (cell === '-') {
                    this.ctx.drawImage(cloudImage, 
                        colIndex * this.cellSize,
                        rowIndex * this.cellSize,
                        this.cellSize,
                        this.cellSize);
                }
            });
        });
    }

    createPlayers(player1Image, player2Image = false){
        const cell = this.getAvailableCell('first')
        this.ctx.drawImage(player1Image, 
            cell.col * this.cellSize,
            cell.row * this.cellSize,
            this.cellSize,
            this.cellSize);
        // Falta caso para jugador 2 e instanciar al jugador (crear clase)
    }

    createEnemies(enemieImage, level){
        const cell = this.getAvailableCell('last')
        console.log(cell)
        this.ctx.drawImage(enemieImage, 
            cell.col * this.cellSize,
            cell.row * this.cellSize,
            this.cellSize,
            this.cellSize);
        // Falta instanciar al enemie y ver cuantos crear segun el nivel(crear clase)
    }

    getAvailableCell(order){
        // Falta revisar que no este ocupada por otro peronsaje ni misil ni bomba, etc....
        const rowArray = order == 'first' ? this.rows : this.rows.slice(0).reverse()
        for (var i = 0; i < rowArray.length; i++) {
            const columns = rowArray[i].split('')
            const colIndex = columns.findIndex(element => {
                return element == ' ';
              });
            if(colIndex != -1){
                return {'row': order == 'first' ? i : rowArray.length - i, 'col': colIndex}
            }
        }
    }
}
