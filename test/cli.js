var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  cli;

describe('cli', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/cli', {
      requires: mocks ? mocks.requires : {},
      globals: {
        console: bag.mock.console(checks),
        process: bag.mock.process(checks)
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('exec', function () {

    it('should log and camouflage error to callback when an error occurs and fallthrough is allowed', function (done) {
      mocks = {
        requires: {
          child_process: bag.mock.child_process(checks, {
            child_process_exec_err: new Error('someerror'),
            child_process_exec_stderr: 'somestderr'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', true, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb.arguments;
        done();
      });
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('Error: somestderr');
      checks.child_process_exec__args[0].should.equal('somecommand');
      checks.child_process_exec_cb_args.length.should.equal(2);
      should.not.exist(checks.child_process_exec_cb_args[0]);
      checks.child_process_exec_cb_args[1].status.should.equal('error');
      checks.child_process_exec_cb_args[1].error.message.should.equal('someerror');
    });

    it('should log and pass error to callback when an error occurs and fallthrough is not allowed', function (done) {
      mocks = {
        requires: {
          child_process: bag.mock.child_process(checks, {
            child_process_exec_err: new Error('someerror'),
            child_process_exec_stderr: 'somestderr'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', false, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb.arguments;
        done();
      });
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('Error: somestderr');
      checks.child_process_exec__args[0].should.equal('somecommand');
      checks.child_process_exec_cb_args.length.should.equal(1);
      checks.child_process_exec_cb_args[0].message.should.equal('someerror');
    });

    it('should log output and pass success callback when there is no error', function (done) {
      mocks = {
        requires: {
          child_process: bag.mock.child_process(checks, {
            child_process_exec_stdout: 'somestdout'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', false, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb.arguments;
        done();
      });
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('somestdout');
      checks.child_process_exec__args[0].should.equal('somecommand');
      checks.child_process_exec_cb_args.length.should.equal(2);
      should.not.exist(checks.child_process_exec_cb_args[0]);
      checks.child_process_exec_cb_args[1].status.should.equal('ok');
    });
  });

  describe('exit', function () {

    it('should exit with status code 0 when error does not exist', function () {
      cli = create(checks);
      cli.exit(null);
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and logs the error message when error exists', function () {
      cli = create(checks);
      cli.exit(new Error('some error'));
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });
  });

  describe('exit_cb', function () {

    it('should exit with status code 0 and logs the result when error does not exist and no success callback is specified', function () {
      cli = create(checks, mocks);
      cli.exit_cb()(null, 'some success');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and logs the error message when error exists and no error callback is specified', function () {
      cli = create(checks, mocks);
      cli.exit_cb()(new Error('some error'));
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });

    it('should exit with status code 0 and call success callback when error does not exist and success callback is specified', function (done) {
      cli = create(checks, mocks);
      cli.exit_cb(null, function (result) {
        checks.success_result = result;
        done();
      })(null, 'some success');
      checks.success_result.should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and call error callback when error exists and error callback is specified', function (done) {
      cli = create(checks, mocks);
      cli.exit_cb(function (err) {
        checks.error_err = err;
        done();
      })(new Error('some error'));
      checks.error_err.message.should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });
  });
});