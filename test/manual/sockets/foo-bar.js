'use strict';

module.exports = (nsp) => {

  nsp.on('connection', (socket) => {
    console.log("\nSocket connected");

    socket.on('foo', () => {
      nsp.emit('bar', new Date());
    });

  });

};
