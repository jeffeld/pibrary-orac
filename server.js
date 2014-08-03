'use strict';

var express = require('express');

// var redis = require('redis');
// var redisClient = redis.createClient();
// var orac_api_key = "9876";
//redisClient.get ('orac_api_key', function (err, reply)
//    {
//        // console.log (reply);
//
//        if (err) {
//            console.log ('orac_api_key hot found!');
//        }
//
//        orac_api_key = reply;
//
//    });
// console.log ('orac api key == ' + orac_api_key);


/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');
var isbndb = require('./lib/modules/isbndb');
var apiV1 = require('./lib/controllers/apiV1');
isbndb.setApiKey(config.isbndb_api_key);

// Database config

var mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["stock", "isbns", "members"]);

db.stock.ensureIndex({itemId : 1}, {unique : true});
db.members.ensureIndex({memberId : 1}, {unique : true});

apiV1.seedTestCodes();

var app = express();

app.use(function (req, res, next){
   res.setHeader ('X-Powered-By', 'Orac');
   next();
});

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Start server
app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;