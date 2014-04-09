'use strict';

var frisby = require('/opt/node/lib/node_modules/frisby/lib/frisby'),
    testConfig = require('../../../lib/config/env/test.js'),
    hh = require('../../../lib/utils/httpHelpers');

var host = function () {
    return testConfig.host + ':' + testConfig.port + '/api/v1';
};

var apiUri = host() + '/stock/codes/';

//
//
//

var codesCount = 1000;

describe('Scenario 1: Get ' + codesCount + ' codes', function () {

    // curl --request GET http://localhost:9000/api/v1/stock/codes/1500 --header 'Cache-Control:no-cache, no-store, must-revalidate'

    var codes = [];

    frisby.create('New codes')
        .get (apiUri + codesCount)
        .expectStatus(200)
        .expectJSONTypes('*', [String])
//        .expectJSONTypes('*', function (val){
//            codes[val] = 1;
//        })
        .toss();

    console.log ('***' + codes.length);

});

