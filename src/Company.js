import IPO from './IPO';
import Stock from './Stock';

export default class Company {
    constructor() {
        this.name = 'RopeCo';
        this.stock = new Stock('$ROPE');
        this.isSelling = {};
        this.history = [];
    }

    IPO() {
        const position = new IPO(this.stock, 10, 1000, this);
        this.isSelling = {
            [position.id]: position
        };
    }
}