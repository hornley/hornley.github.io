const moves = ['w', 'a', 's', 'd'];
let bulletSize = 25;
let speed = 5;
let enemySize = 5;
let spawnRate = 1;
const safeAreaWidth = 200;
const safeAreaHeight = 175;

let score = 0;
let mouseX = 0.0;
let mouseY = 0.0;
let ongoingGame = true;
let objects = [];
let bullets = [];
let lastSpawn = -1;
let keypresses;
let restartDIV = document.getElementById("RestartPrompt");
let myGame = {
    canvas: document.getElementById("canvas"),
    start: function() {
        this.canvas.width = 1200;
        this.canvas.height = 650;
        this.context = this.canvas.getContext("2d");
        this.canvas.addEventListener('mousemove', function(e) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        });

        this.canvas.addEventListener('mousedown', function(e) {
            player_object.shoot();
        });
        updateGame();
    },
    clear: function() {
        requestAnimationFrame(updateGame);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "aliceblue";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = "black";
        this.context.beginPath();
        this.context.roundRect(player_object.x - safeAreaWidth / 2, player_object.y - safeAreaHeight / 2, safeAreaWidth, safeAreaHeight, 15);
        this.context.stroke();
    },
    restart: function() {
        score = 0;
        restartDIV.style.opacity = 0;
        restartDIV.style.top = "100%";
        ongoingGame = true;
        player_object.health = 100;
        player_object.x = myGame.canvas.width / 2;
        player_object.y = myGame.canvas.height / 2;
        this.context = this.canvas.getContext("2d");
        updateGame();
    },
    end: function() {
        restartDIV.style.opacity = 1;
        restartDIV.style.backgroundColor = "rgba(18, 52, 19, 0.4)";
        restartDIV.style.top = "25%";
        objects = [];
        bullets = [];
        this.context = null;
    },
    updateTexts: function() {
        this.context.clearRect(0, 0, 160, 55);
        this.context.fillStyle = "aliceblue";
        this.context.fillRect(0, 0, 160, 55);
        this.context.font = "24px serif";
        this.context.direction = "ltr";
        this.context.fillStyle = "black";
        let hp_message = "Health: " + player_object.health + "/" + player_object.max_health;
        this.context.fillText(hp_message, 10, 25);
        let score_message = "Score: " + score;
        this.context.fillText(score_message, 10, 50);
    }
};

let player_object = {
    health: 100,
    max_health: 100,
    type: "black",
    x: myGame.canvas.width / 2,
    y: myGame.canvas.height / 2,
    width: 50,
    height: 50,

    crash: function() {
        this.x = Math.max(this.width / 2, Math.min(myGame.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(myGame.canvas.height - this.height / 2, this.y));
    },

    render: function() {
        this.crash();
        myGame.context.fillStyle = "honeydew";
        myGame.context.strokeStyle = "black";
        myGame.context.beginPath();
        myGame.context.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 5);
        myGame.context.fill();
        myGame.context.stroke();
    },

    shoot: function() {
        const x = mouseX - player_object.x;
        const y = mouseY - player_object.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * 10;
        const dy = (y / l) * 10;
        bullets.push(new bullet(player_object.x, player_object.y, dx, dy));
    }
};

class bullet {
    constructor(x, y, dx, dy) {
        this.health = 100;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = bulletSize;
        this.height = bulletSize;
    }

    tick() {
        this.x += this.dx;
        this.y += this.dy;

        const outOfBounds = (
            this.x + this.width < 0 ||
            this.x - this.width > myGame.canvas.width ||
            this.y + this.height < 0 ||
            this.y - this.height > myGame.canvas.height
        );

        return outOfBounds;
    }

    render() {
        myGame.context.strokeStyle = "black";
        myGame.context.fillStyle = "red";
        myGame.context.beginPath();
        myGame.context.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, [50, 50, 50, 50]);
        myGame.context.fill();
        myGame.context.stroke();
    }
};


window.addEventListener('keydown', function(e) {
    if (moves.includes(e.key)) {
        keypresses[e.key] = true;
    }
});

window.addEventListener('keyup', function(e) {
    if (moves.includes(e.key)) {
        keypresses[e.key] = false;
        double = false;
    }
});

function startGame() {
    myGame.start();
}

startGame();

function spawnRandomObject() {
    let t = Math.random() < 0.50 ? "red" : "blue";

    let object = {
        type: t,
        x: Math.random() * (myGame.canvas.width - 30) + 2,
        y: Math.random() * (myGame.canvas.height - 30) + 2,

        collide: function(object) {
            let myleft = this.x - 1;
            let myright = this.x + 1;
            let mytop = this.y - 1;
            let mybottom = this.y + 1;
            let otherleft = object.x - object.width / 2 - 7;
            let otherright = object.x + object.width / 2 + 7;
            let othertop = object.y - object.height / 2 - 7;
            let otherbottom = object.y + object.height / 2 + 7;
            
            return (mybottom >= othertop) && (myright <= otherright) && (myleft >= otherleft) && (mytop <= otherbottom);
        },

        crash: function() {
            const bottom = myGame.canvas.height - 5;
            return this.y >= bottom;
        },

        render: function() {
            myGame.context.beginPath();
            myGame.context.arc(this.x, this.y, enemySize, 0, Math.PI * 2);
            myGame.context.closePath();
            myGame.context.fillStyle = this.type;
            myGame.context.fill();
        },

        followPlayer: function() {
            const x = this.x - player_object.x;
            const y = this.y - player_object.y;
            const l = Math.sqrt(x * x + y * y);
    
            const dx = (x / l) * 1;
            const dy = (y / l) * 1;
            this.x += -dx;
            this.y += -dy;
        }
    };

    if (object.x >= player_object.x - safeAreaWidth / 2 &&
        object.x <= player_object.x + safeAreaWidth / 2 &&
        object.y >= player_object.y - safeAreaHeight / 2 &&
        object.y <= player_object.y + safeAreaHeight / 2) {
    } else {
        objects.push(object);
    }
}

function restartGame() {
    if (ongoingGame) {
        return;
    }
    myGame.restart();
}

function updateGame() {
    if (!ongoingGame) {
        myGame.end();
        return;
    }
    let time = Date.now();

    // see if it's time to spawn a new object
    if (time > (lastSpawn + spawnRate)) {
        lastSpawn = time;
        spawnRandomObject();
    }

    // request another animation frame
    myGame.clear();
    move();
    player_object.render();

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.tick()) {
            bullets.splice(i, 1);
            continue;
        }
        bullet.render();
    }

    for (let i = 0; i < objects.length; i++) {
        let object = objects[i];
        object.followPlayer();
        
        bullets.forEach((bullet) => {
            if (object.collide(bullet) || object.crash()) {
                objects.splice(i, 1);
                score++;
            }
        })

        object.render();

        if (object.collide(player_object)) {
            player_object.health -= 20;
            objects.splice(i, 1);
            if (player_object.health <= 0) {
                ongoingGame = false;
            }
        }
        myGame.updateTexts();
    }
}

function move() {
    keypresses = keypresses || [];

    const directions = { w: 0, a: 0, s: 0, d: 0 };
    const diagonal = keypresses.filter((key) => directions[key]).length === 2;

    player_object.x += (keypresses["a"] ? -speed : keypresses["d"] ? speed : 0);
    player_object.y += (keypresses["w"] ? -speed : keypresses["s"] ? speed : 0);
}
