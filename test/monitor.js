var chai = require('chai')
  , should = chai.should()
  , chaiHttp = require('chai-http');

var request = require('superagent');

var gryn = require('..');

chai.use(chaiHttp);
chai.use(function (chai) {
  Object.defineProperty(chai.Assertion.prototype, 'alive',
    { get: function () {
        new chai.Assertion(this.obj).to.be.a('number');
        var alive = true;

        try {
          process.kill(this.obj, 0);
        } catch (ex) {
          if (ex.code == 'ESRCH') alive = false;
          else throw ex;
        }

        this.assert(
            alive === true
          , 'expected pid ' + this.inspect + ' to be alive'
          , 'expected pid ' + this.inspect + ' to not be alive' );

        return this;
      }
    , configurable: true
  });
});

describe('Monitor', function () {

  var mon = new gryn.Monitor('node',
      [ __dirname + '/fixtures/monitor.js', '2' ]
    , { nodeEnv: 'production'
      , env: { PORT: 5000 } }
  );

  it('should be able to start', function (done) {
    mon.once('start', function () {
      var pid = mon.prog.pid;
      pid.should.be.alive;
    });

    mon.once('stdout', function (data) {
      data.toString().trim().should.equal('5000');
      request
        .get('localhost:5000')
        .end(function (res) {
          res.should.have.status(200);
          res.text.should.equal('production');
          done();
        });
    });

    mon.start();
  });

  it('should be able to stop', function (done) {
    var pid = mon.prog.pid;
    mon.stop(function () {
      pid.should.not.be.alive;
      done();
    });
  });
});
