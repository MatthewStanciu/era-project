var url = require('url');

module.exports = function(input) {
  var parts = url.parse(input);
  if (parts.protocol !== 'rethinkdb:') {
    throw new Error('unsupported protocol: ' + parts.protocol);
  }

  var options = {};
  if (parts.hostname) {
    options.host = parts.hostname;
  }

  if (parts.port) {
    options.port = parseInt(parts.port, 10);
  }

  if (parts.pathname && parts.pathname !== '/') {
    options.db = parts.pathname.substr(1);
  }

  if (parts.auth) {
    var i = parts.auth.indexOf(':');
    if (i === -1) {
      throw new Error('both a (dummy) username and a password must be provided')
    }
    options.authKey = parts.auth.substr(i + 1);
  }

  return options;
};
