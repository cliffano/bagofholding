var bag = require('../lib/bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks;

describe('bagofholding', function () {

  function create(checks, mocks) {
  }
  
  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  it('should expose all modules', function () {
    should.exist(bag.cli);
    should.exist(bag.mock);
    should.exist(bag.obj);
    should.exist(bag.text);
  });
});
