var chai = require('chai')
  , should = chai.should();

var gryn = require('..');

describe('.parseProc()', function () {
  it('should be able to parse a procfile', function (done) {
    var file = __dirname + '/fixtures/Procfile';
    gryn.parseProc(file, function (err, arr) {
      should.not.exist(err);
      arr.should.be.instanceof(Array);
      arr.should.have.length(2);
      arr.forEach(function (line) {
        line.should.have.keys('cmd', 'args', 'env', 'name', 'raw');
        line.should.have.property('cmd').a('string');
        line.should.have.property('args').instanceof(Array);
        line.should.have.property('env').a('object');
        line.should.have.property('name').a('string');
      });
      done();
    });
  });
});
