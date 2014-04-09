'use strict';

//
// Type: Memver type (impacts number of loans etc.)
//
// ST   - Student
// LI   - Librarian
// SY   - Sys admin
// BU   - Bulk loanee (e.g. teachers)
//
//

var http = require ('http'),
    hh = require('../utils/httpHelpers'),
    config = require('../config/config'),
    mongojs = require ('mongojs'),
    db = mongojs.connect(config.database, ["members"])
    ;


exports.getMember = function (req, res) {

    db.members.findOne ({memberId : req.params.memberId}, {_id : 0}, function(err, item){

        if (err || !item) {
            res.send (404);
        } else {
            res.json (item);
        }

    });

};

exports.putMember = function (req, res) {

    // TODO: Validate body

    var data = req.body,
        uri = "";

    data.memberId = req.params.memberId;
    data.joined = Date.now();
    data.notes = [];



    db.members.insert (req.body,
        {safe:true},
        function (err, records){

            if (err) {
                if (err.code === 11000) {
                    db.members.findOne ({memberId:req.params.memberId}, {_id:0}, function (err, record) {
                        if (err) {
                            res.send (500);
                        } else {
                            res.send (200, {
                                existing : record,
                                yours : req.body
                            });
                        }
                    });
                } else {
                    res.send (500);
                }
            } else {
                uri = req.protocol + "://" + req.get('host') + req.originalUrl;
                res.setHeader(hh.constants.Location, uri);
                res.setHeader(hh.constants.ContentLocation, uri);
                res.send(201, req.body);
            }

        }
    );

};

