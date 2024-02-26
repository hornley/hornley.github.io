import { Enemy, Player, Text, TextButton, ImageButton } from "./entity.js";
import { difficulties } from "./game.js";

const version = 'Version: 0.3.0-alpha';

function menu(myGame) {
    const ctx = myGame.context;
    const startTop = 15;
    const settingsTop = 75;
    const x = myGame.canvas.width * .15;
    const y = myGame.canvas.height / 2;

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
    const Impossible = new TextButton(x + 100, 425, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Impossible');
    // const DodgeOnly = new TextButton(x + 100, 500, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DODGE-ONLY', 'Dodge Only');
    // const Custom = new TextButton(x + 100, 575, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CUSTOM', 'Custom');
    Title.render();
    Easy.render();
    Medium.render();
    Hard.render();
    Impossible.render();
    // DodgeOnly.render();
    // Custom.render();
    return [Easy, Medium, Hard, Impossible];
}

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

    const EnemySpeed = new Text(x + 25, y + 50, `Difficulty Ratio: ${ratio}`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const ExperienceRate = new Text(x + 25, y + 100, `Experience Rate: +${ratio} per kill`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const ScoreRate = new Text(x + 25, y + 150, `Score Rate: +${ratio} per kill`, 500, ctx, 'black', '24px times-new-roman', 'left');
    EnemySpeed.render();
    ExperienceRate.render();
    ScoreRate.render();

    const StartButton = new TextButton(x + 550, y + 450, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'START-GAME', 'Start');
    StartButton.render();
    return StartButton;
}

function patchNotes(myGame) {
    const ctx = myGame.context;
    const x = myGame.canvas.width * .3;
    const y = myGame.canvas.height / 2;
    const width = myGame.canvas.width * .7;
    const height = myGame.canvas.height;

    ctx.clearRect(x, 0, width, height);
    ctx.fillStyle = '#41980a';
    ctx.fillRect(x, 0, width, height);
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
    const Hotkeys = new Text(x + width / 2, 400, "Press numbers 1-5 respectively for upgrades", 400, ctx);
    const ToggleShoot = new Text(x + width / 2, 560, "Press 'T' to disable auto-shoot", 300, ctx);
    Title.render();
    Movement.render();
    Shoot.render();
    Spacebar.render();
    Restart.render();
    Hotkeys.render();
    ToggleShoot.render();
}

export {
    menu,
    controls,
    patchNotes,
    difficultyMenu,
    difficultyDescription
}