import React, { useMemo, useEffect, useState } from 'react';
import Investor from './Investor';
import Stock from './Stock';
import Market from './Market';

const App = () => {
    const [ stockPrice, setStockPrice ] = useState(0);

    const investors = useMemo(() => (
        [...Array(100)].map(_ => new Investor())
    ), []);

    const stocks = useMemo(() => (
        [new Stock('$ROPE')]
    ), []);

    const market = useMemo(() => (
        new Market(stocks, investors)
    ), [investors, stocks]);

    useEffect(() => {
        let frame = 0;
        const interval = setInterval(() => {
            market.act(frame);
            const selectedStock = market.stocks.find(stock => stock.ticker === '$ROPE');
            setStockPrice(selectedStock.price);
        }, 500);
        return () => clearInterval(interval);
    }, [market]);

    return <p>Stock price is <strong>{stockPrice}</strong></p>;
}

export default App;
