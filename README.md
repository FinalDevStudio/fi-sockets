# fi-seed-component-sockets
Fi Seed's Sockets component

## Installing

```
npm install --save fi-seed-component-sockets
```

## Usage
### Use on fi-seed

```js
var sockets = component('sockets');
```

### Use on Express/Node app

```js
var sockets = require('fi-seed-component-sockets');
```

### Initialization
You must call it with your App's Server instance and a configuration object:

```js
var sockets = require('fi-seed-component-sockets');
var http = require('http');
var path = require('path');

var server = http.createServer();

sockets.init(server, {
  basedir: path.normalize(path.join(__dirname, 'sockets')),
  debug: true
});

server.listen(0);

console.log('Server running on %s', server.address().port);
```

### Configuration
The first argument is required and must be your App's Server instance. The Socket.IO instance will be attached to it.

The second argument is also required and it must be an `Object` with the following parameters:
- **basedir**: This is required and must be a `String`. This should point to the absolute path where the socket module's scripts are located.
- **debug**: This parameter can be a `Function` to log with or a `Boolean`. If `true` it will use `console.log`.

### Socket Modules
The socket modules inside your *sockets* folder must be like this:

```js
module.exports = function (nsp, io) {

  nsp.on('connection', function (socket) {

    console.log("A user connected");

    socket.on('disconnect', function () {
      console.log("A user disconnected");
    });

  });

};
```

The exported function will recieve the *namespace* instance as created with `io.of(namespace)` and the current `io` instance. The namespace is created with the module's file name. If the module's file name is `index.js` then it'll be converted to `/`.

Folders are also respected, so if a socket module is located in `[...]/sockets/chat/messaging.js` then it's namespace will be `/chat/messaging` and if it's file name is `index.js` inside that same folder then it's namespace will be `/chat`.

### Properties
The Sockets component exposes the following properties:
- **init**: The initialization `Function`. Must be called before anything else with an options parameter as shown in the [Initialization](#initialization) example.
- **io**: The current Socket.IO instance.
- **modules**: An `Object` that contains all the *namespaces* as properties.
- **of**: A convenient `Function` to retrieve the socket modules by its name or *namespace* path:

  ```js
  /* These will both return the [chat] namespace */
  sockets.of('chat').emit('hello', 'everyone!');
  sockets.of('/chat').emit('hello', 'everyone!');
  /* These will both return the [chat/messaging] namespace */
  sockets.of('/chat/messaging').emit('hello', 'everyone!');
  sockets.of('chat/messaging').emit('hello', 'everyone!');
  ```

  If passed an empty string or a falsy value then it'll return the root *namespace* if it exists:

  ```js
  /* These will all return the [/] (index.js) namespace */
  sockets.of('/').emit('hello', 'everyone!');
  sockets.of('').emit('hello', 'everyone!');
  sockets.of().emit('hello', 'everyone!');
  ```
