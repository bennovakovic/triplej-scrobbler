var config = require('./config');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');

var options = {
  host: config.sonos_server,
  port: config.sonos_port,
  path: '/zones'
};


var processZoneResponse = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function (er) {
    console.log(er);
    console.log(str);
    var d = JSON.parse(str);
    console.log(d);
  });
}



http.request(options, processZoneResponse).end();
