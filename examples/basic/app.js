var http = require('http')
  , port = process.env.PORT;

var app = http.createServer(function (req, res) {
  console.log('%s [%s]', req.method, req.url);
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.write('Hello Universe');
  res.end();
}).listen(port);

console.log('Server started on port %d', app.address().port);
