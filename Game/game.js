import { Enemy, Button, Player, restart, safeAreaHeight, safeAreaWidth } from "./entity.js";

const moves = ['w', 'a', 's', 'd'];
let speed = 5; // ***
let enemySize = 5; // ***
let spawnRate = 1; // ***
let enemySpeed = 0.5; // ***

let score = 0;
let mouseX = 0.0;
let mouseY = 0.0;
let ongoingGame = true;
let enemies = [];
let bullets = [];
let buttons = [];
let lastSpawn = -1;
let keypresses;
let player_object;
let myGame = {
    canvas: document.getElementById("canvas"),
    start: function() {
        this.canvas.width = 1200;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        this.canvas.addEventListener('mousemove', function(e) {
            mouseX = e.offsetX;
            mouseY = e.offsetY;
        });

        this.canvas.addEventListener('mousedown', function(e) {
            if (ongoingGame) {
                player_object.shoot(mouseX, mouseY, bullets);
            };
            buttons.forEach((button) => {
                if (button.id === 'RESTART') {
                    button.onClick(mouseX, mouseY, myGame.restart());
                }
            });
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
        buttons = [];
        lastSpawn = -1;
        score = 0;
        ongoingGame = true;
        player_object = new Player(myGame);
        this.context = this.canvas.getContext("2d");
        updateGame();
    },
    end: function() {
        buttons.push(restart(myGame, 'RESTART'));
        enemies = [];
        bullets = [];
        this.context = null;
    },
    updateTexts: function() {
        this.context.clearRect(0, 0, 190, 60);
        this.context.fillStyle = "rgba(240, 248, 255, 1)";
        this.context.fillRect(0, 0, 190, 60);
        this.context.font = "24px times-new-roman";
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
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
    player_object = new Player(myGame);
    myGame.start();
}

function spawnEnemy(time) {
    if (time <= (lastSpawn + spawnRate)) { return; }

    lastSpawn = time;
    let t = Math.random() < 0.50 ? "red" : "blue";
    let enemy = new Enemy(t, 1, enemySpeed, enemySize, myGame);
    (!enemy.withinSafeArea(player_object)) ? enemies.push(enemy) : '';
}

function updateGame() {
    if (!ongoingGame) {
        myGame.end();
        return;
    }
    let time = Date.now();
    spawnEnemy(time);    

    myGame.clear();
    move();
    player_object.render();
    enemies = player_object.AoE(time, enemies);

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.tick()) { bullets.splice(i, 1); continue; }
        bullet.render();
    }

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            score++;
        }

        bullets.forEach((bullet) => {
            if (enemy.collide(bullet)) {
                enemies.splice(i, 1);
                score++;
            }
        })

        enemy.followPlayer(player_object);
        enemy.render();

        if (enemy.collide(player_object)) {
            player_object.health -= 100; // ***
            enemies.splice(i, 1);
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
