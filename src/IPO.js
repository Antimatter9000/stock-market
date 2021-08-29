import Position from './Position';

export default class IPO extends Position {
    constructor(stock, price, units, investor) {
        stock.setPrice(price);
        stock.circulation = units;
        super(stock, 0, investor);
        this.status = 'CLOSING';
        this.units = units;
        this.initialUnits = units;
    }
}