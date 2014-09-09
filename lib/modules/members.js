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


