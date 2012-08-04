var _ = require('underscore'),
  child = require('child_process'),
  commander = require('commander'),
  fs = require('fs'),
  p = require('path');

/**
 * Execute a single command.
 * Both stderr and stdout will be logged via console.err/log accordingly.
 * Fallthrough is handy in situation where there are multiple execs running in sequence/parallel,
 * and they all have to be executed regardless of success/error status on either one of them.
 *
 * @param {String} command: command to execute
 * @param (Boolean) fallthrough: allow error to be camouflaged as a non-error
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
 * Synchronously read configuration file at default locations.
 * It looks up for the file in the current directory first,
 * if the file doesn't exist there, then it looks up in user home directory.
 *
 * @param {String} file: the file name to read
 * @return {String} content of the configuration file
 */
function readConfigFileSync(file) {

  var files = _.map(
      [ process.cwd(), process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] ],
      function (path) {
        return p.join(path, file);
      }
    ),
    data;

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
    throw new Error('Unable to find configuration file in ' + files.join(', '));
  }
}

/**
 * Synchronously read configuration file at a specified a location.
 * It checks whether the location is a full path, or relative to current directory.
 *
 * @param {String} file: the path to config file to read
 * @return {String} content of the configuration file
 */
function readCustomConfigFileSync(file) {

  var data;

  if (!file.match(/^\//)) {
    file = p.join(process.cwd(), file);
  }

  try {
    return fs.readFileSync(file);
  } catch (err) {
    throw new Error('Unable to find configuration file in ' + file);
  }
}

exports.exec = exec;
exports.exit = exit;
exports.exitCb = exitCb;
exports.parse = parse;
exports.readConfigFileSync = readConfigFileSync;
exports.readCustomConfigFileSync = readCustomConfigFileSync;
