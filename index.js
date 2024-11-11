class Calculator {
    constructor(displayId) {
        this.display = document.getElementById(displayId);
        this.history = [];
        this.resetOnNextNumber = false;
        this.pendingOperation = false;
    }

    append(value) {
        const currentDisplay = this.display.value;

        if (currentDisplay === "Hata" || currentDisplay === "Sonuç tanımsız" || currentDisplay === "0'a bölünemez") {
            this.clearDisplay();
        }

        const lastChar = currentDisplay.slice(-1);
        const lastNumber = currentDisplay.split(/[\+\-\*\/]/).pop();

        if (this.resetOnNextNumber && value >= '0' && value <= '9') {
            this.clearDisplay();
            this.resetOnNextNumber = false;
        }

        if (value === ',' && lastNumber.includes(',')) {
            return;
        }

        if (value === '0' && currentDisplay === '0') {
            return;
        }

        if (value === ',') {
            if (currentDisplay === '' || ['+', '-', '*', '/'].includes(lastChar)) {
                this.display.value += '0,';
            } else {
                this.display.value += ',';
            }
        } else if (['+', '-', '*', '/'].includes(value)) {
            if (this.resetOnNextNumber) {
                this.display.value += value;
                this.resetOnNextNumber = false;
            } else if (['+', '-', '*', '/'].includes(lastChar)) {
                this.display.value = currentDisplay.slice(0, -1) + value;
            } else {
                this.display.value += value;
            }
            this.pendingOperation = true;
        } else {
            this.display.value += value;
            this.pendingOperation = false;
        }
    }

    clearDisplay() {
        this.display.value = '';
    }

    backspace() {
        const currentDisplay = this.display.value;

        if (currentDisplay === "Sonuç tanımsız" || currentDisplay === "Hata" || currentDisplay === "0'a bölünemez") {
            this.clearDisplay();
        } else {
            this.display.value = this.display.value.slice(0, -1);
        }
    }

    calculate(callback) {
        let expression = this.display.value;

        let summary = '';

        let numbers = expression.split(/[\+\-\*\/]/).map(num => parseFloat(num.replace(/,/g, '.')));
        let operators = expression.split(/[\d\,]+/).filter(op => op);

        if (numbers.length === 0) {
            this.display.value = 'Hata';
            return;
        }

        try {
            for (let i = 0; i < operators.length; i++) {
                if (operators[i] === '*' || operators[i] === '/') {
                    if (operators[i] === '/' && numbers[i + 1] === 0) {
                        if (numbers[i] === 0) {
                            this.display.value = 'Sonuç tanımsız';
                            return;
                        } else {
                            this.display.value = '0\'a bölünemez';
                            return;
                        }
                    }
                    const result = operators[i] === '*'
                        ? numbers[i] * numbers[i + 1]
                        : numbers[i] / numbers[i + 1];

                    numbers.splice(i, 2, result);
                    operators.splice(i, 1);
                    i--;
                }
            }

            for (let i = 0; i < operators.length; i++) {
                const result = operators[i] === '+'
                    ? numbers[i] + numbers[i + 1]
                    : numbers[i] - numbers[i + 1];

                numbers.splice(i, 2, result);
                operators.splice(i, 1);
                i--;
            }

            let finalResult = numbers[0];

            if (isNaN(finalResult)) {
                this.display.value = 'Hata';
            } else {
                if (finalResult.toString().length > 15) {
                    finalResult = finalResult.toExponential();
                }

                this.display.value = finalResult.toString().replace(/\./g, ',');
            }
        } catch (error) {
            this.display.value = 'Hata';
        }

        summary = `${expression} = ${this.display.value}`;
        this.history.push(summary);

        if (callback) {
            callback(this.display.value);
        }

        this.resetOnNextNumber = true;
        this.pendingOperation = false;
    }

    square() {
        let currentDisplay = this.display.value.replace(/,/g, '.');
        let number = parseFloat(currentDisplay);

        if (!isNaN(number)) {
            let result = number ** 2;
            this.display.value = result.toString().replace(/\./g, ',');
        } else {
            this.display.value = 'Hata';
        }
        this.resetOnNextNumber = true;
        this.pendingOperation = false;
    }

    squareRoot() {
        let currentDisplay = this.display.value.replace(/,/g, '.');
        let number = parseFloat(currentDisplay);

        if (!isNaN(number) && number >= 0) {
            let result = Math.sqrt(number);
            this.display.value = result.toString().replace(/\./g, ',');
        } else {
            this.display.value = 'Hata';
        }
        this.resetOnNextNumber = true;
        this.pendingOperation = false;
    }

    displaySummary() {
        if (this.history.length > 0) {
            alert(this.history.join('\n'));
        } else {
            alert('Hesap özetiniz yok.');
        }
    }

    keyPress(event) {
        const key = event.key;

        if (key === 'Enter') {
            event.preventDefault();
            this.calculate();
        } else if (key === 'Delete') {
            this.clearDisplay();
        } else if (key === 'Backspace') {
            this.backspace();
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.append(key);
        } else if (key === ',') {
            this.append(',');
        } else if (key >= '0' && key <= '9') {
            this.append(key);
        }
    }
}

const calculator = new Calculator('entry');

document.querySelectorAll('#calculator button').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.textContent.trim();

        switch (value) {
            case 'C':
                calculator.clearDisplay();
                break;
            case '=':
                calculator.calculate();
                break;
            case 'x²':
                calculator.square();
                break;
            case '√':
                calculator.squareRoot();
                break;
            case 'Özet':
                calculator.displaySummary();
                break;
            case ',':
                calculator.append(',');
                break;
            default:
                calculator.append(value);
                break;
        }
    });
});

document.addEventListener('keydown', (event) => calculator.keyPress(event));
