'use strict';

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["stock"])
    ;

exports.getStock = function (req, res) {

    db.stock.findOne ({itemId : req.params.itemId}, {_id : 0}, function (err,item){

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
                uri = req.protocol + '://' + req.get('host') + req.originalUrl;
                res.setHeader(hh.constants.Location, uri);
                res.setHeader(hh.constants.ContentLocation, uri);
                res.send(201, data);
            }


        }
    );

    db.stock.update ( { itemId : data.itemId },
        data,
        { upsert : true },
        function () {


    });

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


