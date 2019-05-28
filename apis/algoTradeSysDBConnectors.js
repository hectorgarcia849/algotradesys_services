const mysql = require('mysql');

mySQLConnector = (query) => {
    return new Promise((resolve, reject) => {
        let connection = mysql.createConnection({host: 'localhost', user:'root', password: process.env.MYSQL_PW, database:'algotradedb'});
        connection.connect((e) => {
            connection.query(query, (error, results, fields) => {
                if(error) reject(error);
                resolve(results);
            });
        });
    });
};

const  mongodbConnector = require('mongoose');

mongodbConnector.Promise = global.Promise; //need to let mongoose know that you want to use default promises that come with es6
mongodbConnector.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .then(() => console.log('Connected to Database'))
    .catch((e) => console.log('db Connection Error', e));

module.exports = { mySQLConnector, mongodbConnector };
