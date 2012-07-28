/**
 * Check whether the specified nested properties exist in an object or not.
 *
 * @param {String} dsv: dot-separated nested properties name
 * @param {Object} obj: the object to check against whether the nested properties exist
 * @return {Boolean} true if nested properties value exist, false otherwise
 */
function exist(dsv, obj) {

  return value(dsv, obj) !== undefined;  
}

/**
 * Retrieve the value of nested properties within an object.
 *
 * @param {String} dsv: dot-separated nested properties name
 * @param {Object} obj: the object to find the nested properties from
 * @return {?} value of the nested properties
 */
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