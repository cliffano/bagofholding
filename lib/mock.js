var obj = require('./obj');

/**
 * Count the number of calls to a function by initialising/incrementing the prop value.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {String} prop: property name used to register the calls
 */
function _count(checks, prop) {

  prop = prop + '__count';

  if (checks[prop]) {
    checks[prop] += 1;
  } else {
    checks[prop] = 1;
  }
}

/**
 * Mock child_process module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
function childProcess(checks, mocks) {

  checks.child_process_fork_sends = [];

  mocks = mocks || {};

  function exec(command, cb) {

    checks.child_process_exec__args = exec['arguments'];

    cb(
      mocks.child_process_exec_err,
      mocks.child_process_exec_stdout,
      mocks.child_process_exec_stderr);
  }

  function fork(modulePath) {

    checks.child_process_fork__args = fork['arguments'];

    function send(message) {
      checks.child_process_fork_sends.push(message);
    }

    return {
      send: send
    };
  }

  function spawn(command, args) {
    
    checks.child_process_spawn__args = spawn['arguments'];

    return {
      stdout: stream(checks, mocks),
      stderr: stream(checks, mocks),
      on: socket(checks, mocks).on
    };
  }

  return {
    exec: exec,
    fork: fork,
    spawn: spawn
  };
}

/**
 * Mock commander module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
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

  function option(arg, desc, action) {
    checks.commander_options.push({
      arg: arg,
      desc: desc,
      action: action
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
 * Mock console module.
 * error and log functions accept any number of arguments
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 */
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
 * Mock fs module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
function fs(checks, mocks) {

  mocks = mocks || {};

  function createWriteStream(path, opts) {
    checks.fs_createWriteStream_path = path;
    checks.fs_createWriteStream_opts = opts;
    return mocks.fs_createWriteStream;
  }

  function existsSync(file) {
    checks.fs_existsSync_file = file;
    return mocks['fs_existsSync_' + file] || false;
  }

  function readFileSync(file, encoding) {
    checks.fs_readFileSync_file = file;
    checks.fs_readFileSync_encoding = encoding;
    if (mocks['fs_readFileSync_' + file]) {
      return mocks['fs_readFileSync_' + file];
    } else {
      throw new Error('File ' + file + ' does not exist');
    }
  }

  function writeFile(file, data, cb) {
    checks.fs_writeFile_file = file;
    checks.fs_writeFile_data = data;
    cb(mocks.fs_writeFile_error);
  }

  function writeFileSync(file, data, encoding) {
    checks.fs_writeFileSync_file = file;
    checks.fs_writeFileSync_data = data;
    checks.fs_writeFileSync_encoding = encoding;
  }

  return {
    createWriteStream: createWriteStream,
    existsSync: existsSync,
    readFileSync: readFileSync,
    writeFile: writeFile,
    writeFileSync: writeFileSync
  };
}

/**
 * Mock http request module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
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
 * Mock http response module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
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
 * Mock process module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
function process(checks, mocks) {

  mocks = mocks || {};

  function cwd() {
    return mocks.process_cwd;
  }

  function exit(code) {
    checks.process_exit_code = code;
  }

  function nextTick(cb) {
    checks.process_nextTick_cb = cb;
    cb.apply(null, mocks.process_nextTick);
  }

  function on(event, cb) {
    if (mocks['process_on_' + event]) {
      checks['process_on_' + event + '__args'] = on['arguments'];
      cb.apply(null, mocks['process_on_' + event]);
    }
  }

  return {
    argv: mocks.process_argv,
    cwd: cwd,
    env: mocks.process_env,
    exit: exit,
    nextTick: nextTick,
    on: on,
    pid: mocks.process_pid,
    platform: mocks.process_platform,
    stderr: stream(checks, mocks),
    stdout: stream(checks, mocks)
  };
}

/**
 * Mock request module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
function request(checks, mocks) {

  function _request(opts, cb) {
    checks.request_opts = opts;
    cb(mocks.request_err, mocks.request_result);
  }

  return _request;
}

/**
 * Mock socket module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
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

/**
 * Mock stream module.
 *
 * @param {Object} checks: exec values storage, to be asserted in test client
 * @param {Object} mocks: mock values storage
 */
function stream(checks, mocks) {

  checks.stream_write_strings = [];

  mocks = mocks || {};

  function end(string) {
    _count(checks, 'stream_end');
    if (checks.stream_end__count > 1) {
      throw new Error('stream#end can only be called once');
    }

    checks.stream_end_string = string;
  }

  function on(event, cb) {
    if (mocks['stream_on_' + event]) {
      checks['stream_on_' + event + '__args'] = on['arguments'];
      cb.apply(null, mocks['stream_on_' + event]);
    }
  }

  function write(string) {
    checks.stream_write_strings.push(string);
    return mocks.stream_write_status;
  }

  return {
    end: end,
    on: on,
    write: write
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
exports.stream = stream;
