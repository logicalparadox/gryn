var queue = process.env.QUEUE;

setInterval(function () {
  console.log('Queue run [%s]', queue);
}, 5000);
