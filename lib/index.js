'use strict';

var type = require('type-of-is');
var socketio = require('socket.io');
var path = require('path');
var walk = require('walk');

function getRelativeName(root, name, basedir) {
  return path.normalize(path.join(root, path.basename(name, '.js')).replace(basedir, ''));
}

function getNamespace(root, name, basedir) {
  return getRelativeName(root, name, basedir).
  replace(/index/gi, '/').
  replace(/[\\\/]+/g, '/').
  replace(/(.+)\/$/g, '$1');
}

function getPath(root, name) {
  return path.normalize(path.join(root, name));
}

var debug = function () {};

/**
 * Sockets class.
 */
function Sockets() {

  this.initialized = false;
  this.modules = {};

}

/* Prototype */

/**
 * Initializes the socket module.
 */
Sockets.prototype.init = function (config) {
  var io = this.io = socketio(config.server);
  var modules = this.modules;

  if (config.debug) {
    if (type.is(config.debug, Function)) {
      debug = config.debug;
    } else if (type.is(config.debug, Boolean)) {
      debug = console.log;
    }
  }

  /* Initialize socket modules (*.js) on the basedir folder */
  walk.walkSync(config.basedir, {
    listeners: {
      file: function (root, stats) {
        if (path.extname(stats.name) === '.js') {
          /* Get file's path */
          var file = getPath(root, stats.name);
          /* Generate the socket's namespace */
          var namespace = getNamespace(root, stats.name, config.basedir);
          /* Create the namespace module */
          var nsp = io.of(namespace);

          /* Require the socket module and initialize it */
          require(file)(nsp, io);

          /* Register the namespace module */
          modules[namespace] = nsp;

          debug("%s --> %s", namespace, file);
        }
      }
    },

    errors: function (root, stats) {
      debug("Couldn't register module!");
      debug(stats);
    }
  });

  this.initialized = true;
};

/**
 * Retrieves a socket module by it's namespace.
 */
Sockets.prototype.of = function (namespace) {
  if (!this.initialized) {
    throw new Error("Yout must initialize the Sockets component first!");
  }

  namespace = ('/' + (namespace || '')).replace(/\/+/gi, '/');

  try {
    return this.modules[namespace];
  } catch (ex) {
    throw new Error("Socket module [" + namespace + "] is not registered!");
  }
};

module.exports = new Sockets();
