var buster = require('buster'),
  cli = require('../lib/cli'),
  fs = require('fs');

buster.testCase('cli - readFile', {
  setUp: function () {
    this.mockProcess = this.mock(process);
    this.mockFs = this.mock(fs);
  },
  'should return file content in current directory when it exists': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').returns('currdirfilecontent'); 
    var data = cli.readFile('.conf.json');
    assert.equals(data, 'currdirfilecontent');
  },
  'should return file content in home directory when it exists but none exists in current directory and platform is windows': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { USERPROFILE: '/home/dir' });
    this.stub(process, 'platform', 'win32');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist')); 
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').returns('homedirfilecontent'); 
    var data = cli.readFile('.conf.json');
    assert.equals(data, 'homedirfilecontent');
  },
  'should return file content in home directory when it exists but none exists in current directory and platform is non windows': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist')); 
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').returns('homedirfilecontent'); 
    var data = cli.readFile('.conf.json');
    assert.equals(data, 'homedirfilecontent');
  },
  'should throw an error when configuration file does not exist anywhere and file has relative path': function (done) {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist'));
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').throws(new Error('doesnotexist'));
    try {
      cli.readFile('.conf.json');
    } catch (err) {
      assert.equals(err.message, 'Unable to find configuration file in /curr/dir/.conf.json, /home/dir/.conf.json');
      done();
    }
  },
  'should return file content with absolute path when it exists': function () {
    this.mockFs.expects('readFileSync').once().withExactArgs('/absolute/dir/.conf.json').returns('absolutedirfilecontent'); 
    var data = cli.readFile('/absolute/dir/.conf.json');
    assert.equals(data, 'absolutedirfilecontent');
  },
  'should throw an error when configuration file does not exist anywhere and file has absolute path': function (done) {
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/absolute/dir/.conf.json').throws(new Error('doesnotexist'));
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').throws(new Error('doesnotexist'));
    try {
      cli.readFile('/absolute/dir/.conf.json');
    } catch (err) {
      assert.equals(err.message, 'Unable to find configuration file in /absolute/dir/.conf.json, /home/dir/.conf.json');
      done();
    }
  }
});

/*
var bag = require('../lib/bagofholding'),
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

  describe('parse', function () {

    it('should set command details when commander module is used', function () {
      mocks = {
        'fs_readFileSync_/app/foo/package.json': '{ "version": "1.2.3" }',
        'process_argv': { argv: [ 'node', '/somedir', 'cmd1' ] }
      };
      mocks.requires = {
        commander: bag.mock.commander(checks, mocks),
        fs: bag.mock.fs (checks, mocks)
      };
      cli = create(checks, mocks);
      cli.parse({
          cmd1: {
            desc: 'command 1',
            options: [
              { arg: '-a, --aaa <foo>', desc: 'option a', action: function () {} },
              { arg: '-b, --bbb <bar>', desc: 'option b' }
            ],
            action: function () {}
          },
          cmd2: {
            desc: 'command 2',
            options: [
              { arg: '-c, --ccc <xyz>', desc: 'option c' }
            ],
            action: function () {}
          }
        },
        '/app/foo/bar',
        [
          { arg: '-h, --hhh <abc>', desc: 'option h', action: function () {} },
          { arg: '-i, --iii <xyz>', desc: 'option i' }
        ]);
      checks.commander_commands.length.should.equal(2);
      checks.commander_commands[0].should.equal('cmd1');
      checks.commander_commands[1].should.equal('cmd2');
      checks.commander_descs.length.should.equal(2);
      checks.commander_descs[0].should.equal('command 1');
      checks.commander_descs[1].should.equal('command 2');
      checks.commander_options.length.should.equal(5);
      checks.commander_options[0].arg.should.equal('-h, --hhh <abc>');
      checks.commander_options[0].desc.should.equal('option h');
      checks.commander_options[0].action.should.be.a('function');
      checks.commander_options[1].arg.should.equal('-i, --iii <xyz>');
      checks.commander_options[1].desc.should.equal('option i');
      should.not.exist(checks.commander_options[1].action);
      checks.commander_options[2].arg.should.equal('-a, --aaa <foo>');
      checks.commander_options[2].desc.should.equal('option a');
      checks.commander_options[2].action.should.be.a('function');
      checks.commander_options[3].arg.should.equal('-b, --bbb <bar>');
      checks.commander_options[3].desc.should.equal('option b');
      should.not.exist(checks.commander_options[3].action);
      checks.commander_options[4].arg.should.equal('-c, --ccc <xyz>');
      checks.commander_options[4].desc.should.equal('option c');
      should.not.exist(checks.commander_options[4].action);
      checks.fs_readFileSync_file.should.equal('/app/foo/package.json');
      checks.commander_version.should.equal('1.2.3');
      checks.commander_parse.argv.length.should.equal(3);
      checks.commander_parse.argv[0].should.equal('node');
      checks.commander_parse.argv[1].should.equal('/somedir');
      checks.commander_parse.argv[2].should.equal('cmd1');
      checks.commander_actions.length.should.equal(2);
      checks.commander_actions[0].should.be.a('function');
      checks.commander_actions[1].should.be.a('function');
    });
  });

  describe('readFiles', function () {

    it('should read file relative to current directory when the file exists', function (done) {
      mocks = {
        'fs_readFile_error_/curr/foo.js': null,
        'fs_readFile_data_/curr/foo.js': 'somecontent',
        process_cwd: '/curr/dir'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          '../foo.js': {} 
        },
        function (err, results) {
          should.not.exist(err);
          results['../foo.js'].should.equal('somecontent');
          done();
        });
    });

    it('should pass no data when file does not exist and mandatory is false', function (done) {
      mocks = {
        'fs_readFile_error_/curr/foo.js': new Error('File not found: /curr/foo.js'),
        process_cwd: '/curr/dir'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          '../foo.js': { mandatory: false } 
        },
        function (err, results) {
          should.not.exist(err);
          should.not.exist(results['../foo.js']);
          done();
        });
    });

    it('should pass error and no data when file does not exist and mandatory is true', function (done) {
      mocks = {
        'fs_readFile_error_/curr/foo.js': new Error('File not found: /curr/foo.js'),
        process_cwd: '/curr/dir'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          '../foo.js': { mandatory: true } 
        },
        function (err, results) {
          err.message.should.equal('File not found: /curr/foo.js');
          should.not.exist(results['../foo.js']);
          done();
        });
    });

    it('should read file with absolute path when file exists', function (done) {
      mocks = {
        'fs_readFile_error_/curr/blah/foo.js': null,
        'fs_readFile_data_/curr/blah/foo.js': 'somecontent',
        process_cwd: '/curr/dir'
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          '/curr/blah/foo.js': {} 
        },
        function (err, results) {
          should.not.exist(err);
          results['/curr/blah/foo.js'].should.equal('somecontent');
          done();
        });
    });

    it('should read file in home directory when lookup is true and relative location does not exist', function (done) {
      mocks = {
        'fs_readFile_error_/home/foo.js': null,
        'fs_readFile_error_/curr/dir/blah/foo.js': new Error('File not found: /curr/dir/blah/foo.js'),
        'fs_readFile_data_/home/foo.js': 'somecontent',
        process_cwd: '/curr/dir',
        process_env: { HOME: '/home' }
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          'blah/foo.js': { lookup: true } 
        },
        function (err, results) {
          should.not.exist(err);
          results['blah/foo.js'].should.equal('somecontent');
          done();
        });
    });

    it('should read file relative to current directory when the file exists even though lookup is true and lookup file exists', function (done) {
      mocks = {
        'fs_readFile_error_/home/foo.js': null,
        'fs_readFile_error_/curr/dir/blah/foo.js': null,
        'fs_readFile_data_/home/foo.js': 'somelookupcontent',
        'fs_readFile_data_/curr/dir/blah/foo.js': 'somecontent',
        process_cwd: '/curr/dir',
        process_env: { HOME: '/home' }
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          'blah/foo.js': { lookup: true } 
        },
        function (err, results) {
          should.not.exist(err);
          results['blah/foo.js'].should.equal('somecontent');
          done();
        });
    });

    it('should read multiple files when some exist and some do not and none is mandatory', function (done) {
      mocks = {
        'fs_readFile_error_/home/foo.js': null,
        'fs_readFile_error_/curr/dir/blah/bar.js': null,
        'fs_readFile_error_/curr/dir/xyz.js': new Error('File not found: /curr/dir/xyz.js'),
        'fs_readFile_data_/home/foo.js': 'somelookupcontent',
        'fs_readFile_data_/curr/dir/blah/bar.js': 'somecontent',
        process_cwd: '/curr/dir',
        process_env: { HOME: '/home' }
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          'foo.js': { lookup: true },
          'blah/bar.js': {},
          'xyz.js': {}
        },
        function (err, results) {
          should.not.exist(err);
          results['foo.js'].should.equal('somelookupcontent');
          results['blah/bar.js'].should.equal('somecontent');
          should.not.exist(results['xyz.js']);
          done();
        });
    });

    it('should pass error when some exist and some do not and the non existent file is mandatory', function (done) {
      mocks = {
        'fs_readFile_error_/home/foo.js': null,
        'fs_readFile_error_/curr/dir/blah/bar.js': null,
        'fs_readFile_error_/curr/dir/xyz.js': new Error('File not found: /curr/dir/xyz.js, /home/xyz.js'),
        'fs_readFile_data_/home/foo.js': 'somelookupcontent',
        'fs_readFile_data_/curr/dir/blah/bar.js': 'somecontent',
        process_cwd: '/curr/dir',
        process_env: { HOME: '/home' }
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles({
          'foo.js': { lookup: true },
          'blah/bar.js': {},
          'xyz.js': { mandatory: true, lookup: true }
        },
        function (err, results) {
          err.message.should.equal('File not found: /curr/dir/xyz.js, /home/xyz.js');
          should.not.exist(results['xyz.js']);

          // existing files are still included in the results
          results['foo.js'].should.equal('somelookupcontent');
          results['blah/bar.js'].should.equal('somecontent');

          done();
        });
    });

    it('should read an array of files with default settings', function (done) {
      mocks = {
        'fs_exists_/foo.js': true,
        'fs_exists_/curr/dir/blah/bar.js': true,
        'fs_exists_/curr/dir/xyz.js': false,
        'fs_readFile_data_/foo.js': 'somehomecontent',
        'fs_readFile_data_/curr/dir/blah/bar.js': 'somecontent',
        process_cwd: '/curr/dir',
        process_env: { HOME: '/home' }
      };
      mocks.requires = { fs: bag.mock.fs(checks, mocks) };
      cli = create(checks, mocks);
      cli.readFiles([
          '/foo.js',
          'blah/bar.js',
          'xyz.js'
        ],
        function (err, results) {
          should.not.exist(err);
          results['/foo.js'].should.equal('somehomecontent');
          results['blah/bar.js'].should.equal('somecontent');
          should.not.exist(results['xyz.js']);
          done();
        });
    });
  });

  describe('spawn', function () {
    
    it('should write data via stdout and stderr when data event is emitted', function () {
      mocks.stream_on_data = ['somedata'];
      mocks.requires = {
        child_process: bag.mock.childProcess(checks, mocks),
        process: bag.mock.process(checks, mocks)
      };
      cli = create(checks, mocks);
      var spawn = cli.spawn('somecommand', ['arg1', 'arg2'], function (err, result) {
      });
      checks.child_process_spawn__args[0].should.equal('somecommand');
      checks.child_process_spawn__args[1].length.should.equal(2);
      checks.child_process_spawn__args[1][0].should.equal('arg1');
      checks.child_process_spawn__args[1][1].should.equal('arg2');
      checks.stream_on_data__args.length.should.equal(2);
      checks.stream_on_data__args[0].should.equal('data');
      checks.stream_on_data__args[1]('somedata');
      checks.stream_write_strings.length.should.equal(3);
      checks.stream_write_strings[0].should.equal('somedata');
      checks.stream_write_strings[1].should.equal('somedata');
    });

    it('should pass error and exit code to callback when exit code is not 0', function () {
      mocks.socket_on_exit = [1000];
      mocks.requires = {
        child_process: bag.mock.childProcess(checks, mocks),
        process: bag.mock.process(checks, mocks)
      };
      cli = create(checks, mocks);
      var spawn = cli.spawn('somecommand', ['arg1', 'arg2'], function (err, result) {
        checks.spawn_err = err;
        checks.spawn_result = result;
      });
      checks.child_process_spawn__args[0].should.equal('somecommand');
      checks.child_process_spawn__args[1].length.should.equal(2);
      checks.child_process_spawn__args[1][0].should.equal('arg1');
      checks.child_process_spawn__args[1][1].should.equal('arg2');
      checks.spawn_err.message.should.equal('1000');
      checks.spawn_result.should.equal(1000);
    });

    it('should pass no error and exit code to callback when exist code is 0', function () {
      mocks.socket_on_exit = [0];
      mocks.requires = {
        child_process: bag.mock.childProcess(checks, mocks),
        process: bag.mock.process(checks, mocks)
      };
      cli = create(checks, mocks);
      var spawn = cli.spawn('somecommand', ['arg1', 'arg2'], function (err, result) {
        checks.spawn_err = err;
        checks.spawn_result = result;
      });
      checks.child_process_spawn__args[0].should.equal('somecommand');
      checks.child_process_spawn__args[1].length.should.equal(2);
      checks.child_process_spawn__args[1][0].should.equal('arg1');
      checks.child_process_spawn__args[1][1].should.equal('arg2');
      should.not.exist(checks.spawn_err);
      checks.spawn_result.should.equal(0);
    });
  });
});
*/