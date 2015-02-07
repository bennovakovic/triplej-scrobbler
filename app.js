var config = require('./config');
var ajax = require('./ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var lastfmScrobble = require('./lastfm.scrobble');
var lastfmNowPlaying = require('./lastfm.nowplaying');
var deferred = require('deferred');



var loadJSONFile = function(file) {
  var def = deferred();
  fs.readFile(file, 'utf8', function (err,data) {
    if(err) {
      def.resolve(err);
    }
    else {
      var d = JSON.parse(data);
      def.resolve(d);
    }
  });
  return def.promise;
};

var writeFile = function(file, data) {
  var def = deferred();
  fs.writeFile(file, JSON.stringify(data) + '\n', function(err) {
      def.resolve(err);
  });
  return def.promise;
};


var options = {
  host: config.sonos_server,
  port: config.sonos_port,
  path: '/zones'
};


// get the zone data.
ajax.get(options).done(function(data) {
  try {
    if(data[0].coordinator.state.zoneState === 'PLAYING') {
      var currentTrack = data[0].coordinator.state.currentTrack;

      // lets find out we are listening to at the moment.
      for(var station in config.stations) {
        if(currentTrack.uri.indexOf(config.stations[station].uri) >= 0 ||
          currentTrack.title.indexOf(config.stations[station].title) >= 0) {
          var theStation = config.stations[station];
          var app = require('./modules/' + theStation.module);

          //we assume app returns us a dict of track/artist/playtime
          app().done(function(track) {
            if(!track) {
              return;
            }
            var filename = config.cacheFolder + theStation.module + '.json';

            // lets get the cache file.
            loadJSONFile(filename).done(function(data) {

              // if the file doesnt exist, just scrobble the track.
              if(data.errno) {
                console.log('Now Playing: ', track.artist, ' - ', track.track);
                lastfmNowPlaying(theStation.lastfm || config.lastfm, track);
                writeFile(filename, track);
                return;
              }

              if(!(data.track === track.track
                && data.artist === track.artist
                && data.played_time == track.played_time)) {
                // update the now playing
                console.log('Now Playing: ', track.artist, ' - ', track.track);
                lastfmNowPlaying(theStation.lastfm || config.lastfm, track);
                writeFile(filename, track);

                // scrobble the last track which is in the cache..
                console.log('Scrobble: ', data.artist, ' - ', data.track);
                lastfmScrobble(theStation.lastfm || config.lastfm, data);
                return;
              }
              return;

            });
          });
        }
      }
    }
    else {
      console.log('Sonos Playing State: ', data[0].coordinator.state.zoneState);
    }

  }
  catch(e) {};
})
