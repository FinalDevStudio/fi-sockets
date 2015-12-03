# Fi Sockets
Sockets module loader for socket.io Node.js applications.

## Installing

```sh
npm install --save fi-sockets
```

## Usage

```js
var sockets = require('fi-sockets');
```

### Initialization
You must call it with your App's Server instance and a configuration object:

```js
var sockets = require('fi-sockets');
var http = require('http');
var path = require('path');

var server = http.createServer();

sockets.init(server, config);

server.listen(0);

console.log('Server running on %s', server.address().port);
```

### Configuration
The first argument is required and must be your application's Server instance. The socket.io instance will be attached to it.

The second argument is also required and it must be an `Object` with the following parameters:
- **basedir**: This is required and must be a `String`. This should point to the absolute path where the socket module's scripts are located.
- **debug**: This parameter can be a `Function` to log with or a `Boolean`. If `true` it will use `console.log`.

#### Example Configuration

```js
{

  basedir: path.normalize(path.join(__dirname, 'sockets')),

  debug: require('debug')('app:sockets'),

  arguments: [
    session
  ]

}
```

### Socket Modules
The socket modules inside your `config.basedir` folder must be like this:

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

The exported function will receive the _namespace_ instance as created with `io.of(namespace)` and the current `io` instance. The _namespace_ is created with the module's file name. If the module's file name is `index.js` then it'll be converted to `/`.

Folders are also respected, so if a socket module is located in `<...>/sockets/chat/messaging.js` then it's _namespace_ will be `/chat/messaging` and if it's file name is `index.js` inside that same folder then it's _namespace_ will be `/chat`.

The first two arguments will always be the generated namespace and the socket.io instance so you can define your socket namespace behavior. The rest of the parameters will be the ones you define in the `config.arguments` `Array`:

```js
config.arguments = [
  /* Second argument */
  session,

  /* Third argument */
  function aFunction() {
    //...
  }

  /* And so on... */
];
```

Will be passed as:

```js
/* mongoose.Schema will always be the first argument */
module.exports =  function (nsp, io, session, aFunction) {

  nsp.on('connection', function (socket) {
    //...
  });

};
```

### Properties
The Sockets component exposes the following properties:
- **init**: The initialization `Function`. Must be called before anything else with an options parameter as shown in the [Initialization](#initialization) example.
- **io**: The current socket.io instance.
- **modules**: An `Object` that contains all the _namespaces_ as properties.
- **of**: A convenient `Function` to retrieve the socket modules by its _namespace_ path or name:

  ```js
  /* These will both return the [chat] namespace */
  sockets.of('chat').emit('hello', 'everyone!');
  sockets.of('/chat').emit('hello', 'everyone!');

  /* These will both return the [chat/messaging] namespace */
  sockets.of('/chat/messaging').emit('hello', 'everyone!');
  sockets.of('chat/messaging').emit('hello', 'everyone!');
  ```

  If passed an empty `String` or a _falsy_ value then it'll return the root _namespace_ if it exists:

  ```js
  /* These will all return the root namespace ('/') */
  sockets.of('/').emit('hello', 'everyone!');
  sockets.of('').emit('hello', 'everyone!');
  sockets.of().emit('hello', 'everyone!');
  ```
