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

var codesCount = 0xfff; // config.codes.max;

describe('Scenario 1: Get ' + codesCount + ' codes', function () {

    var codes = [];

    // curl --request GET http://localhost:9000/api/v1/stock/codes/4095 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    frisby.create('New codes (length = max)')
        .get (apiUri + codesCount)
        .expectStatus(200)
        .expectJSONTypes('*', [String])
//        .expectJSONTypes('*', function (val){
//            codes[val] = 1;
//        })
        .toss();


    // curl --request GET http://localhost:9000/api/v1/stock/codes/4094 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    frisby.create('New codes (length = max-1)')
        .get (apiUri + (codesCount-1))
        .expectStatus(200)
        .expectJSONTypes('*', [String])
//        .expectJSONTypes('*', function (val){
//            codes[val] = 1;
//        })
        .toss();

    // curl --request GET http://localhost:9000/api/v1/stock/codes/4097 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    frisby.create('New codes (length = max+2)')
        .get (apiUri + (codesCount+2))
        .expectStatus(403)
        .toss();

    // curl --request GET http://localhost:9000/api/v1/stock/codes/0 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    frisby.create('New codes (length = 0)')
        .get (apiUri + '0')
        .expectStatus(403)
        .toss();

    // curl --request GET http://localhost:9000/api/v1/stock/codes/-1 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    frisby.create('New codes (length = -1)')
        .get (apiUri + '-1')
        .expectStatus(403)
        .toss();

});

