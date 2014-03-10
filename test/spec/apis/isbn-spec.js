'use strict';

var frisby = require('/opt/node/lib/node_modules/frisby/lib/frisby'),
    testConfig = require('../../../lib/config/env/test.js'),
    hh = require('../../../lib/utils/httpHelpers'),
    mongojs = require('mongojs'),
    db = mongojs.connect(testConfig.database, ['isbns']);

var host = function () {
    return testConfig.host + ':' + testConfig.port + '/api/v1';
};

var testISBN = '9780330441537', // Use the rename refactor to update comments if changing this value
    apiUri = '';

// Clear out the database

console.log('Clearing out the [' + testConfig.database + ']');
db.isbns.remove();
console.log('Database cleared.');


apiUri = host() + '/isbn/' + testISBN;


//
// Scenario 1
// ==========
//
// Make A GET request to Orac for details on an unknown ISBN.
// NOTE: The ISBN used in this test is not even a valid one.
//
describe('Scenario 1: Try and GET details about an unknown number', function () {

    // curl http://127.0.0.1:9000/api/v1/isbn/0987654321

    frisby.create('Unknown ISBN')
        .get(apiUri)
        .expectStatus(404)
        .toss();

});

//
// Scenario 2
// ==========
//
// Assumptions
// -----------
// * Empty database
// * The variable testISBN holds an ISBN-13 number that WILL be located on http://isbndb.com
//   If it isn't, choose a new ISBN number for the test and update variable testISBN.
//
describe('Scenario 2 : Get ISBN from external source ', function () {

    // 1. POST a request to Orac for an ISBN number. The number will be looked
    //    up on external databases. If found (which is should be - if it isn't,
    //    see Assumptions above), then the data will be stored in our database
    //    and a 201 (CREATED) returned along with the data.

    // curl -X POST http://127.0.0.1:9000/api/v1/isbn/9780330441537

    frisby.create('POST request to Orac')
        .post(apiUri)
        .expectStatus(201)
        .expectHeader(hh.constants.Location, apiUri)
        .expectHeader(hh.constants.ContentLocation, apiUri)
        .expectHeader(hh.constants.ContentType, hh.constants.ApplicationJsonCharsetUtf8)
        .inspectJSON()
        .toss();

    // 2. The test ISBN number is now in our database, so issue a GET to return the
    //    details.

    // curl http://127.0.0.1:9000/api/v1/isbn/9780330441537

    frisby.create('GET request to Orac for known ISBN')
        .get(apiUri)
        .expectStatus(200)
        .expectHeader(hh.constants.ContentType, hh.constants.ApplicationJsonCharsetUtf8)
        .expectJSONTypes('', {
            isbn: String
        })
        .expectJSON({
            isbn: testISBN
        })
        .toss();

});
