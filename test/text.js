var buster = require('buster'),
  jazz = require('jazz'),
  text = require('../lib/text');

buster.testCase('text - applyPrecompiled', {
  'should return original text when it does not have any params': function () {
    var template = jazz.compile('Hello world');
    assert.equals(text.applyPrecompiled(template), 'Hello world');
  },
  'should return text with applied parameter when parameter value is supplied': function () {
    var template = jazz.compile('Hello {name}');
    assert.equals(text.applyPrecompiled(template, { name: 'FooBar' }), 'Hello FooBar');
  },
  'should return text with multiple applied parameters when parameter values are supplied': function () {
    var template = jazz.compile('Hello {name} of {origin}');
    assert.equals(text.applyPrecompiled(template, { name: 'FooBar', origin: 'Rivendell' }), 'Hello FooBar of Rivendell');
  }
});

buster.testCase('text - compile', {
  'should return compiled text': function () {
    assert.isObject(text.compile('Hello world'));
  }
});

buster.testCase('text - apply', {
  'should return original text when it does not have any params': function () {
    assert.equals(text.apply('Hello world'), 'Hello world');
  },
  'should return empty string when text is undefined, null, or blank': function () {
    assert.equals(text.apply(null), '');
    assert.equals(text.apply(undefined), '');
    assert.equals(text.apply(''), '');
  },
  'should return text with applied parameter when parameter value is supplied': function () {
    assert.equals(text.apply('Hello {name}', { name: 'FooBar' }), 'Hello FooBar');
  },
  'should return text with multiple applied parameters when parameter values are supplied': function () {
    assert.equals(text.apply('Hello {name} of {origin}', { name: 'FooBar', origin: 'Rivendell' }), 'Hello FooBar of Rivendell');
  },
  'should return text with multiple function parameters when parameter values are supplied': function () {
    function foo(cb) {
      cb('foo');
    }
    function any(value, cb) {
      cb(value);
    }
    assert.equals(text.apply('I am {foo()} {any(\'bar\')}', { foo: foo, any: any }), 'I am foo bar');
  },
  'should remove parameter when value is not supplied': function () {
    assert.equals(text.apply('{name} {origin}', {}), ' ');
    assert.equals(text.apply('Hello {name} of {origin}', { name: 'FooBar' }), 'Hello FooBar of ');
  }
});