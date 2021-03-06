var ajax = require('./ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var md5 = require('MD5');
var LastfmAPI = require('lastfmapi');


var lastfmNowPlaying = function(lastfm, track) {

  var lfm = new LastfmAPI({
      'api_key' : lastfm.api_key,
      'secret' : lastfm.api_secret
  });

  lfm.setSessionCredentials(lastfm.user, lastfm.session_key);

  lfm.track.updateNowPlaying({
      'artist' : track.artist,
      'track' : track.track,
      'duration' : track.duration
  }, function (err, scrobbles) {
  });

}

module.exports = lastfmNowPlaying;
