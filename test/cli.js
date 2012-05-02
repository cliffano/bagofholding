var assert = require('assert'),
  bag = require('bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
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
      assert.equal(checks.process_exit_code, 0);
    });

    it('should exit with status code 1 when error exists and logs the error message', function () {
      cli.exit(new Error('some error'));
      assert.equal(checks.console_error_messages.length, 1);
      assert.equal(checks.console_error_messages[0], 'some error');
      assert.equal(checks.process_exit_code, 1);
    });
  });
});