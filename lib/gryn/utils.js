var fs = require('fs');

exports.parseProc = function (file, cb) {
  fs.readFile(file, 'utf8', function (err, raw) {
    if (err) return cb(err);
    var commands = raw
      .split('\n')
      .filter(function (line) {
        if (line.trim().length) return true;
      })
      .map(function (line) {
        line = line.trim();
        var cmd = { cmd: null, args: [], env: {} }
          , name = line.split(': ')[0]
          , spec = line.split(': ')[1]
          , hasCmd = false;

        cmd.name = name;

        spec.split(' ').forEach(function (el) {
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
      });

    cb(null, commands);
  });
};

/**
 * # isPathAbsolute
 *
 * Cross platform method to determin if a path
 * is absolute or relative.
 *
 * @param {String} path
 */

exports.isPathAbsolute = function (_path) {
  var abs = false;
  if ('/' == _path[0]) abs = true;
  if (':' == _path[1] && '\\' == _path[2]) abs = true;
  return abs;
};
