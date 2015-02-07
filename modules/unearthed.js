var config = require('../config');
var ajax = require('../ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var deferred = require('deferred');

var unearthed = function() {
  var def = deferred();
  console.log('we ran the module...');

  var options = {
    host : 'music.abcradio.net.au',
    path : '/api/v1/plays/unearthed/now.json'
  };

  ajax.get(options).done(function(d) {
    try {
      var trackName = d.now.recording.title;
      var artistName = d.now.recording.artists[0].name;
      var playedTime = Date.parse(d.now.played_time)/1000 + d.now.recording.duration;
      def.resolve({artist : artistName, track : trackName, played_time: playedTime});
    }
    catch(e) {
      console.log('we failed', e);
      def.resolve(false);
    }
  })


  return def.promise;

}
module.exports = unearthed;
