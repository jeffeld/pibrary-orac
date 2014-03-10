'use strict';

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["stock"])
    ;

exports.getStock = function (req, res) {

    db.stock.findOne ({stockId : req.params.itemId}, {_id : 0}, function (err,item){

        if (err || !item) {
            res.send(404);
        } else {
            res.json(item);
        }

    });

};

exports.putStock = function (req, res) {

    var data = {
        itemId : req.params.itemId,
        itemCode : req.params.itemCode,
        added : new Date(),
        addedBy : "" // TODO: Added by
        },
        uri = '';

    db.stock.insert ({}, //itemId : req.param.itemId},
        data,
        { upsert : false },
        function (err, numAffected) {

            if (err) {
                res.send (500);
            } else {
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
        {itemId : req.param.itemId},
        { single: true },
        function (err, numRemoved) {
            if (err !== null) {
                res.send (500);
            }
            else
            {
                res.send (200, {count : numRemoved});
            }

    });



};


