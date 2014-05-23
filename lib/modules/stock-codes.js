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
        c = '',
        count = parseInt(req.params.num),
        spatial = req.params.spatial;

    if (typeof(spatial) === 'undefined') {
        spatial = 255;
    } else if (typeof(spatial) === 'string') {
        spatial = parseInt(spatial);
        if (isNaN(spatial) || spatial > 255) {
            spatial = 255;
        }
    }

    if (isNaN(count) || count < 1 || count > config.codes.max) {
        res.send (403);
        return;
    }

    for (i = 0; i < count; i++) {
        c = 'a' +
            zeroPad(doy, 3) +
            zeroPad(yy, 3) +
            zeroPad((seed++).toString(16), 7) +
            zeroPad(Number(spatial).toString(16),2);
        codes.push(c);
    }

    res.json(codes);
};