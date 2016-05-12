'use strict';

const io = require('socket.io-client');
const expect = require('chai').expect;
const path = require('path');

const sockets = require('../');

const INSTANCES = 10;

const servers = [];
const clients = [];

describe('Fi Sockets with Adapter', () => {
  before((done) => {
    var ready = 0;

    function onListening() {
      if (++ready === INSTANCES) {
        done();
      }
    }

    for (var i = 0; i < INSTANCES; i++) {
      let server = require('./server')();

      servers.push(server);

      server.once('listening', onListening);
    }
  });

  describe('clients on each server', () => {
    it('should connect to the [foo-bar] namespace', (done) => {
      var connected = 0;

      servers.forEach((server) => {
        let client = io('http://localhost:' + server.address().port +
          '/foo-bar');

        client.on('connect', () => {
          if (++connected === servers.length) {
            done();
          }
        });

        clients.push(client);
      });
    });
  });

  describe('all clients on each server\'s "/foo-bar" namespace', () => {
    it('should respond to the ping emmited by all other clients',
      (done) => {
        var bar = 0;

        clients.forEach((client) => {
          client.on('bar', () => {
            if (++bar === (clients.length * clients.length)) {
              done();
            }
          });
        });

        clients.forEach((client) => client.emit('foo'));
      }
    );
  });
});
