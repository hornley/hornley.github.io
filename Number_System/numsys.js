let _ = new Array( 26 ).fill( 1 ).map( ( _, i ) => String.fromCharCode( 65 + i ) );

const letters = new Map();
const numbers = new Map();


function convert() {
    let number = document.getElementById("toConvert").value;
    let base = document.getElementById("base").value;
    let to = document.getElementById("to").value;

    if (number == '' || base == '' || to == '') {
        window.alert("Cannot continue with missing arguments!");
        return;
    }

    if (parseInt(base) && parseInt(to)) {
        base = parseInt(base);
        to = parseInt(to);
    } else {
        window.alert("Your 'from' or 'to' input is not a number!s");
        return;
    }

    if (to >= 36) {
        window.alert("To Value: " + to + " might run into an error with remainders.");
        return;
    }

    let _x = 10;

    for (let letter in _) {
        letters[_x] = _[letter];
        numbers[_[letter]] = _x;
        _x++;
    }
    numbers['0'] = 0;

    for (let _ = 0; _ < number.length; _++) {
        let currentNumber = (parseInt(number[_])) ? parseInt(number[_]) : numbers[number[_].toUpperCase()];
        if (currentNumber > base - 1) {
            window.alert("Your input base is invalid for this conversion.");
            return;
        }
    }

    if (number.length >= 12) {
        document.getElementById("result").innerHTML = BigInt(number).toString(to).toUpperCase();
    }

    else if (base === 10) {
        let x = fromDecimal(number, to);
        document.getElementById("result").innerHTML = x;
    } else {
        let x = toDecimal(number, base, to);
        document.getElementById("result").innerHTML = x;
    }
}

function fromDecimal(number, to) {
    let result = "";
    m = parseInt(number);
    q = m / to - (m % to / to);
    if (m % to > 9) {
        result = letters[m % to] + result;
    } else {
        result = m % to + result;
    }
    while (q != 0) {
        m = q;
        q = m / to - (m % to / to);
        if (m % to > 9) {
            result = letters[m % to] + result;
        } else {
            result = m % to + result;
        }
    }
    return result;
}

function toDecimal(number, base, to) {
    const length = number.length - 1;
    let _ = 0;
    let result = 0;

    for (let i = length; i >= 0; i--) {
        let currentNumber = (parseInt(number[_])) ? parseInt(number[_]) : numbers[number[_].toUpperCase()];
        result += (currentNumber * (base ** i));
        _++;
    }

    return (to === 10) ? result : fromDecimal(result, to);
}