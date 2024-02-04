let currentTurn = 1;

function play(blockNumber) {
    let player;
    if (currentTurn == 0) {
        return;
    }
    const block = document.getElementById("Block" + blockNumber);

    if (block.children.length > 0) {
        return;
    }

    let img = document.createElement("img");

    if (currentTurn % 2 != 0) {
        img.src = "x.png";
        player = "Player 1";
        block.appendChild(img);
    } else {
        img.src = "o.png";
        player = "Player 2";
        block.appendChild(img);
    }

    if (checkWin()) {
        document.getElementById("h1Winner").innerHTML = player + " won!";
        document.getElementById("Box").style.opacity = 0.5;
        document.getElementById("h1Winner").style.display = 'block';
        document.getElementById("Winner").style.backgroundColor = 'aliceblue';
        document.getElementById("Winner").style.top = '40%';
        document.getElementById("Winner").style.left = '43%';
        return;
    }
    else {
        currentTurn++;
    }
}

function restart() {
    let x = 1;
    currentTurn = 1;
    document.getElementById("Box").style.opacity = 1;
    document.getElementById("h1Winner").innerHTML = '';
    document.getElementById("Winner").style.backgroundColor = '';
    document.getElementById("Winner").style.top = '0';
    document.getElementById("Winner").style.left = '0';
    while (x < 10) {
        const block = document.getElementById("Block" + x);
        if (block.children.length > 0) {
            block.removeChild(block.children[0]);
        }
        x++;
    }
}

function checkWin() {
    let x = 1;
    let blocks = {};
    const blockX = document.createElement('img'); blockX.src = 'x.png';
    const blockO = document.createElement('img'); blockO.src = 'o.png';
    while (x < 10) {
        const block = document.getElementById("Block" + x);
        if (block.children.length > 0) {
            let child = block.children[0];
            blocks[x] = child.src;
        }
        x++;
    }

    for (let i = 1; i < 4; i++) {
    if (blocks[i] == blockX.src && blocks[i + 3] == blockX.src && blocks[i + 6] == blockX.src || 
            blocks[i] == blockO.src && blocks[i + 3] == blockO.src && blocks[i + 6] == blockO.src) {
                currentTurn = 0;
                return true;
        }
    }

    for (let i = 1; i < 9; i += 3) {
        if (blocks[i] == blockX.src && blocks[i + 1] == blockX.src && blocks[i + 2] == blockX.src ||
            blocks[i] == blockO.src && blocks[i + 1] == blockO.src && blocks[i + 2] == blockO.src) {
                currentTurn = 0;
                return true;
        }
    }

    if (blocks[1] == blockX.src && blocks[5] == blockX.src && blocks[9] == blockX.src ||
        blocks[1] == blockO.src && blocks[5] == blockO.src && blocks[9] == blockO.src ||
        blocks[3] == blockX.src && blocks[5] == blockX.src && blocks[7] == blockX.src ||
        blocks[3] == blockO.src && blocks[5] == blockO.src && blocks[7] == blockO.src) {
                currentTurn = 0;
                return true;
    }
}