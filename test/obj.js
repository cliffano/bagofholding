var bag = require('bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks;
  obj = require('../lib/obj');

describe('obj', function () {

  describe('exist', function () {

    it('should return false when object is empty', function () {
      obj.exist('a.b.c', {}).should.be.false;
    });

    it('should return false when object is undefined', function () {
      obj.exist('a.b.c', undefined).should.be.false;
    });

    it('should return false when dsv is empty', function () {
      obj.exist('', { a: 'foo' }).should.be.false;
    });

    it('should return false when dsv is undefined', function () {
      obj.exist(undefined, { a: 'foo' }).should.be.false;
    });

    it('should return true when object contains a property', function () {
      obj.exist('a', { a: 'foo' }).should.be.true;
    });

    it('should return true when object contains nested properties', function () {
      obj.exist('a.b', { a: { b: 'foo' } }).should.be.true;
    });

    it('should return false when object does not contain nested properties', function () {
      obj.exist('a.b.c', { a: { b: 'foo' } }).should.be.false;
    });
  });

  describe('value', function () {

    it('should return undefined when object is empty', function () {
      should.not.exist(obj.value('a.b.c', {}));
    });

    it('should return undefined when object is undefined', function () {
      should.not.exist(obj.value('a.b.c', undefined));
    });

    it('should return undefined when dsv is empty', function () {
      should.not.exist(obj.value('', { a: 'foo' }));
    });

    it('should return undefined when dsv is undefined', function () {
      should.not.exist(obj.value(undefined, { a: 'foo' }));
    });

    it('should return value when object has one property', function () {
      obj.value('a', { a: 'foo' }).should.equal('foo');
    });

    it('should return value when object has nested properties', function () {
      obj.value('a.b', { a: { b: 'foo' } }).should.equal('foo');
    });

    it('should return value when object has multi nested properties', function () {
      var data = { a: { b: 'foo' }, c: 'bar' };
      obj.value('a.b', data).should.equal('foo');
      obj.value('c', data).should.equal('bar');
    });

    it('should return undefined if nested properties do not exist but the name of leaf node property exists as root property in object', function () {
      should.not.exist(obj.value('a.b.c', { a: { b: 'foo' }, c: 'bar' }));
    });
  });
});