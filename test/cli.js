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
        process: bag.mock.process(checks, mocks)
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
          child_process: bag.mock.childProcess(checks, {
            child_process_exec_err: new Error('someerror'),
            child_process_exec_stderr: 'somestderr'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', true, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb['arguments'];
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
          child_process: bag.mock.childProcess(checks, {
            child_process_exec_err: new Error('someerror'),
            child_process_exec_stderr: 'somestderr'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', false, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb['arguments'];
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
          child_process: bag.mock.childProcess(checks, {
            child_process_exec_stdout: 'somestdout'
          })
        }
      };
      cli = create(checks, mocks);
      cli.exec('somecommand', false, function cb(arg1, arg2) {
        checks.child_process_exec_cb_args = cb['arguments'];
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

  describe('exitCb', function () {

    it('should exit with status code 0 and logs the result when error does not exist and no success callback is specified', function () {
      cli = create(checks, mocks);
      cli.exitCb()(null, 'some success');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and logs the error message when error exists and no error callback is specified', function () {
      cli = create(checks, mocks);
      cli.exitCb()(new Error('some error'));
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });

    it('should exit with status code 0 and call success callback when error does not exist and success callback is specified', function (done) {
      cli = create(checks, mocks);
      cli.exitCb(null, function (result) {
        checks.success_result = result;
        done();
      })(null, 'some success');
      checks.success_result.should.equal('some success');
      checks.process_exit_code.should.equal(0);
    });

    it('should exit with status code 1 and call error callback when error exists and error callback is specified', function (done) {
      cli = create(checks, mocks);
      cli.exitCb(function (err) {
        checks.error_err = err;
        done();
      })(new Error('some error'));
      checks.error_err.message.should.equal('some error');
      checks.process_exit_code.should.equal(1);
    });
  });

  describe('readConfigFileSync', function () {
    
    it('should return file content in home directory when all files exist', function () {
      mocks = {
        process_env: { HOME: '/home/blah' },
        process_cwd: '/curr/dir',
        'fs_readFileSync_/home/blah/.conf.json': 'homedirfilecontent',
        'fs_readFileSync_/curr/dir/.conf.json': 'currdirfilecontent'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readConfigFileSync('.conf.json').should.equal('homedirfilecontent');
      checks.fs_readFileSync_file.should.equal('/home/blah/.conf.json');
    });

    it('should return file content in current directory when it exists but not in home directory', function () {
      mocks = {
        process_env: { HOME: '/home/blah' },
        process_cwd: '/curr/dir',
        'fs_readFileSync_/curr/dir/.conf.json': 'currdirfilecontent'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readConfigFileSync('.conf.json').should.equal('currdirfilecontent');
      checks.fs_readFileSync_file.should.equal('/curr/dir/.conf.json');
    });

    it('should throw an error when configuration file does not exist anywhere', function () {
      mocks = {
        process_env: { HOME: '/home/blah' },
        process_cwd: '/curr/dir'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      try {
        cli.readConfigFileSync('.conf.json').should.equal('homedirfilecontent');
        should.fail('an error should\'ve been thrown');
      } catch (err) {
        err.message.should.equal('Unable to find configuration file in /home/blah/.conf.json, /curr/dir/.conf.json');
      }
      checks.fs_readFileSync_file.should.equal('/curr/dir/.conf.json');
    });
  });
});
