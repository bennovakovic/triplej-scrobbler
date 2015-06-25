var config = require('./config');
var ajax = require('./ajax');
var utf8 = require('utf8');
var fs = require('fs');
var http = require('http');
var lastfmScrobble = require('./lastfm.scrobble');
var lastfmNowPlaying = require('./lastfm.nowplaying');
var deferred = require('deferred');

var daemon = false;
var refreshInterval = 60 * 1000;

var args = process.argv;
args.shift();
args.shift();

var MODE = process.argv[2];
var MODULE = process.argv[3];

if(MODE && MODE === 'setup' && MODULE) {

  var lastfmAuth = require('./lastfm.auth');
  if(!config.stations[MODULE]) {

    console.log('Please select a valid module to configure: \n[ ' + Object.keys(config.stations).join(', ') + ' ]');
    return;
  }
  lastfmAuth(config.stations[MODULE].lastfm);

}


if(args.indexOf('--daemon') !== -1) {
  // enter daemon mode.
  daemon = true;
}

var loadJSONFile = function(file) {
  var def = deferred();
  fs.readFile(file, 'utf8', function (err,data) {
    if(err) {
      def.resolve(false);
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


function main() {
// get the zone data.
console.log('main() ----------------------------');
ajax.get(options).done(function(data) {
  try {
    if(data[0].coordinator.state.zoneState === 'PLAYING') {
      var currentTrack = data[0].coordinator.state.currentTrack;

      // lets find out we are listening to at the moment.
      var found = false;
      for(var station in config.stations) {
        if(currentTrack.uri.indexOf(config.stations[station].uri) >= 0 ||
          currentTrack.title.indexOf(config.stations[station].title) >= 0) {
          var theStation = config.stations[station];
          found = true;
          var app = require('./modules/' + theStation.module);

          //we assume app returns us a dict of track/artist/playtime
          app().done(function(track) {
            if(!track) {
              console.log('no track');
              if(daemon) {
                setTimeout(main, refreshInterval);
              }
              return;
            }
            var filename = config.cacheFolder + theStation.module + '.json';

            // lets get the cache file.
            loadJSONFile(filename).done(function(data) {

              var notTheSame = (data.track !== track.track && data.artist !== track.artist);
              // if we have no data, or its a different track
              if(!data || notTheSame) {

                // scrobble the last track which is in the cache..
                if(data) {
                  // var currentTime = Math.floor(new Date().getTime()/1000);
                  // if((currentTime - data.last_played) < 360) {
                    console.log('Scrobble: ', data.artist, ' - ', data.track);
                    lastfmScrobble(theStation.lastfm || config.lastfm, data);
                  // }
                }


                // update the now playing
                setTimeout(function() {
                  console.log('Now Playing: ', track.artist, ' - ', track.track);
                  lastfmNowPlaying(theStation.lastfm || config.lastfm, track);
                  writeFile(filename, track);
                  if(daemon) {
                    setTimeout(main, refreshInterval);
                    return;
                  }
                }, 1000);

                //return;
              }
              else {
                console.log('same track... do nothing...');
                if(daemon) {
                  setTimeout(main, refreshInterval);
                }
              }
              return;

            });
          });
        }
      }
      if(!found) {
        if(daemon) {
          console.log('unknown station');
          setTimeout(main, refreshInterval);
        }
      }
    }
    else {
      console.log('Sonos Playing State: ', data[0].coordinator.state.zoneState);
      if(daemon) {
        setTimeout(main, refreshInterval);
      }
    }

  }
  catch(e) {};
})
}

main();
