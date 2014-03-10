
'use strict';

var http = require ('http');

var options = {

    host : "isbndb.com",
    path : "/api/v2/json/",
    api_key : "XXXXXX",
    port : 80,


    getISBNPath : function (isbn) {
        return this.getISBNDBPath() + "/book/" + isbn;
    },

    getISBNDBPath : function () {
        return (this.port === 443 ? "https" : "http" ) + "://" + this.host + this.path + this.api_key;
    }

};

exports.setApiKey = function (k) {
    options.api_key = k;
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

