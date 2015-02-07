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
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
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
      console.log(currentTrack);

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

            var scrobbleDeferred = deferred();
            scrobbleDeferred.promise.done(function(trackObj) {
              lastfmScrobble(theStation.lastfm || config.lastfm, trackObj);
              // writeFile(filename, trackObj);
            }, function() {});

            // lets get the cache file.
            loadJSONFile(filename).done(function(data) {

              // if the file doesnt exist, just scrobble the track.
              if(data.errno) {
                console.log('scrobble it.');
                lastfmNowPlaying(theStation.lastfm || config.lastfm, track);
                writeFile(filename, track);
                scrobbleDeferred.reject();
                return;
              }

              if(!(data.track === track.track
                && data.artist === track.artist
                && data.played_time == track.played_time)) {
                console.log('its a differnet track, scrobble the track we just listened to.');
                // update the now playing
                lastfmNowPlaying(theStation.lastfm || config.lastfm, track);
                writeFile(filename, track);

                // scrobble the last track which is in the cache..
                scrobbleDeferred.resolve(data);
                return;
              }
              scrobbleDeferred.reject();
              return;

            });

            // lets make sure this track isn't the same as the last one we heard.
            //

            // now we have a track, lets scrobble it.

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
