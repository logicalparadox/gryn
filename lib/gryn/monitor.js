var Drip = require('drip')
  , spawn = require('child_process').spawn
  , util = require('util');

module.exports = Monitor;

function Monitor (cmd, args, opts) {
  Drip.call(this);
  this.cmd = cmd;
  this.args = args || [];
  this.options = opts || {};
  this.stopped = true;
}

util.inherits(Monitor, Drip);

Monitor.prototype.start = function () {
  this.stopped = false;
  startProcess.call(this);
};

function startProcess () {
  var self = this
    , env = {};

  for (var e in process.env)
    env[e] = process.env[e];

  if (this.options.env) {
    for (var e in this.options.env)
      env[e] = this.options.env[e];
  }

  env.NODE_ENV = this.options.nodeEnv || 'development';

  this.prog = spawn(this.cmd, this.args, {
      cwd: this.options.cwd
    , env: env
  });

  this.prog.stdout.on('data', function (data) {
    self.emit('stdout', data);
  });

  this.prog.stderr.on('data', function (data) {
    self.emit('stdrr', data);
  });

  this.prog.on('exit', function (code) {
    self.emit('exit', { code: code });
  });

  this.emit('start');
}

Monitor.prototype.stop = function (sig, cb) {
  var self = this;

  if ('function' === typeof sig) {
    cb = sig;
    sig = 'SIGHUP';
  }

  sig = sig || 'SIGHUP'
  cb = cb || function () {};

  if (!this.prog || this.stopped === true) {
    return cb(null);
  }

  this.prog.once('exit', function (code) {
    delete self.prog;
    cb(null);
  });

  this.stopped = true;
  this.prog.kill('SIGHUP');
};

