var async = require('async'),
  dateformat = require('dateformat'),
  jazz = require('jazz');

/**
 * text#apply(text, params) -> String
 * - text (String): a text containing {param} parameter placeholders, can also contain simple {function('arg1', ... , 'argN')} pre-defined function calls
 * - params (Object): an object containing parameter key value mapping
 *
 * Apply parameters/functions to specified text.
 * E.g. The text 'Hello {name}' with param { name: 'FooBar' } will become 'Hello FooBar'.
 * The text 'Today is {now('dd-mm-yyyy')}' will become 'Today is 09-05-2012' (whatever today's date is)
 **/
function apply(text, params) {

  text = text || '';
  params = params || {};

  params.now = function (format, cb) {
    cb(dateformat(new Date(), format));
  };

  var applied;

  // template evaluation shouldn't need a callback since it doesn't involve any IO, hence text#apply blocks
  async.whilst(
    function () { return applied === undefined; },
    function (cb) {
      var template = jazz.compile(text);
      template.eval(params, function (result) {
        applied = result;
      });
      setTimeout(cb, 1);
    },
    function (err) {
    }
  );

  return applied;
}

exports.apply = apply;