'use strict';

var http = require ('http'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["stock", "isbns"]),
    members = require ('./members'),
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

exports.putStock = function () {
};

exports.deleteStock = function () {
};

function MarkStockOnLoanToMember (stockCode, membershipCode) {

    var deferred = Q.defer(),
        ts = Date.now();

    db.stock.update(
        {
            itemId: stockCode
        },

        {
            $set: {
                loan: {
                    membershipCode: membershipCode,
                    date: ts
                },
                lastModified : ts
            }
        },

        {
            upsert: false,
            multi: false
        },

        function (err, data) {

            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve(data);
            }
        });

    return deferred.promise;

}


exports.lendStock = function (stockCode, membershipCode) {

    var deferred = Q.defer(),
        checks = [members.getMember(membershipCode), this.getStock(stockCode)];


    // Validate that the stockCode and membershipCode exist!

    Q.allSettled (checks).then (function(data) {

        // The get functions used for membershipCode and stockCode
        // resolve to an empty object if the codes aren't found
        // (rather than reject the promise).

        if (_.isEmpty(checks[0]) || _.isEmpty(checks[1])) {
            deferred.resolve ({});
        } else {

            // The codes do exists, so lend the item

            Q.allSettled ([
                MarkStockOnLoanToMember (stockCode, membershipCode),
                members.AddLoan (membershipCode, stockCode)
                // TODO: Add a history table/journal
            ]).then(function () {
                deferred.resolve ("Loaned");
            });

        }


    }, function (error) {

        deferred.reject (error);

    });

    return deferred.promise;
}

exports.returnStock = function (stockCode) {

    var deferred = Q.defer(),
        ts = Date.now();

    db.stock.update (
        {
            itemId: stockCode
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
        },

        function (err, data) {

            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve ("Returned");
            }
        }
    );

    return deferred.promise;
};

