const WebSocket = require('ws');
const { Constants } = require('./enums');

class SignalServer {
  /**
   * @param {Object} config is an OPTIONAL object, if no argument is passed in, then
   * we default to creating a SignalServer running on PORT 3001, if a config
   * object exist then it should contain one of two properties:
   * @port is an integer specifying the port number the SignalServer should run on.
   * @server is any server instance that will be used to create a SignalServer, the
   * SignalServer will run on the same port the passed in Server is listening on.
   */
  constructor(config) {
    this._webSocket = this._setUpServer(config);
  }

  /**
   * @param {WebSocket} currentClient 
   * @param {http.IncomingMessage} request
   * upon calling #connect, SignalServer will listen for when a client has connected
   * to the server and listen for any incoming messages. When a message event is
   * triggered, it will call on #broadcast.
   */
  connect() {
    this._webSocket.on('connection', (currentClient, request) => {
      console.log('User connected');
      currentClient.on('message', (data) => {
        console.log('\nDATA: ', data);
        this._broadcast(data, currentClient);
      });
    });
  }
  
  /**
   * @param {Object} data is an object recieved when listening for a 'message' event.
   * @param {WebSocket} currentClient is the client who emitted data to the SignalServer.
   * 
   * #broadcast is a private method that iterates through a pool of clients currently
   * connected to the SignalServer. It sends any data recieved to every other client
   * but itself as long as their connection is open.
   */
  _broadcast(data, currentClient) {
    this._webSocket.clients.forEach((client) => {
      // checking if the client is from the client who sends the data vs. receiving
      if (client !== currentClient && client.readyState === WebSocket.OPEN) client.send(data);
    });
  }

  _close() {
    this._webSocket.on('close', () => {

    });
  }

  /**
   * @param {Object} config
   * #setUpServer is a private method that creates a new instance of a WebSocket utilizing 
   * the config parameter if included, otherwise utilizes default port.
   * @returns {WebSocket.Server}
   */
  _setUpServer(config) {
    if (!config) return new WebSocket.Server({ port: Constants.PORT });
    else if (config.port) return new WebSocket.Server({ port: config.port });
    else if (config.server) return new WebSocket.Server({ server: config.server });
    // return an error for wrong input field
    else return console.log('ERROR');
  }

}

module.exports = SignalServer;
