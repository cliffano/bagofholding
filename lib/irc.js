var irc = require('irc'),
  util = require('util');

function Bot(host, channel, opts) {
  opts = opts || {};
  this.nick = opts.nick || 'nestor';
  this.host = host;
  this.channel = '#' + channel;
}

Bot.prototype.connect = function (commands) {
  var self = this;

  process.on('SIGINT', function () { self.disconnect(); });
  process.on('SIGTERM', function () { self.disconnect(); });

  console.log('Connecting to %s as %s', this.host, this.nick);
  this.client = new irc.Client(this.host, this.nick);

  this.client.addListener('error', function (err) {
    console.error(err);
  });

  this.client.addListener('message' + this.channel, function (from, message) {
    if (message.match(new RegExp('^' + self.nick))) {

      var parts = message.split(' '),
        command = parts[1],
        args = parts.slice(2);

      if (command === undefined) {
        self.say('Usage: %s <command> <arg1> ... <argN>', self.nick);
      } else if (commands[command]) {
        commands[command].apply(self, args);  
      } else {
        self.say('Command \'' + command + '\' is not supported');
      }
    }
  });

  setTimeout(function () {
    console.log('Joining channel %s', self.channel);
    self.client.join(self.channel);
  }, 1000);

};

Bot.prototype.disconnect = function () {
  console.log('Leaving channel %s and disconnecting', this.channel);
  this.client.part(this.channel);
  process.exit(0);
};

Bot.prototype.say = function () {
  var message = util.format.apply(this, arguments);
  this.client.say(this.channel, message);
};

Bot.prototype.handleCb = function (successCb) {
  var self = this;
  return function (err, result) {
    if (err) {
      console.error(err.message);
      self.say(err.message);
    } else {
      successCb(result);
    }
  };
};

exports.Bot = Bot;