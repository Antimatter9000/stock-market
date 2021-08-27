export default class Position {
    constructor(stock, budget, investor) {
        this.status = 'ORDER';
        this.stock = stock;
        this.units = 0;
        this.budget = budget;
        this.remainingBudget = budget;
        this.investor = investor;
    }

    get value() {
        return this.stock.price * this.units;
    }

    update(newUnits, frame) {
        if (/ORDER|CLOSING/.test(this.status)) {
            this.units += newUnits
            if (this.status === 'ORDER') {
                this.remainingBudget -= newUnits * this.stock.price;
                if (this.remainingBudget <= 0) {
                    this.completeOrder(frame);
                }
            } else if (this.status === 'CLOSING' && this.units <= 0) {
                this.close(frame);
            }
        }
    }

    completeOrder(frame) {
        this.openPrice = this.stock.price;
        this.openValue = this.units/this.budget;
        this.openTime = frame;
        this.unitsBought = this.units;

        this.status = 'OPEN';
        console.info(`${this.investor.name} just opened an order for ${this.unitsBought} units of ${this.stock.ticker} at ${this.openValue}`);
        if (this.remainingBudget < 0) {
            console.error("You should not be able to spend money you don't have");
        }
    }

    close(frame) {
        this.closingPrice = this.stock.price;
        this.closingValue = this.value;
        this.closingTime = frame;

        this.status = 'CLOSED';
        console.info(`${this.investor.name} just sold ${this.unitsBought} units of ${this.stock.ticker} and made a ${this.closingPrice > this.openPrice ? 'profit' : 'loss'} of ${Math.abs(this.closingValue - this.openValue)}`);
        if (this.units < 0) {
            console.error("You should not be able to sell units you don't have");
        }
    }
}