var commander = require('commander'),
  fs = require('fs'),
  p = require('path'),
  v = require('valentine');

/**
 * cli#exit(err, result)
 * - err (Error): error object existence indicates the occurence of an error
 * - result (*): result object
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

exports.exit = exit;