'use strict';

const socketio = require('socket.io');
const path = require('path');
const walk = require('walk');
const is = require('fi-is');

/**
 * Obtain the file's name relative to the root and base directory.
 *
 * @param {String} root The root folder.
 * @name {String} name The stat name.
 * @param {String} basedir The socket's basedir.
 *
 * @return The relative file name.
 */
function getRelativeName(root, name, basedir) {
  return path.normalize(path.join(root, path.basename(name, '.js'))
    .replace(basedir, ''));
}

/**
 * Generates the namespace name based on the root and base directory.
 *
 * @param {String} root The root folder.
 * @name {String} name The stat name.
 * @param {String} basedir The socket's basedir.
 *
 * @return The namespace's name.
 */
function getNamespace(root, name, basedir) {
  return getRelativeName(root, name, basedir)
    .replace(/index/gi, '/')
    .replace(/[\\\/]+/g, '/')
    .replace(/(.+)\/$/g, '$1');
}

/**
 * Obtains the file's normalized full path.
 *
 * @param {String} root The root folder.
 * @name {String} name The stat name.
 *
 * @return The normalized full path.
 */
function getPath(root, name) {
  return path.normalize(path.join(root, name));
}

var debug = function () {};

/**
 * Sockets class.
 *
 * @constructor
 */
function Sockets() {

  this.initialized = false;
  this.modules = {};

}

/**
 * Initializes the socket module.
 *
 * @param {Object} server The Node.js server instance to attach the sockets to.
 * @param {Object} config The fi-sockets configuration object.
 */
Sockets.prototype.init = function init(server, config) {
  var io = this.io = socketio(server);
  var modules = this.modules;

  if (is.function(config.debug)) {
    debug = config.debug;
  } else if (config.debug) {
    debug = console.log;
  }

  if (is.function(config.adapter)) {
    debug("Adding socket.io adapter");
    io.adapter(config.adapter);
  }

  if (is.not.string(config.basedir)) {
    throw new Error("Config's basedir must be a [String]!");
  }

  if (is.not.array(config.arguments)) {
    config.arguments = [];
  }

  /* Initialize socket modules (*.js) on the basedir folder */
  walk.walkSync(config.basedir, {
    listeners: {
      file: (root, stats) => {
        if (path.extname(stats.name) === '.js') {
          /* Get file's path */
          let file = getPath(root, stats.name);
          /* Generate the socket's namespace */
          let namespace = getNamespace(root, stats.name, config.basedir);
          /* Create the namespace module */
          let nsp = io.of(namespace);

          /* Require the socket module and initialize it */
          require(file).apply(null, [nsp, io].concat(config.arguments));

          /* Register the namespace module */
          modules[namespace] = nsp;

          debug(namespace + " --> " + file);
        }
      }
    },

    errors: (root, stats) => {
      debug(stats);
      throw new Error("Couldn't register socket module!");
    }
  });

  this.initialized = true;
};

/**
 * Retrieves a socket module by it's namespace name.
 *
 * @param {String} name The name of the module's namespace.
 *
 * @return {Object} The socket.io namespace object.
 */
Sockets.prototype.of = function of(name) {
  if (!this.initialized) {
    throw new Error("Yout must initialize the Sockets component first!");
  }

  name = ('/' + (name || '')).replace(/\/+/gi, '/');

  try {
    return this.modules[name];
  } catch (ex) {
    throw new Error("Socket module [" + name + "] is not registered!");
  }
};

module.exports = new Sockets();
