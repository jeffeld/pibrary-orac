'use strict';

var frisby = require('frisby'),
    testConfig = require('../../../lib/config/env/test.js'),
    // config = require('../../../lib/config/config.js'),
    hh = require('../../../lib/utils/httpHelpers');

var host = function () {
    return testConfig.host + ':' + testConfig.port + '/api/v1';
};

var apiUri = host() + '/stock/codes/';

//
//
//

var codesCount = 5000; // config.codes.max;

describe('Scenario 1: Get ' + codesCount + ' codes', function () {

    // curl --request GET http://localhost:9000/api/v1/stock/codes/1500 --header 'Cache-Control:no-cache, no-store, must-revalidate'


    var codes = [];

    frisby.create('New codes (length = max')
        .get (apiUri + codesCount)
        .expectStatus(200)
        .expectJSONTypes('*', [String])
//        .expectJSONTypes('*', function (val){
//            codes[val] = 1;
//        })
        .toss();

    frisby.create('New codes (length = max-1')
        .get (apiUri + (codesCount-1))
        .expectStatus(200)
        .expectJSONTypes('*', [String])
//        .expectJSONTypes('*', function (val){
//            codes[val] = 1;
//        })
        .toss();

    frisby.create('New codes (length = max+1')
        .get (apiUri + (codesCount+2))
        .expectStatus(403)
        .toss();


    frisby.create('New codes (length = 0')
        .get (apiUri + '0')
        .expectStatus(403)
        .toss();

    frisby.create('New codes (length = -1')
        .get (apiUri + '-1')
        .expectStatus(403)
        .toss();

});

