'use strict';

var config = require('../config/config'),
    Q = require ('q'),
    _ = require ('underscore'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["isbns"])
;

exports.getISBN = function (isbn) {

    var deferred = Q.defer();

    db.isbns.findOne (
        {isbn:isbn},
        {_id: 0},
        function (err,data) {
            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve (data || {});
            }
        }
    );

    return deferred.promise;
};
