var request = require('request');

/**
 * Sends a HTTP request to a specified URL with optional proxy, query strings, and handlers.
 * Convenient handling of request error and unexpected status code.
 *
 * @param {String} method: http method
 * @param {String} url: URL without query string
 * @param {Object} opts: optional
 *   - proxy: proxy server URL with format http://user:pass@host:port
 *   - quseryStrings: object containing URL query strings with format { name: value }
 *   - handlers: response handlers with format { statuscode: function(result, cb) }
 * @param {Function} cb: standard cb(err, result) callback
 */
function req(method, url, opts, cb) {
  var params = { url: url };

  if (opts.proxy) {
    params.proxy = opts.proxy;
  }

  if (opts.queryStrings) {
    params.qs = opts.queryStrings;
  }

  request[method.toLowerCase()](params, function (err, result) {
    if (err) {
      cb(err);
    } else if (opts.handlers && opts.handlers[result.statusCode]) {
      opts.handlers[result.statusCode](result, cb);
    } else {
      cb(new Error('Unexpected status code: ' + result.statusCode + '\nResponse body:\n' + result.body));
    }
  });
}

exports.request = req;