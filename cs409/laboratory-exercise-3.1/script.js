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
    let closestDestination;
    let destinationCategory;
    destinations.forEach((dest) => {
        if (dest.id === destinationId) {
            destinationCategory = dest.name
            closestDestination = dest.locations[0]
            dest.locations.forEach((destination) => {
                if (Math.abs(destination.distance - location) < Math.abs(closestDestination.distance - location)) {
                    closestDestination = destination
                }
            })
        }
    })
    return result = `The nearest <strong>${destinationCategory}</strong> is <strong>${closestDestination.name}</strong> which is 
    <strong>${Math.abs(closestDestination.distance - location)} km</strong> away.`;
}
