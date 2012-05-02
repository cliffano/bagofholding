var obj = require('./obj');

/**
 * mock#console(checks)
 * - checks (object): an object to store exec values in, to be checked in the test
 *
 * Mock console module.
 **/
function console(checks) {

  checks.console_error_messages = [];
  checks.console_log_messages = [];

  function error(message) {
    checks.console_error_messages.push(message);
  }

  function log(message) {
    checks.console_log_messages.push(message);
  }
  
  return {
    error: error,
    log: log 
  };
}

/**
 * mock#process(checks)
 * - checks (object): an object to store exec values in, to be checked in the test
 *
 * Mock process module.
 **/
function process(checks) {

  function exit(code) {
    checks.process_exit_code = code;
  }

  return {
    exit: exit
  };
}

exports.console = console;
exports.process = process;