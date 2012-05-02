var assert = require('assert'),
  bag = require('bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
  obj = require('../lib/obj');

describe('obj', function () {

  describe('exist', function () {

    it('should return false when object is empty', function () {
      assert.equal(obj.exist('a.b.c', {}), false);
    });

    it('should return false when object is undefined', function () {
      assert.equal(obj.exist('a.b.c', undefined), false);
    });

    it('should return false when dsv is empty', function () {
      assert.equal(obj.exist('', { a: 'foo' }), false);
    });

    it('should return false when dsv is undefined', function () {
      assert.equal(obj.exist(undefined, { a: 'foo' }), false);
    });

    it('should return true when object contains a property', function () {
      assert.equal(obj.exist('a', { a: 'foo' }), true);
    });

    it('should return true when object contains nested properties', function () {
      assert.equal(obj.exist('a.b', { a: { b: 'foo' } }), true);
    });

    it('should return false when object does not contain nested properties', function () {
      assert.equal(obj.exist('a.b.c', { a: { b: 'foo' } }), false);
    });
  });

  describe('value', function () {

    it('should return undefined when object is empty', function () {
      assert.equal(obj.value('a.b.c', {}), undefined);
    });

    it('should return undefined when object is undefined', function () {
      assert.equal(obj.value('a.b.c', undefined), undefined);
    });

    it('should return undefined when dsv is empty', function () {
      assert.equal(obj.value('', { a: 'foo' }), undefined);
    });

    it('should return undefined when dsv is undefined', function () {
      assert.equal(obj.value(undefined, { a: 'foo' }), undefined);
    });

    it('should return value when object has one property', function () {
      assert.equal(obj.value('a', { a: 'foo' }), 'foo');
    });

    it('should return value when object has nested properties', function () {
      assert.equal(obj.value('a.b', { a: { b: 'foo' } }), 'foo');
    });

    it('should return value when object has multi nested properties', function () {
      var data = { a: { b: 'foo' }, c: 'bar' };
      assert.equal(obj.value('a.b', data), 'foo');
      assert.equal(obj.value('c', data), 'bar');
    });

    it('should return undefined if nested properties do not exist but the name of leaf node property exists as root property in object', function () {
      assert.equal(obj.value('a.b.c', { a: { b: 'foo' }, c: 'bar' }), undefined);
    });
  });
});