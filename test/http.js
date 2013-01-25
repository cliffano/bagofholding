var buster = require('buster'),
  http = require('../lib/http'),
  request = require('request');

buster.testCase('http - request', {
  'should pass error to callback when there is an error while sending request': function (done) {
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
  }
});