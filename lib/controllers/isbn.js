"user strict";

var
  config = require ('../config/config'),
  mongojs = require ('mongojs'),
  db = mongojs.connect(config.database, ["isbns"]),
  Q = require ('../../node_modules/q'),
  isbndb = require ('../modules/isbndb'),
  openlib = require ('../modules/openlibrary')
;


exports.GetFromExternalSources = function (isbn) {

  var deferred = Q.defer();

  Q.any ([
    openlib.GetByISBN(isbn),
    isbndb.getByISBN2(isbn)
  ]).then(function (data) {

    console.log ("Request for " + isbn + " winner: " + data.source);

    // Save data to database, using an upsert

    data.added = Date.now();
    data.stock_codes = [];

    db.isbns.update ({ isbn : isbn },
      data,
      { upsert : true },
      function () {

        deferred.resolve (data);
      }
    );
  }, function (error) {
    deferred.reject (404);
  });

  return deferred.promise;


};


