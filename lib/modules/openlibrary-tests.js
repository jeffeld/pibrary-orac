var ol = require ('./openlibrary.js'),
    knownISBN = '9780137081073',
    unknownISBN = '9780714416175'
;

describe ('Get data from OpenLibrary', function () {

  var ot;

  beforeEach(function() {
    ot = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 1000;
  });


  it ('should get data for known isbn', function (done) {

    ol.GetByISBN(knownISBN).then(function (data) {

      expect(data.source).toBe('openlibrary');
      expect(data.isbn).toBe(knownISBN);
      expect(data.search_title).toBeDefined();
      expect(data.search_author).toBeDefined();
      expect(data.data).toBeDefined();

      done();

    }, function (error) {
      expect(false).toBe(true);
      done();
    });

  });

  it ('should not get data', function (done) {

    ol.GetByISBN(unknownISBN).then(function (data) {

      expect(false).toBe(true);
      done();

    }, function (error) {

      expect (error).toBeType(number);
      expect (error).toBe(404);
      done();

    });

    afterEach(function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = ot;
    });

  });



})







