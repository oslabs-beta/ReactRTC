const WebSocket = require('ws');

class SignalServer {
  /**
   * @param {*} config is an OPTIONAL object, if no argument is passed in, then
   * we default to creating a SignalServer running on PORT 3001, if a config
   * object exist then it should contain one of two properties:
   * @port is an integer specifying the port number the SignalServer should run on.
   * @server is any server instance that will be used to create a SignalServer, the
   * SignalServer will run on the same port the passed in Server is listening on.
   */
  constructor(config) {
    let webSocket;
    if (config.port) webSocket = new WebSocket.Server({ port: config.port });
    else if (config.server) webSocket = new WebSocket.Server({ server: config.server });
    else webSocket = new WebSocket.Server({ port: 3001 });

    this._webSocket = webSocket;
  }

  /**
   * upon calling #connect, SignalServer will listen for when a client has connected
   * to the server and listen for any incoming messages. When a message event is
   * triggered, it will call on #broadcast
   */
  connect() {
    this._webSocket.on('connection', (currentClient, request) => {
      console.log('User connected')
      currentClient.on('message', (data) => {
        console.log('\nDATA: ', data);
        this._broadcast(this._webSocket, data, currentClient);
      });
    });
  }
  
  /**
   * @param {*} signalServer is a new WebSocket instance
   * @param {*} data is an object recieved when listening for a 'message' event
   * @param {*} currentClient is the client who emitted data to the SignalServer
   * 
   * #broadcast is a private method that iterates through a pool of clients currently
   * connected to the SignalServer. It sends any data recieved to every other client
   * but itself as long as their connection is opened.
   */
  _broadcast(signalServer, data, currentClient) {
    signalServer.clients.forEach((client) => {
      // checking if the client is from the client who sends the data vs. receiving
      if (client !== currentClient && client.readyState === WebSocket.OPEN) client.send(data);
    });
  }

}

module.exports = SignalServer;
