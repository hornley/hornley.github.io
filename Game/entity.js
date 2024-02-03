let bulletSize = 25;
let lastTime = -1;
const safeAreaWidth = 200;
const safeAreaHeight = 200;

class player {
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
        bullets.push(new bullet(this.x, this.y, dx, dy, this.game, bulletSize));
    };

    AoE(enemy, time) {
        if (time > lastTime + 500) {
            lastTime = time;
            this.game.context.strokeStyle = "black";
            this.game.context.fillStyle = "red";
            this.game.context.beginPath();
            this.game.context.fillRect(this.x - safeAreaWidth / 2, this.y - safeAreaHeight / 2, safeAreaWidth, safeAreaHeight, 15);
            this.game.context.fill();
            if (enemy.x >= this.x - safeAreaWidth / 2 &&
            enemy.x <= this.x + safeAreaWidth / 2 &&
            enemy.y >= this.y - safeAreaHeight / 2 &&
            enemy.y <= this.y + safeAreaHeight / 2) {
                enemy.hp -= 1;
                console.log(enemy.hp);
            }
        }
    }
};

class bullet {
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

function restart(document, myGame) {
    let restartDIV = document.createElement("div");
    restartDIV.className = "RestartPrompt";
    restartDIV.innerHTML = '<h1>Restart your dogshit play!</h1><input id="restart" value="Restart" type="button">';
    
    document.getElementById("game").appendChild(restartDIV);
    document.getElementById("restart").addEventListener("click", function() {
        myGame.restart();
        document.getElementById("game").removeChild(restartDIV);
    });
}

export {
    bullet,
    player,
    restart,
    safeAreaWidth,
    safeAreaHeight
};