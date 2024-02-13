import { Text, TextButton } from "./entity.js";

let statPointsText;
const upgradeBGColor = 'rgb(76, 76, 109)';
const upgradeTextColor = 'rgb(232, 246, 239)';
const buttonConfig = [
    { key: "UPGRADE-HEALTH", text: "Upgrade Health", y: -350 },
    { key: "UPGRADE-BULLET_DAMAGE", text: "Upgrade Bullet Damage", y: -310 },
    { key: "UPGRADE-BULLET_PENETRATION", text: "Upgrade Bullet Penetration", y: -270 },
    { key: "UPGRADE-ATTACK_SPEED", text: "Upgrade Attack Speed", y: -230 },
    { key: "UPGRADE-MOVEMENT_SPEED", text: "Upgrade Movement Speed", y: -190 }
];

function renderUpgradeButtons(game, cw, ch, player) {
    const buttons = buttonConfig.map(({ key, text, y }) => {
        const UpgradeButton = new TextButton(cw/2, ch + y, upgradeBGColor, upgradeTextColor, key.length * 10, 25, game.context, key, text, 5);
        UpgradeButton.render();
        return UpgradeButton;
    });
    statPointsText = new Text(cw/2 - 130, ch - 380, player.statPoints, 25, game.context, upgradeTextColor);
    statPointsText.render();
    return buttons;
}

function upgradeMenu(game, player=null) {
    const { canvas, context } = game;
    const cw = canvas.width;
    const ch = canvas.height;

    if (player) {
        context.beginPath();
        context.fillStyle = upgradeBGColor;
        context.roundRect(cw/2 - 150, ch - 400, 300, 350, 10);
        context.fill();
        return renderUpgradeButtons(game, cw, ch, player);
    } else {
        const upgradeMenuButton = new TextButton(cw/2, ch - 35, upgradeBGColor, upgradeTextColor, 100, 25, context, "UPGRADE", "Upgrade", 5);
        upgradeMenuButton.render();
        return upgradeMenuButton;
    }
}

function upgradeAttribute(player, attribute, multiplier, increment=1) {
    if (player.statPoints <= 0) return;
    player[attribute] *= multiplier;
    if (increment !== undefined) player[attribute] += increment;
    player.statPoints -= 1;
    statPointsText.update(player.statPoints);
}

function upgradeHealth(player) {
    upgradeAttribute(player, 'maxHealth', 1.15);
}

function upgradeBulletDamage(player) {
    upgradeAttribute(player, 'bulletDamage', 1.1);
}

function upgradeBulletPenetration(player) {
    upgradeAttribute(player, 'penetration', 1, 1);
}

function upgradeAttackSpeed(player) {
    upgradeAttribute(player, 'attackSpeed', 1.15);
}

function upgradeMovementSpeed(player) {
    upgradeAttribute(player, 'speed', 1, 1);
}

export {
    upgradeMenu,
    upgradeHealth,
    upgradeBulletDamage,
    upgradeBulletPenetration,
    upgradeAttackSpeed,
    upgradeMovementSpeed
};
