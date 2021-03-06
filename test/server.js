'use strict';

const redis = require('socket.io-redis');
const sockets = require('../');
const path = require('path');
const http = require('http');

module.exports = function () {
  const server = http.createServer();

  sockets.init(server, {
    adapter: redis({
      host: 'localhost',
      port: 6379
    }),

    basedir: path.normalize(path.join(__dirname, 'sockets')),

    debug: false
  });

  server.listen(0);

  return server;
};
