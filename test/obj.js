var buster = require('buster'),
  obj = require('../lib/obj');

buster.testCase('obj - exist', {
  'should return false when object is empty': function () {
    assert.isFalse(obj.exist('a.b.c', {}));
  },
  'should return false when object is undefined': function () {
    assert.isFalse(obj.exist('a.b.c', undefined));
  },
  'should return false when dsv is empty': function () {
    assert.isFalse(obj.exist('', { a: 'foo' }));
  },
  'should return false when dsv is undefined': function () {
    assert.isFalse(obj.exist(undefined, { a: 'foo' }));
  },
  'should return true when object contains a property': function () {
    assert.isTrue(obj.exist('a', { a: 'foo' }));
  },
  'should return true when object contains nested properties': function () {
    assert.isTrue(obj.exist('a.b', { a: { b: 'foo' } }));
  },
  'should return false when object does not contain nested properties': function () {
    assert.isFalse(obj.exist('a.b.c', { a: { b: 'foo' } }));
  }
});

buster.testCase('obj - value', {
  'should return undefined when object is empty': function () {
    assert.equals(obj.value('a.b.c', {}), undefined);
  },
  'should return undefined when object is undefined': function () {
    assert.equals(obj.value('a.b.c', undefined), undefined);
  },
  'should return undefined when dsv is empty': function () {
    assert.equals(obj.value('', { a: 'foo' }), undefined);
  },
  'should return undefined when dsv is undefined': function () {
    assert.equals(obj.value(undefined, { a: 'foo' }), undefined);
  },
  'should return value when object has one property': function () {
    assert.equals(obj.value('a', { a: 'foo' }), 'foo');
  },
  'should return value when object has nested properties': function () {
    assert.equals(obj.value('a.b', { a: { b: 'foo' } }), 'foo');
  },
  'should return value when object has multi nested properties': function () {
    var data = { a: { b: 'foo' }, c: 'bar' };
    assert.equals(obj.value('a.b', data), 'foo');
    assert.equals(obj.value('c', data), 'bar');
  },
  'should return undefined if nested properties do not exist but the name of leaf node property exists as root property in object': function () {
    assert.equals(obj.value('a.b.c', { a: { b: 'foo' }, c: 'bar' }), undefined);
  }
});