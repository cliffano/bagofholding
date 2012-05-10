var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks;
  text = require('../lib/text');

describe('text', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/text', {
      globals: {
        Date: function () {
          return mocks.text_date;
        }
      }
    });
  }
  
  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('value', function () {

    it('should return original text when it does not have any param text', function () {
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

    it('should remove parameter when value is not supplied', function () {
      text.apply('{name} {origin}', {}).should.equal(' ');
      text.apply('Hello {name} of {origin}', { name: 'FooBar' }).should.equal('Hello FooBar of ');
    });

    it('should apply now function call when it is used in the text', function () {
      mocks = {
        text_date: new Date(2001, 0, 1)
      }
      create(checks, mocks).apply('Date: {now(\'dd-mm-yyyy\')}').should.equal('Date: 01-01-2001');
    });
  });
});