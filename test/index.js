'use strict';

var expect = require('chai').expect;
var io = require('socket.io-client');

var sockets, port;

describe('Fi Seed Sockets', function () {
  before(function (done) {
    var http = require('http');
    var path = require('path');

    var server = http.createServer();

    sockets = require('../');
    sockets.init(server, {
      basedir: path.normalize(path.join(__dirname, 'sockets')),
      debug: function () {
        console.log.apply(console, ["Sockets:"].concat([].slice.call(arguments)));
      }
    });

    server.listen(0);

    port = server.address().port;

    console.log("Server running on %s", port);

    done();
  });

  describe('object', function () {
    it('should be an object', function () {
      expect(sockets).to.be.an('object');
    });

    it('should still be an object', function () {
      expect(require('../')).to.be.an('object');
    });

    it('module "/" should still be an object', function () {
      expect(require('../').of()).to.be.an('object');
    });

    it('module "/" emit should still be a function', function () {
      expect(require('../').of().emit).to.be.an('function');
    });
  });

  describe('module "/" (index.js)', function () {
    it('should be an object', function () {
      expect(sockets.of()).to.be.an('object');
    });
  });

  describe('module "/chat" (chat/index.js)', function () {
    it('should be an object', function () {
      expect(sockets.of('chat')).to.be.an('object');
    });
  });

  describe('module "/chat/messaging" (chat/messaging.js)', function () {
    it('should be an object', function () {
      expect(sockets.of('chat/messaging')).to.be.an('object');
    });
  });

  describe('module "test" (test.js)', function () {
    it('should be retrieved with or without "/"', function () {
      expect(sockets.of('test')).to.be.ok;
      expect(sockets.of('/test')).to.be.ok;
    });

    it('should be an object', function () {
      expect(sockets.of('test')).to.be.an('object');
      expect(sockets.of('/test')).to.be.an('object');
    });

    it('emit should be a function', function () {
      expect(sockets.of('test').emit).to.be.a('function');
      expect(sockets.of('/test').emit).to.be.a('function');
    });
  });

  describe('client on "/test"', function () {
    var socket;

    before(function (done) {
      socket = io('http://localhost:' + port + '/test');
      socket.on('connect', done);
    });

    it('should respond the salute', function (done) {
      socket.emit('salute');
      socket.on('salute', done);
    });
  });
});
