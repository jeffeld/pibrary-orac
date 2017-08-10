'use strict';

var config = require('../config/config'),
    Q = require ('q'),
    _ = require ('underscore'),
    mongojs = require ('mongojs'),
    db = mongojs(config.database, ["isbns"])
;


function ISBN10toISBN13(isbn10) {

    var sum = 38 + 3 * (parseInt(isbn10[0]) + parseInt(isbn10[2]) + parseInt(isbn10[4]) + parseInt(isbn10[6])
        + parseInt(isbn10[8])) + parseInt(isbn10[1]) + parseInt(isbn10[3]) + parseInt(isbn10[5]) + parseInt(isbn10[7]);

    var checkDig = (10 - (sum % 10)) % 10;

    return "978" + isbn10.substring(0, 9) + checkDig;
}

/*
 * Converts a isbn13 into an isbn10.
 * The isbn13 is a string of length 13 and must be a legal isbn13. No dashes.
 */
function ISBN13toISBN10(isbn13) {

    var start = isbn13.substring(3, 12);
    var sum = 0;
    var mul = 10;
    var i;

    for(i = 0; i < 9; i++) {
        sum = sum + (mul * parseInt(start[i]));
        mul -= 1;
    }

    var checkDig = 11 - (sum % 11);
    if (checkDig == 10) {
        checkDig = "X";
    } else if (checkDig == 11) {
        checkDig = "0";
    }

    return start + checkDig;
}


exports.getISBN = function (isbn) {

    var deferred = Q.defer(),
        isbn10 = '',
        isbn13 = '';

    if (isbn.length === 13) {

        isbn13 = isbn;
        isbn10 = ISBN13toISBN10(isbn);

    } else {

        isbn10 = isbn;
        isbn13 = ISBN10toISBN13(isbn);

    }

    db.isbns.findOne (
//        {isbn:isbn},
//        {
//            $or : [
//                {isbn:isbn13},
//                {isbn:isbn10}
//            ]
//
//        },
        {
            isbn : {
                $in : [isbn10, isbn13]
            }
        },
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

exports.OnLoan = function (theLoan) {

    db.isbns.update ({isbn: theLoan.isbn}, {$inc: {numLoans:1}});

};