export default class Stock {
    constructor(ticker) {
        this.ticker = ticker;
        this.history = [];
        this.price = 0;
        this.totalIssued = 0;
    }

    get marketCap() {
        return this.price * this.totalIssued;
    }

    setPrice(val) {
        this.price = val;
        this.history.push(val);
    }

    IPO() {
        this.available += 1000;
        this.price = 10;
    }
}