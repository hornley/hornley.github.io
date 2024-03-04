let oldTime;

function cursor(game, player_object, mouseX, mouseY, fps) {
    game.context.lineWidth = 5;
    game.context.strokeStyle = 'grey';
    game.context.beginPath();
    game.context.arc(mouseX, mouseY, 12, 0, 2*Math.PI);
    game.context.stroke();
    game.context.strokeStyle = 'black';
    game.context.beginPath();
    if (game.frameNo < player_object.lastShot + 60/player_object.attackSpeed && player_object.lastShot != 0) {
        game.context.arc(mouseX, mouseY, 12, 0, ( (game.frameNo % 60) / ((player_object.lastShot + (fps/player_object.attackSpeed)) % 60) )*Math.PI*2);
    } else {
        game.context.arc(mouseX, mouseY, 12, 0, Math.PI*2);
    }
    game.context.stroke();
}

function move(keypresses, player_object) {
    keypresses = keypresses || [];

    player_object.x += (keypresses["a"] ? -player_object.speed : keypresses["d"] ? player_object.speed : 0);
    player_object.y += (keypresses["w"] ? -player_object.speed : keypresses["s"] ? player_object.speed : 0);
    return keypresses;
}

function showFPS(game, time) {
    let currentfps = (time - oldTime) / 1000;
    oldTime = time;
    game.context.save();
    game.context.font = "24px times-new-roman";
    game.context.textAlign = 'left';
    game.context.textBaseline = 'middle';
    game.context.fillStyle = "white";
    game.context.fillText(`FPS: ${Math.round(1/currentfps)}`, game.canvas.width - 80, game.canvas.height - 30);
    game.context.restore();
}

export {
    cursor,
    move,
    showFPS
}