// Получим объекты из основной страницы игры
canvasObject = document.getElementById('canvas')        // Элемент разметки для рисования
contextObject = canvasObject.getContext('2d')           // Контекст элемента для рисования
scoresElement = document.getElementById('scores')       // Элемент разметки для отображения набранных очков
blocksElement = document.getElementById('blocks')       // Элемент разметки для отображения счетчика блоков

// Начальные значения переменных
scores = 0                                              // Очки игрока
blocks = 0                                              // Количество упавших блоков
fieldWidthInTiles = 10                                  // Ширина игрового поля в блоках
fieldHeightInTails = 20                                 // Высота игрового поля в блоках
columnProportion = 30                                   // Пропорции одного блока в пикселях
xCoordinate = 3                                         // Кордината Х блока
yCoordinate = -1                                        // Координата У блока   
timeToMoveBlockDown = 0                                 // Счетчик для управления движением ВНИЗ
timeToMoveBlockDownLimit = 20                           // Предел счетчика для движения ВНИЗ - Скорость падения блоков
down = 0                                                // Падаем или нет
gameField = []                                          // Основной объект - Игровое поле
defaultEmptyColor = '#000080'                           // Цвет заполненной ячейки поля
defaultFullColor = '#B0E0E6'                            // Цвет пустой ячейки поля
gameOver = false                                        // Признак конца игры

defaultScoresValue = 100                                // Значение для прироста очков по умолчанию

var soundKeyDownPress                                   // Звук нажатия кнопки вниз
var soundKeyOtherPress                                  // Звук нажатия других кнопок
var soundLoose                                          // Звук конца игры
var soundWin                                            // Звук удаления ряда

/**
 * Объект для проигрывания звука
 *
 * @param {*} src
 */
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}


/**  
 * Определем объекты разных звуков 
 */
soundKeyDownPress = new sound("/static/sounds/key.wav");
soundKeyOtherPress = new sound("/static/sounds/key_others.wav")
soundLoose = new sound('/static/sounds/loose.wav')
soundWin = new sound('/static/sounds/win.wav')


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
                // Удаляет заполненную линию из матрицы игрового поля путем перемещения всех блочков выше на уровень ниже
                gameField[fieldHeightInTails-currentRow][currentColumn] = gameField[fieldHeightInTails-currentRow-1][currentColumn]
            }
        }

        // Если линия заполнена
        if (counter == fieldWidthInTiles) {
            // Нарастим очки игрока
            scores = scores + defaultScoresValue
            // Удалим линию
            for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
                gameField[currentRow][currentColumn] = 0
            }
            // Перерисуем линию
            drawRowsAndCellsInTheField(2, currentRow);
            soundWin.play()
            M.toast({html: `Линия убрана! <br> Вы получили + ${defaultScoresValue} очков!`})
        }
    }

    // Если заполнена вертикаль (достаточно пройтись по верхнему полю)
    let finish = false
    for (let currentColumn = 0; currentColumn < fieldWidthInTiles; currentColumn++) {
        if (gameField[0][currentColumn] == 1) {
            finish = true
        }
    }
    // Если конец игры
    if (finish) {
        gameOver = true
        // Играем музыку
        soundLoose.play()
        // Выводим результат игры
        materialAlertGameOver()
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
                    // Если блок достиг низа - упал на что-то то мы генерируем новый блок и даем ему координаты верха
                    if (currentRow + yCoordinate > fieldHeightInTails - 2 || gameField[currentRow + yCoordinate + 1][currentColumn + xCoordinate] == 1) {
                        // Если мы на что-то напоролись
                        checkField(3);
                        incomingBlock = generateNewBlock();
                        xCoordinate = 3;
                        yCoordinate = -1;
                        down = 0;
                    }
                }
                if (type == 3) {
                    // Мы на что-то наткнулись - или это самый низ или это часть какаого-то блока
                    // Мы вливаем этот блок в матрицу игрового поля путем заполнения элементов матрицы поля единицами (1)
                    // то есть ячейки падающего блока по своим позициям делают ячейки матрицы поля ЗАНЯТЫМИ
                    // Блок incomingBlock падает как бы НАД матрицей поля пока не встретил препятствие
                    // После этого он сам становится частью матрицы игрового поля
                    gameField[currentRow + yCoordinate][currentColumn + xCoordinate] = 1
                }
                if (type == 5) {
                    // Нажата клавиша ВЛЕВО или ВПРАВО - нужно перерисовать падающий блок на одоин ряд левее если он не выйдет за пределы поля
                    // Если number = 0 это ЛЕВО
                    // Если number = 1 это ПРАВО
                    if ((currentColumn + xCoordinate > fieldWidthInTiles - 2 && number == 1) || (currentColumn + xCoordinate < 1 && number == -1)) {
                        fnd = 1
                    }
                }
            }
            if (type==4) {
                // Поворот фигуры при нажатии клавишы ВВЕРХ
                // Это фактически новая фигура (то есть повернутая старая)
                // Но двигать пока мы будем над полем именно его
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
        // То есть либо мы нажали кнопку ВНИЗ либо пришло время анимации ПАДАТЬ
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
setInterval(game, 33);

/**
 * Модальное окно для вывода сообщения о кнце игры и статистики
 *
 */
const materialAlertGameOver = () => {
    MaterialDialog.alert(`Ваш результат: очков - ${scores}, блоков - ${blocks}.`,
        {
            title: 'Игра окончена!',
            buttons: {
                close: {
                    text: 'Начать заново',
                    className: 'blue',
                    callback: () => {
                        location.reload()
                    }
                }
            }
        }
    )
}

/**
 * Обработаем события от клавиатуры (нажатие клавиш)
 *
 * @param {*} evt Событие клавиатеры (код клавиши)
 */
const processKeyCodes = (evt) => {
    switch(evt.keyCode) {
        case 37:
            // Нажата клавиша ВЛЕВО
            soundKeyOtherPress.play()
            checkField(5, -1);
            break;
        case 38:
            // Нажата клавиша ВВЕРХ
            soundKeyOtherPress.play()
            checkField(4);
            break;
        case 39:
            // Нажата клавиша ВПРАВО
            soundKeyOtherPress.play()
            checkField(5, 1);
            break;
        case 40:
            // Нажата клавиша ВНИЗ
            soundKeyDownPress.play()
            // Если должен упасть, то в функции game() при перерисовке мы сможем зайти в условие
            down = 1;
            break;
    }
}

/** 
 * Назначим событие обработки нажатых клавиш
 */
document.addEventListener('keydown', processKeyCodes);