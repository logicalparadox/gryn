var queue = process.env.QUEUE
  , interval;

interval = setInterval(function () {
  console.log('Queue run [%s]', queue);
}, Math.round(Math.random() * 10000));

process.on('SIGINT', function () {
  console.log('start graceful shut down');
  clearInterval(interval);
  setTimeout(function () {
    console.log('shutting down now');
    process.exit();
  }, Math.round(Math.random() * 2000));
});
