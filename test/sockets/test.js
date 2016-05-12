'use strict';

module.exports = (nsp) => {

  nsp.on('connection', (socket) => {

    socket.on('salute', () => {
      socket.emit('salute');
    });

  });

};
