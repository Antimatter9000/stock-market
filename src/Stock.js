export default class Stock {
    constructor(ticker) {
        this.ticker = ticker;
        this.history = [];
        this.price = 0;
        this.circulation = 0;
    }

    get marketCap() {
        return this.price * this.circulation;
    }

    setPrice(val) {
        this.price = val;
        this.history.push(val);
    }
}