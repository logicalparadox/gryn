var fs = require('fs');

var exports = module.exports = {};

exports.version = '0.2.0';

exports.parseProc = function (file, cb) {
  fs.readFile(file, 'utf8', function (err, raw) {
    if (err) return cb(err);

    // remove any extra spacing
    function trim (line) {
      return line.trim();
    }

    // remove empty lines
    function filter (line) {
      return !! line.length;
    }

    // extract commands
    function extract (line) {
      var cmd = { cmd: null, args: [], env: {}, raw: null }
        , name = line.split(': ')[0]
        , spec = line.split(': ')[1]
        , hasCmd = false

      cmd.name = name;
      cmd.raw = spec;

      spec
      .split(/\s+/)
      .forEach(function (el) {
        if (!hasCmd && ~el.indexOf('=')) {
          var env = el.split('=');
          cmd.env[env[0]] = env[1];
        } else if (!hasCmd) {
          cmd.cmd = el;
          hasCmd = true;
        } else {
          cmd.args.push(el);
        }
      });

      return cmd;
    }

    var commands = raw
      .split('\n')
      .map(trim)
      .filter(filter)
      .map(extract);

    cb(null, commands);
  });
};
