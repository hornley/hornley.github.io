var cur_turn = 1;

function omsim(x) {
    const block = document.getElementById("Block" + x);

    if (block.style.backgroundColor == "red" || block.style.backgroundColor == "blue") {
        return;
    }

    if (cur_turn % 2 != 0) {
        block.style.backgroundColor = "red";
    } else {
        block.style.backgroundColor = "blue";
    }
    cur_turn++;
}

function restart() {
    var x = 1;
    while (x < 10) {
        const block = document.getElementById("Block" + x);
    
        block.style.backgroundColor = "powderblue";
        x++;
    }
}