'use strict';

//
// Type: Memver type (impacts number of loans etc.)
//
// ST   - Student
// LI   - Librarian
// SY   - Sys admin
// BU   - Bulk loanee (e.g. teachers)
//
//

var config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["members"]),
    _ = require('underscore'),
    Q = require('q'),
    stock = require ('./stock')
;

exports.getMember = function (memberId) {

    var deferred = Q.defer();

    db.members.findOne ({memberId: memberId}, {_id: 0},
        function (err, data) {

            if (err) {
                deferred.reject (err)
            } else {
                deferred.resolve(data || {});
            }
        }
    );

    return deferred.promise;

};

exports.putMember = function (req, res) {

    // TODO: Validate body

    var data = req.body,
        uri = "";

    data.memberId = req.params.memberId;
    data.joined = Date.now();
    data.notes = [];
    data.status = 'locked';



    db.members.insert (req.body,
        {safe:true},
        function (err, records){

            if (err) {
                if (err.code === 11000) {
                    db.members.findOne ({memberId:req.params.memberId}, {_id:0}, function (err, record) {
                        if (err) {
                            res.send (500);
                        } else {
                            res.send (200, {
                                existing : record,
                                yours : req.body
                            });
                        }
                    });
                } else {
                    res.send (500);
                }
            } else {
                uri = req.protocol + "://" + req.get('host') + req.originalUrl;
                res.setHeader(hh.constants.Location, uri);
                res.setHeader(hh.constants.ContentLocation, uri);
                res.send(201, req.body);
            }

        }
    );

};

exports.putMember2 = function (memberId, data) {

    var deferred = Q.defer();

    data.memberId = memberId;
    data.joined = Date.now();
    data.notes = [];
    data.status = 'approved';

    db.members.insert (req.body,
        {safe:true},
        function (err, records){

            if (err) {
                deferred.reject (err);
            } else {
                deferred.resolve (data);
            }

        }
    );

    return deferred.promise;

};

exports.OnStockLoan = function (theLoan) {

    db.members.update ({
            membershipCode : theLoan.membershipCode
        },
        {
            $push : {
                currentLoans : theLoan
            },
            $set : {
                lastModified : new Date()
            },
            $inc : {
                numLoans : 1
            }

        },
        {
            upsert : false,
            multi : false
        },
        function (err, data) {
            if (err) {
                console.log (err);
            }
        }
    );
};

exports.OnStockReturn = function (theLoan) {

    console.log ("OnStockReturn()");

    db.members.update (
        {
            membershipCode: theLoan.membershipCode
        },
        {
            $pull: {
                currentLoans: {
                    stockCode: theLoan.stockCode
                }

            },

            $push: {
                loanHistory: theLoan
            },

            $set: {
                lastUpdated: new Date()
            }
        }, function (err, data) {

            if (err) {
                console.log (err);
            } else {
//                console.log (data);
            }


        });

};

exports.isAccountLocked = function (status) {
    return status !== 'active';
};
