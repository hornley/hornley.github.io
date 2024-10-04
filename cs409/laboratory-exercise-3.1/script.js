// script.js
const destinationListContainer = document.getElementById(
    "select-destination-container"
);
const destinationListOption1 = document.getElementById("destinations-option1");
const destinationListOption2 = document.getElementById("destinations-option2");
const findButton = document.getElementById("find");
const resultDiv = document.getElementById("result");
const result_paragraph = document.querySelector('#result-p')
const closeResultButton = document.getElementById('close-result');

const destinationsInput = document.getElementById("destinations-input");
const locationInput = document.getElementById("location");

// load destinations from JSON file
fetch("destinations.json")
    .then((response) => response.json())
    .then((destinations) => {
        // populate destination list
        destinations.forEach((destination, index) => {
            const li1 = document.createElement("li");
            li1.textContent = `${destination.id} - ${destination.name}`;
            destinationListOption1.appendChild(li1);
            const li2 = document.createElement("li");
            const button = document.createElement("input");
            button.disabled = true;
            const label = document.createElement("label");
            button.setAttribute("type", "radio");
            button.setAttribute("name", "destination");
            button.setAttribute("value", destination.id);
            button.setAttribute("id", destination.name);
            label.setAttribute("for", destination.name);
            label.textContent = destination.name;
            li2.appendChild(button);
            li2.appendChild(label);
            destinationListOption2.appendChild(li2);
        });
        localStorage.setItem("destinations", JSON.stringify(destinations));

        const button = document.createElement("button");
        button.disabled = true;
        button.textContent = "Clear";
        button.addEventListener("click", function () {
            destinationListOption2
                .querySelectorAll('input[type="radio"]')
                .forEach((node) => {
                    node.checked = false;
                });
            destinationListOption1.parentElement.style.opacity = 1;
            destinationsInput.disabled = false;
        });

        destinationListOption2.parentNode.appendChild(button);

        destinationListOption2.childNodes.forEach((node) => {
            if (node.childNodes[0] !== undefined) {
                node.childNodes[0].addEventListener("change", function () {
                    destinationListOption1.parentElement.style.opacity = node
                        .childNodes[0].checked
                        ? 0.2
                        : 1;
                    destinationsInput.disabled = node.childNodes[0].checked;
                });
            }
        });
    })
    .catch((error) => console.error("Error loading destinations:", error));

destinationsInput.addEventListener("change", function () {
    destinationListOption2.childNodes.forEach((node) => {
        if (node.childNodes[0] !== undefined)
            node.childNodes[0].disabled = destinationsInput.value.trim() !== "";
    });
    destinationListOption2.parentElement.style.opacity =
        destinationsInput.value.trim() !== "" ? 0.2 : 1;
});

locationInput.addEventListener("change", function () {
    const value = locationInput.value.trim();
    const destination_container = document.querySelector(
        "#select-destination-container"
    );
    destination_container.style.opacity = value === "" ? 0.2 : 1;
    document.querySelectorAll("input:not(#location), button:not(.close-result)").forEach((input) => {
        input.disabled = value === "";
    });
});

closeResultButton.addEventListener(('click'), function() {
    resultDiv.style.visibility = 'hidden'
})

// handle form submission
findButton.addEventListener("click", (e) => {
    e.preventDefault();
    const location = locationInput.value.trim();
    if (!parseInt(location)) {
        resultDiv.style.visibility = 'visible'
        result_paragraph.innerHTML = "Not a valid input for destination!"
        return
    }
    let chosenDestinationID;
    const destinations = JSON.parse(localStorage.getItem("destinations"));
    if (destinationsInput.value.trim() !== "") {
        chosenDestinationID = destinationsInput.value.trim().toUpperCase()
    } else {
        document.querySelectorAll('input[type="radio"]').forEach((input) => {
            if (input.checked) chosenDestinationID = input.value
        })
    }
    let result
    destinations.forEach((dest) => {
        if (dest.id === chosenDestinationID) {
            result = calculateNearestEstablishment(location, chosenDestinationID, destinations);
        }
    })
    if (result) {
        resultDiv.style.visibility = 'visible'
        result_paragraph.innerHTML = result
    } else {
        resultDiv.style.visibility = 'visible'
        result_paragraph.innerHTML = "There is no nearby establishment of that."
    }
});

// calculate nearest establishment
function calculateNearestEstablishment(location, destinationId, destinations) {
    let closestDestinations = [];
    let distance;
    let destinationCategory;
    destinations.forEach((dest) => {
        if (dest.id === destinationId) {
            destinationCategory = dest.name
            let closestDestination = dest.locations[0]
            dest.locations.forEach((destination) => {
                if (Math.abs(destination.distance - location) == Math.abs(closestDestination.distance - location)) {
                    closestDestinations.push(destination)
                    distance = Math.abs(destination.distance - location)
                } else if (Math.abs(destination.distance - location) < Math.abs(closestDestination.distance - location)) {
                    closestDestinations = []
                    closestDestinations.push(destination)
                    distance = Math.abs(destination.distance - location)
                }
            })
        }
    })
    if (closestDestinations.length > 1) {
        for (let destination of closestDestinations) {
            const index = closestDestinations.indexOf(destination)
            closestDestinations[index] = destination.name
        }
    }
    return result = `The nearest <strong>${destinationCategory}</strong> is <strong>${(closestDestinations.length > 1) ? closestDestinations.join(', ') : closestDestinations[0].name}</strong> which is 
    <strong>${distance} km</strong> away.`;
}

// CANVA SCRIPT

const canvas = document.getElementById("canvas")
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
const canvas_size = {
    width: canvas.width,
    height: canvas.height
}
const ctx = canvas.getContext('2d')
let destinations = JSON.parse(localStorage.getItem("destinations"));

function showMap() {
    canvas.style.visibility = (canvas.style.visibility === 'visible') ? 'hidden' : 'visible'
    document.querySelectorAll('div.form').forEach((element) => {
        element.style.visibility = (canvas.style.visibility === 'visible') ? 'hidden' : 'visible'
    })

    if (canvas.style.visibility === 'visible') {
        loop()
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas_size.width, canvas_size.height)

    requestAnimationFrame(loop)
    
    const grad = ctx.createLinearGradient(0, 0, canvas_size.width, 0)
    grad.addColorStop(0, '#b8b3d7')
    grad.addColorStop(0.18, '#87a4d9')
    grad.addColorStop(0.36, '#9083d2')
    grad.addColorStop(0.58, '#587fe6')
    grad.addColorStop(0.73, '#496fb8')
    grad.addColorStop(0.92, '#3674ad')
    grad.addColorStop(1, '#583eb5')
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas_size.width, canvas_size.height);

    ctx.save()
    ctx.font = '64px times-new-roman'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'white'
    ctx.fillText("Map", canvas_size.width / 2 - 50, 100, 100);
    ctx.restore()
    const d = []
    destinations.forEach((dest) => {
        dest.locations.forEach((destination) => {
            d.push({
                name: destination.name,
                color: dest.color,
                distance: destination.distance
            })
        })
    })
    let index = 0;
    d.sort((a, b) => a.distance - b.distance)
    d.forEach((destination) => {
        const position = {
            x: destination.distance * 15,
            y: canvas_size.height / 2
        }
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = destination.color
        ctx.arc(position.x, position.y, 50, 0, 2*Math.PI)
        ctx.stroke()
        ctx.fill()
        ctx.font = '64px times-new-roman'
        ctx.textAlign = 'center'
        ctx.fillText(destination.name, position.x, position.y + ((index % 2 == 0) ? 100 : -100), 150);
        ctx.restore()
        index += 1
    })
}
