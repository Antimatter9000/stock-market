class Cache {
    constructor() {
        this.cache = {}
    }

    memoise(fn, deps) {
        const depstr = deps.reduce((str, dep) => {
            return str + dep.reduce((s, dep) => (
                `s${dep.name}`
            ), '');
        }, '');
        if (this.cache[depstr]) {
            return this.cache[depstr];
        } else {
            const result = fn();
            this.cache[depstr] = result;
            return result;
        }
    }
}

export default class Market {
    constructor(companies, investors) {
        this.investors = investors;
        this.companies = companies;
        this.companies.forEach(company => company.IPO());
        this.orderCache = new Cache();
        this.closingPositionCache = new Cache();
    }

    get stocks() {
        // TODO: memoise
        return this.companies.map(company => company.stock);
    }

    act(frame) {
        this.currentFrame = frame;
        this.investors.forEach(investor => {
            investor.update(frame, this.stocks);
        });
        this.stocks.forEach(stock => this.trade(stock));
    }

    getOrders(ticker) {
        // return this.orderCache.memoise(() => {
            return this.investors
              .filter(investor => (
                  investor.isBuying?.status === 'ORDER'
                  && investor.isBuying?.stock.ticker === ticker
              )).map(investor => investor.isBuying);
        // }, [this.investors]);
    }

    getClosingPositions(ticker) {
        // TODO: Memoise this value
        // return this.closingPositionCache.memoise(() => {
            return [...this.investors, ...this.companies]
              .filter(individual => individual.isSelling)
              .reduce((positions, individual) => ([
                  ...positions,
                  ...individual.isSelling.filter(pos => (
                      pos.stock.ticker === ticker
                      && pos.status === 'CLOSING'
                  ))
              ]), []);
        // }, [this.investors, this.companies]);
    }

    trade(stock) {
        const orders = this.getOrders(stock.ticker);

        if (orders.length) {
            orders.forEach(order => {
                const closingPositions = this.getClosingPositions(order.stock.ticker);
                if (closingPositions.length) {
                    closingPositions.forEach(closingPosition => {
                        if (order.remainingBudget) {
                            if (order.remainingBudget >= closingPosition.value || order.units >= stock.circulation) {
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
