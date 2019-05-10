canvasObject = document.getElementById('canvas')
contextObject = canvasObject.getContext('2d')
scoresElement = document.getElementById('scores')
blocksElement = document.getElementById('blocks')

scores = 0
blocks = 0
fieldWidthInTiles = 10 
fieldHeightInTails = 20
columnProportion = 30
xCoordinate = 3 
yCoordinate = -1
timeToMoveBlockDown = 0
timeToMoveBlockDownLimit = 20
down = 0
gameField = []
defaultColor = '#000'

blockShapeMatrix = [
    '00001111',
    '01100110',
    '00100111',
    '01000111',
    '00010111',
    '00110110',
    '01100011'
];

/**
 * Устанавливаем начальное заполнение игрового поля
 *
 */
const setInitialFieldState = () => {
    // Пройдемся по строчкам поля
    for (let currentRow=0; currentRow < fieldHeightInTails; currentRow++) {
        // Заполним поле как пустой массив
        gameField[currentRow] = [];
        // Пройдемся по колонкам в каждой строке поля
        for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
            // Заполним пустыми ячейками в строке
            gameField[currentRow][currentColumn] = 0;
        }
    }
}

/**
 * Генерируем новый блок для игры
 *
 * @returns Новый сгенерированный случайным образом блок
 */
function generateNewBlock() {
    blocks++;
    let generatedBlockShape = '0000'+blockShapeMatrix[Math.floor(Math.random()*7)]+'0000';
    return(generatedBlockShape);
} 

/**
 * Прорисовываем поле
 *
 * @param {*} type Тип операции
 * @param {*} row  Строка
 */
const drawRowsAndCellsInTheField = (type, row) => {
    // Проход по горизонталям поля 
    for (let currentRow = 0; currentRow < fieldHeightInTails; currentRow++) {
        let counter = 0;
        // Проход по вертикалям поля
        for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
            contextObject.fillStyle = "#ddd"
            //  Заполним текущую ячейку поля пустым значением 
            if (gameField[currentRow][currentColumn]) {
                contextObject.fillStyle = defaultColor
                counter ++
            }
            // Зарисуем квадрат фигур
            contextObject.fillRect(
                currentColumn * columnProportion,
                currentRow * columnProportion, 
                columnProportion - 1, 
                columnProportion - 1
            );
            
            if (type == 2 && fieldHeightInTails - currentRow < row + 1) {
                gameField[fieldHeightInTails-currentRow][currentColumn] = gameField[fieldHeightInTails-currentRow-1][currentColumn]
            }
        }

        // Если линия заполнена
        if (counter == fieldWidthInTiles) {
            // Нарастим очки игрока
            scores ++
            // Удалим линию
            for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
                gameField[currentRow][currentColumn] = 0
            }
            // Перерисуем линию
            drawRowsAndCellsInTheField(2, currentRow);
        }
    }
}

/**
 * Check field and redraw context
 *
 * @param {*} type
 * @param {number} [number=0]
 */
const checkField = (type, number = 0) => {
    out = '';
    fnd = 0;
    // Проход по горизонталям блока 
    for (let currentRow = 0; currentRow < 4; currentRow++) {
        // Проход по вертикалям блока
        for (let currentColumn = 0; currentColumn < 4; currentColumn++) {
            if (incomingBlock[currentColumn + currentRow * 4] == 1) {
                // Зарисуем в соответствии с типом
                if (type == 1) {
                    contextObject.fillStyle = defaultColor
                    contextObject.fillRect(
                        currentColumn * columnProportion + xCoordinate * columnProportion,
                        currentRow * columnProportion + yCoordinate * columnProportion,
                        columnProportion - 1, columnProportion-1
                    )
                }
                if (type == 2) {
                    if (currentRow + yCoordinate > fieldHeightInTails - 2 || gameField[currentRow + yCoordinate + 1][currentColumn + xCoordinate] == 1) {
                        checkField(3);
                        incomingBlock = generateNewBlock();
                        xCoordinate=3;
                        yCoordinate=-1;
                        down=0;
                    }
                }
                if (type == 3) {
                    gameField[currentRow + yCoordinate][currentColumn + xCoordinate] = 1
                }
                if (type == 5) {
                    if ((currentColumn + xCoordinate > fieldWidthInTiles - 2 && number == 1) || (currentColumn + xCoordinate < 1 && number == -1)) {
                        fnd = 1
                    }
                }
            }
            if (type==4) {
                out += incomingBlock[currentRow + (3 - currentColumn) * 4]
            }
        }
    }
    incomingBlock = type==4 ? out : incomingBlock;
    if (!fnd) {
        xCoordinate += number
    }
}

// Сгенерируем начальный блок
incomingBlock = generateNewBlock()

// Инициализируемо игровое поле
setInitialFieldState()

/**
 * Основной игровой цикл
 *
 */
const game = () => {
    // Увеличим счетчик для отсчета времени
    timeToMoveBlockDown++;
    // Если счетчик превысил установленный предел
    if (timeToMoveBlockDown > timeToMoveBlockDownLimit || down) {
        // Нарастим координату на 1 вниз
        yCoordinate++;
        // Обновим счетчик для отсчета времени
        timeToMoveBlockDown = 0;
        // Проверим поле
        checkField(2);
    }
    // Перерисуем поле по новым параметрам
    drawRowsAndCellsInTheField(1,0);
    // Проверим еще раз
    checkField(1);
    // Перерисуем результаты игрока на главной странице
    scoresElement.innerHTML = scores;
    blocksElement.innerHTML = blocks;
}

// Зададим интервал срабатывания основной игровой функции
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
            down = 1;
            break;
    }
}

// Add event listener to process keyboard keys
document.addEventListener('keydown', processKeyCodes);
