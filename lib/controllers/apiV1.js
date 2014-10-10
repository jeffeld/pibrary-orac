'use strict';

var config = require('../config/config'),
    Q = require('q'),
    _ = require('underscore'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["isbns", "members", "stock"]),
    hh = require('../utils/httpHelpers'),
    isbndb = require ('../modules/isbndb'),
    members = require('../modules/members'),
    stock = require('../modules/stock'),
    isbn = require('../modules/isbn')
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

    isbndb.getByISBN(res, isbn, function(rc, data) {
        if (rc === 200) {

            // Save data to database, using an upsert

            data.isbn = isbn;
            data.search_title = determineTitle(data.data[0]);
            data.search_author = determineAuthor(data.data[0]);
            data.added = Date.now();
            data.stock_codes = [];

            db.isbns.update ({ isbn : isbn },
                data,
                { upsert : true },
                function () {
                    uri = req.protocol + '://' + req.get('host') + req.originalUrl;
                    res.setHeader(hh.constants.Location, uri);
                    res.setHeader(hh.constants.ContentLocation, uri);
                    res.send(201, data);
                }
            );


        } else {
            res.send(rc);
        }

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

    var stockCode = req.params.stockCode,
        membershipCode = req.params.membershipCode;

    if (anyUndefined([stockCode, membershipCode])) {
        res.send (400);
        return;
    }

    stock.lendStock(stockCode, membershipCode)
        .then (function (data) {

            // If resolved with an empty object, then either the
            // membership code or stock code do not exist.
            // Return 400 - Bad request

            _.isEmpty(data) ? res.send (400) : res.send(200);


        }, function (error) {
            res.send (500, error)
        }
    );



};

exports.returnStock = function (req, res) {

    var stockCode = req.params.stockCode;
    if (anyUndefined([stockCode])) {
        res.send (400);
        return;
    }

    stock.returnStock(stockCode).then(function (data) {
        _.isEmpty(data) ? res.send (400): res.send (200);
    }, function (error) {
        res.send (500, error);
    });






}

