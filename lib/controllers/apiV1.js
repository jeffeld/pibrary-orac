'use strict';

var config = require('../config/config'),
    appevents = require ('../appevents'),
    Q = require('q'),
    _ = require('underscore'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["isbns", "members", "stock", "loans"]),
    hh = require('../utils/httpHelpers'),
    isbndb = require ('../modules/isbndb'),
    openlibrary = require('../modules/openlibrary'),
    members = require('../modules/members'),
    stock = require('../modules/stock'),
    isbn = require('../modules/isbn'),
    audit = require ('./audit'),
    isbnx = require ('./isbn')
;

function anyUndefined (values) {

    if (_.isArray(values)) {
        _.each (values, function (v) {
            if (_.isUndefined(v)) {
                return true;
            }
        });

        return false;
    }

    return !_.isDefined(values);

}



exports.getISBN = function(req, res) {

    var id = req.params.isbn;

    if (anyUndefined([id])){
        res.send (400);
        return;
    }

    isbn.getISBN(id).then(function (data) {
        _.isEmpty(data) ? res.send (404): res.json (200, data);
    }, function (error) {
        res.send (500, error);
    });

};

exports.postISBN = function (req,res) {

    var isbn = req.param('isbn'),
        uri = '';

    isbnx.GetFromExternalSources(isbn).then(function (data) {

      uri = req.protocol + '://' + req.get('host') + req.originalUrl;
      res.setHeader(hh.constants.Location, uri);
      res.setHeader(hh.constants.ContentLocation, uri);
      res.send(201, data);

    }, function (error) {

      // error should be an HTTP status code

      res.send (error)

    });

};

exports.putISBN = function (req, res) {

    var uri = '', data = req.body;

    data.added = Date.now();

    console.log(req.body);



    db.isbns.update({isbn: req.params.isbn},
        data,
        {upsert: true},
        function () {
            uri = req.protocol + '://' + req.get('host') + req.originalUrl;
            res.setHeader(hh.constants.Location, uri);
            res.setHeader(hh.constants.ContentLocation, uri);
            res.send(201, req.body);

        });
};

//exports.putLoan = function (req, res) {
//
//    console.log ('Lending item');
//
//    res.send (200);
//
//};
//
//exports.putReturn = function (req, res) {
//
//    console.log ('Returning item');
//
//    res.send (200);
//
//};
//
exports.putRenew = function (req, res) {

    console.log ('Renew item');

    res.send (200);

};

exports.getSearch = function (req, res) {

    var term = (req.query.q || "").toUpperCase();

    db.isbns.find({
        $text: {
            $search: term
        }
    }, function (err, data) {

        if (err) {
            res.send (500);
        } else {
            res.send (200, data);
        }
    });

};

exports.getRecentlyAdded = function (req, res) {

    // TODO: This needs to change when we've added proper
    // stock support. We need to get the last n stock items added,
    // get their ISBN's and make sure we have maxRecentlyAdded distinct ones

    var maxRecentlyAdded = 50;

    db.isbns.find ({},
        {
            _id : 0,
            search_title : 1,
            search_author : 1,
            isbn : 1},
        {
            limit : maxRecentlyAdded
//            sort : {
//                added : -1
//            }
        }
        , function(err, data) {

            res.send (200, _.isArray(data) ? data : []);

    });

}

//exports.getMember = function (req, res) {
//
//    var memberId = req.params.memberId;
//
//    if (anyUndefined([memberId])) {
//        res.send (400);
//        return;
//    }
//
//    members.getMember (memberId,
//        function (data) {
//            if (_.isEmpty(data)) {
//                res.send (404)
//            } else {
//                res.json (data);
//            }
//        },
//        function (err) {
//            res.send (500);
//        }
//    );
//};

exports.getMember = function (req, res) {

    var memberId = req.params.memberId;

    if (anyUndefined([memberId])) {
        res.send (400);
        return;
    }

    members.getMember(memberId)
        .then(function (data) {
            _.isEmpty(data) ? res.send(404) : res.json(data);
        }, function (err) {
            res.send (500, err);
        }
    );
};

//exports.putMember = function (req, res) {
//
//    // TODO: Validate body
//
//    var data = req.body,
//        uri = "";
//
//    data.memberId = req.params.memberId;
//    data.joined = Date.now();
//    data.notes = [];
//    data.status = 'locked';
//
//
//
//    db.members.insert (req.body,
//        {safe:true},
//        function (err, records){
//
//            if (err) {
//                if (err.code === 11000) {
//                    db.members.findOne ({memberId:req.params.memberId}, {_id:0}, function (err, record) {
//                        if (err) {
//                            res.send (500);
//                        } else {
//                            res.send (200, {
//                                existing : record,
//                                yours : req.body
//                            });
//                        }
//                    });
//                } else {
//                    res.send (500);
//                }
//            } else {
//                uri = req.protocol + "://" + req.get('host') + req.originalUrl;
//                res.setHeader(hh.constants.Location, uri);
//                res.setHeader(hh.constants.ContentLocation, uri);
//                res.send(201, req.body);
//            }
//
//        }
//    );
//
//};

exports.putMember2 = function (req, res) {

    if (anyUndefined[req.params.memberId, req.body]) {
        res.send (400);
        return;
    }

    members.putMember2 (req.params.memberId, req.body).
        then (function (memberData) {
            var uri = req.protocol + "://" + req.get('host') + req.originalUrl;
            res.setHeader(hh.constants.Location, uri);
            res.setHeader(hh.constants.ContentLocation, uri);
            res.send(201, memberData);
        }, function (err) {
            res.send(500, err);
        }
    );

};

///////////////////////////////////////////////////////////////////////////////
//
// STOCK OPERATIONS
//
///////////////////////////////////////////////////////////////////////////////

function incrementItemCount (o) {

    // The itemCode is the code that uniquely identifies a class of item.
    // For example: for a book the itemCode == the ISBN number.

    // TODO: This assumes only ISBN's at the moment. Need to make it
    // update the correct document type.

    db.isbns.update (
        {isbn : o.itemCode},
        { $push : {stock_codes : o.stockCode}},
        function (err, data) {
            if (err) {
                console.log (err);
            }
        }
    );
}

exports.getStock = function (req, res) {

    var itemId = req.params.itemId;
    if (anyUndefined[itemId]) {
        res.send (400);
        return;
    }

    stock.getStock(itemId)
        .then (function (data) {
            _.isEmpty(data) ? res.send(404) : res.json(data);
        }, function (error) {
            res.send (500, error);
        }
    );

};

exports.putStock = function (req, res) {

    var data = {
            itemId : req.params.itemId,
            itemCode : req.params.itemCode,
            added : new Date(),
            addedBy : req.params.addedby || ""
        },
        uri = '';

    db.stock.insert (data,
        { safe: true },
        function (err, records) {

            if (err) {

                // Something went wrong.
                // If its a duplicate index error, then someone is trying
                // to reuse an item id. Not good.
                // There's no earthly reason this should happen, but you
                // can't allow for some idiot trying to print duplicate codes.

                if (err.code === 11000) {
                    db.stock.findOne ({itemId:data.itemId}, {_id : 0}, function (err, record) {
                        if (err) {
                            res.send (500);
                        } else {

                            // Send back to the client details of the existing entry

                            res.send (200, {
                                existing : record,
                                yours : data
                            });

                        }
                    });
                } else {
                    res.send (500);
                }
            } else {


                incrementItemCount({
                    itemCode: req.params.itemCode,
                    stockCode: req.params.itemId});

                uri = req.protocol + '://' + req.get('host') + req.originalUrl;
                res.setHeader(hh.constants.Location, uri);
                res.setHeader(hh.constants.ContentLocation, uri);
                res.send(201, data);
            }


        }
    );


};

exports.deleteStock = function (req, res) {

    db.stock.remove (
        {itemId : req.params.itemId},
        {single: true},
        function (err, numRemoved) {
            if (err !== null) {
                res.send (500);
            }
            else
            {
                res.send (200, {count : numRemoved.n});
            }

        });



};

exports.lendStock = function (req, res) {

    var stockCode = req.params.stockCode;

    // Before loaning out an item, make sure that it isn't already on loan.
    // If it is on loan, just return it and then loan it out again.
    audit.RecordReturn(stockCode).then(
        function (data) {

            // Make sure we fire the event, else the members loan list won't get updated!
            if (!_.isEmpty(data)) {
                appevents.emit ('Stock-Return', data);
            }

            stock.getISBNDetailsByStockCode(stockCode).then(function (isbn) {

                    var theLoan = {
                        stockCode: stockCode,
                        membershipCode: req.params.membershipCode,
                        returnDate: new Date(req.body.returnDate),
                        loanDate: new Date(),
                        title: isbn.search_title,
                        author: isbn.search_author,
                        isbn: isbn.isbn
                    };

                    audit.RecordLoan(theLoan).then(function (data) {
                        appevents.emit('Stock-Loan', data);
                        res.send(200);
                    });


                },
                function (error) {
                    res.send(500, error);
                }
            );
        }
    );
};

exports.returnStock = function (req, res) {

    var stockCode = req.params.stockCode;

    audit.RecordReturn (stockCode).then(function (data) {
        appevents.emit ('Stock-Return', data);
        res.send(200);
    }, function (error) {
        res.send(500, error);
    });




//    stock.returnStock(stockCode).then(function (data) {
//        _.isEmpty(data) ? res.send (400): res.send (200);
//    }, function (error) {
//        res.send (500, error);
//    });






};

