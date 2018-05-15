'use strict';

var path = require('path');
var utils = require('./utils');

/**
 * Create an API method from the declared spec.
 *
 * @param [spec.method='GET'] Request Method (POST, GET, DELETE, PUT)
 * @param [spec.path=''] Path to be appended to the API BASE_PATH, joined with 
 *  the instance's path (e.g. "charges" or "customers")
 * @param [spec.required=[]] Array of required arguments in the order that they
 *  must be passed by the consumer of the API. Subsequent optional arguments are
 *  optionally passed through a hash (Object) as the penultimate argument
 *  (preceeding the also-optional callback argument
 */
module.exports = function iuguMethod(spec) {

  var commandPath = utils.makeURLInterpolator( spec.path || '' );
  var requestMethod = (spec.method || 'GET').toUpperCase();
  var urlParams = spec.urlParams || [];

  return function({ data = {}, params = [], query = {} }, callback) {
  
    var self = this;
    var auth = null;
    var urlData = {};
    var deferred = this.createDeferred(callback);
    var requestPath = this.createFullPath(commandPath, urlData, query);

    for (var i = 0, l = urlParams.length; i < l; ++i) {
      urlData[urlParams[i]] = params.shift();
    }

    self._request(requestMethod, requestPath, data, auth, function(err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(
          spec.transformResponseData ?
            spec.transformResponseData(response) :
            response
        );
      }
    });

    return deferred.promise;

  };
};