var _ = require('../utils')
  , Monitor = require('../monitor');

cli.register({
    name: 'start'
  , description: 'Start all commands listed in a profile'
  , options: {
        '-f, --file [./Procfile]': 'Procfile spec to load'
      , '-e, --env [development]': 'NODE_ENV to set in spawned processes'
    }
});

cli.on('start', function startProcfile (args) {
  var fs = require('fs')
    , path = require('path')
    , exst = fs.existsSync || fs.existsSync;

  var file = args.f || args.file || './Procfile'
    , env = args.e || args.env || 'development'
    , cwd = args.cwd;

  if (!_.isPathAbsolute(file))
    file = path.resolve(cwd, file);

  if (!exst(file)) {
    console.log('Procfile does not exist '.red + '[%s]', file);
    process.exit(1);
  }

  _.parseProc(file, function (err, proc) {
    if (err) throw err;
    var monitors = [];
    proc.forEach(function (spec) {
      var mon = new Monitor(
          spec.cmd
        , spec.args
        , { cwd: cwd
          , nodeEnv: env
          , env: spec.env }
      );

      mon.on('stdout', function (data) {
        data = data.toString().split('\n');
        data.forEach(function (line) {
          if (line.trim().length)
            console.log('%s | %s', spec.name, line);
        });
      });

      mon.on('stderr', function (data) {
        data = data.toString().split('\n');
        data.forEach(function (line) {
          if (line.trim().length)
            console.log('%s | %s', spec.name, line);
        });
      });

      mon.start();
      monitors.push(mon);
    });
  });

});
