let propositions = new Map();
const logicalConnectives = ["A", "V", "O", "->", "<->", "==", "~"];
const variables = new Set();
let input;
let CompoundProposition = "";
let CompoundPropositionLeft = "";
let CompoundPropositionRight = "";
let CompoundPropositionLC = "";
let NegateCompoundProposition = 0;
let numberOfRows = 0;

let maxRows;
let currentPage = 1;
let maxPage = 1;

function removeDuplicates() {
    let temp = new Map();
    for (const p of propositions.keys()) {
        if (p.startsWith("(") && p.endsWith(")") && p !== CompoundProposition) {
            if (propositions.has(p.substring(1, p.length - 1))) {
                temp.set(p.substring(1, p.length - 1), propositions.get(p.substring(1, p.length - 1)));
            }
        } else {
            temp.set(p, propositions.get(p));
        }
    }
    propositions = temp;
}

function checkIfCompoundNegated(input) {
    let POcount = 0;
    if (input.startsWith("~(")) {
        POcount++;
        for (let y = 2; y < input.length; y++) {
            if (input.substring(y, y + 1) === "(") POcount++;
            else if (input.substring(y, y + 1) === ")") POcount--;
            if (POcount === 0 && y !== input.length - 1) return false;
        }
    }
    NegateCompoundProposition++;
    return true;
}

function isCompoundPropositionNegated(input) {
    let POcount = 0;
    let done = false;
    let Compounded = input;
    if (input.startsWith("~(")) {
        if (checkIfCompoundNegated(Compounded)) {
            Compounded = Compounded.substring(2, Compounded.length - 1);
            isCompoundPropositionNegated(Compounded);
            return;
        }
    }
    CompoundProposition = Compounded;
    for (let y = 0; y < input.length; y++) {
        if (done) break;
        if (Compounded.substring(y, y + 1) === "(") POcount++;
        else if (Compounded.substring(y, y + 1) === ")") POcount--;
        for (const LC of logicalConnectives) {
            const from = y;
            if (POcount > 0 || LC === "~") continue;
            if (input.substring(y, y + 1) === LC) {
                CompoundPropositionLeft = input.substring(0, y);
                CompoundPropositionRight = input.substring(y + 1, input.length);
                CompoundPropositionLC = input.substring(y, y + 1);
                done = true;
                break;
            }
            if (input.substring(from).includes("->") || input.substring(from).includes("<->")) {
                if (input.substring(from, y + 2) === "->" || input.substring(from, y + 2) === "==") {
                    CompoundPropositionLeft = input.substring(0, y);
                    CompoundPropositionRight = input.substring(y + 2, input.length);
                    CompoundPropositionLC = input.substring(y, y + 2);
                    done = true;
                    break;
                } else if (input.substring(from, y + 3) === "<->") {
                    CompoundPropositionLeft = input.substring(0, y);
                    CompoundPropositionRight = input.substring(y + 3, input.length);
                    CompoundPropositionLC = input.substring(y, y + 3);
                    done = true;
                    break;
                }
            }
        }
    }
}

function getSimplePropositions(input) {
    input = input.replaceAll("\\s+", "");
    let proposition = [];
    let POcount = 0;
    const tempProposition = new Map();
    if (input.startsWith("(") && input.endsWith(")") && !input === CompoundProposition) input = input.substring(1, input.length - 1);
    if (input.length === 2) return;
    for (let y = 0; y < input.length; y++) {
        if (input.substring(y, y + 1) === "(") {
            POcount++;
            if (y > 0 && input.substring(y - 1, y) === "~") {
                tempProposition.set(POcount, y - 1);
            } else tempProposition.set(POcount, y);
        } else if (input.substring(y, y + 1) === ")") {
            const from = tempProposition.get(POcount);
            const to = y;
            if (input.substring(from, from + 1) === "~") proposition.push(input.substring(from + 2, to));
            proposition.push(input.substring(from, to + 1));
            POcount--;
        } else if (input.substring(y, y + 1) === "~" && !input.substring(y + 1, y + 2) === "(" && input.length !== 4) {
            if (input.includes("->") || input.includes("<->")) {
                if (input.substring(y, y + 2) === "->" || input.substring(y, y + 2) === "==") {
                    proposition.push(input.substring(y, y + 3));
                    proposition.push(input.substring(y + 2, y + 5));
                } else if (input.substring(y, y + 3) === "<->") {
                    proposition.push(input.substring(y, y + 4));
                    proposition.push(input.substring(y + 3, y + 6));
                }
            } else {
                proposition.push(input.substring(y, y + 2));
                if (getVariablesOfProposition(input.substring(y + 1, y + 4)) !== 1) proposition.push(input.substring(y + 1, y + 4));
            }
        }
    }
    for (const p of proposition) {
        if (!propositions.has(p)) {
            propositions.set(p, solveTruthValues(p));
        }
    }
}

function getLeftRightProposition(input) {
    const proposition = [];
    let x = 0;
    let POcount = 0;
    for (let to = 0; to < input.length; to++) {
        for (const LC of logicalConnectives) {
            if (LC === "~") continue;
            if (input.substring(to, to + 1) === LC) {
                if (to > 1 && variables.has(input.charAt(to - 1)) && input.substring(to - 2, to - 1) === "~") x += 1;
                else x = 0;
                proposition.push(input.substring(to - 1 - x, to));
                proposition.push(input.substring(to + 1, input.length));
                proposition.push(LC);
                break;
            }
        }
        if (input.includes("->") || input.includes("<->")) {
            if (input.substring(to, to + 2) === "->") {
                proposition.push(input.substring(to - 1 - x, to));
                proposition.push(input.substring(to + 2, input.length));
                proposition.push("->");
            }
            if (input.substring(to, to + 3) === "<->") {
                proposition.push(input.substring(to - 1 - x, to));
                proposition.push(input.substring(to + 3, input.length));
                proposition.push("<->");
            }
        }
        if (proposition.length !== 0) break;
    }
    return proposition;
}

function negation(truthValues) {
    const TruthValues = [];
    for (let x = 0; x < truthValues.length; x++) {
        TruthValues.push(!truthValues[x]);
    }
    return TruthValues;
}

function getVariablesOfProposition(input) {
    let count = 0;
    for (let x = 0; x < input.length; x++) {
        if (variables.has(input.charAt(x))) count++;
    }
    return count;
}

function solveTruthValues(proposition) {
    if (propositions.has(proposition)) {
        if (propositions.get(proposition) !== null) return propositions.get(proposition);
    }
    proposition = proposition.replaceAll("\\s+", "");
    const TruthValues = [];
    let leftTruthValues = [];
    let rightTruthValues = [];
    let leftProposition = "";
    let rightProposition = "";
    let logicalConnective = "";
    if (proposition === CompoundProposition) {
        isCompoundPropositionNegated(proposition);
        leftProposition = CompoundPropositionLeft;
        rightProposition = CompoundPropositionRight;
        logicalConnective = CompoundPropositionLC;
    }
    if (proposition.startsWith("~") && proposition.length === 2) {
        propositions.set(proposition, negation(propositions.get(proposition.substring(1))));
        return negation(propositions.get(proposition.substring(1)));
    }
    if (proposition.startsWith("(") && proposition.endsWith(")") && proposition !== CompoundProposition) {
        proposition = proposition.substring(1, proposition.length - 1);
    }
    if (proposition.startsWith("~(") && proposition.endsWith(")") && !proposition.substring(2).includes("(")) {
        let x = [];
        if (propositions.get(proposition.substring(2, proposition.length - 1)) !== null) x = propositions.get(proposition.substring(2, proposition.length - 1));
        else x = solveTruthValues(proposition.substring(2, proposition.length - 1));
        propositions.set(proposition, negation(x));
        return negation(x);
    }
    if (proposition.startsWith("~(") && proposition.endsWith("))") && (proposition !== CompoundProposition || variables.size === 1)) {
        let x = [];
        if (propositions.get(proposition.substring(2, proposition.length)) !== null) x = propositions.get(proposition.substring(2, proposition.length - 1));
        else x = solveTruthValues(proposition.substring(2, proposition.length - 1));
        propositions.set(proposition, negation(x));
        return negation(x);
    }
    if (proposition.startsWith("(") && proposition !== CompoundProposition && leftProposition === "" && rightProposition === "") {
        let right = proposition.indexOf(")");
        leftProposition = proposition.substring(1, right);
        if (proposition.length === 5) {
            leftProposition = proposition.substring(1, 2);
            logicalConnective = proposition.substring(2, 3);
            rightProposition = proposition.substring(3, 4);
        } else {
            logicalConnective = proposition.substring(right + 1, proposition.length);
            for (let to = 0; to < logicalConnective.length; to++) {
                for (const LC of logicalConnectives) {
                    if (logicalConnective.substring(to, to + 1) === LC) {
                        rightProposition = logicalConnective.substring(to + 1, logicalConnective.length);
                        logicalConnective = LC;
                        break;
                    }
                }
                if (logicalConnective.includes("->") || logicalConnective.includes("<->")) {
                    if (logicalConnective.substring(to, to + 2) === "->") {
                        rightProposition = logicalConnective.substring(to + 2, logicalConnective.length);
                        logicalConnective = "->";
                        break;
                    }
                    if (logicalConnective.substring(to, to + 3) === "<->") {
                        rightProposition = logicalConnective.substring(to + 3, logicalConnective.length);
                        logicalConnective = "<->";
                        break;
                    }
                }
                if (rightProposition !== "") break;
            }
        }
    } else if (!proposition.startsWith("(") && proposition !== CompoundProposition && leftProposition === "" && rightProposition === "") {
        leftProposition = getLeftRightProposition(proposition)[0];
        rightProposition = getLeftRightProposition(proposition)[1];
        logicalConnective = getLeftRightProposition(proposition)[2];
    }
    if (rightProposition.includes("~") && rightProposition.length === 2) {
        propositions.set(rightProposition, negation(propositions.get(rightProposition.substring(1, 2))));
    }
    if (leftProposition.includes("~") && leftProposition.length === 2) {
        propositions.set(leftProposition, negation(propositions.get(leftProposition.substring(1, 2))));
    }
    if (propositions.get(leftProposition) !== null && propositions.get(rightProposition) !== null) {
        leftTruthValues = propositions.get(leftProposition);
        rightTruthValues = propositions.get(rightProposition);
    }
    if (propositions.get(leftProposition) === null) {
        leftTruthValues = solveTruthValues(leftProposition);
        rightTruthValues = propositions.get(rightProposition);
    }
    if (propositions.get(rightProposition) === null) {
        leftTruthValues = propositions.get(leftProposition);
        rightTruthValues = solveTruthValues(rightProposition);
    }
    switch (logicalConnective) {
        case "A":
            for (let x = 0; x < leftTruthValues.length; x++) {
                const truthValue = leftTruthValues[x] && rightTruthValues[x];
                TruthValues.push(truthValue);
            }
            break;
        case "V":
            for (let x = 0; x < leftTruthValues.length; x++) {
                const truthValue = leftTruthValues[x] || rightTruthValues[x];
                TruthValues.push(truthValue);
            }
            break;
        case "O":
            for (let x = 0; x < leftTruthValues.length; x++) {
                const truthValue = leftTruthValues[x] ^ rightTruthValues[x];
                TruthValues.push((truthValue) ? true : false);
            }
            break;
        case "->":
            for (let x = 0; x < leftTruthValues.length; x++) {
                let truthValue = true;
                if (leftTruthValues[x] && !rightTruthValues[x]) truthValue = false;
                TruthValues.push(truthValue);
            }
            break;
        case "<->":
            for (let x = 0; x < leftTruthValues.length; x++) {
                const truthValue = leftTruthValues[x] ^ rightTruthValues[x];
                TruthValues.push(!truthValue);
            }
            break;
        default:
            break;
    }
    propositions.set(proposition, TruthValues);
    return TruthValues;
}

function initializeTruthTable(rows, vn, cn) {
    const arr = [];
    for (let row = 0; row < rows; row++) {
        if (Math.ceil((row + 1) / Math.pow(2, vn - cn)) % 2 === 1) arr[row] = true;
        else arr[row] = false;
    }
    return arr;
}

function getVariableFromSet(index) {
    let x = 0;
    let z = 'a';
    for (const variable of variables) {
        if (x === index) {
            z = variable;
        }
        x++;
    }
    return z;
}

function displayTruthTable() {
    const rows = numberOfRows + 1
    const table = document.getElementById("table");
    table.setAttribute('border', "1px solid black")
    table.innerHTML = "<caption>"+input+"</caption>";
    let row = 0;
    while (row < rows) {
        let col = 0;
        const tableRow = document.createElement('tr');
        for (const proposition of propositions.keys()) {
            let cell;
            let cellText;
            if (row === 0) {
                cell = document.createElement('th');
                cell.style.width = proposition.length * 6+"%";
                cell.style.background = (col % 2 == 0) ? "powderblue" : "chartreuse";
                cellText = document.createTextNode(proposition);
                col++;
            } else {
                tempRow = row + maxRows * (currentPage - 1)
                if (tempRow >= rows) break;
                cell = document.createElement('td');
                cell.style.background = (col % 2 == 0) ? "#78a0a5" : "#72be26";
                const truthValue = propositions.get(proposition)[tempRow - 1];
                cellText = document.createTextNode((truthValue) ? "T" : "F");
                col++;
            }
            cell.appendChild(cellText);
            tableRow.appendChild(cell);
        }
        table.appendChild(tableRow);
        if (row == maxRows) break;
        row++;
    }
}

function nextPage() {
    if (currentPage >= maxPage) return;
    currentPage++
    const page = document.getElementById("PageNumber")
    page.innerHTML = currentPage
    displayTruthTable()
}

function previousPage() {
    if (currentPage == 1) return;
    currentPage--
    const page = document.getElementById("PageNumber")
    page.innerHTML = currentPage
    displayTruthTable()
}

function main() {
    const table = document.getElementById("table");
    const inputField = document.getElementById('PropositionInput')
    const maxRowsField = document.getElementById('maxRows')
    maxRows = (maxRowsField.value != "") ? maxRowsField.value : 15
    input = inputField.value;
    inputField.value = ""
    let variableNumbers = 0;
    
    for (let i = 97; i <= 122; i++) {
        for (let y = 0; y < input.length; y++) {
            if (String.fromCharCode(i) === input.charAt(y)) {
                variables.add(input.charAt(y));
            }
        }
    }
    variableNumbers = variables.size;
    numberOfRows = Math.pow(2, variableNumbers);

    for (let vn = 0; vn < variableNumbers; vn++) {
        propositions.set(getVariableFromSet(vn), initializeTruthTable(numberOfRows, variableNumbers, vn + 1));
    }

    input = input.replaceAll("\\s+", "");
    CompoundProposition = input;
    isCompoundPropositionNegated(CompoundProposition);
    getSimplePropositions(CompoundProposition);
    solveTruthValues(CompoundProposition);

    for (let x = 1; x <= NegateCompoundProposition; x++) {
        const p = "~(".repeat(x - 1) + CompoundProposition + ")".repeat(x - 1);
        propositions.set("~(".repeat(x) + CompoundProposition + ")".repeat(x), negation(propositions.get(p)));
    }

    removeDuplicates();
    maxPage = numberOfRows / maxRows
    displayTruthTable();
}