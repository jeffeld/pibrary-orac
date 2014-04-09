'use strict';

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    _ = require('underscore')
;

function zeroPad (v, n) {
    var z = ""; // [];
    for (var i = 0; i < n - v.length; i++) {
        z += "0";
    }
    return z + v;
}

function getDOY () {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

exports.generate = function (req, res) {

//    var codes = [],
//        i = 0;
//
//    for (i = _.random(1,100); i < req.params.num; i++) {
//        codes.push(i);
//    }
//
//    res.json(codes);

    var
        codes = [],
        midnight = new Date().setHours(0, 0, 0, 0),
        doy = getDOY().toString(16),
        yy = new Date().getUTCFullYear().toString(16),
        seed = (Date.now() - midnight),
        i = 0,
        c = '';

    for (i = 0; i < req.params.num; i++) {
        c = 'a' + zeroPad(doy, 3) + zeroPad(yy, 3) + zeroPad((seed++).toString(16), 7);
        codes.push(c);
    }

    res.json(codes);
};