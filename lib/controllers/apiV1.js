'use strict';

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    _ = require('underscore'),
    isbndb = require ('../modules/isbndb'),
    db = mongojs.connect(config.database, ["isbns"])
;

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


exports.seedTestCodes = function () {

    var isbnCode = '9780000000007';

    db.isbns.update ({isbn : isbnCode}, {
        isbn : isbnCode,
        title : 'Seeded Test Book',
        author_data : {
          author_name : 'A.N.Other'
        },
        publisher_name : 'Tor',
        summary : 'Summary text can go here...'
    }, {upsert : true}, function (err) {
        if (err) {
            console.log ("Seeding test codes failed");
            console.log (err);
        } else {
            console.log ("Seeded test codes OK");
        }
    });


};


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

exports.putLoan = function (req, res) {

    console.log ("Loaning " + req.param('bookid') + " to member " + req.param('memberid'));

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

    var maxRecentlyAdded = 12;

    db.isbns.find ({},
        {
            _id : 0,
            search_title : 1,
            search_author : 1,
            isbn : 1},
        {
            limit : maxRecentlyAdded,
            sort : {
                added : -1
            }
        }
        , function(err, data) {

            res.send (200, _.isArray(data) ? data : []);

    });

}