var assert = require('assert'),
  bag = require('bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  cli,
  checks;

describe('cli', function () {

  beforeEach(function () {
    checks = {};
    cli = sandbox.require('../lib/cli', {
      requires: {
        commander: {

        }
      },
      globals: {
        console: bag.mock.console(checks),
        process: bag.mock.process(checks)
      }
    });
  });

  describe('exit', function () {

    it('should exit with status code 0 when error does not exist', function () {
      cli.exit(null);
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and logs the error message when error exists', function () {
      cli.exit(new Error('some error'));
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });
  });

  describe('exit_cb', function () {

    it('should exit with status code 0 and logs the result when error does not exist and no success callback is specified', function () {
      cli.exit_cb()(null, 'some success');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and logs the error message when error exists and no error callback is specified', function () {
      cli.exit_cb()(new Error('some error'));
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });

    it('should exit with status code 0 and call success callback when error does not exist and success callback is specified', function () {
      function successCb(result) {
        checks.success_result = result;
      }
      cli.exit_cb(null, successCb)(null, 'some success');
      checks.success_result.should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and call error callback when error exists and error callback is specified', function () {
      function errorCb(err) {
        checks.error_err = err;
      }
      cli.exit_cb(errorCb)(new Error('some error'));
      checks.error_err.message.should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });
  });
});