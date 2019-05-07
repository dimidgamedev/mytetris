let i = { size: 4, blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: 'cyan'   };
let j = { size: 3, blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue'   };
let l = { size: 3, blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' };
let o = { size: 2, blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' };
let s = { size: 3, blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: 'green'  };
let t = { size: 3, blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' };
let z = { size: 3, blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: 'red'    };

let KEY = {
    ESC: 27, 
    SPACE: 32, 
    LEFT: 37, 
    UP: 38, 
    RIGHT: 39, 
    DOWN: 40
}

let DIR = {
    UP: 0, 
    RIGHT: 1, 
    DOWN: 2, 
    LEFT: 3, 
    MIN: 0, 
    MAX: 3 
}

get = (id) => {
    return document.getElementById(id);
}

hide = (id) => {
    get(id).style.visibility = 'hidden';
}

show = (id) => {
    get(id).style.visibility = null;
}

html = (id, html) => {
    get(id).innerHTML = html;
}

timestamp = () => {
    return new Date().getTime();
}

random = (min, max) => {
    return (min + (Math.random() * (max - min)));
}

randomChoice = () => {
    return choices[Math.round(random(0, choices.length-1))];
}

document.addEventListener("DOMContentLoaded", (event) => {
    console.log('DOM is ready.');

    let stats = new Stats();                    // Stats object
    let canvas = get('canvas');                 // Get Canvas
    let ctx = canvas.getContext('2d');          // Get Context
    let ucanvas = get('upcoming');              // Get Upcoming block canvas
    let uctx = ucanvas.getContext('2d');        // Get Upcoming block context
    let speed = {                               // Get Speed start parameters
        start: 0.6,
        decrement: 0.005,
        min: 0.1
    }
    let nx = 10;                                // block width
    let ny = 20;                                // block height
    let nu = 5;                                 // width/height of upcoming block
    let dx;                                     // pixel size X of single block
    let dy;                                     // pixel size Y of single block
    let blocks = [];                            // Array nx*ny of block
    let actions = [];                           // User actions
    let playing = false;                        // Game in progress flag
    let dt = 0;                                 // Time from start
    let current = 0;                            // Current piece
    let next = 0;                               // Next piece
    let score = 0;                              // Total score
    let vscore = 0;                             // Displayed score
    let rows = 0;                               // Completed rows quantity
    let step = 0;                               // Rows from current position to row 1 (bottom)
    let pieces = [];
    let invalid = {};

    /**
     * Make bit manipulation and step iteration for
     * each occuped block with coordinates (x, y) for the given piece
     * @param {*} type
     * @param {*} x_coord
     * @param {*} y_coord
     * @param {*} direction
     * @param {*} callback
     */
    eachBlock = (type, x_coord, y_coord, direction, callback) => {
        let bit = 0;
        let row = 0;
        let column = 0;
        let blocks = type.blocks[direction];
        for (bit = 0x8000; bit > 0; bit = bit >> 1) {
            if (blocks & bit) {
                callback(x_coord + column, y_coord + row);
            }
            if (++column === 4) {
                column = 0;
                ++row;
            }
        }
    }

    /**
     * Check if some piece can be fit into given position in the grid
     *
     * @param {*} type
     * @param {*} x
     * @param {*} y
     * @param {*} dir
     * @returns result (true|false)
     */
    occupied = (type, x_coord, y_coord, dir) => {
        let result = false;
        eachBlock(type, x_coord, y_coord, dir, (x_coord, y_coord) => {
            if ((x_coord < 0) || (x_coord >= nx) || (y_coord < 0) || (y_coord >= ny) || getBlock(x_coord, y_coord))
            result = true;
        })
        return result;
    }

    /**
     * Make piece unoccupied
     *
     * @param {*} type
     * @param {*} x
     * @param {*} y
     * @param {*} dir
     * @returns result (true|false)
     */
    unoccupied = (type, x, y, dir) => {
        return !occupied(type, x, y, dir);
    }

    /**
     * Start with 4 default instances of each piece for example
     * and pick random splice if pieces is empty yet
     * @returns pieces array
     */
    randomPiece = () => {
        if (pieces.length == 0) {
            pieces = [i,i,i,i];
            pieces = pieces.concat(j,j,j,j);
            pieces = pieces.concat(l,l,l,l);
            pieces = pieces.concat(o,o,o,o);
            pieces = pieces.concat(s,s,s,s);
            pieces = pieces.concat(t,t,t,t);
            pieces = pieces.concat(z,z,z,z);
        }
        let type = pieces.splice(
            random(0, pieces.length - 1),
            1
        )[0];
        return {
            type: type,
            dir: DIR.UP,
            x: Math.round(
                random(0, nx - type.size)
            ),
            y: 0
        }
    }

    /** Default Animation section 
     */
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
                function(callback, element) {
                    window.setTimeout(callback, 1000 / 60);
                }
    }

    /**
     * Show Stats in special section
     *
     */
    showStats = () => {
        stats.domElement.id = 'stats';
        get('menu').appendChild(stats.domElement);
    }

    /**
     * Add common Event Listeners
     *
     */
    addEvents = () => {
        document.addEventListener('keydown', keydown, false);
        window.addEventListener('resize', resize, false);
    }

    /**
     * Define Resize listener
     *
     * @param {*} event
     */
    resize = (event) => {
        canvas.width   = canvas.clientWidth;        // set canvas logical size equal to its physical size
        canvas.height  = canvas.clientHeight;       // (ditto)
        ucanvas.width  = ucanvas.clientWidth;
        ucanvas.height = ucanvas.clientHeight;
        dx = canvas.width  / nx;                    // pixel size of a single tetris block
        dy = canvas.height / ny;                    // (ditto)
        invalidate();
        invalidateNext();
    }

    /**
     * Define Keydown listener
     *
     * @param {*} ev
     */
    keydown = (ev) => {
        let handled = false;
        if (playing) {
            switch(ev.keyCode) {
                case KEY.LEFT:   
                    actions.push(DIR.LEFT);  
                    handled = true; 
                    break;
                case KEY.RIGHT:  
                    actions.push(DIR.RIGHT); 
                    handled = true; 
                    break;
                case KEY.UP:     
                    actions.push(DIR.UP);    
                    handled = true; 
                    break;
                case KEY.DOWN:   
                    actions.push(DIR.DOWN);  
                    handled = true; 
                    break;
                case KEY.ESC:    
                    lose();                  
                    handled = true; 
                    break;
        }
        }
        else if (ev.keyCode == KEY.SPACE) {
            play();
            handled = true;
        }
        if (handled)
            ev.preventDefault();                    // prevent arrow keys from scrolling the page
    }


    /**
     * Define Frame function
     *
     */
    frame = () => {
        now = timestamp();
        update(Math.min(1, (now - last) / 1000.0)); // using requestAnimationFrame have to be able to handle large delta's caused when it 'hibernates' in a background or non-visible tab
        draw();
        stats.update();
        last = now;
        requestAnimationFrame(frame, canvas);
    }

    /**
     * Reset all Game variables
     *
     */
    reset = () => {
        dt = 0;
        clearActions();
        clearBlocks();
        clearRows();
        clearScore();
        setCurrentPiece(next);
        setNextPiece();
    }

    /**
     * Draw one court
     *
     */
    drawCourt = () => {
        let x_coord;
        let y_coord;
        let block;
        if (invalid.court) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (playing)
                drawPiece(ctx, current.type, current.x, current.y, current.dir);
            for(y_coord = 0 ; y_coord < ny ; y_coord++) {
                for (x_coord = 0 ; x_coord < nx ; x_coord++) {
                if (block = getBlock(x_coord, y_coord))
                    drawBlock(ctx, x_coord, y_coord, block.color);
                }
            }
            ctx.strokeRect(0, 0, nx*dx - 1, ny*dy - 1); // court boundary
            invalid.court = false;
        }
    }


    /**
     * Draw next
     *
     */
    drawNext = () => {
        if (invalid.next) {
            let padding = (nu - next.type.size) / 2;
            uctx.save();
            uctx.translate(0.5, 0.5);
            uctx.clearRect(0, 0, nu*dx, nu*dy);
            drawPiece(uctx, next.type, padding, padding, next.dir);
            uctx.strokeStyle = 'black';
            uctx.strokeRect(0, 0, nu*dx - 1, nu*dy - 1);
            uctx.restore();
            invalid.next = false;
        }
    }

    /**
     * Draw Scores
     *
     */
    drawScore = () => {
        if (invalid.score) {
            html('score', ("00000" + Math.floor(vscore)).slice(-5));
            invalid.score = false;
        }
    }

    /**
     * Draw Rows
     *
     */
    drawRows = () => {
        if (invalid.rows) {
            html('rows', rows);
            invalid.rows = false;
        }
    }

    /**
     * Draw
     *
     */
    draw = () => {
        ctx.save();
        ctx.lineWidth = 1;
        ctx.translate(0.5, 0.5);
        drawCourt();
        drawNext();
        drawScore();
        drawRows();
        ctx.restore();
    }

    /**
     * Draw Pieces
     *
     * @param {*} ctx
     * @param {*} type
     * @param {*} x_coord
     * @param {*} y_coord
     * @param {*} dir
     */
    drawPiece = (ctx, type, x_coord, y_coord, dir) => {
        eachblock(type, x_coord, y_coord, dir, function(x_coord, y_coord) {
            drawBlock(ctx, x_coord, y_coord, type.color);
        });
    }

    /**
     * Draw Blocks
     *
     * @param {*} ctx
     * @param {*} x_coord
     * @param {*} y_coord
     * @param {*} color
     */
    drawBlock = (ctx, x_coord, y_coord, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x_coord*dx, y_coord*dy, dx, dy);
        ctx.strokeRect(x_coord*dx, y_coord*dy, dx, dy)
    }

    /**
     * Update all Game variables
     *
     * @param {*} idt
     */
    update = (idt) => {
        if (playing) {
            if (vscore < score)
                setVisualScore(vscore + 1);
            handle(actions.shift());
            dt = dt + idt;
            if (dt > step) {
                dt = dt - step;
                drop();
            }
        }
    }

    /**
     * Handle parameters
     *
     * @param {*} action
     */
    handle = (action) => {
        switch(action) {
            case DIR.LEFT:  
                move(DIR.LEFT);  
                break;
            case DIR.RIGHT: 
                move(DIR.RIGHT); 
                break;
            case DIR.UP:    
                rotate();        
                break;
            case DIR.DOWN:  
                drop();          
                break;
        }
    }


    /**
     * Move blocks by directions and change coordinates
     *
     * @param {*} dir
     * @returns reslt (true|false)
     */
    move = (dir) => {
        let x_coord = current.x;
        let y_coord = current.y;
        switch(dir) {
            case DIR.RIGHT: x_coord = x_coord + 1; break;
            case DIR.LEFT:  x_coord = x_coord - 1; break;
            case DIR.DOWN:  y_coord = y_coord + 1; break;
        }
        if (unoccupied(current.type, x_coord, y_coord, current.dir)) {
            current.x = x_coord;
            current.y = y_coord;
            invalidate();
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Rotate block at fly
     *
     */
    rotate = () => {
        let newDirection = (current.dir == DIR.MAX ? DIR.MIN : current.dir + 1);
        if (unoccupied(current.type, current.x, current.y, newDirection)) {
        current.dir = newDirection;
        invalidate();
        }
    }

    /**
     * Drop down
     *
     */
    drop = () => {
        if (!move(DIR.DOWN)) {
            addScore(10);
            dropPiece();
            removeLines();
            setCurrentPiece(next);
            setNextPiece(randomPiece());
            clearActions();
            if (occupied(current.type, current.x, current.y, current.dir)) {
                lose();
            }
        }
    }

    /**
     * Drop down piece
     *
     */
    dropPiece = () => {
        eachblock(current.type, current.x, current.y, current.dir, (x_coord, y_coord) => {
            setBlock(x_coord, y_coord, current.type);
        });
    }


    /**
     * Remove some lines
     *
     */
    removeLines = () => {
        let x_coord = 0;
        let y_coord = 0;
        let complete = 0;
        let row_number = 0;

        for(y_coord = ny ; y_coord > 0 ; --y_coord) {
            complete = true;
            for(x_coord = 0 ; x_coord < nx ; ++x_coord) {
                if (!getBlock(x_coord, y_coord))
                complete = false;
            }
            if (complete) {
                removeLine(y_coord);
                y_coord = y_coord + 1;
                row_number++;
            }
        }
        if (row_number > 0) {
            addRows(row_number);
            addScore(100*Math.pow(2, row_number - 1)); // 1: 100, 2: 200, 3: 400, 4: 800
        }
    }

    /**
     * Remove One Line
     *
     * @param {*} lineNumber
     */
    removeLine = (lineNumber) => {
        let x_coord = 0;
        let y_coord = 0;
        for(y_coord = lineNumber ; y_coord >= 0 ; --y_coord) {
            for(x_coord = 0 ; x_coord < nx ; ++x_coord)
                setBlock(x_coord, y_coord, (y_coord == 0) ? null : getBlock(x_coord, y_coord - 1));
        }
    }


    /**
     * Play the game
     *
     */
    play = () => {
        hide('start');
        reset();
        playing = true;  
    }


    /**
     * Lose the game
     *
     */
    lose = () => {
        show('start');
        setVisualScore();
        playing = false; 
    }

    /**
     * Set Scores as visible component
     *
     * @param {*} newScore
     */
    setVisualScore = (newScore) => {
        vscore = newScore || score;
        invalidateScore();
    }

    /**
     * Set new Score value
     *
     * @param {*} newScore
     */
    setScore = (newScore) => { 
        score = newScore; 
        setVisualScore(newScore);  
    }

    /**
     * Add new score for row deletion
     *
     * @param {*} newScore
     */
    addScore = (newScore) => { 
        score = score + newScore;  
    }

    /**
     * Clear Score value
     *
     */
    clearScore = () => { 
        setScore(0); 
    }

    /**
     * Clear Rows
     *
     */
    clearRows = () => { 
        setRows(0); 
    }

    /**
     * Set Rows
     *
     * @param {*} newRowNumber
     */
    setRows = (newRowNumber) => { 
        rows = newRowNumber; 
        step = Math.max(speed.min, speed.start - (speed.decrement*rows)); 
        invalidateRows(); 
    }

    /**
     * Add Row numbe
     *
     * @param {*} rowNumber
     */
    addRows = (rowNumber) => { 
        setRows(rows + rowNumber); 
    }

    /**
     * Get one block coordinates
     *
     * @param {*} x_coord
     * @param {*} y_coord
     * @returns
     */
    getBlock = (x_coord, y_coord) => { 
        return (blocks && blocks[x_coord] ? blocks[x_coord][y_coord] : null); 
    }

    /**
     * Set one block coordinates
     *
     * @param {*} x_coord
     * @param {*} y_coord
     * @param {*} type
     */
    setBlock = (x_coord, y_coord, type) => { 
        blocks[x_coord] = blocks[x_coord] || []; blocks[x_coord][y_coord] = type; 
        invalidate(); 
    }

    /**
     * Clear block parameters
     *
     */
    clearBlocks = () => {
        blocks = []; 
        invalidate(); 
    }

    /**
     * Clear Actions array
     *
     */
    clearActions = () => { 
        actions = []; 
    }

    /**
     * Set Current piece as default or random
     *
     * @param {*} piece
     */
    setCurrentPiece = (piece) => {
        current = piece || randomPiece(); 
        invalidate();     
    }

    /**
     * Set Next piece as default or random
     *
     * @param {*} piece
     */
    setNextPiece = (piece) => { 
        next = piece || randomPiece(); 
        invalidateNext(); 
    }

    /**
     * Invalidate base
     *
     */
    invalidate = () => { 
        invalid.court  = true; 
    }

    /**
     * Invalidate next
     *
     */
    invalidateNext = () => { 
        invalid.next   = true; 
    }

    /**
     * Invalidate score
     *
     */
    invalidateScore = () => { 
        invalid.score  = true; 
    }

    /**
     * Invalidate rows
     *
     */
    invalidateRows = () => { 
        invalid.rows   = true; 
    }

    /* GAME LOOP
    */

    run = () => {
        let last = now = timestamp();
        showStats();
        addEvents();
        resize();
        reset();
        frame();
    }

    run();

});

