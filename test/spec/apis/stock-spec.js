'use strict';

var frisby = require('/opt/node/lib/node_modules/frisby/lib/frisby'),
    testConfig = require('../../../lib/config/env/test.js'),
    hh = require('../../../lib/utils/httpHelpers'),
    mongojs = require('mongojs'),
    uuid = require('../../../app/bower_components/node-uuid'),
    db = mongojs.connect(testConfig.database, ['stock']);



var host = function () {
    return testConfig.host + ':' + testConfig.port + '/api/v1';
};

var testItemId = uuid.v4(),
    badItemId = "0000-0000-0000-0000",
    testItemCode = '9780330441537',
    apiUri = '';

// Clear out the database

console.log('Clearing out the [' + testConfig.database + ']');
db.stock.remove();
console.log('Database cleared.');


apiUri = host() + '/stock/' + testItemId;

//
// Scenario 1
// ==========
//
// Put a new stock item into the database
//

describe('Scenario 1: Put a new item into the Stock collection', function () {

    // curl -X POST http://127.0.0.1:9000/api/v1/stock/00000000-0000-4000-0000-000000000000/9780330441537

    frisby.create('New stock')
        .put(apiUri + '/' + testItemCode)
        .expectStatus(201)
        .toss();

});


//
// Scenario 2
// ==========
//
// Get information back about a stock item
//

describe('Scenario 2: Get information about a known stock item', function () {

    // curl  http://127.0.0.1:9000/api/v1/stock/00000000-0000-4000-0000-000000000000

    frisby.create('Get stock item')
        .get(apiUri)
        .expectStatus(200)
        .toss();

});

describe('Scenario 3: Delete a known stock item', function () {

    frisby.create('Delete stock item')
        .delete(apiUri)
        .expectStatus(200)
        .expectJSONTypes('', {
            count : Number
        })
        .expectJSON( {
            count : 1
        })
        .toss();

});

describe('Scenario 4: Delete an unknown stock item', function () {

    frisby.create('Delete stock item')
        .delete(apiUri)
        .expectStatus(200)
        .expectJSONTypes('', {
            count : Number
        })
        .expectJSON( {
            count : 0
        })
        .toss();

});




