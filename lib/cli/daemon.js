
program
  .command('daemon')
  .desc('start a process group in the background')
  .option('-e, --env [development]', 'NODE_ENV for spawned processes')
  .option('-f, --file [./Procfile]', 'procfile to load')
  .action(function (argv) {
    var cwd = argv.cwd
      , env = argv.param('e', 'env') || process.env.NODE_ENV || 'development'
      , file = argv.param('f', 'file');

    var fs = require('fsagent')
      , exists = fs.existsSync
      , path = require('path')
      , join = path.join
      , spawn = require('child_process').spawn;

    var runner = path.join(__dirname, '../../bin/grynd')
      , args = [];

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

    args.push('-f=' + file);
    args.push('-e=' + env);

    var grynd = spawn(runner, args, {
        detached: true
      , stdio: 'ignore'
    });

    grynd.unref();

    var pidfile = join(path.dirname(file), '.gryn/grynd.pid')
      , watch = fs.watcher(join(path.dirname(file)));

    function handle (w) {
      if (w == pidfile) {
        watch.clear();
        program.footerOk();
      }
    }

    watch.on('watch', handle);
    watch.on('change', handle);
  });
