import Stock from './Stock';


export default class Market {
    constructor(stocks, investors) {
        this.investors = investors;
        this.stocks = stocks
        this.stocks.forEach(stock => {
            stock.IPO();
        });
    }

    act(frame) {
        this.currentFrame = frame;
        this.investors.forEach(investor => {
            investor.update(frame, this.stocks);
        });
        this.stocks.forEach(stock => this.trade(stock));
    }

    getOrders(ticker) {
        // TODO: Memoise this value
        return this.investors
          .filter(investor => (
              investor.isBuying?.status === 'ORDER'
              && investor.isBuying?.stock.ticker === ticker
          )).map(investor => investor.isBuying);
    }

    getClosingPositions(ticker) {
        // TODO: Memoise this value
        return this.investors
          .filter(investor => investor.isSelling)
          .reduce((positions, investor) => ([
              ...positions,
              ...investor.isSelling.filter(pos => (
                  pos.stock.ticker === ticker
                  && pos.status === 'OPEN'
              ))
          ]), []);
    }

    trade(stock) {
        const orders = this.getOrders(stock.ticker);

        if (orders.length) {
            orders.forEach(order => {
                const closingPositions = this.getClosingPositions(order.stock.ticker);

                if (closingPositions.length) {
                    closingPositions.forEach(closingPosition => {
                        if (order.remainingBudget) {
                            if (order.remainingBudget >= closingPosition.value) {
                                order.update(closingPosition.units, this.currentFrame);
                                closingPosition.update(-closingPosition.units, this.currentFrame);
                            } else if (order.remainingBudget < closingPosition.value) {
                                const units = order.remainingBudget/stock.price;
                                order.update(units, this.currentFrame);
                                closingPosition.update(-units, this.currentFrame);
                            }
                        }
                    });
                } else {
                    stock.setPrice(stock.price + 1);
                }
            });
        } else {
            stock.setPrice(Math.max(stock.price - 1, 0));
        }
    }
}
