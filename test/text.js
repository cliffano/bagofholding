var bag = require('../lib/bagofholding'),
  jazz = require('jazz'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks;
  text = require('../lib/text');

describe('text', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/text', {
      globals: mocks ? mocks.globals : {}
    });
  }
  
  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('applyPrecompiled', function () {

    it('should return original text when it does not have any params', function () {
      var template = jazz.compile('Hello world');
      text.applyPrecompiled(template).should.equal('Hello world');
    });

    it('should return text with applied parameter when parameter value is supplied', function () {
      var template = jazz.compile('Hello {name}');
      text.applyPrecompiled(template, { name: 'FooBar' }).should.equal('Hello FooBar');
    });

    it('should return text with multiple applied parameters when parameter values are supplied', function () {
      var template = jazz.compile('Hello {name} of {origin}');
      text.applyPrecompiled(template, { name: 'FooBar', origin: 'Rivendell' }).should.equal('Hello FooBar of Rivendell');
    });
  });

  describe('compile', function () {

    it('should return compiled text', function () {
      text.compile('Hello world').should.be.a('object');
    });
  });

  describe('apply', function () {

    it('should return original text when it does not have any params', function () {
      text.apply('Hello world').should.equal('Hello world');
    });

    it('should return empty string when text is undefined, null, or blank', function () {
      text.apply(null).should.equal('');
      text.apply(undefined).should.equal('');
      text.apply('').should.equal('');
    });

    it('should return text with applied parameter when parameter value is supplied', function () {
      text.apply('Hello {name}', { name: 'FooBar' }).should.equal('Hello FooBar');
    });

    it('should return text with multiple applied parameters when parameter values are supplied', function () {
      text.apply('Hello {name} of {origin}', { name: 'FooBar', origin: 'Rivendell' }).should.equal('Hello FooBar of Rivendell');
    });

    it('should return text with multiple function parameters when parameter values are supplied', function () {
      function foo(cb) {
        cb('foo');
      }
      function any(value, cb) {
        cb(value);
      }
      text.apply('I am {foo()} {any(\'bar\')}', { foo: foo, any: any }).should.equal('I am foo bar');
    });

    it('should remove parameter when value is not supplied', function () {
      text.apply('{name} {origin}', {}).should.equal(' ');
      text.apply('Hello {name} of {origin}', { name: 'FooBar' }).should.equal('Hello FooBar of ');
    });
  });
});
