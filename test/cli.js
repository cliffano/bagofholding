var buster = require('buster'),
  childProcess = require('child_process'),
  cli = require('../lib/cli'),
  commander = require('commander'),
  fs = require('fs');

buster.testCase('cli - command', {
  setUp: function () {
    this.mockCommander = this.mock(commander);
    this.mockFs = this.mock(fs);
    this.base = '/some/dir';
    this.actions = {
      commands: {
        command1: { action1: function () {} },
        command2: { action2: function () {} },
        command3: { action3: function () {} }
      }
    };
    this.commands = {
      commands: {
        command1: {
          desc: 'Command1 description',
          options: [
            {
              arg: '-f, --flag',
              desc: 'Flag description'
            }
          ]
        },
        command2: {
          desc: 'Command2 description'
        }
      }
    };
    this.mockFs.expects('readFileSync').once().withExactArgs('/some/package.json').returns(JSON.stringify({ version: '1.2.3' }));
  },
  'should use optional command file when specified': function () {
    this.mockCommander.expects('version').once().withExactArgs('1.2.3');
    this.mockCommander.expects('parse').once().withExactArgs(['arg1', 'arg2']);
    this.mockFs.expects('readFileSync').once().withExactArgs('/some/dir/commands.json').returns(JSON.stringify(this.commands));
    this.stub(process, 'argv', ['arg1', 'arg2']);
    cli.command(this.base, this.actions, {
      commandFile: 'commands.json'
    });
  },
  'should fall back to default command file location when optional command file is not specified': function () {
    this.mockCommander.expects('version').once().withExactArgs('1.2.3');
    this.mockCommander.expects('parse').once().withExactArgs(['arg1', 'arg2']);
    this.mockFs.expects('readFileSync').once().withExactArgs('/some/conf/commands.json').returns(JSON.stringify(this.commands));
    this.stub(process, 'argv', ['arg1', 'arg2']);
    cli.command(this.base);
  },
  'should set global options when specified': function () {
    this.mockCommander.expects('version').once().withExactArgs('1.2.3');
    this.mockCommander.expects('parse').once().withExactArgs(['arg1', 'arg2']);
    // add global options
    this.commands.options = [{ arg: '-g, --global', desc: 'Global description', action: function () {} }];
    this.mockFs.expects('readFileSync').once().withExactArgs('/some/conf/commands.json').returns(JSON.stringify(this.commands));
    this.stub(process, 'argv', ['arg1', 'arg2']);
    cli.command(this.base);
  }
});

buster.testCase('cli - exec', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
 'should log and camouflage error to callback when an error occurs and fallthrough is allowed': function (done) {
    this.mockConsole.expects('error').once().withExactArgs('Error: somestderr');
    this.stub(childProcess, 'exec', function (command, cb) {
      assert.equals(command, 'somecommand');
      cb(new Error('someerror'), null, 'somestderr');
    });
    cli.exec('somecommand', true, function cb(err, result) {
      assert.isNull(err);
      assert.equals(result.message, 'someerror');
      done();
    });
  },
  'should log and pass error to callback when an error occurs and fallthrough is not allowed': function (done) {
    this.mockConsole.expects('error').once().withExactArgs('Error: somestderr');
    this.stub(childProcess, 'exec', function (command, cb) {
      assert.equals(command, 'somecommand');
      cb(new Error('someerror'), null, 'somestderr');
    });
    cli.exec('somecommand', false, function cb(err, result) {
      assert.equals(err.message, 'someerror');
      assert.equals(result, undefined);
      done();
    });
  },
  'should log output and pass success callback when there is no error': function (done) {
    this.mockConsole.expects('log').once().withExactArgs('somestdout');
    this.stub(childProcess, 'exec', function (command, cb) {
      assert.equals(command, 'somecommand');
      cb(null, 'somestdout');
    });
    cli.exec('somecommand', false, function cb(err, result) {
      assert.equals(err, undefined);
      assert.equals(result, undefined);
      done();
    });
  }
});

buster.testCase('cli - exit', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockProcess = this.mock(process);
  },
  'should exit with status code 0 when error does not exist': function () {
    this.mockProcess.expects('exit').once().withExactArgs(0);
    cli.exit();
  },
  'should exit with status code 1 and logs the error message when error exists': function () {
    this.mockConsole.expects('error').once().withExactArgs('someerror');
    this.mockProcess.expects('exit').once().withExactArgs(1);
    cli.exit(new Error('someerror'));
  }
});

buster.testCase('cli - exitCb', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockProcess = this.mock(process);
  },
  'should exit with status code 0 and logs the result when error does not exist and no success callback is specified': function () {
    this.mockConsole.expects('log').once().withExactArgs('some success');
    this.mockProcess.expects('exit').once().withExactArgs(0);
    cli.exitCb()(null, 'some success');
  },
  'should exit with status code 1 and logs the error message when error exists and no error callback is specified': function () {
    this.mockConsole.expects('error').once().withExactArgs('some error');
    this.mockProcess.expects('exit').once().withExactArgs(1);
    cli.exitCb()(new Error('some error'));
  },
  'should exit with status code 0 and call success callback when error does not exist and success callback is specified': function (done) {
    this.mockProcess.expects('exit').once().withExactArgs(0);
    cli.exitCb(null, function (result) {
      assert.equals(result, 'some success');
      done();
    })(null, 'some success');
  },
  'should exit with status code 1 and call error callback when error exists and error callback is specified': function (done) {
    this.mockProcess.expects('exit').once().withExactArgs(1);
    cli.exitCb(function (err) {
      assert.equals(err.message, 'some error');
      done();
    })(new Error('some error'));
  }
});

buster.testCase('cli - lookupFile', {
  setUp: function () {
    this.mockProcess = this.mock(process);
    this.mockFs = this.mock(fs);
  },
  'should return file content in current directory when it exists': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').returns('currdirfilecontent'); 
    var data = cli.lookupFile('.conf.json');
    assert.equals(data, 'currdirfilecontent');
  },
  'should return file content in home directory when it exists but none exists in current directory and platform is windows': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { USERPROFILE: '/home/dir' });
    this.stub(process, 'platform', 'win32');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist')); 
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').returns('homedirfilecontent'); 
    var data = cli.lookupFile('.conf.json');
    assert.equals(data, 'homedirfilecontent');
  },
  'should return file content in home directory when it exists but none exists in current directory and platform is non windows': function () {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist')); 
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').returns('homedirfilecontent'); 
    var data = cli.lookupFile('.conf.json');
    assert.equals(data, 'homedirfilecontent');
  },
  'should throw an error when configuration file does not exist anywhere and file has relative path': function (done) {
    this.mockProcess.expects('cwd').once().returns('/curr/dir');
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/curr/dir/.conf.json').throws(new Error('doesnotexist'));
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').throws(new Error('doesnotexist'));
    try {
      cli.lookupFile('.conf.json');
    } catch (err) {
      assert.equals(err.message, 'Unable to lookup file in /curr/dir/.conf.json, /home/dir/.conf.json');
      done();
    }
  },
  'should return file content with absolute path when it exists': function () {
    this.mockFs.expects('readFileSync').once().withExactArgs('/absolute/dir/.conf.json').returns('absolutedirfilecontent'); 
    var data = cli.lookupFile('/absolute/dir/.conf.json');
    assert.equals(data, 'absolutedirfilecontent');
  },
  'should throw an error when configuration file does not exist anywhere and file has absolute path': function (done) {
    this.stub(process, 'env', { HOME: '/home/dir' });
    this.stub(process, 'platform', 'linux');
    this.mockFs.expects('readFileSync').once().withExactArgs('/absolute/dir/.conf.json').throws(new Error('doesnotexist'));
    this.mockFs.expects('readFileSync').once().withExactArgs('/home/dir/.conf.json').throws(new Error('doesnotexist'));
    try {
      cli.lookupFile('/absolute/dir/.conf.json');
    } catch (err) {
      assert.equals(err.message, 'Unable to lookup file in /absolute/dir/.conf.json, /home/dir/.conf.json');
      done();
    }
  }
});

buster.testCase('cli - spawn', {
  setUp: function () {
    this.mockChildProcess = this.mock(childProcess);
    this.mockProcessStdout = this.mock(process.stdout);
    this.mockProcessStderr = this.mock(process.stderr);
  },
  'should write data via stdout and stderr when data event is emitted': function () {
    this.mockProcessStdout.expects('write').once().withExactArgs('somestdoutdata');
    this.mockProcessStderr.expects('write').once().withExactArgs('somestderrdata');
    var mockSpawn = {
      stdout: {
        on: function (event, cb) {
          assert.equals(event, 'data');
          cb('somestdoutdata');
        }
      },
      stderr: {
        on: function (event, cb) {
          assert.equals(event, 'data');
          cb('somestderrdata');
        }
      },
      on: function (event, cb) {}
    };
    this.mockChildProcess.expects('spawn').withExactArgs('somecommand', ['arg1', 'arg2']).returns(mockSpawn);
    cli.spawn('somecommand', ['arg1', 'arg2']);
  },
  'should pass error and exit code to callback when exit code is not 0': function (done) {
    var mockSpawn = {
      stdout: { on: function (event, cb) {}},
      stderr: { on: function (event, cb) {}},
      on: function (event, cb) {
        assert.equals(event, 'exit');
        cb(1);
      }
    };
    this.mockChildProcess.expects('spawn').withExactArgs('somecommand', ['arg1', 'arg2']).returns(mockSpawn);
    cli.spawn('somecommand', ['arg1', 'arg2'], function (err, result) {
      assert.equals(err.message, 1);
      assert.equals(result, 1);
      done();
    });
  },
  'should pass no error and exit code to callback when exit code is 0': function (done) {
    var mockSpawn = {
      stdout: { on: function (event, cb) {}},
      stderr: { on: function (event, cb) {}},
      on: function (event, cb) {
        assert.equals(event, 'exit');
        cb(0);
      }
    };
    this.mockChildProcess.expects('spawn').withExactArgs('somecommand', ['arg1', 'arg2']).returns(mockSpawn);
    cli.spawn('somecommand', ['arg1', 'arg2'], function (err, result) {
      assert.equals(err, undefined);
      assert.equals(result, 0);
      done();
    });
  }
});