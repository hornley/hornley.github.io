import { Enemy, Player, restart, menu, healthBar } from "./entity.js";
import { upgradeMenu, upgradeBulletDamage, upgradeBulletPenetration, upgradeHealth, upgradeAttackSpeed, upgradeMovementSpeed } from "./upgrades.js";

const moves = ['w', 'a', 's', 'd'];

// Difficulty rampage
let gameDifficulty = 'Easy';
const difficulties = {'Easy': 1.15, 'Medium': 1.3, 'Hard': 1.5, ':)': 2, 'Dodge Only': 5};
let gameRound;
let gameRounds = {0: true, 1: false};

/* Base
& - not affected by rampage
*/
let aoeTime = 250; // ***&
let aoe = false; // ***&
let safeAreaWidth = 200; // ***&
let safeAreaHeight = 200; // ***&
let spawnRate = 250; // ***
let enemySpeed = 0.5; // ***
let enemyHealth = 1; // ***
let enemyCollisionDamage = 5; // ***

const fps = 60;
const interval = 1000/fps;
let now;
let then = Date.now();
let delta;

let score = 0;
let mouseX = 0.0;
let mouseY = 0.0;
let ongoingGame = true;
let paused = false;
let enemies = [];
let bullets = [];
let buttons = [];
let lastSpawn = -1;
let keypresses;
let player_object;
let upgradeMenus;
let game = {
    canvas: document.getElementById("canvas"),
    menu: function() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(30, 178, 54, 0.9)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameNo = 0;

        const menuButtons = menu(game);
        buttons.push(menuButtons[0], menuButtons[1], menuButtons[2]);

        eventListener(game);
    },
    start: function() {
        this.canvas.style.cursor = 'none';
        window.addEventListener('keydown', function(e) {
            if (moves.includes(e.key)) {
                keypresses[e.key] = true;
            }
            
            if (e.key === " ") {
                this.canvas.style.cursor = (this.canvas.style.cursor === 'auto') ? 'none' : 'auto';
                upgrade();
            }
        });
        
        window.addEventListener('keyup', function(e) {
            if (moves.includes(e.key)) {
                keypresses[e.key] = false;
            }
        });
        player_object = new Player(game);
        buttons = [];
        buttons.push(upgradeMenu(game));
        loop();
    },
    settings: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = 'rgba(30, 178, 54, 0.9)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "aliceblue";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (aoe) {
            this.context.strokeStyle = "black";
            this.context.lineWidth = 1;
            this.context.beginPath();
            this.context.roundRect(player_object.x - safeAreaWidth / 2, player_object.y - safeAreaHeight / 2, safeAreaWidth, safeAreaHeight, 15);
            this.context.stroke();
        }
    },
    restart: function() {
        this.canvas.style.cursor = 'none';
        spawnRate = 250;
        enemySpeed = 0.5;
        enemyHealth = 2;
        enemyCollisionDamage = 5;
        buttons = [];
        lastSpawn = -1;
        score = 0;
        ongoingGame = true;
        player_object = new Player(game);
        this.context = this.canvas.getContext("2d");
        buttons.push(upgradeMenu(game));
        loop();
    },
    end: function() {
        this.canvas.style.cursor = 'auto';
        buttons.push(restart(game));
        enemies = [];
        bullets = [];
        this.context = null;
    },
    updateTexts: function() {
        this.context.clearRect(0, 0, 150, 35);
        this.context.fillStyle = "rgba(240, 248, 255, 1)";
        this.context.fillRect(0, 0, 150, 35);
        this.context.font = "24px times-new-roman";
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = "black";
        let score_message = "Score: " + score;
        this.context.fillText(score_message, 10, 25);
        healthBar(game, player_object);
    }
};

launch();

function launch() {
    game.menu();
}

function spawnEnemy(time) {
    if (time <= (lastSpawn + spawnRate) || enemies.length >= 30) { return; }

    lastSpawn = time;
    let enemy = new Enemy(enemyHealth, enemySpeed, game);
    (!enemy.withinSafeArea(player_object)) ? enemies.push(enemy) : '';
}

function loop() {
    if (!ongoingGame) {
        game.end();
        return;
    }
    if (paused) {
        return;
    }
    requestAnimationFrame(loop);

    now = Date.now();
    delta = now - then;
    if (delta > interval) updateGame(); then = now - (delta % interval); game.frameNo++;
}

function pause() {
    paused = !paused;
    loop();
}

function updateGame() {
    increaseDifficulty();
    let time = Date.now();
    spawnEnemy(time);    

    game.clear();
    move();
    player_object.render(mouseX, mouseY);
    cursor();
    enemies = player_object.AoE(time, enemies);

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.tick()) { bullets.splice(i, 1); continue; }
        bullet.render();
    }

    buttons.forEach((button) => {
        if (button.id === 'UPGRADE' && player_object.statPoints >= 1) {
            button.render();
        }
    })

    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            score++;
            player_object.experience++;
        }

        bullets.forEach((bullet, index) => {
            if (enemy.collide(bullet)) {
                bullet.penetration -= 1;
                enemy.health -= player_object.bulletDamage;
                if (enemy.health <= 0) enemies.splice(i, 1); score++; player_object.experience++;
                if (bullet.penetration <= 0) bullets.splice(index, 1);
            }
        })

        enemy.followPlayer(player_object);
        enemy.render(player_object);

        if (enemy.collide(player_object)) {
            player_object.health -= enemyCollisionDamage;
            enemies.splice(i, 1);
            if (player_object.health <= 0) {
                ongoingGame = false;
            }
        }
        player_object.checkExp();
        game.updateTexts();
    }
}

function move() {
    keypresses = keypresses || [];

    const directions = { w: 0, a: 0, s: 0, d: 0 };
    const diagonal = keypresses.filter((key) => directions[key]).length === 2;

    player_object.x += (keypresses["a"] ? -player_object.speed : keypresses["d"] ? player_object.speed : 0);
    player_object.y += (keypresses["w"] ? -player_object.speed : keypresses["s"] ? player_object.speed : 0);
}

function increaseDifficulty() {
    gameRound = Math.floor(player_object.level / 2);
    let difficultyRatio = difficulties[gameDifficulty];
    if (!gameRounds[gameRound]) {
        enemySpeed *= difficultyRatio;
        enemyHealth += Math.floor(difficultyRatio * 1.5);
        enemyCollisionDamage *= difficultyRatio;
        spawnRate /= difficultyRatio;
        gameRounds[gameRound++] = true;
        gameRounds[gameRound++] = false;
    }
}

function difficulty(button) {
    switch (button.text) {
        case 'Easy':
            button.text = 'Medium';
            break;
        case 'Medium':
            button.text = 'Hard';
            break;
        case 'Hard':
            button.text = ':)';
            break;
        case ':)':
            button.text = 'Dodge Only';
            break;
        case 'Dodge Only':
            button.text = 'Easy';
            break;
    }
    gameDifficulty = button.text;
    return button;
}

function upgrade() {
    if (player_object.statPoints >= 1) {
        upgradeMenus = upgradeMenu(game, player_object);
        buttons.push(upgradeMenus[0], upgradeMenus[1], upgradeMenus[2], upgradeMenus[3], upgradeMenus[4]);
    }
    pause();
}

function eventListener(game) {
    game.canvas.addEventListener('mousemove', function(e) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    game.canvas.addEventListener('mousedown', function(e) {
        e.preventDefault();
        if (ongoingGame && player_object && !paused) {
            player_object.shoot(mouseX, mouseY, bullets);
        };
        let pressed = false;
        buttons.forEach((button) => {
            if (!button.onClick(mouseX, mouseY) || pressed) { return; }
            switch (button.id) {
                case 'RESTART':
                    game.restart();
                    pressed = true;
                    break;
                case 'START':
                    game.start();
                    pressed = true;
                    break;
                case 'SETTINGS':
                    game.settings();
                    pressed = true;
                    break;
                case 'DIFFICULTY':
                    button = difficulty(button);
                    button.render();
                    pressed = true;
                    break;
                case 'UPGRADE':
                    upgrade();
                    break;
                case 'UPGRADE-HEALTH':
                    upgradeHealth(player_object);
                    pressed = true;
                    break;
                case 'UPGRADE-BULLET_DAMAGE':
                    upgradeBulletDamage(player_object);
                    pressed = true;
                    break;
                case 'UPGRADE-BULLET_PENETRATION':
                    upgradeBulletPenetration(player_object);
                    pressed = true;
                    break;
                case 'UPGRADE-ATTACK_SPEED':
                    upgradeAttackSpeed(player_object);
                    pressed = true;
                    break;
                case 'UPGRADE-MOVEMENT_SPEED':
                    upgradeMovementSpeed(player_object);
                    pressed = true;
                    break;
            }
        });
    });
}

function cursor() {
    game.context.lineWidth = 5;
    game.context.strokeStyle = 'grey';
    game.context.beginPath();
    game.context.arc(mouseX, mouseY, 12, 0, 2*Math.PI);
    game.context.stroke();
    game.context.strokeStyle = 'black';
    game.context.beginPath();
    if (game.frameNo < player_object.lastShot + 60/player_object.attackSpeed && player_object.lastShot != 0) {
        game.context.arc(mouseX, mouseY, 12, 0, ( (game.frameNo % 60) / ((player_object.lastShot + (fps/player_object.attackSpeed)) % 60) )*Math.PI*2);
    } else {
        game.context.arc(mouseX, mouseY, 12, 0, Math.PI*2);
    }
    game.context.stroke();
}

export {
    aoe,
    aoeTime,
    safeAreaHeight,
    safeAreaWidth
}