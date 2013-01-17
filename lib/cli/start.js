
program
  .command('start')
  .desc('start a set of process defined by a procfile')
  .option('-e, --env [development]', 'NODE_ENV for spawned processes')
  .option('-f, --file [./Procfile]', 'procfile to load')
  .action(function (argv) {
    var cwd = argv.cwd
      , env = argv.param('e', 'env')
      , file = argv.param('f', 'file');

    var flynn = require('flynn')
      , fs = require('fsagent')
      , exists = fs.existsSync
      , path = require('path')
      , join = require('path').join;

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

    gryn.parseProc(file, function (err, proc) {
      if (err) {
        l('Error loading procfile: '.red + err.message);
        program.footerNotOk();
      }

      l('Procfile loaded: Found [ '.gray + proc.length.toString().magenta + ' ] entries.'.gray);
      l(file.gray);
      l();

      var colors = [ 'cyan', 'magenta', 'green', 'yellow', 'red', 'blue' ]
        , monitors = []
        , names = []
        , i = -1
        , width;

      proc.forEach(function (line) {
        var name = line.name
          , color;
        i++;
        if (i > colors.length - 1) i = 0;
        color = colors[i];
        line.color = color;
      });

      width = proc.reduce(function (max, line) {
        return line.name.length > max
          ? line.name.length
          : max;
      }, 0) + 1;

      proc.forEach(function (line) {
        l(pad(line.name, width)[line.color] + ': ' + line.raw);
      });
      l();

      process.stdin.resume();
      l('Gracefully stop all process with '.gray + 'SIGINT'.cyan + ' using '.gray + 'CTRL-D'.magenta);
      l('Forcfully stop all process with '.gray + 'SIGHUP'.yellow + ' using '.gray + 'CTRL-C'.magenta);
      l();

      process.stdin.on('end', function () {
        var count = monitors.length;

        function done () {
          if (count) return;
          l();
          l('All processes stopped.'.gray);
          program.footerOk();
        }

        console.log('      ');
        l('Graceful shutting down. Waiting to exit.'.gray);
        l();

        monitors.forEach(function (entry) {
          l(pad(entry.spec.name, width)[entry.spec.color] + ': sending signal ' + 'SIGINT'.cyan);
          entry.monitor.stop('SIGINT', function () {
            count--;
            done();
          });
        });
      });

      process.on('SIGINT', function () {
        console.log(' ');
        l('Forcefully shutting down.'.gray);
        l();

        monitors.forEach(function (entry) {
          l(pad(entry.spec.name, width)[entry.spec.color] + ': sending signal ' + 'SIGHUP'.yellow);
          entry.monitor.stop('SIGHUP', null);
        });

        l();
        l('Exiting immediately.'.gray);
        program.footerOk();
      });

      proc.forEach(function (line) {
        var mon = flynn()
          , color = line.color;

        mon.set('args', line.args);
        mon.set('cmd', line.cmd);
        mon.set('env', line.env);
        mon.set('node env', env);

        mon.on('stdout:data', function (chunk) {
          chunk.toString().split('\n').forEach(function (d) {
            if (d.trim().length) l(pad(line.name, width)[color] + ': ' + d);
          });
        });

        mon.on('stderr:data', function (chunk) {
          chunk.toString().split('\n').forEach(function (d) {
            if (d.trim().length) l(pad(line.name, width)[color] + ': ' + d);
          });
        });

        mon.on('started', function () {
          l(pad(line.name, width)[color] + ': started on pid ' + mon.pid.toString().green);
        });

        mon.on('stopped', function () {
          l(pad(line.name, width)[color] + ': stopped')
        });

        mon.start();
        monitors.push({ spec: line, monitor: mon });
      });
    });

  });
