let cur_turn = 1;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function play(block_number) {
    let player;
    if (cur_turn == 0) {
        return;
    }
    const block = document.getElementById("Block" + block_number);

    if (block.style.backgroundColor == "red" || block.style.backgroundColor == "blue") {
        return;
    }

    if (cur_turn % 2 != 0) {
        block.style.backgroundColor = "red";
        player = "Player 1";
    } else {
        block.style.backgroundColor = "blue";
        player = "Player 2";
    }

    if (check_win()) {
        document.getElementById("h1Winner").innerHTML = player + " won!";
        return;
    }
    else {
        cur_turn++;
    }
}

function restart() {
    let x = 1;
    cur_turn = 1;
    document.getElementById("h1Winner").innerHTML = '';
    while (x < 10) {
        const block = document.getElementById("Block" + x);
    
        block.style.backgroundColor = "powderblue";
        x++;
    }
}

function check_win() {
    let x = 1;
    let blocks = {};
    while (x < 10) {
        const block = document.getElementById("Block" + x);
        blocks[x] = block.style.backgroundColor;
        x++;
    }

    for (let i = 1; i < 4; i++) {
        if (blocks[i] == "red" && blocks[i + 3] == "red" && blocks[i + 6] == "red" || 
            blocks[i] == "blue" && blocks[i + 3] == "blue" && blocks[i + 6] == "blue") {
                cur_turn = 0;
                return true;
        }
    }

    for (let i = 1; i < 9; i += 3) {
        if (blocks[i] == "red" && blocks[i + 1] == "red" && blocks[i + 2] == "red" ||
            blocks[i] == "blue" && blocks[i + 1] == "blue" && blocks[i + 2] == "blue") {
                cur_turn = 0;
                return true;
        }
    }

    if (blocks[1] == "red" && blocks[5] == "red" && blocks[9] == "red" ||
        blocks[1] == "blue" && blocks[5] == "blue" && blocks[9] == "blue" ||
        blocks[3] == "red" && blocks[5] == "red" && blocks[7] == "red" ||
        blocks[3] == "blue" && blocks[5] == "blue" && blocks[7] == "blue") {
                cur_turn = 0;
                return true;
    }
}