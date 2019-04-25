require('../../config/config');
const express = require('express');
const algotradedbRouter = express.Router();
const mySQLConnector = require('../apis/algoTradeSysDBConnector');
const API_KEY = process.env.API_KEY;


algotradedbRouter.get('/watched_assets', (req, res) => {

    // get financial data for all watched_assets
    let query = 'SELECT * FROM watched_asset;';
    mySQLConnector(query)
        .then((assets) => {
            res.status(200).send(assets);
        })
        .catch((e) => {
            res.status(404).send(e);
        });
});

algotradedbRouter.post('/watched_assets', (req, res) => {
    // api:
    // interval <optional>
    // ticker_name
    // output_size
    // asset_name
    // asset_type
    // time_series_function

    console.log('validating req params prior to adding to db w/call to AV', API_KEY);

    let interval = req.query['interval'] === undefined ? '' : req.query['interval'],
        ticker_name = req.query['ticker_name'] === undefined ? res.status(404).send('invalid ticker_name'): req.query['ticker_name'],
        func = req.query['time_series_function'],
        outputsize = req.query['output_size'] === undefined ? '' : req.query['output_size'],
        asset_name = req.query['asset_name'],
        asset_type = req.query['asset_type'];

    let query =
        `INSERT INTO 
                    watched_asset(asset_name, ticker_name, asset_type_id, interval_range, time_series_function, output_size)
                VALUES
                    ('${asset_name}', '${ticker_name}', (SELECT asset_type.id FROM asset_type WHERE asset_type.asset_type = '${asset_type}'), '${interval}', '${func}', '${outputsize}');`;
    mySQLConnector(query)
        .then((sqlRes) => {
            console.log(sqlRes);
            res.send(`Successfully added ${ticker_name}`);
        })
        .catch((e) => {
            res.send('error, could not update database ' + e.sqlMessage);
        });
    });

algotradedbRouter.delete('/watched_assets', (req, res) => {
    // api:
        // ticker_name

    let ticker_name = req.query['ticker_name'];
    let query = `DELETE FROM watched_asset WHERE ticker_name = "${ticker_name}";`;

    mySQLConnector(query)
        .then((asset) => {
            res.send(`Successfully deleted symbol ${ticker_name}`);
        })
        .catch((e) => {
            res.send(e, `Failed to delete ${ticker_name}, ${e.sqlMessage}`);
        });
});

algotradedbRouter.get('/dailydata/:ticker_name', (req, res) => {
    let ticker_name = req.params.ticker_name.replace(':', '_');

    let query = `SELECT * FROM ${ticker_name}_daily;`;
    mySQLConnector(query).then((sqlResponse) => res.send(sqlResponse)).catch((e) => res.send(e));
});

algotradedbRouter.post('/dailydata/:ticker_name', (req, res) => {

    console.log(req.params);

    let ticker_name = req.params.ticker_name.replace(':', '_');

    let createTable =
        `CREATE TABLE IF NOT EXISTS
                            ${ticker_name}_daily (id INT AUTO_INCREMENT, market_date DATE UNIQUE, open_price DOUBLE, high_price DOUBLE, low_price DOUBLE, close_price DOUBLE, adj_close_price DOUBLE, volume DOUBLE,  dividend DOUBLE, split_coefficient DOUBLE, PRIMARY KEY(id));
                      `;

    let insertValues =
        `INSERT INTO ${ticker_name}_daily (market_date, open_price, high_price, low_price, close_price, adj_close_price, volume, dividend, split_coefficient)
         Values
         `;

    let data = req.body.data;
    console.log(data);
    data.map((o) => {

        let date = o['date'],
            openPrice = o['open'],
            highPrice = o['high'],
            lowPrice = o['low'],
            closePrice = o['close'],
            adjClosePrice = o['adj. close'],
            volume = o['volume'],
            dividendAmount = o['dividend'],
            splitCoefficient = o['split coeff.'];

        insertValues += ` (DATE("${date}"), ${openPrice}, ${highPrice}, ${lowPrice}, ${closePrice}, ${adjClosePrice}, ${volume}, ${dividendAmount}, ${splitCoefficient}),`;

    });

    const onDupKey = ` ON DUPLICATE KEY UPDATE market_date = market_date`;
    insertValues = insertValues.slice(0, -1) + onDupKey + ';';
    // console.log(insertValues);
    mySQLConnector(createTable)
        .then((createTableResponse) => {
            console.log(createTableResponse);
            mySQLConnector(insertValues)
                .then((insertResponse) => res.send(insertResponse))
                .catch((e) => res.send(e));
        }).catch((e) => res.send(e));
});



module.exports = { algotradedbRouter };

