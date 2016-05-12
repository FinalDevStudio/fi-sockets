'use strict';

const io = require('socket.io-client');

const client = io('http://localhost:' + process.argv[2] +
  '/foo-bar');

client.on('connect', () => {
  console.log("Connected");
});

client.on('error', (err) => {
  throw err;
});

client.on('bar', (bar) => {
  console.log(bar);
});

client.emit('foo');
