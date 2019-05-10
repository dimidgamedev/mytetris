canvasObject = document.getElementById('canvas')
contextObject = canvasObject.getContext('2d')
scoresElement = document.getElementById('scores')
blocksElement = document.getElementById('blocks')
scores = 0
blocks = 0
fieldWidthInTiles = 10; 
fieldHeightInTails = 20; 
columnProportion = 30; 
xCoordinate = 3; 
yCoordinate = -1; 
tm = 0; 
dwn=0;
cell=[];

blockShapeMatrix = [
    '00001111',
    '01100110',
    '00100111',
    '01000111',
    '00010111',
    '00110110',
    '01100011'
];

const setInitialFieldState = () => {
    for (r=0; r < fieldHeightInTails; r++) {
        cell[r] = [];
        for (c = 0; c < fieldWidthInTiles; c++) {
            cell[r][c] = 0;
        }
    }
}

/**
 * Generate new random block
 *
 * @returns
 */
function generateNewBlock() {
    blocks++;
    return('0000'+blockShapeMatrix[Math.floor(Math.random()*7)]+'0000');
} 

/**
 * Draw rows in Context
 *
 * @param {*} type
 * @param {*} row
 */
const drawRows = (type, row) => {
    for (currentRow = 0; currentRow < fieldHeightInTails; currentRow++) {
        let counter = 0;
        for (currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
            contextObject.fillStyle = "#ddd"

            if (cell[currentRow][currentColumn]) {
                contextObject.fillStyle = "#000"
                counter ++
            }
            contextObject.fillRect(currentColumn * columnProportion, currentRow * columnProportion, columnProportion - 1, columnProportion - 1);
            if (type == 2 && fieldHeightInTails - currentRow < row + 1) {
                cell[fieldHeightInTails-currentRow][currentColumn] = cell[fieldHeightInTails-currentRow-1][currentColumn]
            }
        }
        if (counter == fieldWidthInTiles) {
            // Fill one line
            scores ++
            for (currentColumn=0;currentColumn<fieldWidthInTiles;currentColumn++) cell[currentRow][currentColumn] = 0;
            drawRows(2, currentRow);
        }
    }
}

/**
 * Check field and redraw context
 *
 * @param {*} type
 * @param {number} [n=0]
 */
const checkField = (type,n=0) => {
    out = '';
    fnd = 0;
    for ( r= 0; r < 4; r++) {
        for (c=0;c<4;c++) {
            if (csh[c+r*4]==1) {
                if (type==1) {
                    contextObject.fillStyle = '#000';
                    contextObject.fillRect(c*columnProportion+xCoordinate*columnProportion,r*columnProportion+yCoordinate*columnProportion,columnProportion-1,columnProportion-1);
                }
                if (type==2) if (r+yCoordinate>fieldHeightInTails-2||cell[r+yCoordinate+1][c+xCoordinate]==1) {
                    checkField(3);csh = generateNewBlock();xCoordinate=3;yCoordinate=-1;dwn=0;
                }
                if (type==3) cell[r+yCoordinate][c+xCoordinate] = 1;
                if (type==5) if ((c+xCoordinate>fieldWidthInTiles-2&&n==1)||(c+xCoordinate<1&&n==-1)) fnd = 1;
            }
            if (type==4) out += csh[r+(3-c)*4];
        }
    }
    csh = type==4 ? out : csh;
    if (!fnd) xCoordinate += n;
}

const game = () => {
    tm++;
    if (tm > 20 || dwn) {
        yCoordinate++;
        tm = 0;
        checkField(2);
    }
    drawRows(1,0);
    checkField(1);
    scoresElement.innerHTML = scores;
    blocksElement.innerHTML = blocks;
}

csh = generateNewBlock()

setInitialFieldState()

setInterval(game,33);

/**
 * Process Keys from keyboard
 *
 * @param {*} evt
 */
const processKeyCodes = (evt) => {
    switch(evt.keyCode) {
        case 37:
            // Press LEFT key - > Move left
            checkField(5, -1);
            break;
        case 38:
            // Press UP Key -> Rotate
            checkField(4);
            break;
        case 39:
            // Press RIGHT Key -> Mode right
            checkField(5, 1);
            break;
        case 40:
            // Press DOWN Key -> Move down (drop)
            dwn = 1;
            break;
    }
}

// Add event listener to process keyboard keys
document.addEventListener('keydown', processKeyCodes);
