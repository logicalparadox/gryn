var fs = require('fs');

exports.version = '0.3.0';

exports.read = function (file, cb) {
  cb = cb || function () {};
  fs.readFile(file, function (err, raw) {
    if (err) return cb(err);
    try { var commands = exports.parse(raw.toString()); }
    catch (ex) { return cb(ex); }
    cb(null, commands);
  });
};

exports.parse = function (raw, cb) {
  // remove any extra spacing
  function trim (line) {
    return line.trim();
  }

  // remove empty lines
  function empty (line) {
    return !! line.length;
  }

  function badlines (line) {
    return 'object' === typeof line;
  }

  // extract commands
  function extract (line) {
    var cmd = { cmd: null, args: [], env: {}, raw: null }
      , parts = line.split(': ')
      , hasCmd = false;

    if (2 !== parts.length) {
      return null;
    }

    cmd.name = parts[0];
    cmd.raw = parts[1];

    cmd.raw
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

  return raw
  .split('\n')
  .map(trim)
  .filter(empty)
  .map(extract)
  .filter(badlines);
};
