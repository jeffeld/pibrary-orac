var rest = require ('restler'),
    Q = require ('q'),
    _ = require ('underscore'),
    restOptions = {timeout: 10*1000};

exports.get = function (path, options) {

  var deferred = Q.defer();

  console.log ('Requesting ' + path);

  // console.log (_.extend (restOptions, options || {}));

  rest.get (path, _.extend (restOptions, options || {}))
    .on('success', function (data, response) {
      deferred.resolve ({data: data, response: response});
    })
    .on('timeout', function () {
      console.warn ('Request TIMEOUT for ' + path);
      deferred.reject({reason: 'timeout'});
    })
    .on('fail', function (fail, response) {
      console.warn ("Request FAILED for " + path);
      deferred.reject({reason: 'fail', response: response || {}});
    })
    .on('error', function (error, response) {
      console.warn ("Request ERROR for " + path);
      deferred.reject({reason: 'error', response: response || {}});
    });

  return deferred.promise;

};

