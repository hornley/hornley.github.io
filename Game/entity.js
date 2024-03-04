import { aoe, aoeTime, safeAreaHeight, safeAreaWidth } from "./game.js";

let lastTime = -1;
let idleFrame = 0;
const spriteWidth = 64,
    spriteHeight = 64,
    spiderSprite = "./images/Spider-Sprites.png",
    spiderShoot = "./images/Spider-Shoot.png",
    portalOpenSprite = "./images/Portal/PortalOpen.png",
    portalCloseSprite = "./images/Portal/PortalClose.png",
    portalOpenedSprite = "./images/Portal/Portal.png",
    stagesSprite = "./images/Stages.png";
let playerImage = new Image(),
    bulletImage = new Image(),
    BossWormImage = new Image(),
    SummoningBossWormImage = new Image(),
    WormImage = new Image(),
    CockroachImage = new Image(),
    BossCockroachImage = new Image(),
    spiderWeb = new Image(),
    portalOpenImage = new Image(),
    portalCloseImage = new Image(),
    portalOpenedImage = new Image(),
    stagesImage = new Image();
playerImage.src = spiderSprite;
bulletImage.src = spiderShoot;
BossWormImage.src = "./images/Stage1/Boss-Worm-Sprite.png";
SummoningBossWormImage.src = "./images/Stage1/Animation.png";
BossCockroachImage.src = "./images/Boss-Cockroach-Sprite.png";
WormImage.src = "./images/Worm-Sprite.png";
CockroachImage.src = "./images/Cockroach-Sprite.png";
spiderWeb.src = "./images/Spider-Web.png";
portalOpenImage.src = portalOpenSprite;
portalCloseImage.src = portalCloseSprite;
portalOpenedImage.src = portalOpenedSprite;
stagesImage.src = stagesSprite;

const testing = true;

class Sound {
    constructor(src) {
        this.sound = document.createElement('audio');
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = 1;
        document.body.appendChild(this.sound);
    }
    play() {
        this.sound.currentTime = 0.2;
        this.sound.play();
    }
    setVolume(num) {
        this.sound.volume = num;
    }
}

let levelUpSound = new Sound('../Audio/level-up.mp3');
levelUpSound.setVolume(0.3);
let shootSound = new Sound('../Audio/shoot.mp3');
shootSound.setVolume(0.05);

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
        this.currRotation = 0;
    };

    crash() {
        this.x = Math.max(this.width / 2, Math.min(this.game.canvas.width - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(this.game.canvas.height - this.height / 2, this.y));
    };

    render(mouseX, mouseY) {
        this.crash();

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        let angle = Math.atan2(mouseY - this.y, mouseX - this.x) - Math.PI / 2;
        this.currRotation = angle * (180 / Math.PI);
        this.game.context.rotate(angle);
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

        this.lastDash = this.game.frameNo;
        let _ = this.speed;

        setTimeout(() => {
            this.speed = _;
        }, 1000)
        this.speed *= 2;
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
        this.currRotation = 0;
    };

    render(curFrame) {
        if (this.frame + 120 <= curFrame) { return false; }
        this.context.drawImage(spiderWeb, this.x - this.width / 2, this.y - this.height / 2);
        return true;
    };

    detection(object) {
        return detectRectangleCollision(this, object);
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
        this.currRotation = 0;
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
        this.currRotation = this.rotation * (180 / Math.PI);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage(bulletImage, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    cobweb(frame) {
        return new SpiderWebs(this.x, this.y, this.game.context, frame);
    };
}; 

class Enemy {
    constructor(name, hp, speed, damage, multiplier, type, game, width, height, angle) {
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
        this.multiplier = multiplier * (testing) ? 25 : 1;
        this.rotation = 0;
        this.currRotation = 0;
        this.slowed = false;
        this.type = type;
    };

    setPosition() {
        this.x = this.game.canvas.width / 2 - this.width / 2;
        this.y = 160;   
    }

    collide(object) {
        return detectRectangleCollision(this, object);
    };

    render(player) {
        this.rotation = Math.atan2(player.y - this.y, player.x - this.x) + this.angle;
        this.currRotation = this.rotation * (180 / Math.PI);

        const currentHealth = this.health/this.max_health;
        const remainingHealth = (this.max_health - this.health)/this.max_health;
        const curRectWidth = this.width / 1.5 * currentHealth;

        this.game.context.fillStyle = 'white';
        this.game.context.fillRect(this.x - this.width / 3, this.y - 30, curRectWidth, 5);
        this.game.context.fillStyle = 'black';
        this.game.context.fillRect(this.x - this.width / 3 + curRectWidth, this.y - 30, this.width / 1.5 * remainingHealth, 5);

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        if (this.name === 'Worm-Boss') {
            this.game.context.drawImage(BossWormImage, -this.width / 2, -this.height / 2);
        } else if (this.name === 'Cockroach-Boss') {
            this.game.context.drawImage(BossCockroachImage, -this.width / 2, -this.height / 2);
        } else {
            this.game.context.drawImage((this.name === 'Worm') ? WormImage : CockroachImage, -this.width / 2, -this.height / 2);
        }
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    followPlayer(player) {
        let speed = this.speed;
        if (this.slowed) speed /= (this.type === 'Boss') ? 2 : 5;
        const x = this.x - player.x;
        const y = this.y - player.y;
        const l = Math.sqrt(x * x + y * y);

        const dx = (x / l) * speed;
        const dy = (y / l) * speed;
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

class WormBoss extends Enemy {
    constructor(name, hp, speed, damage, multiplier, type, game, width, height, angle, phases) {
        super(name, hp, speed, damage, multiplier, type, game, width, height, angle);
        this.phases = phases;
        this.phase = 0;
        this.summoningFrame = 0;
        this.summoned = false;
    }

    summoning() {
        if (this.summoned) return true;
        this.game.context.drawImage(SummoningBossWormImage, 0, 215 * this.summoningFrame, 230, 215, this.x - 115, 0, 230, 215);
        if (this.game.frameNo % 90 === 0 && this.game.frameNo != 0) this.summoningFrame++;
        if (this.summoningFrame === 3) { this.summoningFrame = 0; this.summoned = true; }
    }

    render(player) {
        if (!this.summoned) return;
        this.rotation = Math.atan2(player.y - this.y, player.x - this.x) + this.angle;
        this.currRotation = this.rotation * (180 / Math.PI);

        const currentHealth = this.health/this.max_health;
        const remainingHealth = (this.max_health - this.health)/this.max_health;
        const curRectWidth = this.width / 1.5 * currentHealth;

        this.game.context.fillStyle = 'white';
        this.game.context.fillRect(this.x - this.width / 3, this.y - 120, curRectWidth, 5);
        this.game.context.fillStyle = 'black';
        this.game.context.fillRect(this.x - this.width / 3 + curRectWidth, this.y - 120, this.width / 1.5 * remainingHealth, 5);

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        if (this.x > player.x) this.game.context.scale(1, -1);
        this.game.context.drawImage(BossWormImage, 0, this.height * this.phase, this.width, this.height, -this.width/2, -this.height/2, this.width, this.height);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    phaseCheck() {
        let hpPercentage = this.health / this.max_health;
        // To check where Summons are getting summoned from...
        // this.game.context.fillRect(this.x - this.width * 2, this.y - this.height * 2, this.width * 4, this.height * 4);
        if (hpPercentage <= this.phases[this.phase + 1] && this.phase < this.phase + 1) {
            this.phase = this.phase + 1;
            return true;
        }
        return false;
    }

    Summon(enemyHealth, enemySpeed, enemyCollisionDamage) {
        let enemies = [];
        let i = 0;
        while (i < 5) {
            let enemy = new Enemy('Worm', enemyHealth, enemySpeed, enemyCollisionDamage, 0, 'Normal', this.game, 51, 24, .18*Math.PI/2);
            if (!this.withinSafeArea(enemy)) continue;
            enemies.push(enemy);
            i++;
        }
        return enemies;
    }

    withinSafeArea(enemy) {
        return (this.x >= enemy.x - this.width * 2 &&
        this.x <= enemy.x + this.width * 2 &&
        this.y >= enemy.y - this.height * 2 &&
        this.y <= enemy.y + this.height * 2)
    }
};

class CockroachBoss extends Enemy {
    constructor(name, hp, speed, damage, multiplier, type, game, width, height, angle, phases) {
        super(name, hp, speed, damage, multiplier, type, game, width, height, angle);
        this.phases = phases;
        this.phase = 0;
    }

    render(player) {
        this.rotation = Math.atan2(player.y - this.y, player.x - this.x) + this.angle;
        this.currRotation = this.rotation * (180 / Math.PI);

        const currentHealth = this.health/this.max_health;
        const remainingHealth = (this.max_health - this.health)/this.max_health;
        const curRectWidth = this.width / 1.5 * currentHealth;

        this.game.context.fillStyle = 'white';
        this.game.context.fillRect(this.x - this.width / 3, this.y - 120, curRectWidth, 5);
        this.game.context.fillStyle = 'black';
        this.game.context.fillRect(this.x - this.width / 3 + curRectWidth, this.y - 120, this.width / 1.5 * remainingHealth, 5);

        this.game.context.setTransform(1, 0, 0, 1, this.x, this.y);
        this.game.context.rotate(this.rotation);
        this.game.context.drawImage(BossCockroachImage, -this.width / 2, -this.height / 2);
        this.game.context.setTransform(1, 0, 0, 1, 0, 0);
    };

    phaseCheck() {
        let hpPercentage = this.health / this.max_health;
        // To check where Summons are getting summoned from...
        // this.game.context.fillRect(this.x - this.width * 2, this.y - this.height * 2, this.width * 4, this.height * 4);
        if (hpPercentage <= this.phases[this.phase + 1] && this.phase < this.phase + 1) {
            this.phase = this.phase + 1;
            return true;
        }
        return false;
    }

    Summon(enemyHealth, enemySpeed, enemyCollisionDamage) {
        let enemies = [];
        let i = 0;
        while (i < 5) {
            let enemy = new Enemy('Cockroach', enemyHealth, enemySpeed, enemyCollisionDamage, 0, 'Normal', this.game, 51, 24, .18*Math.PI/2);
            if (!this.withinSafeArea(enemy)) continue;
            enemies.push(enemy);
            i++;
        }
        return enemies;
    }

    withinSafeArea(enemy) {
        return (this.x >= enemy.x - this.width * 2 &&
        this.x <= enemy.x + this.width * 2 &&
        this.y >= enemy.y - this.height * 2 &&
        this.y <= enemy.y + this.height * 2)
    }
}

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

class Portal {
    constructor(game) {
        this.game = game;
        this.frame = 0;
        this.opened = false;
        this.closing = false;
        this.width = 320;
        this.height = 320;
        this.x = game.canvas.width/2;
    }

    close() {
        this.game.context.drawImage(portalCloseImage, 0, this.height * this.frame, this.width, this.height, this.x - this.width / 2, 0, this.width, this.height);
        if (this.game.frameNo % 45 === 0) this.frame++;
        if (this.frame === 5) { this.frame = 0; this.opened = false; this.closing = false; return true; }
    }

    open() {
        if (this.opened) { this.render(); return }
        this.game.context.drawImage(portalOpenImage, 0, this.height * this.frame, this.width, this.height, this.x - this.width / 2, 0, this.width, this.height);
        if (this.game.frameNo % 60 === 0 && this.game.frameNo != 0) this.frame++;
        if (this.frame === 4) { this.frame = 0; this.opened = true;}
    }

    render() {
        this.game.context.drawImage(portalOpenedImage, 0, this.height * this.frame, this.width, this.height, this.x - this.width / 2, 0, this.width, this.height);
        if (this.game.frameNo % 30 === 0) this.frame++;
        if (this.frame === 3) this.frame = 0;
    }

    playerDetect(player) {
        if (!this.opened) return false;
        return (player.x - player.width/2 >= this.x - this.width/3 && player.x + player.width/2 <= this.x + this.width/3 && player.y - player.height/2 >= -this.height && player.y + player.height/2 <= this.height);
    }
}

class Stage {
    constructor(game) {
        this.game = game;
        this.width = 470;
        this.height = 310;
        this.x = game.canvas.width/2-this.width/2;
        this.frame = 0;
        this.status = {1: false, 2: false};
    }

    new(stage) {
        if (this.status[stage]) return;
        if (this.game.frameNo % 30 === 0) this.frame++;
        if (this.frame === 5) { this.frame = 0; this.status[stage] = true; }
        this.game.context.drawImage(stagesImage, 0, this.height * (stage - 1), this.width, this.height, this.x, 0, this.width, this.height);
    }

    clear(stage) {
        if (this.game.frameNo % 30 === 0) this.frame++;
        if (this.frame === 5) { this.frame = 0; }
        this.game.context.drawImage(stagesImage, this.width, this.height * (stage - 1), this.width, this.height, this.x, this.game.canvas.height/2, this.width, this.height);
    }
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

// Collision Formula from: https://www.youtube.com/watch?v=MvlhMEE9zuc

function workOutNewPoints(cx, cy, vx, vy, rotatedAngle){
        rotatedAngle = rotatedAngle * Math.PI / 180;
        let dx = vx - cx;
        let dy = vy - cy;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let originalAngle = Math.atan2(dy,dx);
        let rotatedX = cx + distance * Math.cos(originalAngle + rotatedAngle);
        let rotatedY = cy + distance * Math.sin(originalAngle + rotatedAngle);
    
        return {
            x: rotatedX,
            y: rotatedY
        }
}

function getRotatedSquareCoordinates(square){
    let x = square.x - square.width/2;
    let y = square.y - square.height/2;
    let centerX = x + (square.width / 2);
    let centerY = y + (square.height / 2);
    let topLeft = workOutNewPoints(centerX, centerY, x, y, square.currRotation);
    let topRight = workOutNewPoints(centerX, centerY, x + square.width, y, square.currRotation);
    let bottomLeft = workOutNewPoints(centerX, centerY, x, y + square.height, square.currRotation);
    let bottomRight = workOutNewPoints(centerX, centerY, x + square.width, y + square.height, square.currRotation);
    return{
        tl: topLeft,
        tr: topRight,
        bl: bottomLeft,
        br: bottomRight
    }
}

function xy(x,y){
    this.x = x;
    this.y = y;
};

function polygon(vertices, edges){
    this.vertex = vertices;
    this.edge = edges;
};

function sat(polygonA, polygonB){
    var perpendicularLine = null;
    var dot = 0;
    var perpendicularStack = [];
    var amin = null;
    var amax = null;
    var bmin = null;
    var bmax = null;
    //Work out all perpendicular vectors on each edge for polygonA
    for(var i = 0; i < polygonA.edge.length; i++){
         perpendicularLine = new xy(-polygonA.edge[i].y,
                                     polygonA.edge[i].x);
         perpendicularStack.push(perpendicularLine);
    }
    //Work out all perpendicular vectors on each edge for polygonB
    for(var i = 0; i < polygonB.edge.length; i++){
         perpendicularLine = new xy(-polygonB.edge[i].y,
                                     polygonB.edge[i].x);
         perpendicularStack.push(perpendicularLine);
    }
    //Loop through each perpendicular vector for both polygons
    for(var i = 0; i < perpendicularStack.length; i++){
        //These dot products will return different values each time
         amin = null;
         amax = null;
         bmin = null;
         bmax = null;
         /*Work out all of the dot products for all of the vertices in PolygonA against the perpendicular vector
         that is currently being looped through*/
         for(var j = 0; j < polygonA.vertex.length; j++){
              dot = polygonA.vertex[j].x *
                    perpendicularStack[i].x +
                    polygonA.vertex[j].y *
                    perpendicularStack[i].y;
            //Then find the dot products with the highest and lowest values from polygonA.
              if(amax === null || dot > amax){
                   amax = dot;
              }
              if(amin === null || dot < amin){
                   amin = dot;
              }
         }
         /*Work out all of the dot products for all of the vertices in PolygonB against the perpendicular vector
         that is currently being looped through*/
         for(var j = 0; j < polygonB.vertex.length; j++){
              dot = polygonB.vertex[j].x *
                    perpendicularStack[i].x +
                    polygonB.vertex[j].y *
                    perpendicularStack[i].y;
            //Then find the dot products with the highest and lowest values from polygonB.
              if(bmax === null || dot > bmax){
                   bmax = dot;
              }
              if(bmin === null || dot < bmin){
                   bmin = dot;
              }
         }
         //If there is no gap between the dot products projection then we will continue onto evaluating the next perpendicular edge.
         if((amin < bmax && amin > bmin) ||
            (bmin < amax && bmin > amin)){
              continue;
         }
         //Otherwise, we know that there is no collision for definite.
         else {
              return false;
         }
    }
    /*If we have gotten this far. Where we have looped through all of the perpendicular edges and not a single one of there projections had
    a gap in them. Then we know that the 2 polygons are colliding for definite then.*/
    return true;
}

function detectRectangleCollision(enemy, object){
    let thisRect = enemy;
    let otherRect = object;
    let tRR = getRotatedSquareCoordinates(thisRect);
    let oRR = getRotatedSquareCoordinates(otherRect);
    let thisTankVertices = [
        new xy(tRR.tr.x, tRR.tr.y),
        new xy(tRR.br.x, tRR.br.y),
        new xy(tRR.bl.x, tRR.bl.y),
        new xy(tRR.tl.x, tRR.tl.y),
    ];
    let thisTankEdges = [
        new xy(tRR.br.x - tRR.tr.x, tRR.br.y - tRR.tr.y),
        new xy(tRR.bl.x - tRR.br.x, tRR.bl.y - tRR.br.y),
        new xy(tRR.tl.x - tRR.bl.x, tRR.tl.y - tRR.bl.y),
        new xy(tRR.tr.x - tRR.tl.x, tRR.tr.y - tRR.tl.y)
    ];
    let otherTankVertices = [
        new xy(oRR.tr.x, oRR.tr.y),
        new xy(oRR.br.x, oRR.br.y),
        new xy(oRR.bl.x, oRR.bl.y),
        new xy(oRR.tl.x, oRR.tl.y),
    ];
    let otherTankEdges = [
        new xy(oRR.br.x - oRR.tr.x, oRR.br.y - oRR.tr.y),
        new xy(oRR.bl.x - oRR.br.x, oRR.bl.y - oRR.br.y),
        new xy(oRR.tl.x - oRR.bl.x, oRR.tl.y - oRR.bl.y),
        new xy(oRR.tr.x - oRR.tl.x, oRR.tr.y - oRR.tl.y)
    ];
    let thisRectPolygon = new polygon(thisTankVertices, thisTankEdges);
    let otherRectPolygon = new polygon(otherTankVertices, otherTankEdges);

    if(sat(thisRectPolygon, otherRectPolygon)){
        thisRect.color = "red";
        return true;
    }else{
        thisRect.color = "black";
        if(thisRect.currRotation === 0 && otherRect.currRotation === 0){
            if(!(
                thisRect.x>otherRect.x+otherRect.width || 
                thisRect.x+thisRect.width<otherRect.x || 
                thisRect.y>otherRect.y+otherRect.height || 
                thisRect.y+thisRect.height<otherRect.y
            )){
                thisRect.color = "red";
            }
        }
    }
}

export {
    TextButton,
    ImageButton,
    Enemy,
    WormBoss,
    CockroachBoss,
    Bullet,
    Player,
    Text,
    Restart,
    Portal,
    Stage,
    healthBar
};