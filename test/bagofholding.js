var assert = require('assert'),
  bag = require('../lib/bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module');

describe('bagofholding', function () {

  it('should expose all modules', function () {
    assert.equal(bag.cli !== undefined, true);
    assert.equal(typeof bag.cli, 'object');
    assert.equal(bag.mock !== undefined, true);
    assert.equal(typeof bag.mock, 'object');
    assert.equal(bag.obj !== undefined, true);
    assert.equal(typeof bag.obj, 'object');
  });
});