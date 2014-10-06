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

    // TODO: Persist the seed value to prevent duplicate code generation
    //       How best to do this? mongojs, mongo-sync, redis?

    var
        codes = [],
        doy = getDOY().toString(16),
        yy = (new Date().getUTCFullYear() - 2000).toString(16),
        seed = 0xfff,
        i,
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

    if (isNaN(count) || count < 1 || (seed - count < 0)) {
        res.send (403);
        return;
    }

    for (i = 0; i < count; i++) {
        c = 'A' +
            zeroPad(yy, 2) +
            zeroPad(doy, 3) +
            zeroPad((seed--).toString(16), 3) +
            zeroPad(Number(spatial).toString(16),2);

        codes.push(c.toUpperCase());
    }

    res.json(codes);
};