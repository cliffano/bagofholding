var _ = require('underscore'),
  child = require('child_process'),
  commander = require('commander'),
  fs = require('fs'),
  p = require('path');

/**
 * cli#exec(command, fallthrough, cb)
 * - command (String): command to execute
 * - fallthrough (Boolean): allow error to be camouflaged as a non-error
 * - cb (Function): standard cb(err, result) callback
 *
 * Execute a single command.
 * Both stderr and stdout will be logged via console.err/log accordingly.
 * Fallthrough is handy in situation where there are multiple execs running in sequence/parallel,
 * and they all have to be executed regardless of success/error status on either one of them.
 **/
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
 * cli#exit(err, result)
 * - err (Error): error object existence indicates the occurence of an error
 * - result (?): result object
 *
 * Handle process exit based on the existence of error.
 * This is handy for command-line tools to use as the final callback.
 * Exit status code 1 indicates an error, exit status code 0 indicates a success.
 * Error message will be logged to the console. Result object is only used for convenient debugging.
 **/
function exit(err, result) {
  if (err) {
    console.error(err.message);
    process.exit(1);
  } else {
    process.exit(0);
  }
}

/**
 * cli#exitCb([errorCb], [successCb])
 * - errorCb(Function): error callback accepts error argument, defaults to logging to console error
 * - successCb(Function): success callback accepts result argument, defaults to logging to console log
 *
 * A higher order function that returns a process exit callback,
 * with error and success callbacks to handle error and result accordingly.
 * Exit status code 1 indicates an error, exit status code 0 indicates a success.
 **/
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
 * cli#readConfigFileSync(file) -> String
 * - file(String): the file name to read
 *
 * Synchronously read configuration file.
 * It looks up for the file at user home directory first,
 * if it doesn't exist, then it looks up in current directory.
 **/
function readConfigFileSync(file) {
  
  var files = _.map(
      [ process.env.HOME, process.cwd() ],
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

exports.exec = exec;
exports.exit = exit;
exports.exitCb = exitCb;
exports.readConfigFileSync = readConfigFileSync;