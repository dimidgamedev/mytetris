// Получим объекты из основной страницы игры
canvasObject = document.getElementById('canvas')
contextObject = canvasObject.getContext('2d')
scoresElement = document.getElementById('scores')
blocksElement = document.getElementById('blocks')

// Начальные значения переменных
scores = 0                                      // Очки игрока
blocks = 0                                      // Количество упавших блоков
fieldWidthInTiles = 10                          // Ширина игрового поля в блоках
fieldHeightInTails = 20                         // Высота игрового поля в блоках
columnProportion = 30                           // Пропорции одного блока в пикселях
xCoordinate = 3                                 // Кордината Х блока
yCoordinate = -1                                // Координата У блока   
timeToMoveBlockDown = 0                         // Счетчик для управления движением ВНИЗ
timeToMoveBlockDownLimit = 20                   // Предел счетчика для движения ВНИЗ - Скорость падения блоков
down = 0                                        // Падаем или нет
gameField = []                                  // Основной объект - Игровое поле
defaultEmptyColor = '#000080'                   // Цвет заполненной ячейки поля
defaultFullColor = '#B0E0E6'                    // Цвет пустой ячейки поля

gameOver = false                                // Признак конца игры

/**  
 * Заполнение фигуры ведется в виде матрицы в 16 значение белое-черное
 * Верхняя строка заполняется белым 0000
 * Середина заполняется случайным образом и временами модифицирует верх или низ
 * Нижняя строка так же заполняется белым 0000
*/

blockShapeMatrix = [                            // Основные фигуры в виде матриц белое(0)-черное(1)
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
    let generatedBlockShape = '0000'+blockShapeMatrix[Math.floor(Math.random() * 7)]+'0000';
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
            contextObject.fillStyle = defaultFullColor
            //  Заполним текущую ячейку поля пустым значением 
            if (gameField[currentRow][currentColumn]) {
                contextObject.fillStyle = defaultEmptyColor
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

    // Если заполнена вертикаль (достаточно пройтись по верхнему полю)
    let finish = false
    for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
        if (gameField[0][currentColumn] == 1) {
            finish = true
        }
    }
    if (finish) {
        alert(`Игра окончена! \nВы набрали: \n    * очков - ${scores} \n    * блоков - ${blocks} \nДля продолжения перезагрузите страницу.`)
        gameOver = true
    }
}

/**
 * Проверим поле блока с определенным номером
 *
 * @param {*} type Тип
 * @param {number} [number=0] Номер
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
                    contextObject.fillStyle = defaultEmptyColor
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

/**
 *  Сгенерируем начальный блок
 */
incomingBlock = generateNewBlock()

/** 
 * Инициализируемо игровое поле
 */
setInitialFieldState()

/**
 * Основной игровой цикл
 *
 */
const game = () => {
    if (!gameOver) {
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
}

// Зададим интервал срабатывания основной игровой функции
setInterval(game,33);

/**
 * Обработаем события от клавиатуры (нажатие клавиш)
 *
 * @param {*} evt Событие клавиатеры (код клавиши)
 */
const processKeyCodes = (evt) => {
    switch(evt.keyCode) {
        case 37:
            // Нажата клавиша ВЛЕВО
            checkField(5, -1);
            break;
        case 38:
            // Нажата клавиша ВВЕРХ
            checkField(4);
            break;
        case 39:
            // Нажата клавиша ВПРАВО
            checkField(5, 1);
            break;
        case 40:
            // Нажата клавиша ВНИЗ
            down = 1;
            break;
    }
}

/** 
 * Назначим событие обработки нажатых клавиш
 */
document.addEventListener('keydown', processKeyCodes);