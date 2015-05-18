var isbndb = require('./isbndb');
isbndb.setApiKey('33QRCVHS');


describe("ISBNDB Tests", function (){

  it('should get data for 9780137081073', function (done) {

    isbndb.getByISBN2('9780137081073').then(function (data) {

      expect(data.source).toBe('isbndb');
      expect(data.isbn).toBe('9780137081073');
      expect(data.search_title).toBeDefined();
      expect(data.search_author).toBeDefined();
      expect(data.data).toBeDefined();


      done();

    }, function (error) {

      console.error (error);

    });

  });


});


