'use strict';

var expect = require('chai').expect;
var io = require('socket.io-client');

var sockets, port;

describe('Fi Seed Sockets', function () {
  before(function (done) {
    var http = require('http');
    var path = require('path');

    var server = http.createServer();

    sockets = require('../lib');

    sockets.init({
      basedir: path.normalize(path.join(__dirname, 'sockets')),
      server: server,
      debug: true
    }, function () {
      server.listen(0);

      port = server.address().port;

      console.log('Server running on %s', port);

      done();
    });
  });

  describe('object', function () {
    it('should be an object', function () {
      expect(sockets).to.be.an('object');
    });
  });

  describe('module "/" (index.js)', function () {
    it('should be an object', function () {
      expect(sockets.of()).to.be.an('object');
    });
  });

  describe('module "test" (test.js)', function () {
    it('should be an object', function () {
      expect(sockets.of('test')).to.be.an('object');
    });

    it('emit should be a function', function () {
      expect(sockets.of('test').emit).to.be.a('function');
    });
  });

  describe('client', function () {
    it('should connect to the "/test" namespace', function (done) {
      var socket = io('http://localhost:' + port);

      socket.on('connect', function () {
        done();
      });
    });
  });
});
