const express = require('express');
let appServices = express();
let { algotradedbRouter }  = require('./routes/algotradedbRouter');
let { alphaVantageRouter } = require('./routes/alphavantageRouter');
const bodyParser = require('body-parser');

appServices.use(bodyParser.json());
appServices.use('/services/db', algotradedbRouter);
appServices.use('/services', alphaVantageRouter);

appServices.listen(3000, () => {
    console.log(`Server is up ${3000}`);
});

module.exports = { appServices };