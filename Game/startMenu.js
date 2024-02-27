import { Enemy, Player, Text, TextButton, ImageButton } from "./entity.js";
import { difficulties } from "./game.js";

const version = 'Version: 0.3.0-alpha';
let img = new Image();
img.src = "./images/Menu.jpg";

function startClear(ctx, width, height) {
    ctx.drawImage(img, 0, 0, 1920, 1080, 0, 0, width, height);
}

function menu(myGame, back=null) {
    const ctx = myGame.context;
    const startTop = 15;
    const settingsTop = 75;
    const x = myGame.canvas.width/2;
    const y = myGame.canvas.height / 2;

    const startButton = new TextButton(x, y + startTop, 'rgb(57, 202, 202)', 'black', 90, 45, ctx, 'START', 'Start');
    const controlsButton = new TextButton(x, y + settingsTop, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CONTROLS', 'Controls');

    if (back) {
        startClear(ctx, myGame.canvas.width, myGame.canvas.height);
        controlsButton.render();
        startButton.render();
        return;
    }

    img.onload = function () {
        startClear(ctx, myGame.canvas.width, myGame.canvas.height);
        controlsButton.render();
        startButton.render();
    }

    // const patchNotesButton = new ImageButton(x * 1.85, y * 2 - 50, 22, 22, ctx, 'PATCH-NOTES', "./images/Patch-Notes.png");
    // const gameVersion = new Text(85, y * 2 - 17, version, 150, ctx, 'black', '20px times-new-roman');

    // patchNotesButton.render();
    // gameVersion.render();

    return [startButton, controlsButton];
}

function difficultyMenu(myGame) {
    const ctx = myGame.context;
    const x = myGame.canvas.width /2;
    const y = myGame.canvas.height / 2;
    const Title = new Text(x, 300, "Difficulty", 200, ctx, 'black', "40px times-new-roman");
    const Easy = new TextButton(x , 400, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Easy');
    const Medium = new TextButton(x, 475, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Medium');
    const Hard = new TextButton(x, 550, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Hard');
    const Impossible = new TextButton(x, 625, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DIFFICULTY', 'Impossible');
    // const DodgeOnly = new TextButton(x + 100, 500, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DODGE-ONLY', 'Dodge Only');
    // const Custom = new TextButton(x + 100, 575, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CUSTOM', 'Custom');
    const StartButton = new TextButton(x, 700, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'START-GAME', 'Start');

    ctx.save();
    ctx.beginPath();
    ctx.clearRect(0, 0, myGame.canvas.width, myGame.canvas.height);
    ctx.drawImage(img, 0, 0, 1920, 1080, 0, 0, myGame.canvas.width, myGame.canvas.height);
    ctx.fillStyle = "#41980a";
    ctx.roundRect(x - 200, y - 200, 400, 550, 10);
    ctx.fill();
    ctx.restore();
    Title.render();
    Easy.render();
    Medium.render();
    Hard.render();
    Impossible.render();
    // DodgeOnly.render();
    // Custom.render();
    StartButton.render();
    
    return [Easy, Medium, Hard, Impossible];
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
    const Patch = new Text(x + width / 2, y, "Nothing LOL", 200, ctx, 'black', "40px times-new-roman");
    Patch.render();
}

function controls(myGame) {
    const ctx = myGame.context;
    const x = myGame.canvas.width /2;
    const y = myGame.canvas.height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.clearRect(0, 0, myGame.canvas.width, myGame.canvas.height);
    ctx.drawImage(img, 0, 0, 1920, 1080, 0, 0, myGame.canvas.width, myGame.canvas.height);
    ctx.fillStyle = "#41980a";
    ctx.roundRect(x - 350, y - 200, 700, 500, 10);
    ctx.fill();
    ctx.restore();

    const Title = new Text(x, 300, "Controls", 150, ctx, 'black', "40px times-new-roman");
    const Movement = new Text(x, 400, "WASD - Movements", 200, ctx);
    const Shoot = new Text(x, 450, "Click or Hold to shoot (Hold for 5secs to toggle auto shoot)", 600, ctx);
    const Spacebar = new Text(x, 500, "Spacebar to open upgrades menu", 300, ctx);
    const Restart = new Text(x, 550, "Press 'R' for the restart hotkey.", 300, ctx);
    const Hotkeys = new Text(x, 600, "Press numbers 1-5 respectively for upgrades", 400, ctx);
    const ToggleShoot = new Text(x, 650, "Press 'T' to disable auto-shoot", 300, ctx);
    const Back = new TextButton(x, 800, 'rgb(76, 76, 109)', 'black', 150, 50, ctx, 'BACK-MENU', 'Back', 10);
    Title.render();
    Movement.render();
    Shoot.render();
    Spacebar.render();
    Restart.render();
    Hotkeys.render();
    ToggleShoot.render();
    Back.render();

    return Back;
}

export {
    menu,
    controls,
    patchNotes,
    difficultyMenu
}