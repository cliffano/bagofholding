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
 * mock#childProcess(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock child_process module.
 **/
function childProcess(checks, mocks) {

  mocks = mocks || {};

  function exec(command, cb) {

    checks.child_process_exec__args = exec['arguments'];

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
 * mock#commander(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock commander module.
 **/
function commander(checks, mocks) {

  checks.commander_actions = [];
  checks.commander_commands = [];
  checks.commander_descs = [];
  checks.commander_options = [];

  function action(act) {
    checks.commander_actions.push(act);
  }

  function command(name) {
    checks.commander_commands.push(name);
    return this;
  }

  function description(desc) {
    checks.commander_descs.push(desc);
    return this;
  }

  function option(short, long, desc) {
    checks.commander_options.push({
      short: short,
      long: long,
      desc: desc
    });
  }

  function parse(argv) {
    checks.commander_parse = argv;
  }

  function version(ver) {
    checks.commander_version = ver;
  }

  return {
    action: action,
    command: command,
    description: description,
    option: option,
    parse: parse,
    version: version
  };
}

/**
 * mock#console(checks)
 * - checks (Object): exec values storage, to be asserted in test client
 *
 * Mock console module.
 * error and log functions accept any number of arguments
 **/
function console(checks) {

  checks.console_error_messages = [];
  checks.console_log_messages = [];

  // a simple format to simulate parts of util.format
  // util.format is not used because it's not available in node v0.4.x
  function _format(text, args) {
    var i = 1,
      formatted = String(text).replace(/%[sdj]/g, function (match) {
        switch(match) {
          case '%s': return String(args[i++]);
          case '%d': return Number(args[i++]);
          case '%j': return JSON.stringify(args[i++]);
          default: return match;
        }
      });
    return formatted;
  }

  function error(message, arg1, arg2, arg3) {
    checks.console_error_messages.push(_format(message, error['arguments']));
  }

  function log(message, arg1, arg2, arg3) {
    checks.console_log_messages.push(_format(message, log['arguments']));
  }
  
  return {
    error: error,
    log: log 
  };
}

/**
 * mock#fs(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock fs module.
 **/
function fs(checks, mocks) {

  mocks = mocks || {};

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

/**
 * mock#httpReq(checks, mocks)
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock http request module.
 **/
function httpReq(checks, mocks) {

  mocks = mocks || {};

  function end() {
    _count(checks, 'httpreq_end');
  }

  function on(event, cb) {
    checks['httpreq_on_' + event + '__args'] = on['arguments'];
    cb.apply(null, mocks['httpreq_on_' + event]);
  }

  return {
    end: end,
    on: on
  };
}

/**
 * mock#httpRes(checks, mocks)
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock http response module.
 **/
function httpRes(checks, mocks) {

  mocks = mocks || {};

  function end() {
    _count(checks, 'httpres_end');
  }

  function on(event, cb) {
    checks['httpres_on_' + event + '__args'] = on['arguments'];
    cb.apply(null, mocks['httpres_on_' + event]);
  }
  
  function setEncoding(encoding) {
    checks.httpres_setencoding_encoding = encoding;
  }

  return {
    end: end,
    headers: mocks.httpres_headers,
    on: on,
    setEncoding: setEncoding,
    statusCode: mocks.httpres_statuscode
  };
}

/**
 * mock#process(checks)
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock process module.
 **/
function process(checks, mocks) {

  mocks = mocks || {};

  function cwd() {
    return mocks.process_cwd;
  }

  function exit(code) {
    checks.process_exit_code = code;
  }

  return {
    argv: mocks.process_argv,
    cwd: cwd,
    env: mocks.process_env,
    exit: exit,
    platform: mocks.process_platform
  };
}

/**
 * mock#request(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock request module.
 **/
function request(checks, mocks) {

  function _request(opts, cb) {
    checks.request_opts = opts;
    cb(mocks.request_err, mocks.request_result);
  }

  return _request;
}

/**
 * mock#socket(checks[, mocks])
 * - checks (Object): exec values storage, to be asserted in test client
 * - mocks (Object): mock values storage
 *
 * Mock socket module.
 **/
function socket(checks, mocks) {

  mocks = mocks || {};

  function close() {
    _count(checks, 'socket_close');
  }

  function on(event, cb) {
    if (mocks['socket_on_' + event]) {
      checks['socket_on_' + event + '__args'] = on['arguments'];
      cb.apply(null, mocks['socket_on_' + event]);
    }
  }

  function send(buffer, offset, length, port, address, cb) {
    checks.socket_send__args = send['arguments'];
    cb.apply(null, mocks.socket_send);
  }

  return {
    close: close,
    on: on,
    send: send
  };
}

exports.childProcess = childProcess;
exports.commander = commander;
exports.console = console;
exports.fs = fs;
exports.httpReq = httpReq;
exports.httpRes = httpRes;
exports.process = process;
exports.request = request;
exports.socket = socket;
