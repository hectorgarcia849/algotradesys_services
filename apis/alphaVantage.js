const axios = require('axios');
const AV_URL = 'https://www.alphavantage.co';

module.exports = axios.create({
    baseURL: AV_URL
});