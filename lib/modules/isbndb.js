
'use strict';

var http = require ('http'),
    restler = require ('restler'),
    rest = require ('./restlerx'),
    Q = require('q'),
    _ = require('underscore');

var restOptions = {
  timeout: process.env.ISBNDB_TIMEOUT || 10 * 1000,
  parser: restler.parsers.json
}

var options = {

    host : "isbndb.com",
    path : "/api/v2/json/",
    api_key : "XXXXXX",
    port : 80,


    getISBNPath : function (isbn) {

        var path = this.getISBNDBPath() + "/book/" + isbn;
        console.log (path);
        return path;
    },

    getISBNDBPath : function () {
        return (this.port === 443 ? "https" : "http" ) + "://" + this.host + this.path + this.api_key;
    }

};

function stringDefinedAndHasLength (s) {
  return (!_.isUndefined(s)) && _.isString(s) && s.length > 0;
}

function determineTitle (o) {

  var t = '',
    ut = 'UNDETERMINED TITLE';

  if ((_.isUndefined(o)) || (!_.isObject(o)) ) {
    t = ut;
  } else if (stringDefinedAndHasLength(o.title)) {
    t = o.title;
  } else if (stringDefinedAndHasLength(o.title_latin)) {
    t = o.title_latin;
  } else if (stringDefinedAndHasLength(o.title_long)) {
    t = o.title_long;
  }

  if (t === '') {
    t = ut;
  }

  return t;
}

function determineAuthor (o) {

  var a ='', ua = '';

  if ((_.isUndefined(o.author_data)) || (!_.isArray(o.author_data)) || (o.author_data.length === 0)) {
    a = ua;
  } else if (stringDefinedAndHasLength(o.author_data[0].name)) {
    a = o.author_data[0].name;
  } else {
    a = ua;
  }

  return a;
}

exports.setApiKey = function (k) {
    options.api_key = k;
};

exports.getByISBN2 = function (isbn) {

  var deferred = Q.defer(),
      path = options.getISBNPath(isbn);

  console.log ("Requesting " + path);

  rest.get (path, restOptions).then(function (resolved) {

    var data = resolved.data;

    if (data.hasOwnProperty("error")) {
      deferred.reject (404);
    } else {

      data.source = "isbndb";
      data.isbn = isbn;
      data.search_title = determineTitle(data.data[0]);
      data.search_author = determineAuthor(data.data[0]);

      deferred.resolve (data);
    }

  }, function (error) {
    deferred.reject (error);
  });

  return deferred.promise;
};


exports.getByISBN = function (res, isbn, callback) {

    var req = http.get (options.getISBNPath(isbn), function (r) {

        var chunks = [],
            o = {},
            data;

        if (r.statusCode === 200) {

            // We got a 200 response, but that doesn't mean that the
            // ISBN was found.

            // De-serialize the data.

            r.on('data', function(chunk) {
                chunks.push (chunk);
            }).on('end', function () {

                // Convert the deserialized JSON data string to a JavaScript object.

                data = JSON.parse(Buffer.concat(chunks));
                if (data.hasOwnProperty("error")) {

                    // If the resultant object has an "error" property, then the book
                    // was not found.

                    callback(404);

                } else {

                    // The book was found. Return the data to the caller.

                    callback (200, data);
                }

            });

        } else {

            // Something went very wrong. Return 500

            callback(500);

        }

    });

};

