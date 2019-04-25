let chai = require('chai'),
    chaiHttp = require('chai-http');
let expect = require('chai').expect;
let { appServices } = require('./index');
const API_KEY = process.env.API_KEY;

chai.use(chaiHttp);

let requester = chai.request(appServices).keepOpen();


describe('AlgoTradeDBRouter', function() {
    describe('/db/watched_assets', function() {
        it('GET watched assets should return list of assets', function(done) {
            requester
                .get('/services/db/watched_assets')
                .end(function(err, res) {
                    let data = JSON.parse(res.text);
                    expect(data).to.be.a('array');
                    expect(res).to.have.status(200);
                    done();
                });
        });

    });
});

describe('AlphaVantageRouter', function() {

    describe('/alphavantage/quote', function() {
        it('GET request with no query values', function(done) {
            requester
                .get('/services/alphavantage/quote')
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    done();
                });
        });

        it('GET request with valid query value', function(done) {
            requester
                .get('/services/alphavantage/quote')
                .query({ticker_name: 'TSX:MSI'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        });

        it('GET request with invalid query value', function(done) {
            requester
                .get('/services/alphavantage/quote')
                .query({ticker_name: 'TSX:MS'})
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    done();
                });
        });

    });

    describe('/alphavantage/dailydata', function() {
        it('GET request with valid query', function(done) {
            requester
                .get('/services/alphavantage/dailydata')
                .query({ticker_name: 'TSX:MSI', output_size: 'compact'})
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
        });


        it('GET request with invalid ticker_name', function(done) {
            requester
                .get('/services/alphavantage/dailydata')
                .query({ticker_name: 'TSX:MS', output_size: 'compact'})
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    done();
                });
        });

        it('GET request with no query values', function(done) {
            requester
                .get('/services/alphavantage/dailydata')
                .end(function(err, res) {
                    expect(res).to.have.status(404);
                    done();
                });
        });
    });
});

