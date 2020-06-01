var $canvas = document.getElementById('cnvs')
$canvas.width = 630
$canvas.height = 630
var context = $canvas.getContext('2d')
var $modal = document.getElementById('modal')
var moveSound = new Audio('./audio/tap-mellow.mp3')
var winningSound = new Audio('./audio/winning.wav')
var fieldSize = 78, fieldVisibleSize = 78, offset = 75 // global variables
var moves = 0;


// wooden background
const bg = document.createElement('img')
bg.src = 'images/wood-bg-bottom.webp'
bg.onload = function() {
    context.drawImage(bg, 0, 0,630,630);
    repaint()
};

// wooden overlay
const bg2 = document.createElement('img')
bg2.src = 'images/wood-bg-top.webp'
bg2.onload = function() {
    context.drawImage(bg2, 0, 0,630,630);
    //draw leave, exit
    context.clearRect(offset + fieldSize * 6, offset + fieldSize * 2, 45, fieldVisibleSize);
};

// wooden arrows on top of the cars
const arrow = document.createElement('img')
arrow.src = 'images/arrow.webp'

/**
 * function for determining how the vehicle is placed
 * @param {array} pos the car position
 */
function getDirection(pos) {
    var counts = {x: [], y: []}
    for (var i = 0; i < pos.length; i++) {
        var currX = pos[i];
        var currY = pos[i+1];
        if (!counts.x.includes(currX)) {
            counts.x.push(currX)
        }
        if (!counts.y.includes(currY)) {
            counts.y.push(currY)
        }
        i=i+1
    }
    return counts.x.length < counts.y.length ? 'y' : 'x'
}


/**
 * Represents a vehicle on the board
 */
class Vehicle {

    /**
     * 
     * @param {array} pos array of x and y coords
     * @param {string} color color of the car
     * @param {boolean} red wheter the car is the red car or not
     */
    constructor(pos = [], color = "blue", red = false) {
        this.pos = pos
        this.type = (pos.length > 4 ? "Truck" : "Car")
        this.color = red ? "red" : color
        this.direction = getDirection(pos)
        this.red = red
    }
    
    /**
     * Draws itself onto the board
     */
    draw () {
        for (let i = 0; i < this.pos.length; i++) {
            context.fillStyle=this.color;
            context.fillRect(offset + fieldSize * this.pos[i], offset + fieldSize * this.pos[i+1], fieldVisibleSize, fieldVisibleSize);
            i = i+1
        }
    }

    /**
     * Moves itself to the desired position
     * @param {number} x the desired x pos
     * @param {number} y the desired y pos
     * @param {number} carIndex index of the car in the vehicles array
     */
    move (x,y, carIndex) {
        var fallback = Array.from(this.pos)
        if(this.direction === 'x') {
            if(this.pos[0] === x) {
                this.pos[0]--
                this.pos[2]--
                this.type === "Truck" ? this.pos[4]-- : undefined
            } else if (this.pos[4] === x && this.type === "Truck" || this.pos[2] === x && this.type === "Car") {
                this.pos[0]++
                this.pos[2]++
                this.type === "Truck" ? this.pos[4]++ : undefined
            }
        } else if (this.direction === 'y') {
           if(this.pos[1] === y) {
               this.pos[1]--
               this.pos[3]--
               this.type === "Truck" ? this.pos[5]-- : undefined
           } else if (this.pos[5] === y && this.type === "Truck" || this.pos[3] === y && this.type === "Car") {
               this.pos[1]++
               this.pos[3]++
               this.type === "Truck" ? this.pos[5]++ : undefined
           }
        }
        // collision detection for the border
        for (let i = 0; i < this.pos.length; i++) {
            const coor = this.pos[i], coor2 = this.pos[i+1];
            if (coor < 0 || coor > 5 || coor2 < 0 || coor2 > 5) {
                
                return this.pos = fallback
            }
        }
        
        for (let ind = 0; ind < vehicles.length; ind++) {
            const car = vehicles[ind];
            const len = this.type === "Truck"? 4 : 3
            for (let i = 0; i < len; i++) {
                if (carIndex !== ind) {
                    if (car.pos[i] === this.pos[0] && car.pos[i+1] === this.pos[1]) {
                        return this.pos = fallback
                    } else if (car.pos[i] === this.pos[2] && car.pos[i+1] === this.pos[3]) {
                        return this.pos = fallback
                    } else if (this.type === "Truck" && car.pos[i] === this.pos[4] && car.pos[i+1] === this.pos[5]) {
                        return this.pos = fallback
                    } else if (car.type === "Truck" && car.pos[4] === this.pos[i] && car.pos[5] === this.pos[i+1]) {
                        return this.pos = fallback
                    } else if (car.type === "Truck" && this.type === "Truck" && car.pos[4] === this.pos[4] && car.pos[5] === this.pos[5]) {
                        return this.pos = fallback
                    }
                }
                i = i+1
            }
        }
        if (this.red === true && (this.pos[0] === 5 || this.pos[2] === 5) && (this.pos[1] === 2 || this.pos[3] === 2)) {
            document.getElementById('header').innerText = 'You Won';
            
            $modal.classList = "modal show"
            winningSound.play()
        }
        moves++;
        document.getElementById('move').innerText = moves
        moveSound.play()
        repaint()
    }
}

/**
 * completely redraws the canvas
 */
function repaint() {
    //draw background (black)
    context.fillStyle='#1f2125';
    context.fillRect(0,0,630,630);
    context.drawImage(bg, 0, 0,630,630);

    //draw parkinglot structure
    context.strokeStyle='white';

    for (let index = 0; index < 6; index++) {
        for (let i = 0; i < 6; i++) {
            context.strokeRect(offset + fieldSize * index, offset + fieldSize * i, fieldVisibleSize, fieldVisibleSize);
        }
    }

    //draw cars
    vehicles.forEach(car => {
        car.draw()
    })

    context.drawImage(bg2, 0, 0, 630, 630);
    
    //draw leave, exit
    context.clearRect(offset + fieldSize * 6, offset + fieldSize * 2, 45, fieldVisibleSize);
}

var levels = [
    [new Vehicle([2,5,3,5,4,5], 'lightgreen'), new Vehicle([0,4,0,5], 'orange'), new Vehicle([0,1,0,2,0,3], 'violet'),new Vehicle([4,4,5,4], 'lightblue'), new Vehicle([0,0,1,0], 'green'), new Vehicle([3,1,3,2,3,3], 'blue'), new Vehicle([5,0,5,1,5,2], 'yellow'), new Vehicle([1,2,2,2], undefined, true)],
    [new Vehicle([3,0,4,0,5,0], 'yellow'), new Vehicle([3,1,3,2], 'orange'), new Vehicle([5,1,5,2,5,3], 'purple'),new Vehicle([4,2,4,3], 'lightblue'), new Vehicle([4,4,5,4], 'darkblue'), new Vehicle([0,3,1,3,2,3], 'blue'), new Vehicle([0,0,0,1], 'darkgreen'), new Vehicle([3,5,4,5], 'lightgray'), new Vehicle([2,4,2,5], 'pink'), new Vehicle([0,5,1,5], 'lightgreen'), new Vehicle([0,2,1,2], undefined, true)],
    [new Vehicle([3,2,3,3,3,4], 'yellow'), new Vehicle([1,3,2,3], 'darkgreen'), new Vehicle([5,3,5,4,5,5], 'purple'), new Vehicle([1,4,1,5], 'orange'), new Vehicle([2,5,3,5], 'lightblue'), new Vehicle([1,2,2,2], undefined, true)],
    
    [new Vehicle([0,0,0,1,0,2], 'yellow'), new Vehicle([2,3,2,4], 'orange'), new Vehicle([3,0,3,1,3,2], 'purple'),new Vehicle([5,4,5,5], 'lightblue'), new Vehicle([3,3,4,3,5,3], 'blue'), new Vehicle([1,0,2,0], 'darkgreen'), new Vehicle([2,5,3,5,4,5], 'lightgreen'), new Vehicle([1,2,2,2], undefined, true)],
]

// choose random level and deepcopy it
var levelNumber = Math.floor(Math.random()*levels.length)
var vehicles = JSON.parse(JSON.stringify(levels[levelNumber])).map(car => new Vehicle(car.pos, car.color, car.red));

/**
 * Checks whether a car was clicked or not
 * @param {number} x coordinate
 * @param {number} y coordinate
 */
function check(x, y) {
    for (let index = 0; index < vehicles.length; index++) {
        for (var i = 0; i < vehicles[index].pos.length; i++) {
            var currX = vehicles[index].pos[i];
            var currY = vehicles[index].pos[i+1];
            if(x === currX && y === currY) { 
                return [x,y,index]
            }
            i = i+1
        }
    }
}

/**
 * returns the field which was clicked on 
 * @param {event} e the event of the mouse listener
 * @returns [x, y]
 */
function getCoordinates(e) {
    var x = e.offsetX, y = e.offsetY;
    
    switch (true) {
        case (x > offset+(fieldSize * 5) && x < (offset + (fieldSize * 5) + fieldVisibleSize)):
            x = 5
            break;
        case (x > offset+(fieldSize * 4) && x < (offset + (fieldSize * 4) + fieldVisibleSize)):
            x = 4
            break;
        case (x > offset+(fieldSize * 3) && x < (offset + (fieldSize * 3) + fieldVisibleSize)):
            x = 3
            break;
        case (x > offset+(fieldSize * 2) && x < (offset + (fieldSize * 2) + fieldVisibleSize)):
            x = 2
            break;
        case (x > offset+fieldSize && x < (offset + fieldSize + fieldVisibleSize)):
            x = 1
            break;
        case (x > offset && x < (offset + fieldVisibleSize)):
            x = 0
            break;
        default:
            return;
    }
    switch (true) {
        case (y > offset+(fieldSize * 5) && y < (offset + (fieldSize * 5) + fieldVisibleSize)):
            y = 5
            break;
        case (y > offset+(fieldSize * 4) && y < (offset + (fieldSize * 4) + fieldVisibleSize)):
            y = 4
            break;
        case (y > offset+(fieldSize * 3) && y < (offset + (fieldSize * 3) + fieldVisibleSize)):
            y = 3
            break;
        case (y > offset+(fieldSize * 2) && y < (offset + (fieldSize * 2) + fieldVisibleSize)):
            y = 2
            break;
        case (y > offset+fieldSize && y < (offset + fieldSize + fieldVisibleSize)):
            y = 1
            break;
        case (y > offset && y < (offset + fieldVisibleSize)):
            y = 0
            break;
        default:
            return;
    }
    return [x,y]
}

$canvas.onclick = function (e) {
    var coords = getCoordinates(e)
    var checked = check(coords[0], coords[1])
    if(checked === undefined) return;
    vehicles[checked[2]].move(checked[0], checked[1], checked[2])
    drawArrows(e)
}

/**
 * Draws an image to the canvas
 * @param {image} image The image to draw
 * @param {number} x x-Coordinate
 * @param {number} y y-Coordinate
 * @param {number} w width of the image
 * @param {number} h height of the image
 * @param {number} degrees rotation of the image in degrees
 */
function drawImage(image, x, y, w, h, degrees){
    context.save();
    context.translate(x+w/2, y+h/2);
    context.rotate(degrees*Math.PI/180.0);
    context.translate(-x-w/2, -y-h/2);
    context.drawImage(image, x, y, w, h);
    context.restore();
}

/**
 * draws arrows on top of the active car
 * @param {event} e mouse event
 */
function drawArrows(e) {
    repaint()
    var coords = getCoordinates(e)
    if (coords === undefined) return;
    var checked = check(coords[0], coords[1])
    if(checked === undefined) return;
    var currCar = vehicles[checked[2]]
    
    context.fillStyle = 'black'
    const arrowWidth = 50, arrowHeight = 40;

    if (currCar.direction === 'y') {
        // up arrow
        drawImage(arrow, offset + (fieldSize * currCar.pos[0]) + fieldSize / 2 - arrowWidth / 2, offset+(fieldSize * currCar.pos[1] + 1) + fieldSize / 2 - arrowHeight / 2, 50, 40, 90);
        
        // down arrow
        drawImage(arrow, offset + (fieldSize * currCar.pos[currCar.pos.length - 2]) + fieldSize / 2 - arrowWidth / 2, offset+(fieldSize * currCar.pos[currCar.pos.length - 1] + 1) + fieldSize / 2 - arrowHeight / 2, 50, 40, -90);
    } else if (currCar.direction === 'x') {
        // left arrow
        drawImage(arrow, offset + (fieldSize * currCar.pos[0]) + fieldSize / 2 - arrowWidth / 2, offset+(fieldSize * currCar.pos[1] + 1) + fieldSize / 2 - arrowHeight / 2, 50, 40, 0);
        
        // right arrow
        drawImage(arrow, offset + (fieldSize * currCar.pos[currCar.pos.length - 2]) + fieldSize / 2 - arrowWidth / 2, offset+(fieldSize * currCar.pos[currCar.pos.length - 1] + 1) + fieldSize / 2 - arrowHeight / 2, 50, 40, -180);
    }
}
$canvas.onmousemove = drawArrows

// closes the modal via a button click (if open)
document.body.onkeypress = function (e) {
    console.log(e)
    if (e.key === "q" || e.key === 'esc') {
        $modal.classList = "modal hide"
    }
}

// chooses another level
document.getElementById("nxtLvl").onclick = function (e) {
    while (true) {
        var newLevelNumber = Math.floor(Math.random()*levels.length)
        if (newLevelNumber !== levelNumber) {
            levelNumber = newLevelNumber
            vehicles = JSON.parse(JSON.stringify(levels[newLevelNumber])).map(car => new Vehicle(car.pos, car.color, car.red)); // deepcopy
            moves = 0;
            break;
        }
    }
    repaint()
    $modal.classList = 'modal hide'
}

// resets the level
document.getElementById('playAgain').onclick = function (e) {
    moves = 0;
    console.log(levelNumber, levels[levelNumber] == vehicles)
    // deepcopy
    vehicles = JSON.parse(JSON.stringify(levels[levelNumber])).map(car => new Vehicle(car.pos, car.color, car.red))
    repaint()
    document.getElementById('move').textContent = moves;
    $modal.classList = 'modal hide'
}

window.requestAnimationFrame(repaint)