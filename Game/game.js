import { CockroachBoss, WormBoss, Enemy, Player, Portal, Restart, healthBar, Text, TextButton, Stage } from "./entity.js";
import { menu, difficultyMenu, patchNotes, controls } from "./startMenu.js";
import { upgradeMenu, upgradeBulletDamage, upgradeBulletPenetration, upgradeHealth, upgradeAttackSpeed, upgradeMovementSpeed, playerStats, upgradeHotkeys } from "./upgrades.js";
import { cursor, move, showFPS } from "./events.js";

const moves = ['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'];

const bgMusic = document.getElementById("bgMUSIC");

// Difficulty rampage
let gameDifficulty = 'Easy';
const difficulties = {'Easy': 1, 'Medium': 1.5, 'Hard': 2, 'Impossible': 3, 'Dodge Only': 5};
const stages = {1: 'Worm', 2: 'Cockroach'};
let gameRound;
let gameStage = 1;
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
let oldTime = -1;

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
let stage2 = new Image();
let stageBossFight;
let portal;
let StageDisplay;
let newStageStatus;

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
            bgMusic.volume = 0.3;
            bgMusic.play();
            ongoingGame = true;
            StageDisplay = new Stage(game);
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

                if (key === 'q') {
                    let x = player_object.skillOne();
                    if(x) spider_webs.push(x);
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
        gameBG.src = "./images/Stage1/Stage1Background.png";
        stage2.src = "./images/Stage2Background.png";
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (gameStage === 1) {
            this.context.drawImage(gameBG, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.context.drawImage(stage2, 0, 0, this.canvas.width, this.canvas.height);
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
        newStageStatus = false;
        stageBossFight = false;
        portal = null;
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

game.menu();

function spawnEnemy(time) {
    if (time <= (lastSpawn + spawnRate) || enemies.length >= 30 || boss || newStageStatus) return;
    if (stageBossFight) {
        let name = stages[gameStage];
        if (name === 'Worm') boss = new WormBoss(`${name}-Boss`, enemyHealth * 25, enemySpeed / 3, enemyCollisionDamage * 5, 1, 'Boss', game, 230, 117, .05*Math.PI/2, {1: 0.75, 2: 0.5, 3: 0.25})
        if (name === 'Cockroach') boss = new CockroachBoss(`${name}-Boss`, enemyHealth * 75, enemySpeed / 2, enemyCollisionDamage * 15, 2, 'Boss', game, 168, 129, .05*Math.PI/2, {1: 0.75, 2: 0.5, 3: 0.25})
        boss.setPosition();
        enemies.push(boss);
        return;
    }
    let enemy;

    if (gameStage === 1) {
        enemy = new Enemy('Worm', enemyHealth, enemySpeed, enemyCollisionDamage, 1, 'Normal', game, 51, 24, .18*Math.PI/2);
    } else {
        enemy = new Enemy('Cockroach', enemyHealth * 2, enemySpeed * 1.75, enemyCollisionDamage * 1.5, 2, 'Normal', game, 56, 43, .005*Math.PI/2);
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
    let _stage = gameStage, _x = gameStage;
    gameRound = Math.floor(player_object.level / 2);
    let difficultyRatio = difficulties[gameDifficulty];
    if (!gameRounds[gameRound]) {
        _x = Math.floor((gameRound) / 5) + 1;
        enemySpeed = 0.5 * (gameRound) + (1 * gameStage);
        enemyHealth = 1 + 3 * gameStage * Math.log10(gameRound + 1) * difficultyRatio;
        enemyCollisionDamage = 5 + 1.5 * gameStage * Math.log10(gameRound + 1) * difficultyRatio;
        spawnRate = -(Math.log10(gameRound + 1) / 0.005) + 500;
        gameRounds[gameRound++] = true;
        gameRounds[gameRound++] = false;
        if (_stage !== _x && _stage) {
            portal = new Portal(game);
            return true;
        }
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

function newStage() {
    portal = (!portal) ? new Portal(game) : portal;

    if (portal.closing) {
        portal.close();
        return;
    }

    if (portal.opened && !portal.closing ) {
        portal.closing = portal.playerDetect(player_object);
        stageBossFight = false;
    }

    if (!portal.opened && !stageBossFight) {
        newStageStatus = false;
        gameStage++;
        portal = null;
        toggleShoot = false;
        bullets = [];
        return;
    }

    StageDisplay.clear(gameStage);
    portal.open();
}

function updateGame() {
    let newRound = increaseDifficulty();
    let reward = 1 * difficulties[gameDifficulty] * gameStage * (stageBossFight) ? 0 : 1;
    let time = Date.now();
    let dmgMultiplier;
    let enemy;
    spawnEnemy(time);

    game.clear();
    showFPS(game, time);
    keypresses = move(keypresses, player_object);
    player_object.render(mouseX, mouseY);
    enemies = player_object.AoE(time, enemies);

    if (newStageStatus && enemies.length < 1) {
        newStage();
        game.updateTexts();
        cursor(game, player_object, mouseX, mouseY, fps);
        return;
    }

    StageDisplay.new(gameStage);

    if (ongoingGame && player_object && !paused && (mouseDown || toggleShoot)) {
        player_object.shoot(mouseX, mouseY, bullets);
        (toggleShoot) ? toggleText.render() : '';
    };

    for (let i = 0; i < bullets.length; i++) {
        let bullet = bullets[i];
        if (bullet.tick()) { bullets.splice(i, 1); continue; }
        bullet.render();
    }

    if (!stageBossFight && !boss && portal) {
        stageBossFight = true;
    }

    if (boss) boss.summoning();
    
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
    
    // Simplify the 'enemy.type === Boss' shits
    for (let i = 0; i < enemies.length; i++) {
        enemy = enemies[i];
        dmgMultiplier = 1;

        // Simplify this shit to the bottom (1)
        if (enemy.health <= 0 && enemy.dead === 5) {
            enemies.splice(i, 1);
            rewarding(reward, enemy.multiplier);
            if (enemy.type === 'Boss') {
                boss = null;
                newStageStatus = true;
            }
        }

        if (enemy.type === 'Boss') {
            if (!boss.summoned) continue;
            if (boss.phaseCheck() && boss.health > 0) boss.Summon(enemyHealth, enemySpeed, enemyCollisionDamage).forEach((x) => { enemies.push(x) });
        }

        if (spider_webs.length === 0) enemy.slowed = false;
        
        spider_webs.forEach((web) => {
            if (web.detection(enemy)) {
                enemy.slowed = true;
                if (web.type = 'PlayerSkillOne') dmgMultiplier = 1.5;
            } else {
                enemy.slowed = false;
            }
        })

        bullets.forEach((bullet, index) => {
            if (enemy.collide(bullet) && !bullet.isHit(enemy) && !enemy.dead) {
                bullet.hits.push(enemy);
                bullet.penetration -= 1;
                if (enemy.type === 'Boss') bullet.penetration = 0;
                enemy.health -= player_object.bulletDamage * dmgMultiplier; 
                // (1)
                if (enemy.health <= 0 && enemy.type === 'Boss' && enemy.dead === 5) {
                    boss = null;
                    newStageStatus = true;
                } else if (enemy.health <= 0 && enemy.dead === 5) {
                    enemies.splice(i, 1);
                    rewarding(reward, enemy.multiplier);
                } else {
                    let web = bullet.cobweb(game.frameNo);
                    spider_webs.push(web);
                }
                if (bullet.penetration <= 0) bullets.splice(index, 1);
            }
        })

        // Change this block to also check if the player has been hit before, around 1s, if yes, ignore.
        if (enemy.collide(player_object)) {
            if (enemy.health > 0) player_object.health -= enemy.damage;
            else {
                player_object.devour(enemy);
                // (1)
                rewarding(reward, enemy.multiplier);
                if (enemy.type === 'Boss') {
                    boss = null;
                    newStageStatus = true;
                }
            }
            enemies.splice(i, 1);
            if (player_object.health <= 0) {
                ongoingGame = false;
            }
        }
        enemy.followPlayer(player_object);
        enemy.render(player_object);
        cursor(game, player_object, mouseX, mouseY, fps);
        player_object.checkExp();
        game.updateTexts();
    }
    game.updateTexts();
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