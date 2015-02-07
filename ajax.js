/* just wrap up some http action in a deferred */
var http = require('http');
var deferred = require('deferred');

var ajax = {
  get : function(options) {
    var def = deferred();
    function callback(response) {

      var str = '';

      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function (er) {
        var d = JSON.parse(str);
        def.resolve(d);
      });
    }

    http.request(options, callback).end();

    return def.promise;
    // returns a deferred;
  }
}
module.exports = ajax;
