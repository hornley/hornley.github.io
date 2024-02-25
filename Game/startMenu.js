function menu(myGame) {
    const ctx = myGame.context;
    const startTop = 15;
    const settingsTop = 75;
    const x = myGame.canvas.width * .15;
    const y = myGame.canvas.height / 2;
    // let image = new Image();
    // image.src = "../images/background-image.jpeg";
    // image.onload = function() {
        // ctx.drawImage(image, 0, 0, myGame.canvas.width, myGame.canvas.height);
        // put renders here
    // }

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
    // const Impossible = new TextButton(x + 100, 425, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'IMPOSSIBLE', 'Impossible');
    // const DodgeOnly = new TextButton(x + 100, 500, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'DODGE-ONLY', 'Dodge Only');
    // const Custom = new TextButton(x + 100, 575, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'CUSTOM', 'Custom');
    Title.render();
    Easy.render();
    Medium.render();
    Hard.render();
    // Impossible.render();
    // DodgeOnly.render();
    // Custom.render();
    // buttons.push([Easy, Medium, Hard, Impossible, DodgeOnly, Custom]);
    return [Easy, Medium, Hard];
}

// Continue from here to patchNotes()
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

    const EnemySpeed = new Text(x + 25, y + 50, `Enemy Speed: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const EnemyHealth = new Text(x + 25, y + 100, `Enemy Health: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const EnemyDamage = new Text(x + 25, y + 150, `Enemy Damage: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    const SpawnRate = new Text(x + 25, y + 200, `Spawn Rate: ${ratio}x of previous`, 500, ctx, 'black', '24px times-new-roman', 'left');
    EnemySpeed.render();
    EnemyHealth.render();
    EnemyDamage.render();
    SpawnRate.render();

    const StartButton = new TextButton(x + 550, y + 450, 'rgb(57, 202, 202)', 'black', 120, 45, ctx, 'START-GAME', 'Start');
    StartButton.render();
    return StartButton;
}

function patchNotes() {
    const ctx = myGame.context;
    const x = myGame.canvas.width * .3;
    const y = myGame.canvas.height / 2;
    const width = myGame.canvas.width * .7;
    const height = myGame.canvas.height;
}