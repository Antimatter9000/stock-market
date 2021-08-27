import React, { useMemo, useEffect } from 'react';
import Investor from './Investor';
import Stock from './Stock';
import Market from './Market';

const App = () => {
    const investors = useMemo(() => (
        [...Array(100)].map(_ => new Investor())
    ), []);

    const stocks = useMemo(() => (
        [new Stock('$ROPE')]
    ), []);

    const market = useMemo(() => (
        new Market(stocks, investors)
    ), []);

    useEffect(() => {
        let frame = 0;
        const interval = setInterval(() => {
            market.act(frame);
            const selectedStock = market.stocks.find(stock => stock.ticker === '$ROPE');
            console.log(
                `%c${selectedStock.ticker}: ${selectedStock.price}`,
                "font-weight: bold; background-color: gold; color: black; padding: 3px; font-size: 1.3em; width: 100%;"
            );
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return 'hello';
}

export default App;
