import { aoe, aoeTime, safeAreaHeight, safeAreaWidth, difficulties } from "./game.js";

let lastTime = -1;
const spriteWidth = 64;
const spriteHeight = 64;
const spiderSprite = "../images/Spider-Sprites.png";
let playerImage = new Image();
playerImage.src = spiderSprite;
const spiderShoot = "../images/Spider-Shoot.png";
let bulletImage = new Image();
bulletImage.src = spiderShoot;
const enemySprite = "../images/Enemy.png";
let enemyImage = new Image();
enemyImage.src = enemySprite;
let idleFrame = 0;
const version = 'Version: 0.2.1-alpha';

class Sound {
    constructor(src) {
        this.sound = document.createElement('audio');
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
    }
    play() {
        this.sound.currentTime = 0.2;
        this.sound.play();
    }
}

let levelUpSound = new Sound('../Audio/level-up.mp3');
let shootSound = new Sound('../Audio/shoot.mp3');

class Player {
    constructor(game) {
        this.game = game;
        this.speed = 3;
        this.health = 100;
        this.maxHealth = 100;
        this.type = "black";
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.width = spriteWidth;
        this.height = spriteHeight;
        this.level = 1;
        this.experience = 0;
        this.experienceRequired = 10;
        this.statPoints = 0;
        this.bulletDamage = 1;
        this.penetration = 1;
        this.rotation = 0;
        this.attackSpeed = 2;
        this.lastShot = 0;
    };

    crash() {
        this.x = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(this.game.canvas.height - this.height / 2, this.y));
    };

    render(mouseX, mouseY) {
        this.crash();
        
        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(Math.atan2(mouseY - this.y, mouseX - this.x) - Math.PI / 2);
        this.game.context.drawImage(playerImage, spriteWidth * idleFrame, 0, spriteWidth, spriteHeight, -this.width / 2, -this.height / 2, spriteWidth, spriteHeight);
        if (this.game.frameNo % 10 == 0) idleFrame++;
        if (idleFrame === 3) idleFrame = 0;
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);

        experienceBar(this.experience, this.experienceRequired, this.game.context, this.game.canvas.width, this.game.canvas.height);
    };

    shoot(mouseX, mouseY, bullets) {
        if (this.game.frameNo < this.lastShot + 60/this.attackSpeed && this.lastShot != 0) { return; }
        const x = mouseX - this.x;
        const y = mouseY - this.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * 10;
        const dy = (y / l) * 10;
        this.lastShot = this.game.frameNo;
        shootSound.play();
        bullets.push(new Bullet(this.x, this.y, dx, dy, this.game, mouseX, mouseY, this.bulletDamage, this.penetration));
    };

    AoE(time, enemies) {
        if (time > lastTime + aoeTime && aoe) {
            lastTime = time;
            this.game.context.strokeStyle = "black";
            this.game.context.fillStyle = "red";
            this.game.context.beginPath();
            this.game.context.roundRect(this.x - safeAreaWidth / 2, this.y - safeAreaHeight / 2, safeAreaWidth, safeAreaHeight, 15);
            this.game.context.fill();
            for (let _ in enemies) {
                let enemy = enemies[_];
                if (enemy.withinSafeArea(this)) {
                    enemy.health -= 1;
                };
            }
        }
        return enemies;
    };

    checkExp() {
        if (this.experience >= this.experienceRequired) {
            levelUpSound.play();
            this.level++;
            this.statPoints += 4;
            this.experience -= this.experienceRequired;
            this.experienceRequired *= 1.3;
        };
    };
};

class Bullet {
    constructor(x, y, dx, dy, game, mouseX, mouseY, damage, pene) {
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = 24;
        this.height = 44;
        this.game = game;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.rotation = 0;
        this.penetration = pene;
        this.hits = [];
    }

    tick() {
        this.x += this.dx;
        this.y += this.dy;

        const outOfBounds = (
            this.x + this.width < 0 ||
            this.x - this.width > this.game.canvas.width ||
            this.y + this.height < 0 ||
            this.y - this.height > this.game.canvas.height
        );

        return outOfBounds;
    }

    isHit(enemy) {
        return this.hits.includes(enemy);
    }

    render() {

        if (!this.rotation) this.rotation = Math.atan2(this.mouseY - this.y, this.mouseX - this.x) + Math.PI / 2;

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage(bulletImage, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    }
}; 

class Enemy {
    constructor(hp, speed, game) {
        this.game = game;
        this.x = Math.random() * (game.canvas.width - 30) + 2;
        this.y = Math.random() * (game.canvas.height - 30) + 2;
        this.health = hp;
        this.max_health = hp;
        this.speed = speed;
        this.width = 51;
        this.height = 24;
        this.rotation = 0;
    };

    collide(object) {
        let myleft = this.x;
        let myright = this.x;
        let mytop = this.y;
        let mybottom = this.y;
        let otherleft = object.x - object.width / 2;
        let otherright = object.x + object.width / 2;
        let othertop = object.y - object.height / 2;
        let otherbottom = object.y + object.height / 2;
        
        return (mybottom >= othertop) && (myright <= otherright) && (myleft >= otherleft) && (mytop <= otherbottom);
    };

    render(player) {
        this.rotation = Math.atan2(player.y - this.y, player.x - this.x) + .2*Math.PI/2;

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage(enemyImage, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    followPlayer(player) {
        const x = this.x - player.x;
        const y = this.y - player.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * this.speed;
        const dy = (y / l) * this.speed;
        this.x += -dx;
        this.y += -dy;
    };

    withinSafeArea(player) {
        return (this.x >= player.x - safeAreaWidth / 2 &&
        this.x <= player.x + safeAreaWidth / 2 &&
        this.y >= player.y - safeAreaHeight / 2 &&
        this.y <= player.y + safeAreaHeight / 2)
    };
};

class TextButton {
    constructor(x, y, fillStyle, textColor, width, height, ctx, id, text, round=10) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.fillStyle = fillStyle;
        this.textColor = textColor;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.text = text;
        this.round = round;
        this.opacity = 1;
    };

    render() {
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.beginPath();
        this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, this.round);
        this.ctx.fill();
        this.ctx.restore();
        const text = new Text(this.x, this.y, this.text, this.width, this.ctx, this.textColor);
        text.render();
    };

    changeSize(width, height) {
        this.width = width;
        this.height = height;
    };

    changeText(text) {
        this.text = text;
    };

    changeOpacity(opacity) {
        this.opacity = opacity;
    };

    onClick(mouseX, mouseY) {
        return (this.x >= mouseX - this.width / 2 &&
        this.x <= mouseX + this.width / 2 &&
        this.y >= mouseY - this.height / 2 &&
        this.y <= mouseY + this.height / 2);
    };
};

class ImageButton {
    constructor(x, y, width, height, ctx, id, source) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.source = source;
    };

    render() {
        let image = new Image();
        image.src = this.source;
        let ctx = this.ctx;
        let x = this.x;
        let y = this.y;
        image.onload = function() {
            ctx.drawImage(image, x, y);
        }
    };

    onClick(mouseX, mouseY) {
        return (this.x >= mouseX - this.width / 2 &&
        this.x <= mouseX + this.width / 2 &&
        this.y >= mouseY - this.height / 2 &&
        this.y <= mouseY + this.height / 2);
    };
};

class Text {
    constructor(x, y, text, maxWidth, ctx, textColor='black', font='24px times-new-roman', textAlign='center', textBaseline='middle') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.textColor = textColor;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
        this.maxWidth = maxWidth;
        this.font = font;
        this.ctx = ctx;
    };

    render() {
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.fillText(this.text, this.x, this.y, this.maxWidth);
    }

    update(text) {
        this.ctx.fillStyle = 'rgb(76, 76, 109)';
        this.ctx.fillRect(this.x - 12.5, this.y - 12.5, 25, 25);
        this.text = text;
        this.render();
    }
};

function restart(myGame) {
    const ctx = myGame.context;
    const restartWidth = 350;
    const restartHeight = 300;
    const restartTop = 125;
    const x = myGame.canvas.width / 2;
    const y = myGame.canvas.height / 2;

    ctx.fillStyle = 'rgba(119, 161, 161, 1)';
    ctx.strokeStyle = 'black';
    ctx.roundRect(x - restartWidth / 2, y - restartHeight / 2 - restartTop, restartWidth, restartHeight, 15);
    ctx.fill();

    const restartText = new Text(x, y - restartTop * 1.2, "Press the TextButton below to restart", 300, ctx, 'black',"30px times-new-roman");
    restartText.render();

    const restartButton = new TextButton(x, y - restartTop / 2, 'rgba(135, 206, 235, 1)', 'black', 100, 50, ctx, 'RESTART', "Restart");
    restartButton.render();

    return restartButton;
}

function menu(myGame) {
    const ctx = myGame.context;
    const startTop = 15;
    const settingsTop = 75;
    const x = myGame.canvas.width * .15;
    const y = myGame.canvas.height / 2;
    // let image = new Image();
    // image.src = "../images/background-image.jpeg";
    // image.onload = function() {
        // ctx.drawImage(image, 0, 0, myGame.canvas.width, myGame.canvas.height);
        // put renders here
    // }

    const startButton = new TextButton(x, y + startTop, 'rgb(57, 202, 202)', 'black', 90, 45, ctx, 'START', 'Start');
    const controlsButton = new TextButton(x, y + settingsTop, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CONTROLS', 'Controls');
    const patchNotesButton = new ImageButton(x * 1.85, y * 2 - 50, 22, 22, ctx, 'PATCH-NOTES', "../images/Patch-Notes.png");
    const gameTitle = new Text(x, y - 200, "Bugs War", 500, ctx, 'black', '75px times-new-roman');
    const gameVersion = new Text(85, y * 2 - 17, version, 150, ctx, 'black', '20px times-new-roman');

    controlsButton.render();
    startButton.render();
    patchNotesButton.render();
    gameTitle.render();
    gameVersion.render();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(x * 2, 0);
    ctx.lineTo(x * 2, y * 2);
    ctx.stroke();

    return [startButton, patchNotesButton, controlsButton];
}

function difficultyMenu(myGame) {
    const ctx = myGame.context;
    const x = myGame.canvas.width * .3;
    const y = myGame.canvas.height / 2;
    const width = myGame.canvas.width * .7;
    const height = myGame.canvas.height;

    ctx.clearRect(x, 0, width, height);
    ctx.fillStyle = '#41980a';
    ctx.fillRect(x, 0, width, height);
    
    const Title = new Text(x + width / 2, 80, "Difficulty", 200, ctx, 'black', "40px times-new-roman");
    const Easy = new TextButton(x + 100, 200, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Easy');
    const Medium = new TextButton(x + 100, 275, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Medium');
    const Hard = new TextButton(x + 100, 350, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Hard');
    // const Impossible = new TextButton(x + 100, 425, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'IMPOSSIBLE', 'Impossible');
    // const DodgeOnly = new TextButton(x + 100, 500, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DODGE-ONLY', 'Dodge Only');
    // const Custom = new TextButton(x + 100, 575, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CUSTOM', 'Custom');
    Title.render();
    Easy.render();
    Medium.render();
    Hard.render();
    // Impossible.render();
    // DodgeOnly.render();
    // Custom.render();
    // buttons.push([Easy, Medium, Hard, Impossible, DodgeOnly, Custom]);
    return [Easy, Medium, Hard];
}

// Continue from here to patchNotes()
function difficultyDescription(difficulty, myGame) {
    const ctx = myGame.context;
    const ratio = difficulties[difficulty];
    const x = myGame.canvas.width * .3 + 200;
    const y = 150;
    const descriptionBoxWidth = 650;
    const descriptionBoxHeight = 500;

    ctx.fillStyle = '#41980a';
    ctx.roundRect(x, y, descriptionBoxWidth, descriptionBoxHeight, 10);
    ctx.stroke();
    ctx.fill();

    const EnemySpeed = new Text(x + 25, y + 50, `Enemy Speed: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const EnemyHealth = new Text(x + 25, y + 100, `Enemy Health: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const EnemyDamage = new Text(x + 25, y + 150, `Enemy Damage: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const SpawnRate = new Text(x + 25, y + 200, `Spawn Rate: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    EnemySpeed.render();
    EnemyHealth.render();
    EnemyDamage.render();
    SpawnRate.render();

    const StartButton = new TextButton(x + 550, y + 450, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'START-GAME', 'Start');
    StartButton.render();
    return StartButton;
}

function patchNotes() {
    const ctx = myGame.context;
    const x = myGame.canvas.width * .3;
    const y = myGame.canvas.height / 2;
    const width = myGame.canvas.width * .7;
    const height = myGame.canvas.height;
}

function controls(myGame) {
    const ctx = myGame.context;
    const x = myGame.canvas.width * .3;
    const y = myGame.canvas.height / 2;
    const width = myGame.canvas.width * .7;
    const height = myGame.canvas.height;

    ctx.clearRect(x, 0, width, height);
    ctx.fillStyle = '#41980a';
    ctx.fillRect(x, 0, width, height);

    const Title = new Text(x + width / 2, 80, "Controls", 150, ctx, 'black', "40px times-new-roman");
    const Movement = new Text(x + width / 2, 200, "WASD - Movements", 200, ctx);
    const Shoot = new Text(x + width / 2, 250, "Click or Hold to shoot (Hold for 5secs to toggle auto shoot)", 600, ctx);
    const Spacebar = new Text(x + width / 2, 300, "Spacebar to open upgrades menu", 300, ctx);
    const Restart = new Text(x + width / 2, 350, "Press 'R' for the restart hotkey.", 300, ctx);
    Title.render();
    Movement.render();
    Shoot.render();
    Spacebar.render();
    Restart.render();
}

function experienceBar(experience, experienceRequired, context, gameWidth, gameHeight) {
    let currentExperience = experience/experienceRequired;
    let remainingExperience = (experienceRequired - experience)/experienceRequired;
    let currentRectWidth = gameWidth * currentExperience;
    let expBarHeight = 20;
    const percentage = new Text(gameWidth/2, gameHeight - 10, `Exp: ${(experience).toFixed(2)}/${(experienceRequired).toFixed(2)} (${(currentExperience * 100).toFixed(2)}%)`, 150, context, 'white', '15px times-new-roman', 'white');
    
    context.fillStyle = "red";
    context.fillRect(0, gameHeight - expBarHeight, currentRectWidth, expBarHeight);
    context.fillStyle = "black";
    context.fillRect(0 + currentRectWidth, gameHeight - expBarHeight, gameWidth * remainingExperience, expBarHeight);
    percentage.render();
}

function healthBar(game, player) {
    game.context.lineWidth = 25;
    game.context.strokeStyle = 'black';
    game.context.beginPath();
    game.context.arc(game.canvas.width, 0, 125, Math.PI, .5*Math.PI, true);
    game.context.stroke();
    game.context.strokeStyle = 'red';
    game.context.beginPath();
    game.context.arc(game.canvas.width, 0, 125, (player.health/player.maxHealth/2 + 0.5)*Math.PI, .5*Math.PI, true);
    game.context.stroke();
    const playerLevelText = new Text(game.canvas.width - 40, 50, player.level, 50, game.context, 'black', '60px times-new-roman');
    playerLevelText.render();
}

export {
    TextButton,
    Enemy,
    Bullet,
    Player,
    Text,
    restart,
    menu,
    controls,
    healthBar,
    patchNotes,
    difficultyMenu,
    difficultyDescription
};