'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {

    root: rootPath,
    port: process.env.PORT || 9000,

    isbndb_api_key: process.env.ORAC_ISBNDB_KEY,


    codes : {
        max : 5000
    }

};
