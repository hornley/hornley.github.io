const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let spawnLineY = 25;
let spawnRate = 1;
let objects = [];
let lastSpawn = -1;
let startTime = Date.now();

animate();

function spawnRandomObject() {
    let t;

    if (Math.random() < 0.50) {
        t = "red";
    } else {
        t = "blue";
    }

    let object = {
        type: t,
        x: Math.random() * (canvas.width - 30) + 15,
        y: spawnLineY,

        collide: function(mouseX, mouseY) {
            if (mouseX === Math.floor(this.x) && mouseY === Math.floor(this.y)) {
                return true;
            }
            return false;
        }
    }

    objects.push(object);
}

function animate() {
    let time = Date.now();

    // see if its time to spawn a new object
    if (time > (lastSpawn + spawnRate)) {
        lastSpawn = time;
        spawnRandomObject();
    }

    // request another animation frame
    requestAnimationFrame(animate);

    // clear the canvas so all objects can be 
    // redrawn in new positions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "aliceblue";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    // draw the line where new objects are spawned
    ctx.beginPath();
    ctx.moveTo(0, spawnLineY);
    ctx.lineTo(canvas.width, spawnLineY);
    ctx.stroke();

    // move each object down the canvas
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.y += 0.5;
        ctx.beginPath();
        ctx.arc(object.x, object.y, 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = object.type;
        ctx.fill();
    }
}

function showCoords(event) {
    let x = event.offsetX;
    let y = event.offsetY;
    for (let i = 0; i < objects.length; i++) {
        objects[i].collide(x, y);
    }
}