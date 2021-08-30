export default class Position {
    constructor(stock, budget, investor) {
        this.id = Date.now().toString();
        console.log('time', this.id);
        this.status = 'ORDER';
        this.stock = stock;
        this.units = 0;
        this.budget = budget;
        this.remainingBudget = budget;
        this.investor = investor;
        this.openValue = this.value;
        console.info(`${this.investor.name} just opened an order for ${this.stock.ticker} with a budget of ${budget}`);
    }

    get value() {
        return this.stock.price * this.units;
    }

    update(newUnits, frame) {
        if (/ORDER|CLOSING/.test(this.status)) {
            this.units += newUnits
            if (this.status === 'ORDER') {
                this.remainingBudget -= newUnits * this.stock.price;
            }
        }
    }

    completeOrder(frame) {
        this.openPrice = this.stock.price;
        this.openValue = this.budget/this.units;
        this.openTime = frame;
        this.initialUnits = this.units;

        this.status = 'OPEN';
        this.investor.isBuying = null;
        console.info(`${this.investor.name} just opened a position for ${this.initialUnits} units of ${this.stock.ticker} at ${this.openPrice}`);
        if (this.remainingBudget < 0) {
            console.error("You should not be able to spend money you don't have");
        }
    }

    close() {
        this.status = 'CLOSING';
        console.info(`${this.investor.name} just strated closing their position for ${this.stock.ticker}`);
    }

    completeClose(frame) {
        this.closingPrice = this.stock.price;
        this.closingValue = this.value;
        this.closingTime = frame;

        this.status = 'CLOSED';
        this.investor.cash += this.value;
        console.log(this);
        this.investor.history.push(this);
        delete this.investor.isSelling[this.id];
        console.info(`${this.investor.name} just sold ${this.initialUnits} units of ${this.stock.ticker} and made a ${this.closingPrice > this.openPrice ? 'profit' : 'loss'} of ${Math.abs(this.closingValue - this.openValue)}`);
        if (this.units < 0) {
            console.error("You should not be able to sell units you don't have");
        }
    }
}