import { player, bullet, restart, safeAreaHeight, safeAreaWidth } from "./entity.js";

const moves = ['w', 'a', 's', 'd'];
let speed = 5;
let enemySize = 5;
let spawnRate = 10000;
let enemySpeed = 0.5;

let score = 0;
let mouseX = 0.0;
let mouseY = 0.0;
let ongoingGame = true;
let objects = [];
let bullets = [];
let lastSpawn = -1;
let keypresses;
let player_object;
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
            player_object.shoot(mouseX, mouseY, bullets);
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
        ongoingGame = true;
        player_object.health = 100;
        player_object.x = myGame.canvas.width / 2;
        player_object.y = myGame.canvas.height / 2;
        this.context = this.canvas.getContext("2d");
        updateGame();
    },
    end: function() {
        restart(document, myGame);
        objects = [];
        bullets = [];
        this.context = null;
    },
    updateTexts: function() {
        this.context.clearRect(0, 0, 180, 55);
        this.context.fillStyle = "aliceblue";
        this.context.fillRect(0, 0, 180, 55);
        this.context.font = "24px serif";
        this.context.direction = "ltr";
        this.context.fillStyle = "black";
        let hp_message = "Health = " + player_object.health + "/" + player_object.max_health;
        this.context.fillText(hp_message, 10, 25);
        let score_message = "Score = " + score;
        this.context.fillText(score_message, 10, 50);
    }
};

startGame();

function startGame() {
    window.addEventListener('keydown', function(e) {
        if (moves.includes(e.key)) {
            keypresses[e.key] = true;
        }
    });
    
    window.addEventListener('keyup', function(e) {
        if (moves.includes(e.key)) {
            keypresses[e.key] = false;
        }
    });
    player_object = new player(myGame);
    myGame.start();
}

function spawnEnemy() {
    let t = Math.random() < 0.50 ? "red" : "blue";

    let enemy = {
        type: t,
        x: Math.random() * (myGame.canvas.width - 30) + 2,
        y: Math.random() * (myGame.canvas.height - 30) + 2,
        hp: 10,

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
    
            const dx = (x / l) * enemySpeed;
            const dy = (y / l) * enemySpeed;
            this.x += -dx;
            this.y += -dy;
        }
    };

    if (enemy.x >= player_object.x - safeAreaWidth / 2 &&
        enemy.x <= player_object.x + safeAreaWidth / 2 &&
        enemy.y >= player_object.y - safeAreaHeight / 2 &&
        enemy.y <= player_object.y + safeAreaHeight / 2) {
    } else {
        objects.push(enemy);
    }
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
        spawnEnemy();
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
        // object.followPlayer();
        
        bullets.forEach((bullet) => {
            if (object.collide(bullet) || object.crash()) {
                objects.splice(i, 1);
                score++;
            }
        })

        object.render();
        player_object.AoE(object, time);

        if (object.hp <= 0) {
            objects.splice(i, 1);
            score++;
        }

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
