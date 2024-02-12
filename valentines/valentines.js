let container = document.getElementById("container");
let index = 0;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let noButton = document.getElementById('no');
let yesButton = document.getElementById('yes');
let buttons = document.getElementById('buttons');
let lastSpawn = -1;
let spawns = [];
let stop = false;
const noMessages = [
    "Are you sure?",
    "Why?",
    "Can you just please say yes?",
    "Why not?",
    "Do you not love me?",
    "Do you hate me?",
    "I will be sad if you don't click yes",
    ".......Okay",
    "You really don't want to be my valentine, huh?",
    "Alright then...",
    "You leave me no choice.",
    "You can't say no anymore :)"
];
let heart = new Image();
heart.src = 'heart.png';

function yes() {
    container.innerHTML = "<img width='500px' src='valentines-gif.gif'>";
    container.style.marginTop = "20%";
    buttons.innerHTML = "";
    canvas.style.backgroundColor = 'white';
    stop = true;
}

function no() {
    if (index >= 15 && index <= 20) {
        noButton.innerHTML = `Just say yes...`;
        index++;
        return;
    } else if (index > 20) {
        noButton.style.opacity = "0";
        return;
    }
    buttons.style.display = "flex";
    buttons.style.flexDirection = 'column';
    buttons.style.justifyContent = 'center';
    buttons.style.alignItems = 'center';
    yesButton.style.width = `${index * 10 + 80}px`;
    yesButton.style.height = `${index * 10 + 45}px`;
    yesButton.style.fontSize = `${index * 3 + 24}px`
    noButton.style.width = '175px';
    noButton.style.height = `${45 + index * 4}px`;
    if (index <= 11) noButton.innerHTML = noMessages[index];
    index++;
}

class backgroundDrops {
    constructor() {
        this.x = Math.random() * (canvas.width - 30);
        this.y = 0;
        this.size = 10;
    }

    render() {
        ctx.drawImage(heart, this.x, this.y);
    };
}

background();

function randomSpawn() {
    let time = Date.now();
    if (time <= lastSpawn + 200) { return; }

    lastSpawn = time;
    let x = new backgroundDrops();
    spawns.push(x);
}

function background() {
    if (stop) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    randomSpawn();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#EFE4EF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    spawns.forEach((x) => {
        x.render();
        x.y += 1;
    })
    requestAnimationFrame(background);
}