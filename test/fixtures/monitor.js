var http = require('http');

var app = http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.write(process.env.NODE_ENV || 'development');
  res.end();
});

switch (process.argv[2]) {
  case '1':
    process.exit(1);
    break;
  case '2':
    app.listen(process.env.PORT);
    console.log(process.env.PORT);
    break;
  default:
    console.log('need port number');
    break;
}
