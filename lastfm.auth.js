var ajax = require('./ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var md5 = require('MD5');
var LastfmAPI = require('lastfmapi');


var lastfmAuth = function(lastfm) {

  var lfm = new LastfmAPI({
      'api_key' : lastfm.api_key,
      'secret' : lastfm.api_secret
  });


  // step 1.
  // if(!lastfm.session_key) {
  //   console.log('go here', 'http://www.last.fm/api/auth/?api_key=' + lastfm.api_key + '&cb=http://example.com');
  //   return;
  // }

  // step 2
  lfm.authenticate('932e1d36ec02b08dffd0b2f2341f8260', function (err, session) {
      if (err) { throw err; }
      console.log(session); // {"name": "LASTFM_USERNAME", "key": "THE_USER_SESSION_KEY"}
  });


}

module.exports = lastfmAuth;
