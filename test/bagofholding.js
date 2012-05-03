var assert = require('assert'),
  bag = require('../lib/bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
  should = require('should');

describe('bagofholding', function () {

  it('should expose all modules', function () {
    should.exist(bag.cli);
    should.exist(bag.mock);
    should.exist(bag.obj);
  });
});