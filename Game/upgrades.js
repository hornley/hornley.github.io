import { Text, Button, Player } from "./entity.js";

let statPointsText;
let upgradeBGColor = "#5C8374";

function upgradeMenu(game, player=null) {
    let cw = game.canvas.width;
    let ch = game.canvas.height;

    if (player) {
        game.context.fillStyle = upgradeBGColor;
        game.context.roundRect(cw/2 - 150, ch - 400, 300, 350, 10);
        game.context.fill();
    
        const upgradeHealthButton = new Button(cw/2, ch - 350, upgradeBGColor, "black", 150, 25, game.context, "UPGRADE-HEALTH", "Upgrade Health", 5);
        upgradeHealthButton.render();
        const upgradeBulletDamageButton = new Button(cw/2, ch - 310, upgradeBGColor, "black", 200, 25, game.context, "UPGRADE-BULLET_DAMAGE", "Upgrade Bullet Damage", 5);
        upgradeBulletDamageButton.render();
        const upgradeBulletPenetrationButton = new Button(cw/2, ch - 270, upgradeBGColor, "black", 225, 25, game.context, "UPGRADE-BULLET_PENETRATION", "Upgrade Bullet Penetration", 5);
        upgradeBulletPenetrationButton.render();
        statPointsText = new Text(cw/2 - 130, ch - 380, player.statPoints, 25, game.context);
        statPointsText.render();
    
        return [upgradeHealthButton, upgradeBulletDamageButton, upgradeBulletPenetrationButton];
    }
    const upgradeMenuButton = new Button(cw/2, ch - 35, upgradeBGColor, "black", 100, 25, game.context, "UPGRADE", "Upgrade", 5);

    upgradeMenuButton.render();
    return upgradeMenuButton;
}

function upgradeHealth(player) {
    if (player.statPoints <= 0) return;
    let _ = player.maxHealth;
    player.maxHealth *= 1.15;
    player.health += player.maxHealth - _;
    player.statPoints -= 1;
    statPointsText.update(player.statPoints);
}

function upgradeBulletDamage(player) {
    if (player.statPoints <= 0) return;
    player.bulletDamage *= 1.1;
    player.statPoints -= 1;
    statPointsText.update(player.statPoints);
}

function upgradeBulletPenetration(player) {
    if (player.statPoints <= 0) return;
    player.penetration++;
    player.statPoints -= 1;
    statPointsText.update(player.statPoints);
}

export {
    upgradeMenu,
    upgradeHealth,
    upgradeBulletDamage,
    upgradeBulletPenetration
}