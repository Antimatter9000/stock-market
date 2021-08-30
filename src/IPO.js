import Position from './Position';

export default class IPO extends Position {
    constructor(stock, price, units, investor) {
        stock.setPrice(price);
        super(stock, 0, investor);
        console.log('or is it this that runs twice?');
        stock.circulation = units;
        this.status = 'CLOSING';
        this.units = units;
        this.initialUnits = units;
    }
}