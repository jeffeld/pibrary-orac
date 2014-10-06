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
    app.put(apiV1Path + '/isbn/:isbn', apiV1.putISBN);

    // Item routes

    app.get(apiV1Path + '/stock/:itemId', apiV1.getStock);
    app.put(apiV1Path + '/stock/:itemId/:itemCode', apiV1.putStock);
    app.put(apiV1Path + '/stock/:itemId/:itemCode/:addedby', apiV1.putStock);
    app.delete(apiV1Path + '/stock/:itemId', apiV1.deleteStock);

    app.get(apiV1Path + '/stock/codes/:num/:spatial', stockCodes.generate);
    app.get(apiV1Path + '/stock/codes/:num', stockCodes.generate);

    // Member routes

    app.get (apiV1Path + '/members/:memberId', apiV1.getMember);
    app.put (apiV1Path + '/members/:memberId', apiV1.putMember2);

   // Loan routes

    app.put(apiV1Path + '/lend/:stockCode/:membershipCode', apiV1.lendStock);
    app.put(apiV1Path + '/return/:stockCode', apiV1.returnStock);
    app.put(apiV1Path + '/renew/:stockCode', apiV1.putRenew);

    // Search routes

    app.get (apiV1Path + '/search', apiV1.getSearch);

    // Statistics routes

    app.get (apiV1Path + '/stats/recentlyadded', apiV1.getRecentlyAdded);

    // All undefined api routes should return a 404

    app.get('/api/*', function (req, res) {
        res.send(404);
    });

    // All other routes to use Angular routing in app/scripts/app.js

    app.get('/partials/*', index.partials);
    app.get('/*', index.index);
};