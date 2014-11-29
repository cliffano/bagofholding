var assert = require('assert'),
  buster = require('buster'),
  http = require('../lib/http'),
  request = require('request');

buster.testCase('http - request', {
  'should pass error to callback when there is an error while sending request': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      assert.equals(params.proxy, 'http://someproxy');
      assert.equals(params.qs.param1, 'value1');
      cb(new Error('someerror'));
    });
    http.request('GET', 'http://someurl', { proxy: 'http://someproxy', queryStrings: { param1: 'value1' } }, function (err, result) {
      assert.equals(err.message, 'someerror');
      assert.equals(result, undefined);
      done();
    });
  },
  'should handle result based on status code': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      assert.equals(params.proxy, 'http://someproxy');
      assert.equals(params.qs.param1, 'value1');
      cb(null, { statusCode: 200, body: 'somebody' });
    });
    function _success(result, cb) {
      assert.equals(result.statusCode, 200);
      assert.equals(result.body, 'somebody');
      cb(null, result);
    }
    http.request('GET', 'http://someurl', { proxy: 'http://someproxy', queryStrings: { param1: 'value1' }, handlers: { 200: _success } }, function (err, result) {
      assert.isNull(err);
      assert.equals(result.statusCode, 200);
      assert.equals(result.body, 'somebody');
      done();
    });
  },
  'should aliased http#req delete method into request del method': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'del', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      cb(null, { statusCode: 200, body: 'somebody' });
    });
    function _success(result, cb) {
      cb(null, result);
    }
    http.request('DELETE', 'http://someurl', { handlers: { 200: _success } }, function (err, result) {
      done();
    });
  },
  'should handle result based on wildcard status code': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      cb(null, { statusCode: '200', body: 'somebody' });
    });
    function _success(result, cb) {
      assert.equals(result.statusCode, 200);
      cb(null, result);
    }
    function _honeypot(result, cb) {
      // should never be called
    }
    http.request('GET', 'http://someurl', { proxy: 'http://someproxy', queryStrings: { param1: 'value1' }, handlers: { 201: _honeypot, '20x': _success } }, function (err, result) {
      assert.isNull(err);
      assert.equals(result.statusCode, 200);
      done();
    });
  },
  'should handle result based on wildcard status code with multiple wildcard characters': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      cb(null, { statusCode: '200', body: 'somebody' });
    });
    function _success(result, cb) {
      assert.equals(result.statusCode, 200);
      cb(null, result);
    }
    function _honeypot(result, cb) {
      // should never be called
    }
    http.request('GET', 'http://someurl', { proxy: 'http://someproxy', queryStrings: { param1: 'value1' }, handlers: { '2xx': _success, 201: _honeypot } }, function (err, result) {
      assert.isNull(err);
      assert.equals(result.statusCode, 200);
      done();
    });
  },
  'should handle result based on first match when there are multiple matches': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      cb(null, { statusCode: '200', body: 'somebody' });
    });
    function _success(result, cb) {
      assert.equals(result.statusCode, 200);
      cb(null, result);
    }
    function _honeypot(result, cb) {
      // should never be called
    }
    http.request('GET', 'http://someurl', { proxy: 'http://someproxy', queryStrings: { param1: 'value1' }, handlers: { 200: _success, '2xx': _honeypot } }, function (err, result) {
      assert.isNull(err);
      assert.equals(result.statusCode, 200);
      done();
    });
  },
  'should pass error to callback when result status code is not expected': function (done) {
    this.stub(process, 'env', {});
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      assert.equals(params.proxy, undefined);
      assert.equals(params.qs, undefined);
      cb(null, { statusCode: 888, body: 'somebody' });
    });
    http.request('GET', 'http://someurl', {}, function (err, result) {
      assert.equals(err.message, 'Unexpected status code: 888\nResponse body:\nsomebody');
      assert.equals(result, undefined);
      done();
    });
  },
  'should set proxy to environment variable when available': function (done) {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      assert.equals(params.proxy, 'http://someproxy');
      assert.equals(params.qs, undefined);
      cb(null, { statusCode: 888, body: 'somebody' });
    });
    http.request('GET', 'http://someurl', {}, function (err, result) {
      assert.equals(err.message, 'Unexpected status code: 888\nResponse body:\nsomebody');
      assert.equals(result, undefined);
      done();
    });
  },
  'should not set proxy when URL hostname is on the default no proxy hosts array': function (done) {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://localhost');
      assert.equals(params.proxy, undefined);
      cb(null, { statusCode: 200, body: 'somebody' });
    });
    http.request('GET', 'http://localhost', {}, function (err, result) {
      assert.equals(result, undefined);
      done();
    });
  },
  'should not set proxy when URL hostname is on no proxy hosts opt': function (done) {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.url, 'http://someurl');
      assert.equals(params.proxy, undefined);
      cb(null, { statusCode: 200, body: 'somebody' });
    });
    http.request('GET', 'http://someurl', { noProxyHosts: ['someurl'] }, function (err, result) {
      assert.equals(result, undefined);
      done();
    });
  },
  'should follow non-GET redirection': function (done) {
    this.stub(request, 'post', function (params, cb) {
      assert.isTrue(params.followAllRedirects);
      cb(null, { statusCode: 302, body: 'somebody' });
    });
    function _redirect(result, cb) {
      cb(null, result);
    }
    http.request('POST', 'http://someurl', { handlers: { 302: _redirect }}, function (err, result) {
      assert.isNull(err);
      done();
    });
  },
  'should set timeout': function (done) {
    this.stub(request, 'post', function (params, cb) {
      assert.equals(params.timeout, 10000);
      cb(null, { statusCode: 200 });
    });
    function _success(result, cb) {
      cb(null, result);
    }
    http.request('POST', 'http://someurl', { timeout: 10000, handlers: { 200: _success }}, function (err, result) {
      assert.isNull(err);
      done();
    });
  },
  'should set headers': function (done) {
    this.stub(request, 'post', function (params, cb) {
      assert.equals(params.headers.foo, 'bar');
      cb(null, { statusCode: 200 });
    });
    function _success(result, cb) {
      cb(null, result);
    }
    http.request('POST', 'http://someurl', { headers: { foo: 'bar' }, handlers: { 200: _success }}, function (err, result) {
      assert.isNull(err);
      done();
    });
  },
  'should set request payload': function (done) {
    this.stub(request, 'post', function (params, cb) {
      assert.equals(params.json, '{ "foo": "bar" }');
      cb(null, { statusCode: 200 });
    });
    function _success(result, cb) {
      cb(null, result);
    }
    http.request('POST', 'http://someurl', { json: '{ "foo": "bar" }', handlers: { 200: _success }}, function (err, result) {
      assert.isNull(err);
      done();
    });
  },
  'should override http#req params when requestOpts is provided': function (done) {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    this.stub(request, 'get', function (params, cb) {
      assert.equals(params.proxy, 'http://overrideproxy');
      cb(null, { statusCode: 200, body: 'somebody' });
    });
    function _success(result, cb) {
      cb(null, result);
    }
    http.request('GET', 'http://someurl', { requestOpts: { proxy: 'http://overrideproxy' }, handlers: { 200: _success }}, function (err, result) {
      assert.isNull(err);
      done();
    });
  }
});

buster.testCase('http - proxy', {
  'should return http proxy when url uses http and both http and https proxy exist': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    assert.equals(http.proxy('http://someurl'), 'http://someproxy');
  },
  'should return undefined when url uses http and https proxy exist but not http proxy': function () {
    this.stub(process, 'env', { https_proxy: 'https://someproxy' });
    assert.equals(http.proxy('http://someurl'), undefined);
  },
  'should return undefined when url uses http and no proxy environment variable exists': function () {
    this.stub(process, 'env', {});
    assert.equals(http.proxy('http://someurl'), undefined);
  },
  'should return https proxy when url uses https and both http and https proxy exist': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    assert.equals(http.proxy('https://someurl'), 'https://someproxy');
  },
  'should return https proxy when url uses https and both http and HTTPS PROXY exist': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', HTTPS_PROXY: 'https://someproxy' });
    assert.equals(http.proxy('https://someurl'), 'https://someproxy');
  },
  'should return http proxy when url uses https and http proxy exists but not https proxy': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy' });
    assert.equals(http.proxy('https://someurl'), 'http://someproxy');
  },
  'should return http proxy when url uses https and HTTP PROXY exists but not https proxy': function () {
    this.stub(process, 'env', { HTTP_PROXY: 'http://someproxy' });
    assert.equals(http.proxy('https://someurl'), 'http://someproxy');
  },
  'should return undefined when url uses https and no proxy environment variable exist': function () {
    this.stub(process, 'env', {});
    assert.equals(http.proxy('http://someurl'), undefined);
  },
  'should return http proxy when url does not specify protocol and both http and https proxy exist': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    assert.equals(http.proxy('someurl'), 'http://someproxy');
  },
  'should return undefined when url does not specify protocol and https proxy exists but not http proxy': function () {
    this.stub(process, 'env', { https_proxy: 'https://someproxy' });
    assert.equals(http.proxy('someurl'), undefined);
  },
  'should return undefined when url does not specify protocol and no proxy environment variable exists': function () {
    this.stub(process, 'env', {});
    assert.equals(http.proxy('someurl'), undefined);
  },
  'should return http proxy when url is not specified and both http and https proxy exist': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy', https_proxy: 'https://someproxy' });
    assert.equals(http.proxy(), 'http://someproxy');
  },
  'should return http proxy when url is not specified and http proxy exists but not https proxy': function () {
    this.stub(process, 'env', { http_proxy: 'http://someproxy' });
    assert.equals(http.proxy(), 'http://someproxy');
  },
  'should return http proxy when url is not specified and HTTP PROXY exists but not https proxy': function () {
    this.stub(process, 'env', { HTTP_PROXY: 'http://someproxy' });
    assert.equals(http.proxy(), 'http://someproxy');
  },
  'should return https proxy when url is not specified and https proxy exists but not http proxy': function () {
    this.stub(process, 'env', { https_proxy: 'https://someproxy' });
    assert.equals(http.proxy(), 'https://someproxy');
  },
  'should return http proxy when url is not specified and HTTPS PROXY exists but not https proxy': function () {
    this.stub(process, 'env', { HTTPS_PROXY: 'https://someproxy' });
    assert.equals(http.proxy(), 'https://someproxy');
  },
  'should return https proxy when url is not specified and HTTPS PROXY exists but not http proxy': function () {
    this.stub(process, 'env', { HTTPS_PROXY: 'https://someproxy' });
    assert.equals(http.proxy(), 'https://someproxy');
  },
  'should return undefined when url is not specified and no proxy environment variable exists': function () {
    this.stub(process, 'env', {});
    assert.equals(http.proxy(), undefined);
  }
});