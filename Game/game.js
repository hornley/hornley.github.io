const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.x = canvas.width / 2;
canvas.y = canvas.height / 2;

let doAnim = true;

let speed = 5;
let enemySize = 5;
let spawnRate = 1;

let objects = [];
let lastSpawn = -1;
let startTime = Date.now();
let keypresses;
let double = false;
const moves = ['a', 'w', 's', 'd'];
let mouseX = 0.0;
let mouseY = 0.0;
let player_object = {
    health: 100,
    type: "black",
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 50,
    height: 50
}
let bullet = {
    x: player_object.x,
    y: player_object.y,
    dx: 0,
    dy: 0,
    width: 50,
    height: 50,

    tick: function() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.x + this.width < 0.0
            ||	this.x - this.width > canvas.width
            ||	this.y + this.height < 0.0
            || 	this.y - this.height > canvas.height)
            {
                this.dx = 0;
                this.dy = 0;
                this.x = player_object.x;
                this.y = player_object.y;
            }
    },

    render: function() {
        if (this.dx === 0 || this.dy === 0) {
            this.x = player_object.x;
            this.y = player_object.y;
        }
        ctx.fillStyle = "darkcyan";
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.stroke();
    }
}

animate();
canvas.addEventListener('mousemove', function (e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})

canvas.addEventListener('mousedown', function (e) {
    if (bullet.dx !== 0 || bullet.dy !== 0) { return; }
    let x = mouseX - player_object.x;
    let y = mouseY - player_object.y;

    let l = Math.sqrt(x * x + y * y);

    x = x / l;
    y = y / l;
    
    bullet.x = player_object.x;
    bullet.y = player_object.y;

    bullet.dx = x * 10;
    bullet.dy = y * 10;
})

window.addEventListener('keydown', function (e) {
    for (let movement in moves) {
        if (moves[movement] === e.key) { move(e); }
    }
})

window.addEventListener('keyup', function (e) {
    for (let movement in moves) {
        if (moves[movement] === e.key) {
            key = e.key;
            keypresses[key] = false;
            double = false;
        }
    }
})

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
        y: 0,

        collide: function(object) {
            console.log(object.x, object.y, this.x, this.y);
            let myleft = this.x - 1;
            let myright = this.x + 1;
            let mytop = this.y - 1;
            let mybottom = this.y + 1;
            let otherleft = object.x - object.width / 2 - 7;
            let otherright = object.x + object.width / 2 + 7;
            let othertop = object.y - object.height / 2 - 7;
            let otherbottom = object.y + object.height / 2 + 7;
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

function gameOver() {
    requestAnimationFrame(animate);
    ctx.fillStyle = "darkcyan";
    ctx.strokeStyle = "black";

    // clear the canvas so all objects can be 
    // redrawn in new positions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "aliceblue";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx = null;
}

function animate() {
    if (!doAnim) { gameOver(); return; }
    let time = Date.now();

    // see if its time to spawn a new object
    if (time > (lastSpawn + spawnRate)) {
        lastSpawn = time;
        spawnRandomObject();
    }

    // request another animation frame
    requestAnimationFrame(animate);
    ctx.fillStyle = "darkcyan";
    ctx.strokeStyle = "black";

    // clear the canvas so all objects can be 
    // redrawn in new positions
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "aliceblue";
    ctx.fillRect(0,0,canvas.width, canvas.height);

    if (canvas.x && canvas.y) {
        player_object.x = canvas.x;
        player_object.y = canvas.y;
    }
    ctx.beginPath();
    ctx.rect(player_object.x - player_object.width / 2, player_object.y - player_object.height / 2, player_object.width, player_object.height);
    ctx.stroke();

    bullet.tick();
    bullet.render();

    // move each object down the canvas
    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.y += 1;
        if (object.collide(bullet) || object.crash()) {
            objects.splice(i, 1);
            continue;
        }
        // Game Over
        if (object.collide(player_object)) {
            doAnim = false;
        }
        ctx.beginPath();
        ctx.arc(object.x, object.y, enemySize, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = object.type;
        ctx.fill();
    }
}

function shoot() {

}

function move(e) {
    keypresses = (keypresses || []);
    key = e.key;
    keypresses[key] = true;
    if (!keypresses[key]) { return; }

    if (keypresses["w"] && keypresses["a"]) {
        canvas.x -= speed;
        canvas.y -= speed;
        double = true;
    }
    if (keypresses["w"] && keypresses["d"]) {
        canvas.x += speed;
        canvas.y -= speed;
        double = true;
    }
    if (keypresses["s"] && keypresses["a"]) {
        canvas.x -= speed;
        canvas.y += speed;
        double = true;
    }
    if (keypresses["s"] && keypresses["d"]) {
        canvas.x += speed;
        canvas.y += speed;
        double = true;
    }

    if (!double){
        if (keypresses["w"]) { 
            canvas.y -= speed;
        } else if (keypresses["a"]) {
            canvas.x -= speed;
        } else if (keypresses["s"]) {
            canvas.y += speed;
        } else if (keypresses["d"]) {
            canvas.x += speed;
        }
    }
}
