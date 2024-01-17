var cur_turn = 0;

function omsim(x) {
    const block = document.getElementById("Block" + x);

    if (cur_turn % 2 == 0) {
        block.style.backgroundColor = "red";
    } else {
        block.style.backgroundColor = "blue";
    }
    cur_turn++;
}