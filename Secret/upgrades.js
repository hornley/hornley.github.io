import { Text, TextButton, ImageButton } from "./entity.js";

let statPointsText;
const upgradeBGColor = 'rgb(76, 76, 109)';
const upgradeTextColor = 'rgb(232, 246, 239)';
const buttonConfig = [
    { key: "UPGRADE-HEALTH", text: "Max Health", y: -350 },
    { key: "UPGRADE-BULLET_DAMAGE", text: "Bullet Damage", y: -310 },
    { key: "UPGRADE-BULLET_PENETRATION", text: "Bullet Penetration", y: -270 },
    { key: "UPGRADE-ATTACK_SPEED", text: "Attack Speed", y: -230 },
    { key: "UPGRADE-MOVEMENT_SPEED", text: "Movement Speed", y: -190 }
];
let allotedpoints = {'maxHealth': 0, 'bulletDamage': 0, 'penetration': 0, 'attackSpeed': 0, 'speed': 0};

function renderUpgradeButtons(game, cw, ch, player) {
    const buttons = buttonConfig.map(({ key, text, y }) => {
        const UpgradeButton = new ImageButton(335, ch + y + 15, 26, 26, game.context, key, "../images/UpgradeButton.png");
        UpgradeButton.render();
        return UpgradeButton;
    });
    return buttons;
}

function playerStats(game, player) {
    const { canvas, context } = game;
    const cw = canvas.width;
    const ch = canvas.height;

    context.beginPath();
    context.fillStyle = upgradeBGColor;
    context.roundRect(50, ch - 400, 320, 350, 10);
    context.fill();
    
    statPointsText = new Text(75, ch - 370, player.statPoints, 25, game.context, upgradeTextColor);
    (player.statPoints >= 1) ? statPointsText.render() : '';

    const MaxHealthText = new Text(75, ch - 330, `Max Health: ${(player.maxHealth).toFixed(0)} (${allotedpoints['maxHealth']})`, 250, context, upgradeTextColor, '24px times-new-roman', 'left');
    MaxHealthText.render();
    const BulletDamageText = new Text(75, ch - 290, `Bullet Damage: ${(player.bulletDamage).toFixed(0)} (${allotedpoints['bulletDamage']})`, 250, context, upgradeTextColor, '24px times-new-roman', 'left');
    BulletDamageText.render();
    const BulletPenetrationText = new Text(75, ch - 250, `Bullet Penetration: ${(player.penetration).toFixed(0)} (${allotedpoints['penetration']})`, 250, context, upgradeTextColor, '24px times-new-roman', 'left');
    BulletPenetrationText.render();
    const AttackSpeedText = new Text(75, ch - 210, `Attack Speed: ${(player.attackSpeed).toFixed(0)} (${allotedpoints['attackSpeed']})`, 250, context, upgradeTextColor, '24px times-new-roman', 'left');
    AttackSpeedText.render();
    const MovementSpeedText = new Text(75, ch - 170, `Movement Speed: ${(player.speed).toFixed(0)} (${allotedpoints['speed']})`, 250, context, upgradeTextColor, '24px times-new-roman', 'left');
    MovementSpeedText.render();
}

function upgradeMenu(game, player=null) {
    const { canvas, context } = game;
    const cw = canvas.width;
    const ch = canvas.height;

    if (player) {
        playerStats(game, player);
        return renderUpgradeButtons(game, cw, ch, player);
    } else {
        const upgradeMenuButton = new TextButton(cw/2, ch - 35, upgradeBGColor, upgradeTextColor, 100, 25, context, "UPGRADE", "Upgrade", 5);
        upgradeMenuButton.render();
        return upgradeMenuButton;
    }
}

function upgradeAttribute(player, attribute, increment) {
    if (player.statPoints <= 0) return;
    if (increment !== undefined) player[attribute] += increment;
    player.statPoints -= 1;
    statPointsText.update(player.statPoints);
    allotedpoints[attribute]++;
}

function upgradeHealth(player) {
    upgradeAttribute(player, 'maxHealth', 5);
}

function upgradeBulletDamage(player) {
    upgradeAttribute(player, 'bulletDamage', 0.5);
}

function upgradeBulletPenetration(player) {
    upgradeAttribute(player, 'penetration', 1);
}

function upgradeAttackSpeed(player) {
    upgradeAttribute(player, 'attackSpeed', 0.25);
}

function upgradeMovementSpeed(player) {
    upgradeAttribute(player, 'speed', 0.5);
}

function upgradeHotkeys(key, player_object, game) {
    switch (parseInt(key)) {
        case 1:
            upgradeHealth(player_object);
            upgradeMenu(game, player_object);
            break;
        case 2:
            upgradeBulletDamage(player_object);
            upgradeMenu(game, player_object);
            break;
        case 3:
            upgradeBulletPenetration(player_object);
            upgradeMenu(game, player_object);
            break;
        case 4:
            upgradeAttackSpeed(player_object);   
            upgradeMenu(game, player_object);
            break;
        case 5:
            upgradeMovementSpeed(player_object);
            upgradeMenu(game, player_object);
            break;
    }

}

export {
    upgradeMenu,
    upgradeHealth,
    upgradeBulletDamage,
    upgradeBulletPenetration,
    upgradeAttackSpeed,
    upgradeMovementSpeed,
    playerStats,
    upgradeHotkeys
};
