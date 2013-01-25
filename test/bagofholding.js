var bag = require('../lib/bagofholding'),
  buster = require('buster');

buster.testCase('bagofholding', {
  'should expose all modules': function () {
    assert.defined(bag.cli);
    assert.defined(bag.http);
    assert.defined(bag.irc);
    assert.defined(bag.obj);
    assert.defined(bag.text);
  }
});