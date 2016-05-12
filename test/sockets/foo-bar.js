'use strict';

module.exports = (nsp) => {

  nsp.on('connection', (socket) => {

    socket.on('foo', () => {
      nsp.emit('bar');
    });

  });

};
