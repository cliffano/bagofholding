var async = require('async'),
  jazz = require('jazz');

/**
 * Apply parameters/functions to specified pre-compiled template.
 * Used in conjunction with text#applyPrecompiled when text needs to be compiled once
 * and then applied multiple times.
 *
 * @param {String} template: pre-compiled template
 * @param {Object} params: an object containing parameter key value mapping
 * @return {String} template merged with the parameters
 */
function applyPrecompiled(template, params) {

  params = params || {};

  var applied;

  // template evaluation shouldn't need a callback since it doesn't involve any IO, hence text#apply blocks
  async.whilst(
    function () { return applied === undefined; },
    function (cb) {
      template.process(params, function (result) {
        applied = result;
      });
      setTimeout(cb, 1);
    },
    function (err) {
    }
  );

  return applied;
}

/**
 * Compile text. An abstraction layer on top of jazz.compile .
 * Used in conjunction with text#applyPrecompiled when text needs to be compiled once
 * and then applied multiple times.
 *
 * @param {String} text: a text containing {param} parameter placeholders, can also contain simple {function('arg1', ... , 'argN')} function calls 
 * @return {Object} compiled template
 */
function compile(text) {

  return jazz.compile(text);
}

/**
 * Apply parameters/functions to specified text.
 * E.g. The text 'Hello {name}' with param { name: 'FooBar' } will become 'Hello FooBar'.
 * The text 'Today is {now('dd-mm-yyyy')}' will become 'Today is 09-05-2012' (whatever today's date is)
 *
 * @param text {String}: a text containing {param} parameter placeholders, can also contain simple {function('arg1', ... , 'argN')} function calls
 * @param params {Object}: an object containing parameter key value mapping
 * @return {String} template merged with the parameters
 */
function apply(text, params) {

  text = text || '';

  return this.applyPrecompiled(this.compile(text), params);
}

exports.apply = apply;
exports.applyPrecompiled = applyPrecompiled;
exports.compile = compile;
