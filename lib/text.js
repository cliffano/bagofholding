var async = require('async'),
  jazz = require('jazz');

/**
 * text#applyPrecompiled(template, params) -> String
 * - template (String): pre-compiled template
 * - params (Object): an object containing parameter key value mapping
 *
 * Apply parameters/functions to specified pre-compiled template.
 * This is handy when template needs to be compiled only once in userland,
 * then applied multiple times.
 **/
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
 * text#apply(text, params) -> String
 * - text (String): a text containing {param} parameter placeholders, can also contain simple {function('arg1', ... , 'argN')} function calls
 * - params (Object): an object containing parameter key value mapping
 *
 * Apply parameters/functions to specified text.
 * E.g. The text 'Hello {name}' with param { name: 'FooBar' } will become 'Hello FooBar'.
 * The text 'Today is {now('dd-mm-yyyy')}' will become 'Today is 09-05-2012' (whatever today's date is)
 **/
function apply(text, params) {

  text = text || '';

  return this.applyPrecompiled(jazz.compile(text), params);
}

exports.apply = apply;
exports.applyPrecompiled = applyPrecompiled;
