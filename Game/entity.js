import { aoe, aoeTime, safeAreaHeight, safeAreaWidth } from "./game.js";

let lastTime = -1;
const spriteWidth = 64;
const spriteHeight = 64;
const spiderSprite = "../images/Spider-Sprites.png";
let playerImage = new Image();
playerImage.src = spiderSprite;
const spiderShoot = "../images/Spider-Shoot.png";
let bulletImage = new Image();
bulletImage.src = spiderShoot;
let WormImage = new Image();
WormImage.src = "../images/Worm-Sprite.png";
let CockroachImage = new Image();
CockroachImage.src = "../images/Cockroach-Sprite.png";
let spiderWeb = new Image();
spiderWeb.src = "../images/Spider-Web.png";
let idleFrame = 0;

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
        this.lastDash = 0;
        this.dash = false;
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

    dash(mouseX, mouseY) {
        if (this.game.frameNo < this.lastDash + 300 && this.lastDash != 0) { return; }
        const x = this.x - mouseX;
        const y = this.y - mouseY;
        const l = Math.sqrt(x * x + y * y);

        this.lastDash = this.game.frameNo;
        const dx = (x / l) * this.speed;
        const dy = (y / l) * this.speed;
        this.x += -dx;
        this.y += -dy;
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
            this.health = this.maxHealth;
            this.level++;
            this.statPoints += 4;
            this.experience -= this.experienceRequired;
            this.experienceRequired *= 1.3;
        };
    };
};

class SpiderWebs {
    constructor(x, y, ctx, frame) {
        this.x = x;
        this.y = y;
        this.context = ctx;
        this.frame = frame;
        this.width = 60;
        this.height = 60;
    };

    render(curFrame) {
        if (this.frame + 120 <= curFrame) { return false; }
        this.context.drawImage(spiderWeb, this.x - this.width / 2, this.y - this.height / 2);
        return true;
    };
}

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
    };

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
    };

    isHit(enemy) {
        return this.hits.includes(enemy);
    };

    render() {
        if (!this.rotation) this.rotation = Math.atan2(this.mouseY - this.y, this.mouseX - this.x) + Math.PI / 2;

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage(bulletImage, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    cobweb(frame) {
        return new SpiderWebs(this.x, this.y, this.game.context, frame);
    };
}; 

class Enemy {
    constructor(name, hp, speed, damage, multiplier, game, width, height, angle) {
        this.name = name;
        this.game = game;
        this.x = Math.random() * (game.canvas.width - 30) + 2;
        this.y = Math.random() * (game.canvas.height - 30) + 2;
        this.health = hp;
        this.max_health = hp;
        this.speed = speed;
        this.baseSpeed = speed;
        this.damage = damage;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.multiplier = multiplier;
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
        this.rotation = Math.atan2(player.y - this.y, player.x - this.x) + this.angle;

        const currentHealth = this.health/this.max_health;
        const remainingHealth = (this.max_health - this.health)/this.max_health;
        const curRectWidth = this.width / 1.5 * currentHealth;

        this.game.context.fillStyle = 'white';
        this.game.context.fillRect(this.x - this.width / 3, this.y - 30, curRectWidth, 5);
        this.game.context.fillStyle = 'black';
        this.game.context.fillRect(this.x - this.width / 3 + curRectWidth, this.y - 30, this.width / 1.5 * remainingHealth, 5);

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage((this.name === 'Worm') ? WormImage : CockroachImage, -this.width / 2, -this.height / 2);
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
            ctx.drawImage(image, x - this.width/2, y - this.height/2);
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

class Restart {
    constructor (game) {
        this.ctx = game.context;
        this.width = 350;
        this.height = 300;
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.Text = new Text(this.x, this.y - 125 * 1.2, "Press the TextButton below to restart", 300, this.ctx, 'black',"30px times-new-roman");
        this.Button = new TextButton(this.x, this.y - 125 / 2, 'rgba(135, 206, 235, 1)', 'black', 100, 50, this.ctx, 'RESTART', "Restart");
    };

    render() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(119, 161, 161, 1)';
        this.ctx.strokeStyle = 'black';
        this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2 - 125, this.width, this.height, 15);
        this.ctx.fill();
        this.ctx.restore();
        this.Text.render();
        this.Button.render();
        return this.Button;
    };
}

function experienceBar(experience, experienceRequired, context, gameWidth, gameHeight) {
    const currentExperience = experience/experienceRequired;
    const remainingExperience = (experienceRequired - experience)/experienceRequired;
    const currentRectWidth = gameWidth * currentExperience;
    const expBarHeight = 20;
    const percentage = new Text(gameWidth/2, gameHeight - 10, `Exp: ${(experience).toFixed(2)}/${(experienceRequired).toFixed(2)} (${(currentExperience * 100).toFixed(2)}%)`, 150, context, 'white', '15px times-new-roman', 'white');
    
    context.fillStyle = "red";
    context.fillRect(0, gameHeight - expBarHeight, currentRectWidth, expBarHeight);
    context.fillStyle = "black";
    context.fillRect(0 + currentRectWidth, gameHeight - expBarHeight, gameWidth * remainingExperience, expBarHeight);
    percentage.render();
}

function healthBar(game, player) {
    game.context.save();
    game.context.lineWidth = 25;
    game.context.strokeStyle = 'black';
    game.context.beginPath();
    game.context.arc(game.canvas.width, 0, 125, Math.PI, .5*Math.PI, true);
    game.context.stroke();
    game.context.strokeStyle = 'red';
    game.context.beginPath();
    game.context.arc(game.canvas.width, 0, 125, (player.health/player.maxHealth/2 + 0.5)*Math.PI, .5*Math.PI, true);
    game.context.stroke();
    game.context.restore();
    const playerLevelText = new Text(game.canvas.width - 40, 50, player.level, 50, game.context, 'white', '60px times-new-roman');
    playerLevelText.render();
}

export {
    TextButton,
    ImageButton,
    Enemy,
    Bullet,
    Player,
    Text,
    Restart,
    healthBar
};