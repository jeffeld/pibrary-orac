'use strict';

var Q = require ('q'),
    _ = require('underscore'),
    rest = require ('./restlerx'),
    restOptions = {timeout: process.env.OPENLIBRARY_TIMEOUT || 10 * 1000};

function determineTitle (data) {
  return data.title;
}

function determineAuthor (data) {
  return (data.authors.length > 0 ? data.authors[0].name : '');
}

// Returns a promise that will be fulfilled
exports.GetByISBN = function (isbn) {

  var deferred = Q.defer(),
      path = 'http://openlibrary.org/api/books?bibkeys=ISBN:' + isbn + '&format=json&jscmd=data';

  rest.get (path, restOptions).then(function (data) {

    var item = {}, theData = data.data[Object.keys(data.data)[0]];

    if (_.isEmpty(theData)) {
      deferred.reject (404);
    } else {

      item.source = "openlibrary";
      item.isbn = isbn;
      item.search_title = determineTitle(theData);
      item.search_author = determineAuthor(theData);
      item.data = theData;

      deferred.resolve (item);
    }


  }, function (error) {
    deferred.reject (error);
  });

  return deferred.promise;

};




