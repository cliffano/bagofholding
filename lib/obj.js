/**
 * obj#exist(dsv, obj) -> boolean
 * - dsv (string): dot-separated nested property names
 * - obj (object): the object to check against whether the nested properties exist
 *
 * Check whether the specified nested properties exist in an object or not.
 **/
function exist(dsv, obj) {

  return value(dsv, obj) !== undefined;  
}

/**
 * obj#value(dsv, obj) -> *
 * - dsv (string): dot-separated nested property names
 * - obj (object): the object to find the nested properties from
 *
 * Retrieve the value of nested properties from an object.
 **/
function value(dsv, obj) {

  dsv = dsv || '';
  obj = obj || {};

  var props = dsv.split('.'),
    _value;

  for (var i = 0, ln = props.length; i < ln; i += 1) {
    _value = (_value) ? _value[props[i]] : obj[props[i]];
    if (_value === undefined) {
      break;
    }
  }

  return _value;
}

exports.exist = exist;
exports.value = value;