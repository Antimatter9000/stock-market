import React, { useMemo, useEffect, useState } from 'react';
import mocker from 'mocker-data-generator';
import Investor from './Investor';
import Company from './Company';
import Market from './Market';

const App = () => {
    const [ stockPrice, setStockPrice ] = useState(0);
    const [ investorNames, setInvestorNames ] = useState([]);
    const [ investorList, setInvestorList ] = useState([]);

    useEffect(() => {
        mocker().schema(
            'username', {
                firstName: { faker: 'name.firstName' },
                lastName: { faker: 'name.lastName' },
            }, 10
        ).build((error, data) => {
            if (error) console.error(error);
            setInvestorNames(data.username.map(item => `${item.firstName} ${item.lastName}`));
        })
    }, []);

    const investors = useMemo(() => (
        investorNames.length && investorNames.map(name => new Investor(name))
    ), [investorNames]);

    const companies = useMemo(() => (
        [new Company()]
    ), []);

    const market = useMemo(() => (
        investors.length ? new Market(companies, investors) : null
    ), [investors]);

    useEffect(() => {
        if (market) {
            let frame = 0;
            const interval = setInterval(() => {
                market.act(frame);
                const selectedStock = market.stocks.find(stock => stock.ticker === '$ROPE');
                setStockPrice(selectedStock.price);
                setInvestorList(market.investors);
                frame++;
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [market]);

    return (
        <div>
            <p>Stock price is <strong>{stockPrice}</strong></p>
            {investorList.length ? investorList.map(investor => (
                <li>{investor.name} {investor.stock} {Math.round(investor.bullishness)} {investor.isBuying ? '(buying)' : (investor.isSelling?.length ? '(selling)' : '')}</li>
            )) : <p>No investors</p>}
        </div>
    );
}

export default App;
