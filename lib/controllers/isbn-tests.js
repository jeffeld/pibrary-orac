var
  isbn = require ('./isbn')
;


describe ('Get book data from any of two external sources', function () {

  it ('should get data for 978...', function (done) {

    isbn.GetFromExternalSources ('9780137081073').then(function (data) {

      console.log (data.source);
      expect (data.source).toBeDefined();

      done();

    }, function (error) {

      console.error (error);

    });



  });



});


