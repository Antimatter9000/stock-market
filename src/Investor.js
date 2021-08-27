// import Chance from 'chance';
import Position from './Position';

// const chance = new Chance();

export default class Investor {
    constructor() {
        // this.name = chance.name();
        this.name = 'Bob';
        this.cash = 10000; // this is the investor's entire life savings. Will they #YOLO it all?
        this.maxEquity = this.cash;
        this.confidence = (Math.random() * 99) + 1;
        this.history = [];
    }

    get bullishness() {
        return this.confidence - 50; // negative bullishness = bearishness
    }

    get equity() {
        return this.cash + this.positions.reduce((total, position) => total + position.value, 0);
    }

    get stock() {
        return this.positions.reduce((total, position) => total + position.units, 0);
    }

    get positions() {
        return [
            ...(this.isBuying ? [this.isBuying] : []),
            ...(this.isSelling?.length ? this.isSelling : [])
        ];
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

        this.evaluate(stocks);
    }

    evaluate(stocks) {
        const defaultTimeframe = 1000/this.confidence;
        stocks.forEach(stock => {
            const positions = this.positions.filter(position => position.stock.ticker === stock.ticker);
            if (positions.length) {
                // we have stock
                // decide whether to buy or sell
                positions.forEach(position => {
                    // if investor has any positions, they are interested in a drop from the highest peak from which they opened their position
                    const timeframe = this.currentFrame - position.openTime;
                    this.decide(timeframe, stock, position);
                });
            }
            // decide whether to buy
            // really neurotic (1) will worry about a drop over 10 frames; non-neurotic (100) will worry about a drop over 1000 frames
            this.decide(defaultTimeframe, stock);
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

        const timeline = stock.history.slice(-timeframe);
        const highestPrice = Math.max(timeline);
        const dailyChange = (timeline[1] - stock.price)/timeline[1];
        const changeSincePeak = (highestPrice - stock.price)/highestPrice;
        const timeSincePeak = timeline.reverse().findIndex(price => price === highestPrice); // this will tell us how many frames ago the change occurred

        // the more neurotic the investor, the more the change is likely to affect them
        // for example, a 5% drop may lead a neurotic investor to sell everything, while a less neurotic one may see it as an opportunity to buy the dip
        // should neurosis and bullishness be different measures?
        // or would bullishness beget bullishness?
        // - neurosis would affect the timeframe on which to be bullish
        // - neurosis and bullishness could both affect the changeImpact here
        // let's say dailyChange is 0.05
        // -- hang on - surely the market should decide how bullish it should be; now the investor's neurosis may go up and down though
        // --- not really, we still need to figure out timelines
        // -- well we could say that more confident investors will care about longer timelines
        // -- but if someone was really confident and then lost all their money, they may start to care more about shorter timelines
        // -- we should rename neurosis to confidence and have that as the only measure
        const changeImpact = dailyChange * this.confidence;
        
        // we want bullishness to start to increase once the stock gets low enough
        // a sudden drop will cause increased bullishness
        // a long decline will cause decreased bullishness at the start, but increased bullishness after a while
        const changeSignificance = changeImpact / timeSincePeak;


        // DECISION
        if (this.bullishness > 50) {
            // we will buy some stock
            // if investor is quite risk averse, they won't YOLO their entire life savings
            // if they are super bullish and not risk averse at all, they might
            // bullishness of 100 means they will YOLO it all
            // bullishness of 50 means they will use 1% of cash
            const proportionOfCashToUse = 100/((this.bullishness - 50)*2);
            const budget = proportionOfCashToUse * this.cash;
            this.openPosition(stock, budget);
        } else if (position && this.bullishness < -50) {
            const proportionOfStockToSell = 100/((Math.abs(this.bullishness - 50))*2);
            const amountToSell = proportionOfStockToSell * this.stock;
            this.closePosition(position);
        } else {
            this.doNothing();
        }
    }

    openPosition(stock, budget) {
        this.cash -= budget;
        this.isBuying = new Position(stock, budget);
    }

    closePosition(position) {
        this.isSelling.push(position);
    }

    doNothing() {

    }
}