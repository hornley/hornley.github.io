let bulletSize = 25; // ***
let lastTime = -1;
let aoe = false; // ***
let aoeTime = 250; // ***
let safeAreaWidth = 200; // ***
let safeAreaHeight = 200; // ***

class Player {
    constructor(game) {
        this.game = game;
        this.health = 100;
        this.max_health = 100;
        this.type = "black";
        this.x = game.canvas.width / 2;
        this.y = game.canvas.height / 2;
        this.width = 50;
        this.height = 50;
    };

    crash() {
        this.x = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(this.game.canvas.height - this.height / 2, this.y));
    };

    render() {
        this.crash();
        this.game.context.fillStyle = "honeydew";
        this.game.context.strokeStyle = "black";
        this.game.context.beginPath();
        this.game.context.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 5);
        this.game.context.fill();
        this.game.context.stroke();
    };

    shoot(mouseX, mouseY, bullets) {
        const x = mouseX - this.x;
        const y = mouseY - this.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * 10;
        const dy = (y / l) * 10;
        bullets.push(new Bullet(this.x, this.y, dx, dy, this.game, bulletSize));
        console.log(bullets);
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
    }
};

class Bullet {
    constructor(x, y, dx, dy, game, size) {
        this.health = 100;
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.width = size;
        this.height = size;
        this.game = game;
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
        this.game.context.strokeStyle = "black";
        this.game.context.fillStyle = "red";
        this.game.context.beginPath();
        this.game.context.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, [50, 50, 50, 50]);
        this.game.context.fill();
        this.game.context.stroke();
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
        let otherleft = object.x - object.width / 2 - 7;
        let otherright = object.x + object.width / 2 + 7;
        let othertop = object.y - object.height / 2 - 7;
        let otherbottom = object.y + object.height / 2 + 7;
        
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
    constructor(x, y, fillStyle, textColor, text, width, height, game, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.fillStyle = fillStyle;
        this.textColor = textColor;
        this.text = text;
        this.width = width;
        this.height = height;
        this.ctx = game.context;
    };

    render() {
        this.ctx.fillStyle = this.fillStyle;
        this.ctx.beginPath();
        this.ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 10);
        this.ctx.fill();
    };

    onClick(mouseX, mouseY, func) {
        if (this.x >= mouseX - this.width / 2 &&
        this.x <= mouseX + this.width / 2 &&
        this.y >= mouseY - this.height / 2 &&
        this.y <= mouseY + this.height / 2) {
            func();
        };
    };
};

class Text {
    constructor(x, y, text, maxWidth, game, font='25px times-new-roman', textColor='black', textAlign='center', textBaseline='middle') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.textColor = textColor;
        this.textAlign = textAlign;
        this.textBaseline = textBaseline;
        this.maxWidth = maxWidth;
        this.font = font;
        this.ctx = game.context;
    };

    render() {
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.textColor;
        this.ctx.textAlign = this.textAlign;
        this.ctx.textBaseline = this.textBaseline;
        this.ctx.fillText(this.text, this.x, this.y, this.maxWidth);
    }
};

function restart(myGame, id) {
    const ctx = myGame.context;
    const restartWidth = 350;
    const restartHeight = 300;
    const restartTop = 125;
    const x = myGame.canvas.width / 2;
    const y = myGame.canvas.height / 2;

    ctx.fillStyle = 'rgba(199, 12, 115, 0.6)';
    ctx.strokeStyle = 'black';
    ctx.roundRect(x - restartWidth / 2, y - restartHeight / 2 - restartTop, restartWidth, restartHeight, 15);
    ctx.fill();

    const restartText = new Text(x, y - restartTop * 1.2, "Press the button below to restart", 300, myGame, "30px times-new-roman");
    restartText.render();

    const restartButton = new Button(x, y - restartTop / 2, 'rgba(135, 206, 235, 1)', 'black', "Restart", 100, 50, myGame, id);
    const restartButtonText = new Text(x, y - restartTop / 2, "Restart", 100, myGame);
    restartButton.render();
    restartButtonText.render();

    return restartButton;
}

export {
    Button,
    Enemy,
    Bullet,
    Player,
    restart,
    safeAreaWidth,
    safeAreaHeight
};