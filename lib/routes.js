'use strict';

var apiV1 = require('./controllers/apiV1'),
    stock = require('./modules/stock'),
    stockCodes = require('./modules/stock-codes'),
    index = require('./controllers'),

    members = require('./modules/members'),
    apiV1Path = "/api/v1";

/**
 * Application routes
 */
module.exports = function (app) {

    // Server API Routes


    // ISBN routes

    app.get(apiV1Path + '/isbn/:isbn', apiV1.getISBN);
    app.post(apiV1Path + '/isbn/:isbn', apiV1.postISBN);

    // Item routes

    app.get(apiV1Path + '/stock/:itemId', stock.getStock);
    app.put(apiV1Path + '/stock/:itemId/:itemCode', stock.putStock);
    app.delete(apiV1Path + '/stock/:itemId', stock.deleteStock);

    app.get(apiV1Path + '/stock/codes/:num', stockCodes.generate);

    // Member routes

    app.get (apiV1Path + '/members/:memberId', members.getMember);
    app.put (apiV1Path + '/members/:memberId', members.putMember);

    // Loan routes

    app.put(apiV1Path + '/loan/:bookid/:memberid', apiV1.putLoan);

    // All undefined api routes should return a 404

    app.get('/api/*', function (req, res) {
        res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js

    app.get('/partials/*', index.partials);
    app.get('/*', index.index);
};