import Position from './Position';
import motivators from './motivators';

export default class Investor {
    constructor(name) {
        this.name = name;
        this.cash = 10000; // this is the investor's entire life savings. Will they #YOLO it all?
        this.maxEquity = this.cash;
        this.confidence = (Math.random() * 99) + 100;
        this.positions = [];
        this.history = [];
        this.isBuying = null;
        this.isSelling = {};
    }

    get bullishness() {
        return this.confidence - 100; // negative bullishness = bearishness
    }

    get equity() {
        return this.cash + this.positions.reduce((total, position) => (
            position.status === 'OPEN'
            ? total + position.value
            : total
        ), 0);
    }

    get stock() {
        return this.positions
            .filter(position => position.status === 'OPEN')
            .reduce((total, position) => total + position.units, 0);
    }

    update(frame, stocks) {
        this.currentFrame = frame;
        this.maxEquity = Math.max(this.maxEquity, this.equity);

        if (this.isSelling?.length) {
            this.isSelling = this.isSelling.reduce((newArr, position) => {
                if (position.status === 'CLOSED') {
                    this.cash += position.value;
                    this.history.push(position);
                    return newArr;
                } else {
                    return [...newArr, position];
                }
            }, []);
        }

        // if we have no unfulfilled orders, evaluate the stocks
        if (!(this.isBuying?.status === 'ORDER')) {
            this.evaluate(stocks);
        }
    }

    evaluate(stocks) {
        // const defaultTimeframe = 1000/this.confidence;
        stocks.forEach(stock => {
            const defaultTimeframe = stock.history.length;
            if (stock.price > 0) {
                const positions = this.positions.filter(position => position.stock.ticker === stock.ticker);
                if (positions.length) {
                    // we have stock
                    // decide whether to buy or sell
                    positions.forEach(position => {
                        // if investor has any positions, they are interested in a drop from the highest peak from which they opened their position
                        // const timeframe = this.currentFrame - position.openTime;
                        const timeframe = stock.history.length;
                        this.decide(timeframe, stock, position);
                    });
                }
                // decide whether to buy
                // really neurotic (1) will worry about a drop over 10 frames; non-neurotic (100) will worry about a drop over 1000 frames
                this.decide(defaultTimeframe, stock);
            } else {
                console.info('stock as fallen to zero');
            }
        });
    }

    decide(timeframe, stock, position) {
        // higher bullishness will mean that they will be less likely to sell when they have made lots of profit
        // higher bullishness will mean that they will be less likely to sell when they have made a loss
        // obviously there will be a point where they do in fact sell

        // INVESTOR_HAS_LOST_MONEY
        // investor is down a certain percent compared to before

        // INVESTOR_HAS_GAINED_MONEY
        // investor is up a certain percent compared to before

        // INVESTOR_IS_RICH
        // investor has high equity compared to others

        // INVESTOR_IS_POOR
        // investor has low equity compared to others

        // INVESTOR_HAS_NOT_INVESTED_MUCH
        // stock value makes up low percentage of equity

        // INVESTOR_HAS_INVESTED_A_LOT
        // stock value makes up high percentage of equity

        // STOCK_HAS_RISEN
        // stock is higher than it was before (timeframe needed)

        // STOCK_HAS_FALLEN
        // stock is lower than it was before (timeframe needed)

        // STOCK_IS_PROFITABLE
        // stock is in profit

        // STOCK_IS_LOSING
        // stock is not in profit


        /* ok, how about we have fewer options for now:
            bullishness decreases while the stock falls
            until it has fallen so much
            that it starts to increase again

            so basically a small drop over a short amount of time will cause a small decrease in bullishness
            this will accumulate at a lessening rate
            until it goes negative and starts to increase bullishness

            timeframe is important.
            different investors think in different timeframes
            more neurotic investors think in short timeframes
            less neurotic investors think in large timeframes
        */
        // console.log('confidence', this.confidence);
        const timeline = stock.history.slice(-timeframe);
        // console.log(timeline);
        console.log(timeline);
        const highestPrice = Math.max(...timeline);
        const lowestPrice = Math.min(...timeline);
        // console.log('curret', stock.price, 'highest', highestPrice);
        const dailyChange = timeline.length > 1
            ? (stock.price - timeline[1])/timeline[1]
            : stock.price;
        // console.log('ch', dailyChange);
        const changeSincePeak = stock.price - highestPrice;
        const changeSinceLow = stock.price - lowestPrice;
        // console.log('changesincepeak', changeSincePeak);
        const timeSincePeak = timeline.reverse().findIndex(price => price === highestPrice); // this will tell us how many frames ago the change occurred
        const timeSinceLow = timeline.reverse().findIndex(price => price === lowestPrice);
        // console.log('tome', timeSincePeak);

        this.confidence = Object.values(motivators).reduce((b, motivator) => {
            return motivator(b, highestPrice, lowestPrice, stock);
        }, 0);


        // DECISION
        if (this.bullishness > 50) {
            // we will buy some stock
            // if investor is quite risk averse, they won't YOLO their entire life savings
            // if they are super bullish and not risk averse at all, they might
            // bullishness of 100 means they will YOLO it all
            // bullishness of 50 means they will use 1% of cash
            const proportionOfCashToUse = 100/(this.bullishness*2);
            const budget = proportionOfCashToUse * this.cash;

            this.openPosition(stock, budget);
        } else if (position && this.bullishness < -50) {
            // bullishness of -100 means they will sell everything

            // const proportionOfStockToSell = 100/((Math.abs(this.bullishness - 50))*2);
            // const amountToSell = proportionOfStockToSell * this.stock;
            this.closePosition(position);
        } else {
            this.doNothing();
        }
    }

    openPosition(stock, budget) {
        this.cash -= budget;
        const position = new Position(stock, budget, this);
        this.isBuying = position;
        this.positions.push(position);
    }

    closePosition(position) {
        position.close();
        this.isSelling[position.id] = position;
    }

    doNothing() {

    }
}