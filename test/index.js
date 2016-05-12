'use strict';

const expect = require('chai').expect;
const io = require('socket.io-client');
const http = require('http');
const path = require('path');

const sockets = require('../');

var port;

describe('Fi Sockets', () => {
  before((done) => {
    const server = http.createServer();

    sockets.init(server, {
      basedir: path.normalize(path.join(__dirname, 'sockets')),
      debug: false
    });

    server.once('listening', () => {
      port = server.address().port;
      done();
    });

    server.listen(0);
  });

  describe('object', () => {
    it('should be an object', () => {
      expect(sockets).to.be.an('object');
    });

    it('should still be an object', () => {
      expect(require('../')).to.be.an('object');
    });

    it('module "/" should still be an object', () => {
      expect(require('../').of()).to.be.an('object');
    });

    it('module "/" emit should still be a function', () => {
      expect(require('../').of().emit).to.be.an('function');
    });
  });

  describe('module "/" (index.js)', () => {
    it('should be an object', () => {
      expect(sockets.of()).to.be.an('object');
    });
  });

  describe('module "/chat" (chat/index.js)', () => {
    it('should be an object', () => {
      expect(sockets.of('chat')).to.be.an('object');
    });
  });

  describe('module "/chat/messaging" (chat/messaging.js)', () => {
    it('should be an object', () => {
      expect(sockets.of('chat/messaging')).to.be.an('object');
    });
  });

  describe('module "test" (test.js)', () => {
    it('should be retrieved with or without "/"', () => {
      expect(sockets.of('test')).to.be.ok;
      expect(sockets.of('/test')).to.be.ok;
    });

    it('should be an object', () => {
      expect(sockets.of('test')).to.be.an('object');
      expect(sockets.of('/test')).to.be.an('object');
    });

    it('emit should be a function', () => {
      expect(sockets.of('test').emit).to.be.a('function');
      expect(sockets.of('/test').emit).to.be.a('function');
    });
  });

  describe('client on "/test"', () => {
    var socket;

    before((done) => {
      socket = io('http://localhost:' + port + '/test');
      socket.on('connect', done);
    });

    it('should respond the salute', (done) => {
      socket.emit('salute');
      socket.on('salute', done);
    });
  });
});
