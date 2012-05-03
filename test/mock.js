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

  describe('socket', function () {

    it('should count how many times socket close is called', function () {
      var socket = mock.socket(checks);
      assert.equal(checks.socket_close_count, undefined);
      socket.close();
      assert.equal(checks.socket_close_count, 1);
      socket.close();
      socket.close();
      socket.close();
      socket.close();
      assert.equal(checks.socket_close_count, 5);
    });

    it('should call callback with correct mock arguments when socket event is called', function () {
      mock.socket(checks, {
        socket_on_someevent: ['foo', 'bar']
      }).on('someevent', function (arg1, arg2) {
        checks['socket_on_someevent_args'] = [arg1, arg2];
      });
      assert.equal(checks.socket_on_someevent_args.length, 2);
      assert.equal(checks.socket_on_someevent_args[0], 'foo');
      assert.equal(checks.socket_on_someevent_args[1], 'bar');
    });

    it('should call callback with correct mock arguments when socket send is called', function () {
      var buffer = new Buffer('somemessage');
      mock.socket(checks, {
        socket_send: ['foo', 'bar']
      }).send(buffer, 0, buffer.length, 33848, 'http://host', function (arg1, arg2) {
        checks['socket_send_args'] = [arg1, arg2];
      });
      assert.equal(checks.socket_send_args.length, 2);
      assert.equal(checks.socket_send_args[0], 'foo');
      assert.equal(checks.socket_send_args[1], 'bar');
    });
  });
});