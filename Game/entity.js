import { aoe, aoeTime, safeAreaHeight, safeAreaWidth } from "./game.js";

let lastTime = -1;
const spriteWidth = 64;
const spriteHeight = 64;
const spiderSprite = "../images/Spider-Sprites.png";
const spiderShoot = "../images/Spider-Shoot.png";
let idleFrame = 0;
let frame = 0;

class Player {
    constructor(game) {
        this.game = game;
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
    };

    crash() {
        this.x = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(this.game.canvas.height - this.height / 2, this.y));
    };

    render(mouseX, mouseY) {
        this.crash();
        let image = new Image();
        image.src = spiderSprite;
        
        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(Math.atan2(mouseY - this.y, mouseX - this.x) - Math.PI / 2);
        this.game.context.drawImage(image, spriteWidth * idleFrame, 0, spriteWidth, spriteHeight, -this.width / 2, -this.height / 2, spriteWidth, spriteHeight);
        frame++;
        if (frame % 5 === 0) idleFrame++;
        if (idleFrame === 3) idleFrame = 0;
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    shoot(mouseX, mouseY, bullets) {
        const x = mouseX - this.x;
        const y = mouseY - this.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * 10;
        const dy = (y / l) * 10;
        bullets.push(new Bullet(this.x, this.y, dx, dy, this.game, mouseX, mouseY));
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
            this.level++;
            this.statPoints += 4;
            this.experience -= this.experienceRequired;
            this.experienceRequired *= 1.3;
        };
    };
};

class Bullet {
    constructor(x, y, dx, dy, game, mouseX, mouseY) {
        this.health = 100;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = 24;
        this.height = 44;
        this.game = game;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.angle = 0;
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

    render() {
        let image = new Image();
        image.src = spiderShoot;

        if (!this.angle) this.angle = Math.atan2(this.mouseY - this.y, this.mouseX - this.x) + Math.PI / 2;

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.angle);
        this.game.context.drawImage(image, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    }
};

class Enemy {
    constructor(type, hp, speed, size, game) {
        this.game = game;
        this.type = type;
        this.x = Math.random() * (game.canvas.width - 30) + 2;
        this.y = Math.random() * (game.canvas.height - 30) + 2;
        this.health = hp;
        this.max_health = hp;
        this.speed = speed;
        this.size = size;
    };

    collide(object) {
        let myleft = this.x - 1;
        let myright = this.x + 1;
        let mytop = this.y - 1;
        let mybottom = this.y + 1;
        let otherleft = object.x - object.width / 2;
        let otherright = object.x + object.width / 2;
        let othertop = object.y - object.height / 2;
        let otherbottom = object.y + object.height / 2;
        
        return (mybottom >= othertop) && (myright <= otherright) && (myleft >= otherleft) && (mytop <= otherbottom);
    };

    render() {
        this.game.context.beginPath();
        this.game.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.game.context.closePath();
        this.game.context.fillStyle = this.type;
        this.game.context.fill();
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

class Button {
    constructor(x, y, fillStyle, textColor, width, height, ctx, id, text=null) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.fillStyle = fillStyle;
        this.textColor = textColor;
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.text = text;
    };

    render() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.beginPath();
        this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 10);
        this.ctx.fill();
        if (this.text) { 
            const text = new Text(this.x, this.y, this.text, this.width, this.ctx);
            text.render();
        }
    };

    changeSize(width, height) {
        this.width = width;
        this.height = height;
    };

    changeText(text) {
        this.text = text;
    };

    onClick(mouseX, mouseY) {
        return (this.x >= mouseX - this.width / 2 &&
        this.x <= mouseX + this.width / 2 &&
        this.y >= mouseY - this.height / 2 &&
        this.y <= mouseY + this.height / 2);
    };
};

class Text {
    constructor(x, y, text, maxWidth, ctx, font='24px times-new-roman', textColor='black', textAlign='center', textBaseline='middle') {
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

    const restartText = new Text(x, y - restartTop * 1.2, "Press the button below to restart", 300, ctx, "30px times-new-roman");
    restartText.render();

    const restartButton = new Button(x, y - restartTop / 2, 'rgba(135, 206, 235, 1)', 'black', 100, 50, ctx, 'RESTART', "Restart");
    restartButton.render();

    return restartButton;
}

function menu(myGame) {
    const ctx = myGame.context;
    const startTop = 75;
    const difficultyTop = 15;
    const settingsTop = 135;
    const x = myGame.canvas.width / 2;
    const y = myGame.canvas.height / 2;

    const startButton = new Button(x, y + startTop, 'rgb(57, 202, 202)', 'black', 90, 45, ctx, 'START', 'Start');
    const difficultyButton = new Button(x, y + difficultyTop, 'rgb(57, 202, 202)', 'black', 90, 45, ctx, 'DIFFICULTY', 'Easy');
    const settingsButton = new Button(x, y + settingsTop, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'SETTINGS', 'Settings');
    settingsButton.render();
    startButton.render();
    difficultyButton.render();

    const gameTitle = new Text(x, y - 125, "Bugs War", 500, ctx, '75px times-new-roman');
    gameTitle.render();
    const gameVersion = new Text(x * 2 - 85, y * 2 - 17, "Version: 0.1.0-alpha", 150, ctx, '20px times-new-roman');
    gameVersion.render();

    return [startButton, difficultyButton, settingsButton];
}

function settings(myGame) {
    const ctx = myGame.context;
    const settingsWidth = 350;
    const settingsHeight = 300;
    const settingsTop = 135;
    const x = myGame.canvas.width / 2;
    const y = myGame.canvas.height / 2;

}

export {
    Button,
    Enemy,
    Bullet,
    Player,
    restart,
    menu,
    settings
};