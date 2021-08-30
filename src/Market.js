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
        console.log('companies', companies[0].isSelling);
        this.companies.forEach(company => company.IPO());
        console.log('companies', companies[0].isSelling);
    }

    get stocks() {
        // TODO: memoise
        return this.companies.map(company => company.stock);
    }

    act(frame) {
        console.log('act', frame, this.companies[0].isSelling);
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
              .filter(individual => Object.keys(individual.isSelling).length)
              .reduce((positions, individual) => ([
                  ...positions,
                  ...Object.values(individual.isSelling).filter(pos => (
                      pos.stock.ticker === ticker
                      && pos.status === 'CLOSING'
                  ))
              ]), []);
        // }, [this.investors, this.companies]);
    }

    trade(stock) {
        const orders = this.getOrders(stock.ticker);

        if (orders.length) {
            console.log('there are', orders.length, 'orders');
            // orders.forEach(order => {
            //     const closingPositions = this.getClosingPositions(order.stock.ticker);
            //     const allStockIsOrdered = orders.reduce((total, ord) => {
            //         return order.units + total
            //     }, 0) > stock.circulation;
            //     if (closingPositions.length) {
            //         closingPositions.forEach(closingPosition => {
            //             if (order.remainingBudget) {
            //                 if (allStockIsOrdered) {
            //                     order.update(closingPosition.units, this.currentFrame);
            //                     order.completeOrder(this.currentFrame);
            //                     closingPosition.update(-closingPosition.units, this.currentFrame);
            //                 } else if (order.remainingBudget >= closingPosition.value) {
            //                     order.update(closingPosition.units, this.currentFrame);
            //                     closingPosition.update(-closingPosition.units, this.currentFrame);
            //                 } else if (order.remainingBudget < closingPosition.value) {
            //                     const units = order.remainingBudget/stock.price;
            //                     order.update(units, this.currentFrame);
            //                     closingPosition.update(-units, this.currentFrame);
            //                 }
            //             }
            //         });
            //     } else {
            //         stock.setPrice(stock.price + 1);
            //     }
            // });
            const closingPositions = this.getClosingPositions(stock.ticker);      

            orders.forEach(order => {
                // at the start there will be 1000 stock and investors will be asking for
                // up to 1000
                if (order.remainingBudget) {
                    console.log(`${order.investor.name} has ${order.remainingBudget} left`);
                    if (closingPositions.length) {
                        console.log('there are', closingPositions.length, 'closing positions:', closingPositions);
                        this.buyUnits(order, closingPositions);
                    } else {
                        stock.setPrice(stock.price + 1);
                    }
                } else {
                    order.completeOrder(this.currentFrame);
                }
            })
        } else {
            stock.setPrice(Math.max(stock.price - 1, 0));
        }
    }

    buyUnits(order, closingPositions) {    
        closingPositions.forEach(closingPosition => {
            if (order.remainingBudget < closingPosition.value) {
                // close part of closingPostion
                const units = order.remainingBudget/order.stock.price;
                order.update(units, this.currentFrame);
                closingPosition.update(-units, this.currentFrame);
                console.log(`${order.investor.name} just added ${units} units to their position`);
            } else if (order.remainingBudget >= closingPosition.value) {
                order.update(closingPosition.units, this.currentFrame);
                closingPosition.update(-closingPosition.units, this.currentFrame);
                closingPosition.completeClose(this.currentFrame);
            } else {
                console.error('There are orders and closingPositions but we cant match them together');
            }
        });
    }
}
