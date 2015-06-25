var config = {}
config.lastfm = {};
config.stations = {};

config.lastfm.api_key = '';
config.lastfm.api_secret = '';
config.lastfm.session_key = '';
config.lastfm.user = '';

config.sonos_server = '127.0.0.1';
config.sonos_port = 5005;


config.stations['triplej'] = {
  name : 'triplej',
  uri : 'shoutmedia.abc.net.au:10426',
  title : 'x-sonosapi-stream:s25508',
  module : 'triplej',
  lastfm : {
    api_key : '',
    api_secret : '',
    session_key : '',
    user : ''
  }
};


config.cacheFolder = 'cache/';
module.exports = config;

