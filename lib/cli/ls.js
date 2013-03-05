
program
  .command('ls')
  .desc('view a list of processes defined by a procfile')
  .option('-f, --file [./Procfile]', 'procfile to load')
  .action(function (argv) {
    var cwd = argv.cwd
      , env = argv.param('e', 'env') || process.env.NODE_ENV || 'development'
      , file = argv.param('f', 'file');

    var fs = require('fsagent')
      , exists = fs.existsSync
      , path = require('path')
      , join = path.join;

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

    gryn.read(file, function (err, proc) {
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

      program.footerOk();
    });
  });
