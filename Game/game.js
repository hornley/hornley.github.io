import { Enemy, Player, restart, menu, healthBar, Text, difficultyMenu, difficultyDescription, patchNotes, controls } from "./entity.js";
import { upgradeMenu, upgradeBulletDamage, upgradeBulletPenetration, upgradeHealth, upgradeAttackSpeed, upgradeMovementSpeed } from "./upgrades.js";

const moves = ['w', 'a', 's', 'd'];

// Difficulty rampage
let gameDifficulty = 'Easy';
const difficulties = {'Easy': 1.15, 'Medium': 1.3, 'Hard': 1.5, 'Impossible': 2, 'Dodge Only': 5};
let gameRound;
let gameRounds = {0: true, 1: false};

/* Base
& - not affected by rampage
*/
let aoeTime = 250; // ***&
let aoe = false; // ***&
let safeAreaWidth = 200; // ***&
let safeAreaHeight = 200; // ***&
let spawnRate = 250; // **bbb
let enemySpeed = 0.5; // ***
let enemyHealth = 1; // ***
let enemyCollisionDamage = 5; // ***

// FPS and Time
const fps = 60;
const interval = 1000/fps;
let now;
let then = Date.now();
let delta;
let lastSpawn = -1;

// MouseClickEvents and Shooting toggles
let mouseDownTimeout;
let mouseDown;
let mouseX = 0.0;
let mouseY = 0.0;
let toggleShoot;
let toggleText;
let keypresses;

// Game Objects and Variables
let player_object;
let score = 0;
let ongoingGame = true;
let paused = false;
let enemies = [];
let bullets = [];
let buttons = [];

let game = {
    canvas: document.getElementById("canvas"),
    menu: function() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = '#41980a';
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
                upgrade();
            }

            if ((e.key === 'r' || e.key === 'R') && !ongoingGame) {
                game.restart();
            }

            if (parseInt(e.key)) {
                upgradeHotkeys(e.key);
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
    controls: function() {
        controls(game);
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
        toggleShoot = false;
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
        this.context.clearRect(0, 0, 120, 60);
        this.context.fillStyle = "rgba(240, 248, 255, 1)";
        this.context.fillRect(0, 0, 120, 60);
        this.context.font = "24px times-new-roman";
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = "black";
        this.context.fillText(`Score: ${score}`, 10, 25);
        this.context.fillText(`Round: ${gameRound + 1}`, 10, 50);
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
        enemySpeed = Math.log(gameRound + 1) * (difficultyRatio/1.5);
        enemyHealth = 1  + Math.log(gameRound + 1) * (difficultyRatio/1.5);
        enemyCollisionDamage = 5 + Math.log(gameRound + 1) * (difficultyRatio/1.5);
        spawnRate = 250 / Math.log(gameRound + 1) * (difficultyRatio/1.5);
        gameRounds[gameRound++] = true;
        gameRounds[gameRound++] = false;
        return true;
    }
}

function upgrade() {
    game.canvas.style.cursor = (game.canvas.style.cursor === 'auto') ? 'none' : 'auto';
    if (player_object.statPoints >= 1) {
        upgradeMenu(game, player_object).forEach((button) => {
            buttons.push(button);
        })
    }
    pause();
}

function upgradeHotkeys(key) {
    console.log(key);
    switch (parseInt(key)) {
        case 1:
            upgradeHealth(player_object);
            break;
        case 2:
            upgradeBulletDamage(player_object);
            break;
        case 3:
            upgradeBulletPenetration(player_object);
            break;
        case 4:
            upgradeAttackSpeed(player_object);   
            break;
        case 5:
            upgradeMovementSpeed(player_object);
            break;
    }

}

function difficultyToggle(button) {
    buttons.push(difficultyDescription(button.text, game));
    button.changeOpacity(1);
    game.context.clearRect(game.canvas.width * .3 + 5, 150, 180, 500);
    game.context.fillStyle = '#41980a';
    game.context.fillRect(game.canvas.width * .3 + 5, 150, 181, 500);
    buttons.forEach((x) => {
        if (x.id === 'DIFFICULTY' && x.text !== button.text) x.changeOpacity(0.4);
        if (x.id === 'DIFFICULTY') x.render();
    });
    gameDifficulty = button.text;
}

function buttonsOnClick() {
    let pressed = false;
    buttons.forEach((button) => {
        if (!button.onClick(mouseX, mouseY) || pressed) { return; }
        switch (button.id) {
            case 'RESTART':
                game.restart();
                pressed = true;
                break;
            case 'START':
                difficultyMenu(game).forEach((button) => {
                    buttons.push(button);
                })
                pressed = true;
                break;
            case 'START-GAME':
                game.start();
                pressed = true;
                break;
            case 'CONTROLS':
                game.controls();
                pressed = true;
                break;
            case 'PATCH-NOTES':
                
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
            case 'DIFFICULTY':
                difficultyToggle(button);
                pressed = true;
                break;
        }
    });
}

function updateGame() {
    let newRound = increaseDifficulty();
    let time = Date.now();
    spawnEnemy(time);    

    game.clear();
    move();
    player_object.render(mouseX, mouseY);
    cursor();
    enemies = player_object.AoE(time, enemies);

    if (ongoingGame && player_object && !paused && (mouseDown || toggleShoot)) {
        player_object.shoot(mouseX, mouseY, bullets);
        (toggleShoot) ? toggleText.render() : '';
    };

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.tick()) { bullets.splice(i, 1); continue; }
        bullet.render();
    }

    buttons.forEach((button) => {
        if (button.id === 'UPGRADE' && player_object.statPoints >= 1) {
            button.render();
            const upgradeTooltip = new Text(game.canvas.width/2, game.canvas.height - 65, "Press Spacebar to open upgrade menu", 300, game.context);
            upgradeTooltip.render();
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
            if (enemy.collide(bullet) && !bullet.isHit(enemy)) {
                bullet.hits.push(enemy);
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

function eventListener(game) {
    game.canvas.addEventListener('mousemove', function(e) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    });

    game.canvas.addEventListener('mouseup', function(e) {
        mouseDown = false;
        clearTimeout(mouseDownTimeout);
    });

    game.canvas.addEventListener('mousedown', function(e) {
        mouseDown = true;
        mouseDownTimeout = setTimeout(function() {
            if (mouseDown) {
                toggleShoot = true;
                toggleText = new Text(game.canvas.width / 2, 25, "Auto Shoot: Enabled", 150, game.context);
            }
        }, 5000);
        buttonsOnClick();
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
    safeAreaWidth,
    difficulties
}