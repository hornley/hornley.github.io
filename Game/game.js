import { CockroachBoss, WormBoss, Enemy, Player, Restart, healthBar, Text, TextButton } from "./entity.js";
import { menu, difficultyMenu, patchNotes, controls } from "./startMenu.js";
import { upgradeMenu, upgradeBulletDamage, upgradeBulletPenetration, upgradeHealth, upgradeAttackSpeed, upgradeMovementSpeed, playerStats, upgradeHotkeys } from "./upgrades.js";
import { cursor, move } from "./events.js";

const moves = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];

// Difficulty rampage
let gameDifficulty = 'Easy';
const difficulties = {'Easy': 1, 'Medium': 1.5, 'Hard': 2, 'Impossible': 3, 'Dodge Only': 5};
const stages = {1: 'Worm', 2: 'Cockroach'};
let gameRound;
let gameStage;
let gameRounds = {0: false, 1: false};

// Base Enemy Stats
let enemySpeed = 0.5; // ***
let enemyHealth = 1; // ***
let enemyCollisionDamage = 5; // ***

// Game & Enemy Thingz
let aoeTime = 250; // ***&
let aoe = false; // ***&
let safeAreaWidth = 200; // ***&
let safeAreaHeight = 200; // ***&
let spawnRate = 500; // **bbb

// FPS and Time (60/s)
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
let ongoingGame;
let paused = false;
let openUpgradeMenu = false;
let enemies = [];
let boss;
let bullets = [];
let buttons = [];
let spider_webs = [];
let restart;
let gameBG = new Image();
let stageBossFight;

let game = {
    canvas: document.getElementById("canvas"),
    menu: function() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.canvas.onselectstart = function () { return false; }
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = '#41980a';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.frameNo = 0;

        const menuButtons = menu(game);
        buttons.push(menuButtons[0], menuButtons[1]);

        eventListener(game);
    },
    start: function() {
        gameBG.onload = function () {
            ongoingGame = true;
            restart = new Restart(game);
            game.canvas.style.cursor = 'none';
            window.addEventListener('keydown', function(e) {
                let key = (e.key.length > 1) ? e.key : e.key.toLowerCase();
                if (moves.includes(key)) {
                    keypresses[key] = true;
                }
                
                if (key === " ") {
                    upgrade();
                }
    
                if ((key === 'r') && !ongoingGame) {
                    game.restart();
                }
    
                if (parseInt(key) && openUpgradeMenu) {
                    upgradeHotkeys(key, player_object, game);
                }
    
                if (key === 'Shift') {
                    player_object.dash(mouseX, mouseY);
                }
    
                if (key === 't') {
                    toggleShoot = false;
                }
            });
            
            window.addEventListener('keyup', function(e) {
                let key = e.key.toLowerCase();
                if (moves.includes(key)) {
                    keypresses[key] = false;
                }
            });
            player_object = new Player(game);
            buttons = [];
            buttons.push(upgradeMenu(game));
            loop();
        }
        gameBG.src = "./images/gameBG.jpg";
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(gameBG, 0, 0, this.canvas.width, this.canvas.height);
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
        gameRound = 0;
        gameStage = 1;
        toggleShoot = false;
        spawnRate = 500;
        enemySpeed = 0.5;
        enemyHealth = 1;
        enemyCollisionDamage = 5;
        buttons = [];
        gameRounds = {0: false, 1: false}
        lastSpawn = -1;
        score = 0;
        boss = null;
        stageBossFight = false;
        ongoingGame = true;
        player_object = new Player(game);
        this.context = this.canvas.getContext("2d");
        buttons.push(upgradeMenu(game));
        loop();
    },
    end: function() {
        this.canvas.style.cursor = 'auto';
        buttons.push(restart.render());
        enemies = [];
        bullets = [];
        spider_webs = [];
        this.context = null;
    },
    updateTexts: function() {
        this.context.font = "24px times-new-roman";
        this.context.textAlign = 'left';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = "white";
        this.context.fillText(`Score: ${score}`, 10, 25);
        this.context.fillText(`Stage: ${gameStage}`, 10, 50);
        this.context.fillText(`Round: ${gameRound + 1}`, 10, 75);
        healthBar(game, player_object);
    }
};

function newGame() {

}

game.menu();

function spawnEnemy(time) {
    if (time <= (lastSpawn + spawnRate) || enemies.length >= 30 || boss) return;
    let name;
    if (stageBossFight) {
        enemies = [];
        name = stages[gameStage - 1];
        if (name === 'Worm') boss = new WormBoss(`${name}-Boss`, enemyHealth * 25, enemySpeed / 3, enemyCollisionDamage * 5, 1, 'Boss', game, 153, 78, .05*Math.PI/2, {1: 0.75, 2: 0.5, 3: 0.25})
        if (name === 'Cockroach') boss = new CockroachBoss(`${name}-Boss`, enemyHealth * 25, enemySpeed / 3, enemyCollisionDamage * 5, 1, 'Boss', game, 153, 78, .05*Math.PI/2, {1: 0.75, 2: 0.5, 3: 0.25})
        enemies.push(boss);
        return;
    }
    let enemy;
    name = (Math.random() > 0.3 && gameStage > 1) ? 'Cockroach' : 'Worm';

    if (name === 'Worm') {
        enemy = new Enemy(name, enemyHealth, enemySpeed, enemyCollisionDamage, 1, 'Normal', game, 51, 24, .18*Math.PI/2);
    } else {
        enemy = new Enemy(name, enemyHealth * 2, enemySpeed * 1.75, enemyCollisionDamage * 1.5, 2, 'Normal', game, 56, 43, .005*Math.PI/2);
    }

    lastSpawn = time;
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
    playerStats(game, player_object);
    loop();
}

function increaseDifficulty() {
    let _stage = gameStage;
    gameRound = Math.floor(player_object.level / 2);
    let difficultyRatio = difficulties[gameDifficulty];
    if (!gameRounds[gameRound]) {
        gameStage = Math.floor((gameRound) / 5) + 1;
        enemySpeed = 0.5 + 1 * gameStage * Math.log10(gameRound + 1) * difficultyRatio;
        enemyHealth = 1 + 3 * gameStage * Math.log10(gameRound + 1) * difficultyRatio;
        enemyCollisionDamage = 5 + 1.5 * gameStage * Math.log10(gameRound + 1) * difficultyRatio;
        spawnRate = -(Math.log10(gameRound + 1) / 0.005) + 500;
        gameRounds[gameRound++] = true;
        gameRounds[gameRound++] = false;
        if (_stage !== gameStage && _stage) {
            stageBossFight = true;
        }
        return true;
    }
}

function difficultyToggle(button) {
    const Title = new Text(game.canvas.width/2, 300, "Difficulty", 200, game.context, 'black', "40px times-new-roman");
    const StartButton = new TextButton(game.canvas.width/2, 700, 'rgb(57, 202, 202)', 'black', 120, 45, game.context, 'START-GAME', 'Start');
    buttons.push(StartButton);
    button.changeOpacity(1);
    game.context.clearRect(game.canvas.width/2 - 200, game.canvas.height/2 - 200, 400, 550);
    game.context.fillStyle = "#41980a";
    game.context.roundRect(game.canvas.width/2 - 200, game.canvas.height/2 - 200, 400, 550, 10);
    game.context.fill();
    Title.render();
    StartButton.render();
    buttons.forEach((x) => {
        if (x.id === 'DIFFICULTY' && x.text !== button.text) x.changeOpacity(0.4);
        if (x.id === 'DIFFICULTY') {
            x.render();
        }
    });
    gameDifficulty = button.text;
}

function rewarding(reward, multiplier) {
    score += reward * multiplier;
    player_object.experience += reward * multiplier;
    player_object.checkExp();
    game.updateTexts();
}

function bossFight(reward) {
    if (boss.health <= 0) {
        rewarding(reward, boss.multiplier);
        boss = null;
        stageBossFight = false;
    }

    let newPhase = boss.phaseCheck();
    if (newPhase) boss.Summon(enemyHealth, enemySpeed, enemyCollisionDamage).forEach((x) => { enemies.push(x) });

    if (spider_webs.length === 0) boss.slowed = false;
    
    spider_webs.forEach((web) => {
        boss.slowed = (web.detection(boss)) ? true : false;
    })

    bullets.forEach((bullet, index) => {
        if (boss.collide(bullet) && !bullet.isHit(boss)) {
            bullet.hits.push(boss);
            bullet.penetration = 0;
            boss.health -= player_object.bulletDamage;
            if (boss.health <= 0) {
                rewarding(reward, boss.multiplier);
                boss = null;
                stageBossFight = false;
                return;
            } else {
                let web = bullet.cobweb(game.frameNo);
                spider_webs.push(web);
            }
            if (bullet.penetration <= 0) bullets.splice(index, 1);
        }
    })

    if (!boss) return;

    boss.followPlayer(player_object);
    boss.render(player_object);

    if (boss.collide(player_object)) {
        player_object.health -= boss.damage;
        if (player_object.health <= 0) {
            ongoingGame = false;
        }
    }
}

function updateGame() {
    let newRound = increaseDifficulty();
    let reward = 1 * difficulties[gameDifficulty] * gameStage;
    let time = Date.now();
    spawnEnemy(time);

    game.clear();
    keypresses = move(keypresses, player_object);
    player_object.render(mouseX, mouseY);
    cursor(game, player_object, mouseX, mouseY, fps);
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

    if (boss) bossFight(reward);
    
    buttons.forEach((button) => {
        if (button.id === 'UPGRADE' && player_object.statPoints >= 1) {
            game.context.save();
            game.context.fillStyle = 'rgb(76, 76, 109)';
            game.context.fillRect(game.canvas.width/2 - 155, game.canvas.height - 80, 310, 28);
            const upgradeTooltip = new Text(game.canvas.width/2, game.canvas.height - 65, "Press Spacebar to open upgrade menu", 300, game.context, 'white');
            upgradeTooltip.render();
            button.render();
            game.context.restore();
        }
    })

    spider_webs.forEach((web, index) => {
        if (web.render(game.frameNo)) {
            web.render(game.frameNo);
        } else {
            spider_webs.splice(index, 1);
        }
    })
    
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.health <= 0) {
            enemies.splice(i, 1);
            rewarding(reward, enemy.multiplier);
        }

        if (spider_webs.length === 0) enemy.slowed = false;
        
        spider_webs.forEach((web) => {
            enemy.slowed = (web.detection(enemy)) ? true : false;
        })

        bullets.forEach((bullet, index) => {
            if (enemy.collide(bullet) && !bullet.isHit(enemy)) {
                bullet.hits.push(enemy);
                bullet.penetration -= 1;
                enemy.health -= player_object.bulletDamage;
                if (enemy.health <= 0) {
                    enemies.splice(i, 1);
                    rewarding(reward, enemy.multiplier);
                } else {
                    let web = bullet.cobweb(game.frameNo);
                    spider_webs.push(web);
                }
                if (bullet.penetration <= 0) bullets.splice(index, 1);
            }
        })

        enemy.followPlayer(player_object);
        enemy.render(player_object);

        if (enemy.collide(player_object)) {
            player_object.health -= enemy.damage;
            enemies.splice(i, 1);
            if (player_object.health <= 0) {
                ongoingGame = false;
            }
        }
        player_object.checkExp();
        game.updateTexts();
    }
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
                buttons = [];
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
                buttons.push(controls(game));
                break;
            case 'BACK-MENU':
                menu(game, 1);
                pressed = true;
                break;
            case 'PATCH-NOTES':
                patchNotes(game);
                pressed = true;
                break;
            case 'UPGRADE':
                upgrade();
                break;
            case 'UPGRADE-HEALTH':
                upgradeHealth(player_object);
                upgradeMenu(game, player_object);
                pressed = true;
                break;
            case 'UPGRADE-BULLET_DAMAGE':
                upgradeBulletDamage(player_object);
                upgradeMenu(game, player_object);
                pressed = true;
                break;
            case 'UPGRADE-BULLET_PENETRATION':
                upgradeBulletPenetration(player_object);
                upgradeMenu(game, player_object);
                pressed = true;
                break;
            case 'UPGRADE-ATTACK_SPEED':
                upgradeAttackSpeed(player_object);
                upgradeMenu(game, player_object);
                pressed = true;
                break;
            case 'UPGRADE-MOVEMENT_SPEED':
                upgradeMovementSpeed(player_object);
                upgradeMenu(game, player_object);
                pressed = true;
                break;
            case 'DIFFICULTY':
                difficultyToggle(button);
                pressed = true;
                break;
        }
    });
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
        mouseDown = (ongoingGame) ? true : false;
        mouseDownTimeout = setTimeout(function() {
            if (mouseDown) {
                toggleShoot = true;
                toggleText = new Text(game.canvas.width / 2, 25, "Auto Shoot: Enabled", 150, game.context, 'white');
            }
        }, 3000);
        buttonsOnClick();
    });
}

function upgrade() {
    game.canvas.style.cursor = (game.canvas.style.cursor === 'auto') ? 'none' : 'auto';
    if (player_object.statPoints >= 1) {
        upgradeMenu(game, player_object).forEach((button) => {
            buttons.push(button);
        })
    }
    openUpgradeMenu = (player_object.statPoints >= 1) ? !openUpgradeMenu : false;
    pause();
}

export {
    aoe,
    aoeTime,
    safeAreaHeight,
    safeAreaWidth,
    difficulties
}