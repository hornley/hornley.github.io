import { Enemy, Button, Player, restart, menu, settings } from "./entity.js";

const moves = ['w', 'a', 's', 'd'];
const difficulties = {'Easy': 1, 'Medium': 2, 'Hard': 3, ':)': 4, 'Dodge Only': 5};
let speed = 5; // ***^
let enemySize = 5; // ***^
let aoeTime = 250; // ***^
let aoe = false; // ***
let spawnRate = 250; // ***
let enemySpeed = 0.5; // ***
let enemyHealth = 2; // ***
let enemyCollisionDamage = 5; // ***
let safeAreaWidth = 200; // ***
let safeAreaHeight = 200; // ***

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
let gameDifficulty;
let game = {
    canvas: document.getElementById("canvas"),
    menu: function() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        console.log(this.canvas.width, this.canvas.height);
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(30, 178, 54, 0.9)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const menuButtons = menu(game);
        buttons.push(menuButtons[0], menuButtons[1], menuButtons[2]);

        eventListener(game);
    },
    start: function() {
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
        player_object = new Player(game);
        buttons = [];
        updateGame();
    },
    settings: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(30, 178, 54, 0.9)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


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
        player_object = new Player(game);
        this.context = this.canvas.getContext("2d");
        updateGame();
    },
    end: function() {
        buttons.push(restart(game));
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

launch();

function launch() {
    game.menu();
}

function spawnEnemy(time) {
    if (time <= (lastSpawn + spawnRate)) { return; }

    if (gameDifficulty === 'Dodge Only') {
        score += 5;
    }

    lastSpawn = time;
    let t = Math.random() < 0.50 ? "red" : "blue";
    let enemy = new Enemy(t, enemyHealth, enemySpeed, enemySize, game);
    (!enemy.withinSafeArea(player_object)) ? enemies.push(enemy) : '';
}

function updateGame() {
    if (!ongoingGame) {
        game.end();
        return;
    }
    let time = Date.now();
    spawnEnemy(time);    

    game.clear();
    move();
    player_object.render(mouseX, mouseY);
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
            player_object.health -= enemyCollisionDamage;
            enemies.splice(i, 1);
            if (player_object.health <= 0) {
                ongoingGame = false;
            }
        }
        game.updateTexts();
    }
}

function move() {
    keypresses = keypresses || [];

    const directions = { w: 0, a: 0, s: 0, d: 0 };
    const diagonal = keypresses.filter((key) => directions[key]).length === 2;

    player_object.x += (keypresses["a"] ? -speed : keypresses["d"] ? speed : 0);
    player_object.y += (keypresses["w"] ? -speed : keypresses["s"] ? speed : 0);
}

function difficulty(button) {
    spawnRate = 250;
    aoe = false;
    enemySpeed = 0.5;
    enemyHealth = 2;
    enemyCollisionDamage = 5;
    safeAreaWidth = 200;
    safeAreaHeight = 200;
    switch (difficulties[button.text]) {
        case 1:
            button.text = 'Medium';
            enemySpeed *= 2;
            spawnRate /= 2;
            enemyHealth *= 2;
            enemyCollisionDamage *= 2;
            break;
        case 2:
            button.text = 'Hard';
            enemySpeed *= 3;
            spawnRate /= 3;
            enemyHealth *= 3;
            enemyCollisionDamage *= 3;
            break;
        case 3:
            button.text = ':)';
            enemySpeed *= 5;
            spawnRate /= 5;
            enemyHealth *= 5;
            enemyCollisionDamage *= 5;
            aoe = false;
            break;
        case 4:
            button.text = 'Dodge Only';
            enemySpeed *= 3;
            spawnRate /= 2;
            enemyCollisionDamage *= 2;
            aoe = false;
            break;
        case 5:
            button.text = 'Easy';
            enemySpeed *= 1;
            spawnRate /= 1;
            enemyHealth *= 1;
            enemyCollisionDamage *= 1;
            break;
    }
    gameDifficulty = button.text;
    return button;
}

function eventListener(game) {
    game.canvas.addEventListener('mousemove', function(e) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    game.canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (ongoingGame && player_object) {
            player_object.shoot(mouseX, mouseY, bullets);
        };
        buttons.forEach((button) => {
            if (!button.onClick(mouseX, mouseY)) { return; }
            switch (button.id) {
                case 'RESTART':
                    game.restart();
                    break;
                case 'START':
                    game.start();
                    break;
                case 'SETTINGS':
                    game.settings();
                    break;
                case 'DIFFICULTY':
                    button = difficulty(button);
                    button.render();
                    break;
            }
        });
    });
}

export {
    aoe,
    aoeTime,
    safeAreaHeight,
    safeAreaWidth
}