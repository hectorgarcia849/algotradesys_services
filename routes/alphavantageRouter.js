require('../../config/config');
const express = require('express');
const alphaVantageRouter = express.Router();
const alphaVantage =  require('../apis/alphaVantage');
const API_KEY = process.env.API_KEY;



alphaVantageRouter.get('/alphavantage/quote', (req, res) => {
    // api
        // ticker_name

    let symbol = req.query['ticker_name'];

    if (symbol) {
        alphaVantage.get(`/query?symbol=${symbol}&function=GLOBAL_QUOTE&apikey=${API_KEY}`)
            .then((avRes) => {

                if(Object.keys(avRes.data['Global Quote']).length > 0) {
                    res.status(200).send({
                        symbol,
                        isValid: true,
                        data: avRes.data
                    });
                } else {
                    res.status(404).send({
                        symbol,
                        isValid: false,
                        errorMessage: 'Invalid Symbol'
                    });
                }
            })
            .catch((e) => {
                res.status(404).send({
                    symbol,
                    isValid: false,
                    errorMessage: e
                });
            });
    } else {
        res.status(404).send({
            symbol,
            isValid: false,
            errorMessage: "Invalid Symbol"
        })
    }

});

alphaVantageRouter.get('/alphavantage/dailydata', (req, res) => {

    // api
        // ticker_name
        // output_size

    let symbol = req.query['ticker_name'],
        outputsize = req.query['output_size'] === undefined ? 'compact' : req.query['output_size'];

    alphaVantage.get(`/query?symbol=${symbol}&function=TIME_SERIES_DAILY_ADJUSTED&apikey=${API_KEY}&outputsize=${outputsize}`)
        .then((avResponse) => {
            let timeSeries = "Time Series (Daily)";
            let data = {};
            data['data'] = Object.keys(avResponse.data[timeSeries]).map(date => standardizeAVDataKeyNames(avResponse.data[timeSeries][date], date, symbol));

            if(data['data'].length > 0) {
                res.status(200).send(data);

            } else {
                data['errorMessage'] = 'No records found, the ticker_name may be invalid or the AlphaVantage servers may be down.';
                res.status(404).send(data);
            }
        })
        .catch((e) => res.status(404).send('error: ' +  e));
});

module.exports = { alphaVantageRouter };

function standardizeAVDataKeyNames(o, k, symbol) {
    const newObj = {};
    newObj['symbol'] = symbol;
    newObj['date'] = k;
    newObj['open'] = o['1. open'];
    newObj['high'] = o['2. high'];
    newObj['low'] = o['3. low'];
    newObj['close'] = o['4. close'];
    newObj['adj. close'] = o['5. adjusted close'];
    newObj['volume'] = o['6. volume'];
    newObj['dividend'] = o['7. dividend amount'];
    newObj['split coeff.'] = o['8. split coefficient'];
    return newObj;
}
