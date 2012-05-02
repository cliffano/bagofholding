var assert = require('assert'),
  bag = require('bagofholding'),
  mocha = require('mocha'),
  sandbox = require('sandboxed-module'),
  mock = require('../lib/mock'),
  checks;

describe('mock', function () {

  beforeEach(function () {
    checks = {};
  });

  describe('console', function () {

    it('should set message when console error is called', function () {
      var console = mock.console(checks);
      console.error('some error');
      assert.equal(checks.console_error_messages.length, 1);
      assert.equal(checks.console_error_messages[0], 'some error');
    });

    it('should set message when console log is called', function () {
      var console = mock.console(checks);
      console.log('some log');
      assert.equal(checks.console_log_messages.length, 1);
      assert.equal(checks.console_log_messages[0], 'some log');
    });
  });

  describe('process', function () {

    it('should set code when process exit is called', function () {
      var process = mock.process(checks);
      process.exit(1);
      assert.equal(checks.process_exit_code, 1);
    });
  });
});