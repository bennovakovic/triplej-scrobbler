var ajax = require('./ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var md5 = require('MD5');
var LastfmAPI = require('lastfmapi');


var lastfmScrobble = function(lastfm, track) {

  var lfm = new LastfmAPI({
      'api_key' : lastfm.api_key,
      'secret' : lastfm.api_secret
  });


  // step 1.
  // if(!lastfm.session_key) {
  //   console.log('go here', 'http://www.last.fm/api/auth/?api_key=' + lastfm.api_key + '&cb=http://example.com');
  //   return;
  // }
  //
  // step 2
  // lfm.authenticate('ENTER_TOKEN_HERE', function (err, session) {
  //     if (err) { throw err; }
  //     console.log(session); // {"name": "LASTFM_USERNAME", "key": "THE_USER_SESSION_KEY"}
  // });
  //

  lfm.setSessionCredentials(lastfm.user, lastfm.session_key);

  lfm.track.scrobble({
      'artist' : track.artist,
      'track' : track.track,
      'timestamp' : track.played_time,
      'duration' : track.duration
  }, function (err, scrobbles) {
  });

  // ajax.get(options).done(function(data) {
  //   console.log('we are back with data..', data);
  // })

}

module.exports = lastfmScrobble;
