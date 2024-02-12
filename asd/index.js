let numberOfBets;
let dictionary = {};
let currentName;
let currentBetNumber = 1;
let agentBettors = {};
let jsonifyThis = [];


function submit() {
    const agentInput = document.getElementById('Agent');
    const textArea = document.getElementById('Bets');
    const mopDropdown = document.getElementById('MOP');
    const combinationsText = textArea.value;
    const Array = combinationsText.split(/\n/);
    const Agent = agentInput.value;
    const mop = mopDropdown.value;
    // const Agent = 'Yumi';
    dictionary[Agent] = {};
    
    for (let line in Array) {
        let text = Array[line];
        if (text.startsWith('@')) {
            currentName = text.substring(1);
            dictionary[Agent][currentName] = [];
        } else if (text.includes("=")) {
            let combination = text.substring(0, text.indexOf("="));
            combination = (combination.includes(" ")) ? combination.replace(" ", "-") : combination;
            let type = (text.includes("S") || text.includes("s")) ? 'Straight' : 'Ramble';
            let amount = text.substring(text.indexOf("=") + 1, text.length - 1);
            let date = new Date();
            let newDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            dictionary[Agent][currentName].push({'Combination': combination ,'Type': type, 'Amount': amount, 'Date': newDate, 'Mode': mop});
            jsonifyThis.push({'Agent': Agent, 'Bettor': currentName, 'N1': combination[0], 'N2': combination[2], 'N3': combination[4], 'Amount': amount, 'Type': type, 'Mode': mop, 'Combination': combination, 'Date': newDate});
            numberOfBets++;
        }
    }
    console.log(jsonifyThis);
    table();
}

function table() {
    const table = document.getElementById('table');
    for (agent in dictionary) {
        for (bettor in dictionary[agent]) {
            for (bet in dictionary[agent][bettor]) {
                const { Combination, Type, Amount, Date, Mode } = dictionary[agent][bettor][bet];
                const rowData = [currentBetNumber, agent, bettor, Combination[0], Combination[2], Combination[4], Amount, Type, Mode, Date];
                const row = document.createElement('tr');
                rowData.forEach(data => {
                    const cell = document.createElement('td');
                    const cellText = document.createTextNode(data);
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                });
                table.appendChild(row);
                currentBetNumber++;
            }
        }
    }
}

function jsonify(el) {
    let data = "text/json; charset=utf-8," + encodeURIComponent(JSON.stringify(jsonifyThis));
    el.setAttribute("href", "data:"+data);
    el.setAttribute("download", "data.json");
}

/*
@Auchi B. A
0-0-1=30S
0-1-5=50R

            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            const cell3 = document.createElement('td');
            const cell4 = document.createElement('td');
            const cell5 = document.createElement('td');
            const cell6 = document.createElement('td');
            const cell7 = document.createElement('td');
            const cell1Text = document.createTextNode(currentBetNumber);
            const cell2Text = document.createTextNode(currentBetNumber);
            const cell3Text = document.createTextNode(currentBetNumber);
            const cell4Text = document.createTextNode(currentBetNumber);
            const cell5Text = document.createTextNode(currentBetNumber);
            const cell6Text = document.createTextNode(currentBetNumber);
            const cell7Text = document.createTextNode(currentBetNumber);

*/