
program
  .command('stop')
  .desc('stop a daemonized process group with SIGINT')
  .option('-f, --file [./Procfile]', 'procfile to load')
  .option('-F, --force', 'forcefully exit with SIGHUP')
  .action(function (argv) {
    var cwd = argv.cwd
      , file = argv.param('f', 'file')
      , sig = argv.mode('F', 'force')
        ? 'SIGHUP'
        : 'SIGINT'

    var fs = require('fsagent')
      , exists = fs.existsSync
      , path = require('path')
      , join = path.join
      , spawn = require('child_process').spawn;

    program.colorize();
    program.header();

    // Procfile location defaults
    if (!file) {
      file = exists(join(cwd, 'Procfile'))
        ? join(cwd, 'Procfile')
        : exists(join(cwd, 'procfile'))
          ? join(cwd, 'procfile')
          : null;
    }

    // Normalize Procfile path
    if (file && fs.isPathAbsolute(file)) {
      file = path.resolve(cwd, file);
    }

    // Check to make sure Procfile exists
    if (!exists(file)) {
      l('Procfile not found.'.red);
      program.footerNotOk();
    }

    var pidfile = join(path.dirname(file), '.gryn/grynd.pid');

    if (!exists(pidfile)) {
      l('Pidfile does not exist. Assuming daemon is not running.');
      program.footerOk();
    }

    var pid = fs.readFileSync(pidfile, 'utf8');

    if (!pid.length) {
      l('Pidfile is empty.'.red);
      program.footerNotOk();
    }

    try {
      pid = parseFloat(pid);
    } catch (ex) {
      l('Pid is not a valid number.'.gred);
      program.footerNotOk();
    }

    l('Exiting deamon ' + pid.toString().green + ' with signal ' + sig.yellow);

    function clean () {
      fs.unlink(pidfile, function (err) {
        if (err) {
          l('Error: '.red + err.message.red);
          program.footerNotOk();
        }

        l('Daemon stopped.');
        program.footerOk();
      });
    }

    try {
      process.kill(pid, sig);
    } catch (ex) {
      if (ex.code == 'ESRCH') clean();
    }


    var check = setInterval(function () {
      if (!isAlive(pid)) {
        clearInterval(check);
        clean();
      }
    }, 500);
  });

function isAlive (pid) {
  var alive = true;

  try {
    process.kill(pid, 0);
  } catch (ex) {
    if (ex.code == 'ESRCH') alive = false;
  }

  return alive;
}
