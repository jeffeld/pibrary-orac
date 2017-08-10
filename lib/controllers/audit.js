/**
 * Created by jeff on 28/11/14.
 */

var config = require('../config/config'),
    Q = require('q'),
    _ = require('underscore'),
    mongojs = require ('mongojs'),
    db = mongojs(config.database, ["currentLoans", "loanHistory"])
;

db.currentLoans.ensureIndex ({stockCode: 1});


var CLDB = {

    insert : function (o) {
        var deferred = Q.defer();
        db.currentLoans.insert (o, function (err, data) {
            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    },

    del : function (stockCode) {
        var deferred = Q.defer();
        db.currentLoans.remove ({stockCode: stockCode}, function (err,data) {
            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    }

};

exports.RecordLoan = function (loan, depth) {

    var deferred = Q.defer();

    if (_.isUndefined(depth)) {
        depth = 1;
    } else if (depth > 2) {
       deferred.reject ("RecordLoan below recursion depth");
       return;
    }

    CLDB.insert (loan).then(function (data) {

        deferred.resolve (_.omit(_.extend(loan, { auditId : data._id }), '_id'));

    }, function (error) {

        if (error.code === 11000) {

            // We'll get an error here if the stock code already exists.
            // We need to handle this as the item may not have been properly
            // returned to the library (i.e. just put back on the shelf, and
            // not checked in.

            CLDB.del(loan.stockCode).then(function (data) {
                this.RecordLoan(loan, depth + 1);
            }, function (error) {
                deferred.reject(error);
            });

        } else {
            deferred.reject(error);
        }

    });

    return deferred.promise;

};

exports.RecordReturn = function  (stockCode) {

    var deferred = Q.defer();

    db.currentLoans.findOne ({stockCode: stockCode}, function (err, data) {

        if (err) {
            deferred.reject (err);
        } else {

            // There has not been a loan with this stock code
            if (data === null) {
                deferred.resolve ({});
                return;
            }

            var theLoan = _.omit(_.extend (data, {actualReturnDate: new Date(), auditId: data._id}), '_id');

            db.loanHistory.insert (theLoan, function (err, res) {

                if (err) {
                    deferred.reject(err);
                }

                db.currentLoans.remove ({_id : data._id}, function (err2, data2) {

                    if (err2) {
                        deferred.reject (err2);
                    } else {
                        deferred.resolve (theLoan);
                    }

                });

            });

        }

    });

    return deferred.promise;

};