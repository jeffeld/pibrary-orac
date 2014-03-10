'use strict';

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    isbndb = require ('../modules/isbndb'),
    db = mongojs.connect(config.database, ["isbns"])
;

exports.getISBN = function(req, res) {

    var isbnToFind = req.param('isbn');

    db.isbns.findOne({isbn:isbnToFind}, {_id: 0}, function (err,isbn) {
       if (err || !isbn) {
           res.send(404);
       } else {
           res.json(isbn);
       }
    });

};

exports.postISBN = function (req,res) {

    var isbn = req.param('isbn'),
        uri = '';

    isbndb.getByISBN(res, isbn, function(rc, data) {
        if (rc === 200) {

            // Save data to database, using an upsert

            data.isbn = isbn;

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

exports.putLoan = function (req, res) {

    console.log ("Loaning " + req.param('bookid') + " to member " + req.param('memberid'));

};

//exports.getFromAmazon = function (req, res) {
//
//    var accessKeyId = "1KKSVHDE88NKZ8M1VYG2",
//        secretKeyId = "V103+wkyUop39s7AXzakUbga+ocoNhEwprnvIoPL",
//        associateTag = "maranon-21";
//
//    var prodAdv = aws.createProdAdvClient(accessKeyId, secretKeyId, associateTag);
//
//    var options = {SearchIndex: "Books", Keywords: req.param.isbn};
//
//    prodAdv.call("ItemSearch", options, function(err, result) {
//        if (err)
//        {
//            res.send(500);
//        } else {
//            console.log (result);
//            res.json(result);
//        }
//    });
//
//
//
//
//
//
//};

// id : 1KKSVHDE88NKZ8M1VYG2
// secret: V103+wkyUop39s7AXzakUbga+ocoNhEwprnvIoPL