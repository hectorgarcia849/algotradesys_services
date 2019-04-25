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


module.exports = mySQLConnector;
