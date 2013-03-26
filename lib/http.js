var request = require('request');

/**
 * Sends a HTTP request to a specified URL with optional proxy, query strings, and handlers.
 * Convenient handling of request error and unexpected status code.
 *
 * @param {String} method: http method
 * @param {String} url: URL without query string
 * @param {Object} opts: optional
 *   - proxy: proxy server URL with format http://user:pass@host:port
 *   - queryStrings: object containing URL query strings with format { name: value }
 *   - handlers: response handlers with format { statuscode: function(result, cb) }
 * @param {Function} cb: standard cb(err, result) callback
 */
function req(method, url, opts, cb) {
  opts.handlers = opts.handlers || {};

  var params = { url: url },
    envProxy = proxy(url);

  if (opts.proxy) {
    params.proxy = opts.proxy;
  } else if (envProxy) {
    params.proxy = envProxy;
  }

  if (opts.queryStrings) {
    params.qs = opts.queryStrings;
  }

  function _wildcardMatch(statusCode) {
    var match;
    Object.keys(opts.handlers).forEach(function (handlerStatusCode) {
      var regex = new RegExp(handlerStatusCode.replace(/x/g, '.'));
      if (!match && statusCode.toString().match(regex)) {
        match = handlerStatusCode;
      }
    });
    return match;
  }

  request[method.toLowerCase()](params, function (err, result) {
    if (err) {
      cb(err);
    } else {
      var wildcardMatch = _wildcardMatch(result.statusCode);
      if (opts.handlers[result.statusCode]) {
        opts.handlers[result.statusCode](result, cb);
      } else if (wildcardMatch) {
        opts.handlers[wildcardMatch](result, cb);
      } else {
        cb(new Error('Unexpected status code: ' + result.statusCode + '\nResponse body:\n' + result.body));
      }
    }
    /*
    if (err) {
      cb(err);
    } else if (opts.handlers && opts.handlers[result.statusCode]) {
      opts.handlers[result.statusCode](result, cb);
    } else {
      cb(new Error('Unexpected status code: ' + result.statusCode + '\nResponse body:\n' + result.body));
    }
    */
  });
}

/**
 * Determines proxy value based on URL and process environment variable (http_proxy, https_proxy).
 * This allows library clients to control which proxy to use by setting environment variable.
 * - if url starts with http, use http_proxy when available
 * - if url starts with https, use https_proxy when available, otherwise fallback to http_proxy
 * - if url does not have protocol, assume http protocol
 * - if url is not specified, http_proxy takes precedence over https_proxy
 *
 * @param {String} url: URL used to determine which proxy environment variable to use
 */
function proxy(url) {
  var _proxy;

  if (!url) {
    _proxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy || process.env.HTTPS_PROXY;
  } else {
    if (!url.match(/^https?:\/\//)) {
      url += 'http://' + url;
    }

    if (url.match(/^https:\/\//)) {
      _proxy = process.env.https_proxy || process.env.HTTPS_PROXY || process.env.http_proxy || process.env.HTTP_PROXY;
    } else {
      _proxy = process.env.http_proxy;
    }
  }

  return _proxy;
}

exports.request = req;
exports.proxy = proxy;