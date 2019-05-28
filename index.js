require('../config/config');

const express = require('express');
let appServices = express();
const {mongodbConnector} = require('./apis/algoTradeSysDBConnectors'); //connects to db
const cors = require('cors');
const bodyParser = require('body-parser');


let { userRouter } = require('./routes/userRouter');
let { algotradedbRouter }  = require('./routes/algotradedbRouter');
let { alphaVantageRouter } = require('./routes/alphavantageRouter');

// let corsOptions = {};

appServices.use(cors());

appServices.use(bodyParser.json());
appServices.use('/services/user', userRouter);
appServices.use('/services/db', algotradedbRouter);
appServices.use('/services/alphaVantage', alphaVantageRouter);

appServices.listen(3000, () => {
    console.log(`Server is up ${3000}`);
});

module.exports = { appServices };