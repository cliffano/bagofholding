var _ = require('underscore'),
  async = require('async'),
  child = require('child_process'),
  commander = require('commander'),
  fs = require('fs'),
  p = require('path');

/**
 * Execute a one-liner command.
 * Both stderr and stdout will be logged via console.err/log accordingly.
 * Fallthrough is handy in situation where there are multiple execs running in sequence/parallel,
 * and they all have to be executed regardless of success/error status on either one of them.
 *
 * @param {String} command: command to execute
 * @param {Boolean} fallthrough: allow error to be camouflaged as a non-error
 * @param {Function} cb: standard cb(err, result) callback
 */
function exec(command, fallthrough, cb) {

  child.exec(command, function (err, stdout, stderr) {
    if (err) {
      console.error('Error: ' + stderr);
      if (fallthrough) {
        // camouflage error to allow other execs to keep running
        cb(null, { status: 'error', error: err });
      } else {
        cb(err);
      }
    } else {
      console.log(stdout);
      cb(null, { status: 'ok' });
    }
  });
}

/**
 * Handle process exit based on the existence of error.
 * This is handy for command-line tools to use as the final callback.
 * Exit status code 1 indicates an error, exit status code 0 indicates a success.
 * Error message will be logged to the console. Result object is only used for convenient debugging.
 *
 * @param {Error} err: error object existence indicates the occurence of an error
 * @param {Object} result: result object
 */
function exit(err, result) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  } else {
    process.exit(0);
  }
}

/**
 * A higher order function that returns a process exit callback,
 * with error and success callbacks to handle error and result accordingly.
 * Exit status code 1 indicates an error, exit status code 0 indicates a success.
 *
 * @param {Function} errorCb: error callback accepts error argument, defaults to logging to console error
 * @param {Function} successCb: success callback accepts result argument, defaults to logging to console log
 */
function exitCb(errorCb, successCb) {

  if (!errorCb) {
    errorCb = function (err) {
      console.error(err.message);
    };
  }

  if (!successCb) {
    successCb = function (result) {
      console.log(result);
    };
  }

  return function (err, result) {
    if (err) {
      errorCb(err);
      process.exit(1);
    } else {
      successCb(result);
      process.exit(0);
    }
  };
}

/**
 * Parse command line arguments and execute actions based on the specified commands.
 * Uses commander.js to provide -V / --version to display version number,
 * and -h / --help to display help info.
 *
 * @param {Object} commands: mapping of command name to its options and callback action
 * @param {String} dir: directory where the client module is located, used as a base directory to read package.json file
 * @param {Object} options: global options applicable to all commands
 */
function parse(commands, dir, options) {

  commander.version(JSON.parse(fs.readFileSync(p.join(dir, '../package.json'))).version);

  _.each(options, function (option) {
    commander.option(option.arg, option.desc, option.action);
  });

  _.each(commands, function (command, name) {

    var program = commander
      .command(name)
      .description(command.desc);

    _.each(command.options, function (option) {
      program.option(option.arg, option.desc, option.action);
    });

    program.action(command.action);
  });

  commander.parse(process.argv);
}

/**
 * Parse command line arguments and execute actions based on the specified commands.
 * Uses commander.js to provide -V / --version to display version number,
 * and -h / --help to display help info.
 *
 * @param {String} base: base directory where the client module is located,
 *   used as a base directory to read command file and package.json file,
 *   ideally the value would be the client's __dirname
 * @param {Object} actions: action function for each command in format: { command: { action: function () {} }},
 *   the command name in actions object is then mapped to the command name specified in commandFile
 * @param {Object} opts: optional
 *   - commandFile: relative path to command file from base directory, defaults to 'conf/commands.json'
 */
function command(base, actions, opts) {

  actions = actions || {};
  opts = opts || {};

  var commands = JSON.parse(fs.readFileSync(p.join(base, opts.commandFile || '../conf/commands.json'))),
    pkg = JSON.parse(fs.readFileSync(p.join(base, '../package.json')));

  if (actions.commands && commands.commands) {
    _.each(actions.commands, function (command, name) {
      if (commands.commands[name]) {
        commands.commands[name].action = command.action; 
      }
    });
  }

  commander.version(pkg.version);

  if (commands.options) {
    _.each(commands.options, function (option) {
      commander.option(option.arg, option.desc, option.action);
    });
  }

  _.each(commands.commands, function (command, name) {
    var program = commander
      .command(name)
      .description(command.desc);

    _.each(command.options, function (option) {
      program.option(option.arg, option.desc, option.action);
    });

    program.action(command.action);
  });

  commander.parse(process.argv);
}

/**
 * Synchronously read file based on these rules:
 * - if path is absolute, then check file at absolute path first
 * - if path is relative, then check file at current working directory
 * - if none of the above exists, check file at user home directory
 * - if none exists, throw an error
 * This allows simple file lookup which allows various locations.
 *
 * @param {String} file: the file name to read
 * @return {String} content of the file
 */
function lookupFile(file) {
  var data,
    baseDir = file.match(/^\//) ? p.dirname(file) : process.cwd(),
    homeDir = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
    files = _.map([ baseDir, homeDir ], function (dir) {
      return p.join(dir, file.match(/^\//) ? p.basename(file) : file);
    });

  for (var i = 0, ln = files.length; i < ln; i += 1) {
    try {
      data = fs.readFileSync(files[i]);
      break;
    } catch (err) {
    }
  }

  if (data) {
    return data;
  } else {
    throw new Error('Unable to lookup file in ' + files.join(', '));
  }
}

/**
 * Asynchronously read a list of files in parallel.
 *
 * @param {Object} files: file location as keys (if not absolute path, then file is relative to current directory),
 *   value contains file settings:
 *   - mandatory: if true then error will be passed to callback when file does not exist, defaults to false (allow file to not exist)
 *   - lookup: if true then it will check file location, if file not found then it will check home directory, defaults to false
 *   files can also be an array where each file name will be assigned default settings:
 *   - mandatory: false
 *   - lookup: false
 * @param {Function} cb: caolan/async cb(err, results) callback with results of each command execution
 */
function readFiles(files, cb) {

  // convert array to object with default settings
  if (files && Array.isArray(files)) {
    var temp = {};
    files.forEach(function (file) {
      temp[file] = { mandatory: false, lookup: false };
    });
    files = temp;
  }

  // prepare an array of file locations to read from
  function _locations(file) {

    var locations = [];

    // add original location
    if (!file.match(/^\//)) {
      locations.push(p.join(process.cwd(), file));
    } else {
      locations.push(file);
    }
    // add lookup location at home directory
    if (files[file].lookup === true) {
      locations.push(p.join(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'], p.basename(file)));
    }

    return locations;
  }

  var tasks = {};
  _.keys(files).forEach(function (file) {

    function _read(cb) {

      var locations = _locations(file),
        i = 0,
        ln = locations.length,
        content;
      async.whilst(
        function () {
          return content === undefined && i < ln;
        },
        function (_cb) {
          fs.readFile(locations[i], 'utf-8', function (err, data) {
            i += 1;
            if (err && files[file].mandatory === true) {
              _cb(err);
            } else {
              content = data;
              _cb(null);
            }
          });
        },
        function (err) {
          cb(err, content);
        }
      );
    }
    tasks[file] = _read;
  });

  async.parallel(tasks, cb);
}

/**
 * Execute a command with an array of arguments.
 * E.g. command: make, arguments: -f somemakefile target1 target2 target3
 *      will be executed as: make -f somemakefile target1 target2 target3
 * NOTE: process.stdout.write and process.stderr.write are used because console.log adds a newline
 *
 * @param {String} command: command to execute
 * @param {Array} args: command arguments
 * @param {Function} cb: standard cb(err, result) callback
 */
function spawn(command, args, cb) {

  var _spawn = child.spawn(command, args);

  _spawn.stdout.on('data', function (data) {
    process.stdout.write(data);
  });

  _spawn.stderr.on('data', function (data) {
    process.stderr.write(data);
  });

  _spawn.on('exit', function (code) {
    cb((code !== 0) ? new Error(code) : undefined, code);
  });
}

exports.exec = exec;
exports.exit = exit;
exports.exitCb = exitCb;
exports.parse = parse;
exports.command = command;
exports.lookupFile = lookupFile;
exports.readFiles = readFiles;
exports.spawn = spawn;
