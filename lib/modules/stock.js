'use strict';

var http = require ('http'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs(config.database, ["stock", "isbns"]),
    members = require ('./members'),
    isbn = require ('./isbn'),
    Q = require ('q'),
    _ = require ('underscore')
;

exports.getStock = function (itemId) {

    var deferred = Q.defer();

    db.stock.findOne ({itemId : itemId}, {_id : 0}, function (err,data){

        if (err) {
            deferred.reject (err);
        } else {
            deferred.resolve (data || {});
        }

    });

    return deferred.promise;
};

exports.getISBNDetailsByStockCode = function (itemId) {

    var deferred = Q.defer();

    this.getStock (itemId).then(function (stockItem) {

        isbn.getISBN (stockItem.itemCode).then(function (isbn) {
            deferred.resolve (isbn);
        });

    });

    return deferred.promise;
};

exports.putStock = function () {
};

exports.deleteStock = function () {
};

exports.OnStockLoan = function (theLoan) {

    db.stock.update(
        {
            itemId: theLoan.stockCode
        },

        {
            $set: {
                loan: theLoan,
                lastLoan: theLoan.loanDate,
                lastModified : theLoan.loanDate
            },
            $inc: {
                numLoans : 1
            }
        },

        {
            upsert: false,
            multi: false
        },

        function (err, data) {

            if (err) {
                console.log (err);
            }
        }
    );
};

exports.OnStockReturn = function (theLoan) {

    var ts = Date.now();

    db.stock.update (
        {
            itemId: theLoan.stockCode
        },

        {
            $unset : {
                loan : {}
            },
            $set : {
                lastModified : ts
            }
        },

        {
            upsert: false,
            multi: false
        }
    );

};

//exports.returnStock = function (stockCode) {
//
//    var deferred = Q.defer(),
//        ts = Date.now();
//
//    db.stock.update (
//        {
//            itemId: stockCode
//        },
//
//        {
//            $unset : {
//                loan : {}
//            },
//            $set : {
//                lastModified : ts
//            }
//        },
//
//        {
//            upsert: false,
//            multi: false
//        },
//
//        function (err, data) {
//
//            if (err) {
//                deferred.reject (err);
//            } else {
//                deferred.resolve ("Returned");
//            }
//        }
//    );
//
//    return deferred.promise;
//};
//
