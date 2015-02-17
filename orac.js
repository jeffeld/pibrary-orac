'use strict';

var express = require('express');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Application Config
var config = require('./lib/config/config');
var isbndb = require('./lib/modules/isbndb');
var apiV1 = require('./lib/controllers/apiV1');
isbndb.setApiKey(config.isbndb_api_key);

// Application Event Management
require('./lib/appevents');

// Database config

var mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["stock", "isbns", "members"]);

db.stock.ensureIndex({itemId : 1}, {unique : true});
// db.members.ensureIndex({memberId : 1}, {unique : true});
db.isbns.ensureIndex({search_title : "text", search_author : "text"});

var app = express();

app.use(function (req, res, next){
   res.setHeader ('X-Powered-By', 'Orac');
   next();
});

app.use(function (req, res, next){

  var serviceNotConfigured = 'Service not configured';
  if (config.isbndb_api_key === undefined) {
    console.error ('ORAC_ISBNDB_KEY not defined');
    res.send (500, serviceNotConfigured);
    return;
  }

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
