var bag = require('../lib/bagofholding'),
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

    it('should call callback with mock error, stdout, and stderr when exec is called', function (done) {
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

    it('should register messages when child process fork\'s send is called', function () {
      var childProcess = mock.childProcess(checks, mocks),
        fork = childProcess.fork('/path/to/somemodule.js');
      checks.child_process_fork__args.length.should.equal(1);
      checks.child_process_fork__args[0].should.equal('/path/to/somemodule.js');
      fork.send('somemessage');
      fork.send({ foo: 'bar' });
      checks.child_process_fork_sends.length.should.equal(2);
      checks.child_process_fork_sends[0].should.equal('somemessage');
      checks.child_process_fork_sends[1].foo.should.equal('bar');
    });
  });

  describe('commander', function () {

    it('should register action functions when action is called multiple times', function () {
      var commander = mock.commander(checks, mocks);
      commander.action(function () {});
      commander.action(function () {});
      checks.commander_actions.length.should.equal(2);
      checks.commander_actions[0].should.be.a('function');
      checks.commander_actions[1].should.be.a('function');
    });

    it('should register command names when command is called multiple times in a chain', function () {
      var commander = mock.commander(checks, mocks);
      commander.command('cmd1').command('cmd2');
      checks.commander_commands.length.should.equal(2);
      checks.commander_commands[0].should.equal('cmd1');
      checks.commander_commands[1].should.equal('cmd2');
    });

    it('should register descriptions when description is called multiple times in a chain', function () {
      var commander = mock.commander(checks, mocks);
      commander.description('command 1').description('command 2');
      checks.commander_descs.length.should.equal(2);
      checks.commander_descs[0].should.equal('command 1');
      checks.commander_descs[1].should.equal('command 2');
    });

    it('should register option details when option is called multiple times', function () {
      var commander = mock.commander(checks, mocks);
      commander.option('-a, --aa <foo>', 'aaa', function () {});
      commander.option('-b, --bb <bar>', 'bbb', function () {});
      checks.commander_options.length.should.equal(2);
      checks.commander_options[0].arg.should.equal('-a, --aa <foo>');
      checks.commander_options[0].desc.should.equal('aaa');
      checks.commander_options[0].action.should.be.a('function');
      checks.commander_options[1].arg.should.equal('-b, --bb <bar>');
      checks.commander_options[1].desc.should.equal('bbb');
      checks.commander_options[1].action.should.be.a('function');
    });

    it('should set process arguments when parse is called', function () {
      var commander = mock.commander(checks, mocks);
      commander.parse(['node', '/somedir', 'cmd1']);
      checks.commander_parse.length.should.equal(3);
      checks.commander_parse[0].should.equal('node');
      checks.commander_parse[1].should.equal('/somedir');
      checks.commander_parse[2].should.equal('cmd1');
    });

    it('should set version number when version is called', function () {
      var commander = mock.commander(checks, mocks);
      commander.version('1.2.3');
      checks.commander_version.should.equal('1.2.3');
    });
  });

  describe('console', function () {

    it('should set message when console error is called', function () {
      var console = mock.console(checks);
      console.error('some error');
      console.error('foo %s', 'bar');
      checks.console_error_messages.length.should.equal(2);
      checks.console_error_messages[0].should.equal('some error');
      checks.console_error_messages[1].should.equal('foo bar');
    });

    it('should set message when console log is called', function () {
      var console = mock.console(checks);
      console.log('some log');
      console.log('foo %s', 'bar');
      checks.console_log_messages.length.should.equal(2);
      checks.console_log_messages[0].should.equal('some log');
      checks.console_log_messages[1].should.equal('foo bar');
    });
  });

  describe('fs', function () {

    it('should return mock stream when createWriteStream is called', function () {
      mocks.fs_createWriteStream = 'somestream';
      var fs = mock.fs(checks, mocks);
      fs.createWriteStream('/path/to/somefile', { flags: 'w', encoding: 'utf-8' }).should.equal('somestream');
      checks.fs_createWriteStream_path.should.equal('/path/to/somefile');
      checks.fs_createWriteStream_opts.flags.should.equal('w');
      checks.fs_createWriteStream_opts.encoding.should.equal('utf-8');
    });

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

  describe('httpReq', function () {

    it('should count how many times httpReq close is called', function () {
      var httpReq = mock.httpReq(checks);
      should.not.exist(checks.httpreq_end__count);
      httpReq.end();
      checks.httpreq_end__count.should.equal(1);
      httpReq.end();
      httpReq.end();
      httpReq.end();
      httpReq.end();
      checks.httpreq_end__count.should.equal(5);
    });

    it('should call callback with correct mock arguments when httpReq event is called', function (done) {

      mock.httpReq(checks, {
        httpreq_on_someevent: ['foo', 'bar']
      }).on('someevent', function cb(arg1, arg2) {
        checks.httpreq_on_someevent_cb_args = cb['arguments'];
        done();
      });
      checks.httpreq_on_someevent__args.length.should.equal(2);
      checks.httpreq_on_someevent__args[0].should.equal('someevent');
      checks.httpreq_on_someevent__args[1].should.be.a('function');
      checks.httpreq_on_someevent_cb_args.length.should.equal(2);
      checks.httpreq_on_someevent_cb_args[0].should.equal('foo');
      checks.httpreq_on_someevent_cb_args[1].should.equal('bar');
    });
  });

  describe('httpRes', function () {

    it('should count how many times httpRes close is called', function () {
      var httpRes = mock.httpRes(checks);
      should.not.exist(checks.httpres_end__count);
      httpRes.end();
      checks.httpres_end__count.should.equal(1);
      httpRes.end();
      httpRes.end();
      httpRes.end();
      httpRes.end();
      checks.httpres_end__count.should.equal(5);
    });

    it('should return mock headers when httpRes statusCode is called', function () {
      mocks.httpres_headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
      };
      var httpRes = mock.httpRes(checks, mocks);
      httpRes.headers['Content-Type'].should.equal('application/x-www-form-urlencoded');
    });

    it('should call callback with correct mock arguments when httpRes event is called', function (done) {

      mock.httpRes(checks, {
        httpres_on_someevent: ['foo', 'bar']
      }).on('someevent', function cb(arg1, arg2) {
        checks.httpres_on_someevent_cb_args = cb['arguments'];
        done();
      });
      checks.httpres_on_someevent__args.length.should.equal(2);
      checks.httpres_on_someevent__args[0].should.equal('someevent');
      checks.httpres_on_someevent__args[1].should.be.a('function');
      checks.httpres_on_someevent_cb_args.length.should.equal(2);
      checks.httpres_on_someevent_cb_args[0].should.equal('foo');
      checks.httpres_on_someevent_cb_args[1].should.equal('bar');
    });

    it('should set encoding value when setEncoding is called', function () {
      var httpRes = mock.httpRes(checks, mocks);
      httpRes.setEncoding('utf-8');
      checks.httpres_setencoding_encoding.should.equal('utf-8');
    });

    it('should return mock status code when httpRes statusCode is called', function () {
      mocks.httpres_statuscode = 503;
      var httpRes = mock.httpRes(checks, mocks);
      httpRes.statusCode.should.equal(503);
    });
  });

  describe('process', function () {

    it('should return mock process arguments when process argv is called', function () {
      mocks = {
        process_argv: [ 'node', '/home/blah', 'cmd1' ]
      };
      var process = mock.process(checks, mocks);
      process.argv.length.should.equal(3);
      process.argv[0].should.equal('node');
      process.argv[1].should.equal('/home/blah');
      process.argv[2].should.equal('cmd1');
    });

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

    it('should return mock process ID when process pid is called', function () {
      mocks = {
        process_pid: 12345
      };
      var process = mock.process(checks, mocks);
      process.pid.should.equal(12345);
    });

    it('should return mock platform when process platform is called', function () {
      mocks = {
        process_platform: 'win32'
      };
      var process = mock.process(checks, mocks);
      process.platform.should.equal('win32');
    });

    it('should call callback with correct mock arguments when process event is called', function (done) {
      mock.process(checks, {
        process_on_someevent: ['foo', 'bar']
      }).on('someevent', function cb(arg1, arg2) {
        checks.process_on_someevent_cb_args = cb['arguments'];
        done();
      });
      checks.process_on_someevent__args.length.should.equal(2);
      checks.process_on_someevent__args[0].should.equal('someevent');
      checks.process_on_someevent__args[1].should.be.a('function');
      checks.process_on_someevent_cb_args.length.should.equal(2);
      checks.process_on_someevent_cb_args[0].should.equal('foo');
      checks.process_on_someevent_cb_args[1].should.equal('bar');
    });

    it('should not emit event when mock event data is not specified', function () {
      mock.process(checks, mocks).on('someevent', function cb() {});
      should.not.exist(checks.process_on_someevent__args);
    });
  });

  describe('request', function () {

    it('should set request options value when request is called', function () {
      mock.request(checks, mocks)({ method: 'get', uri: 'http://localhost:8080'}, function () {});
      checks.request_opts.method.should.equal('get');
      checks.request_opts.uri.should.equal('http://localhost:8080');
    });

    it('should pass error to callback when mock error exists', function (done) {
      mocks = {
        request_err: new Error('someerror')
      };
      mock.request(checks, mocks)({ method: 'get', uri: 'http://localhost:8080'}, function (err, result) {
        checks.request_err = err;
        checks.request_result = result;
        done();
      });
      checks.request_err.message.should.equal('someerror');
      should.not.exist(checks.request_result);
    });

    it('should not pass any error to callback when mock error does not exist', function (done) {
      mocks = {
        request_result: 'someresult'
      };
      mock.request(checks, mocks)({ method: 'get', uri: 'http://localhost:8080'}, function (err, result) {
        checks.request_err = err;
        checks.request_result = result;
        done();
      });
      should.not.exist(checks.request_err);
      checks.request_result.should.equal('someresult');
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

    it('should not emit event when mock event data is not specified', function () {
      mock.socket(checks, mocks).on('someevent', function cb() {});
      should.not.exist(checks.socket_on_someevent__args);
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

  describe('stream', function () {

    it('should add string to stream when end is called once', function () {
      var stream = mock.stream(checks, mocks);
      stream.end('foo');
      checks.stream_end_string.should.equal('foo');
    });

    it('should throw error when end is called more than once', function (done) {
      var stream = mock.stream(checks, mocks);
      stream.end('foo');
      try {
        stream.end('foo');
      } catch (err) {
        err.message.should.equal('stream#end can only be called once');
        done();
      }
    });

    it('should call callback with correct mock arguments when socket event is called', function (done) {
      mock.stream(checks, {
        stream_on_someevent: ['foo', 'bar']
      }).on('someevent', function cb(arg1, arg2) {
        checks.stream_on_someevent_cb_args = cb['arguments'];
        done();
      });
      checks.stream_on_someevent__args.length.should.equal(2);
      checks.stream_on_someevent__args[0].should.equal('someevent');
      checks.stream_on_someevent__args[1].should.be.a('function');
      checks.stream_on_someevent_cb_args.length.should.equal(2);
      checks.stream_on_someevent_cb_args[0].should.equal('foo');
      checks.stream_on_someevent_cb_args[1].should.equal('bar');
    });

    it('should not emit event when mock event data is not specified', function () {
      mock.stream(checks, mocks).on('someevent', function cb() {});
      should.not.exist(checks.stream_on_someevent__args);
    });

    it('should add string to stream when write is called', function () {
      var stream = mock.stream(checks, mocks);
      stream.write('foo');
      stream.write('bar');
      stream.write('xyz');
      checks.stream_write_strings.length.should.equal(3);
      checks.stream_write_strings[0].should.equal('foo');
      checks.stream_write_strings[1].should.equal('bar');
      checks.stream_write_strings[2].should.equal('xyz');
    });

    it('should return mock status when write is called', function () {
      var stream = mock.stream(checks, mocks);
      mocks.stream_write_status = true;
      stream.write('foo').should.equal(true);
      stream.write('bar').should.equal(true);
      mocks.stream_write_status = false;
      stream.write('xyz').should.equal(false);
    });
  });
});
