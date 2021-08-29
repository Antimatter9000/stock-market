import IPO from './IPO';
import Stock from './Stock';

export default class Company {
    constructor() {
        this.name = 'RopeCo';
        this.stock = new Stock('$ROPE')
    }

    IPO() {
        const position = new IPO(this.stock, 10, 10000, this);
        this.isSelling = [position];
    }
}