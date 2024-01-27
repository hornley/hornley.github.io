const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let spawnLineY = 25;
let spawnRate = 15;
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

        collide: function(object) {
            let myleft = this.x - 1;
            let myright = this.x + 1;
            let mytop = this.y - 1;
            let mybottom = this.y + 1;
            let otherleft = object.x - object.width / 2 - 3;
            let otherright = object.x + object.width / 2 + 3;
            let othertop = object.y - object.height / 2;
            let otherbottom = object.y + object.height / 2;
            if ((mybottom >= othertop) && (myright <= otherright) && (myleft >= otherleft) && (mytop <= otherbottom)) {
                return true;
            }
            return false;
        },

        crash: function() {
            const bottom = canvas.height - 5;
            if (this.y >= bottom) {
                return true;
            }
            return false;
        }
    }

    objects.push(object);
}

function animate() {
    let time = Date.now();
    let player_object = {
        type: "black",
        x: canvas.width / 2,
        y: canvas.height / 2,
        width: 50,
        height: 50
    }

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

    canvas.addEventListener('mousemove', function (e) {
        canvas.x = e.offsetX;
        canvas.y = e.offsetY;
    })
    
    if (canvas.x && canvas.y) {
        player_object.x = canvas.x;
        player_object.y = canvas.y;
    }

    ctx.beginPath();
    ctx.rect(player_object.x - player_object.width / 2, player_object.y - player_object.height / 2, player_object.width, player_object.height);
    ctx.stroke();

    // move each object down the canvas
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.y += 1;
        if (object.collide(player_object) || object.crash()) {
            objects.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.arc(object.x, object.y, 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = object.type;
            ctx.fill();
        }
    }
}

function showCoords(event) {
    let x = event.offsetX;
    let y = event.offsetY;
}