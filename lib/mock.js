var obj = require('./obj');

/** internal
 * mock#_count(checks, prop)
 * - checks (Object): exec values storage, to be asserted in test client
 * - prop (String): property name used to register the calls
 *
 * Count the number of calls to a function by initialising/incrementing the prop value.
 **/
function _count(checks, prop) {

  prop = prop + '__count';

  if (checks[prop]) {
    checks[prop] += 1;
  } else {
    checks[prop] = 1;
  }
}

/**
 * mock#childProcess(checks, mocks)
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock child_process module.
 **/
function childProcess(checks, mocks) {

  function exec(command, cb) {

    checks.child_process_exec__args = exec.arguments;

    cb(
      mocks.child_process_exec_err,
      mocks.child_process_exec_stdout,
      mocks.child_process_exec_stderr);
  }

  return {
    exec: exec
  };
}

/**
 * mock#console(checks)
 * - checks (Object): exec values storage, to be asserted in test client
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
 * mock#fs(checks, mocks)
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock fs module.
 **/
function fs(checks, mocks) {

  function readFileSync(file) {
    checks.fs_readFileSync_file = file;
    if (mocks['fs_readFileSync_' + file]) {
      return mocks['fs_readFileSync_' + file];
    } else {
      throw new Error('File ' + file + ' does not exist');
    }
  }

  return {
    readFileSync: readFileSync
  };
}

function http_req(checks) {

}

function http_res(checks) {

}

/**
 * mock#process(checks)
 * - checks (Object): exec values storage, to be asserted in test client
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

/**
 * mock#socket(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 *
 * Mock socket module.
 **/
function socket(checks, mocks) {

  function close() {
    _count(checks, 'socket_close');
  }

  function on(event, cb) {
    checks['socket_on_' + event + '__args'] = on.arguments;
    cb.apply(null, mocks['socket_on_' + event]);
  }

  function send(buffer, offset, length, port, address, cb) {
    checks['socket_send__args'] = send.arguments;
    cb.apply(null, mocks['socket_send']);
  }

  return {
    close: close,
    on: on,
    send: send
  };
}

exports.childProcess = childProcess;
exports.console = console;
exports.fs = fs;
exports.process = process;
exports.socket = socket;