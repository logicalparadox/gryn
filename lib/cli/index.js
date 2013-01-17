
var electron = require('electron');

gryn = require('../gryn');

/*!
 * Expose log helper
 */

l = function (str) {
  str = str || '';
  console.log('  ' + str);
}

pad = function (str, width) {
  return Array(width - str.length).join(' ') + str;
}

/*!
 * Create an electron based cli
 */

program = electron('gryn')
  .name('Gryn')
  .desc('https://github.com/logicalparadox/gryn')
  .version(gryn.version);

/*!
 * Codex cli log header
 */

program.header = function () {
  program.colorize();
  l();
  l('Welcome to ' + 'Gryn'.gray);
  l('It worked if it ends with ' + 'Gryn'.gray + ' ok'.green);
  l();
  //l('Graceful shutdown all processes using ' + 'CTRL+?'.green);
};

/*!
 * Codex cli log footer ok
 */

program.footerOk = function () {
  program.colorize();
  l('Gyrn'.gray + ' ok'.green);
  l();
  process.exit();
};

/*!
 * Codex cli log footer not ok
 */

program.footerNotOk = function (c) {
  program.colorize();
  l('Gryn'.gray + ' not ok'.red);
  l();
  process.exit(c || 1);
};

/*!
 * Load all the CLI submodules
 */

require('./start');

/*!
 * Primary Export
 */

module.exports = program;
