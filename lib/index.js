'use strict';

var type = require('type-of-is');
var io = require('socket.io');
var path = require('path');
var walk = require('walk');

function getRelativeName(root, name, basedir) {
  return path.normalize(path.join(root, path.basename(name, '.js')).replace(basedir, ''));
}

function getNamespace(root, name, basedir) {
  return getRelativeName(root, name, basedir).
  replace(/index/gi, '/').
  replace(/\\+|\/+/g, '/');
}

function getPath(root, name) {
  return path.normalize(path.join(root, name));
}

var debug = function () {};

module.exports = {

  io: null,

  modules: {},

  of: function (namespace) {
    namespace = ('/' + (namespace || '')).replace(/\/+/gi, '/');

    debug('Obtaining %s', namespace);

    try {
      return this.modules[namespace];
    } catch (ex) {
      throw new Error("Socket module [" + namespace + "] not registered!");
    }
  },

  init: function (config, callback) {
    var self = this;

    self.io = io(config.server);

    if (type.is(config.debug, Function)) {
      debug = config.debug;
    } else if (type.is(config.debug, Boolean) && config.debug) {
      debug = console.log;
    }

    /* Initialize socket modules (*.js) on the basedir folder */
    var walker = walk.walk(config.basedir);

    walker.on('file', function (root, stats, next) {
      if (path.extname(stats.name) === '.js') {
        /* Get file's path */
        var file = getPath(root, stats.name);
        /* Generate the socket's namespace */
        var namespace = getNamespace(root, stats.name, config.basedir);
        /* Create the namespace module */
        var nsp = self.io.of(namespace);

        /* Require the socket module and initialize it */
        require(file)(nsp, self.io);

        /* Register the namespace module */
        self.modules[namespace] = nsp;

        debug("%s --> %s", namespace, file);
      }

      next();
    });

    walker.on('errors', function (root, stats, next) {
      debug("Couldn't register module!");
      debug(stats);

      next();
    });

    walker.on('end', function () {
      callback();
    });

  }

};
