var buster = require('buster'),
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