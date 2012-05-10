var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  mock = require('../lib/mock');

describe('mock', function () {

  function create(checks, mocks) {
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
  });

  describe('childProcess', function () {

    it('should ', function (done) {
      mocks = {
        child_process_exec_err: new Error('someerror'),
        child_process_exec_stdout: 'somestdout',
        child_process_exec_stderr: 'somestderr'
      };
      var childProcess = mock.childProcess(checks, mocks);
      childProcess.exec('somecommand', function cb(err, stdout, stderr) {
        checks.child_process_cb_args = cb['arguments'];
        done();
      });
      checks.child_process_exec__args.length.should.equal(2);
      checks.child_process_exec__args[0].should.equal('somecommand');
      checks.child_process_exec__args[1].should.be.a('function');
      checks.child_process_cb_args.length.should.equal(3);
      checks.child_process_cb_args[0].message.should.equal('someerror');
      checks.child_process_cb_args[1].should.equal('somestdout');
      checks.child_process_cb_args[2].should.equal('somestderr');
    });
  });

  describe('console', function () {

    it('should set message when console error is called', function () {
      var console = mock.console(checks);
      console.error('some error');
      checks.console_error_messages.length.should.equal(1);
      checks.console_error_messages[0].should.equal('some error');
    });

    it('should set message when console log is called', function () {
      var console = mock.console(checks);
      console.log('some log');
      checks.console_log_messages.length.should.equal(1);
      checks.console_log_messages[0].should.equal('some log');
    });
  });

  describe('fs', function () {

    it('should return mock file when an existing file is read', function () {
      mocks = {
        'fs_readFileSync_someexistingfile': 'somefilecontent'
      };
      var fs = mock.fs(checks, mocks);
      fs.readFileSync('someexistingfile').should.equal('somefilecontent');
      checks.fs_readFileSync_file.should.equal('someexistingfile');
    });

    it('should throw an error when an inexisting file is read', function (done) {
      var fs = mock.fs(checks, mocks);
      try {
        fs.readFileSync('someinexistingfile');
        should.fail('An error should\'ve been thrown');
      } catch (err) {
        err.message.should.equal('File someinexistingfile does not exist');
        done();
      }
      checks.fs_readFileSync_file.should.equal('someinexistingfile');
    });
  });

  describe('process', function () {

    it('should return mock current directory when process cwd is called', function () {
      mocks = {
        process_cwd: 'somedir'
      };
      var process = mock.process(checks, mocks);
      process.cwd().should.equal('somedir');
    });

    it('should return mock environment variables when process env is called', function () {
      mocks = {
        process_env: { HOME: '/home/blah' }
      };
      var process = mock.process(checks, mocks);
      process.env.HOME.should.equal('/home/blah');
    });

    it('should set code when process exit is called', function () {
      var process = mock.process(checks);
      process.exit(1);
      checks.process_exit_code.should.equal(1);
    });
  });

  describe('socket', function () {

    it('should count how many times socket close is called', function () {
      var socket = mock.socket(checks);
      should.not.exist(checks.socket_close__count);
      socket.close();
      checks.socket_close__count.should.equal(1);
      socket.close();
      socket.close();
      socket.close();
      socket.close();
      checks.socket_close__count.should.equal(5);
    });

    it('should call callback with correct mock arguments when socket event is called', function (done) {

      mock.socket(checks, {
        socket_on_someevent: ['foo', 'bar']
      }).on('someevent', function cb(arg1, arg2) {
        checks.socket_on_someevent_cb_args = cb['arguments'];
        done();
      });
      checks.socket_on_someevent__args.length.should.equal(2);
      checks.socket_on_someevent__args[0].should.equal('someevent');
      checks.socket_on_someevent__args[1].should.be.a('function');
      checks.socket_on_someevent_cb_args.length.should.equal(2);
      checks.socket_on_someevent_cb_args[0].should.equal('foo');
      checks.socket_on_someevent_cb_args[1].should.equal('bar');
    });

    it('should call callback with correct mock arguments when socket send is called', function (done) {

      var buffer = new Buffer('somemessage');
      mock.socket(checks, {
        socket_send: ['foo', 'bar']
      }).send(buffer, 0, buffer.length, 33848, 'http://host', function cb(arg1, arg2) {
        checks.socket_send_cb_args = cb['arguments'];
        done();
      });
      checks.socket_send__args.length.should.equal(6);
      checks.socket_send__args[0].toString().should.equal('somemessage');
      checks.socket_send__args[1].should.equal(0);
      checks.socket_send__args[2].should.equal(11);
      checks.socket_send__args[3].should.equal(33848);
      checks.socket_send__args[4].should.equal('http://host');
      checks.socket_send_cb_args.length.should.equal(2);
      checks.socket_send_cb_args[0].should.equal('foo');
      checks.socket_send_cb_args[1].should.equal('bar');
    });
  });
});
