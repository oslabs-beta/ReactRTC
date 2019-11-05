const ws = require('ws');

class SignalServer {
  constructor(config) {
    let webSocket;
      // if they have their own port, config websocket with their custom port number
    if (config.port) webSocket = new WebSocket.Server({ port: config.port });
    // if they have their own server, set websocket to their server
    else if (config.server) webSocket = new WebSocket.Server({ server: config.server });
    // if they don't have a customized port ==> use our port
    else webSocket = new WebSocket.Server({ port: 3000 });

    webSocket: webSocket;
  }
  onConnection() {
    this.webSocket.on('connection', (currentClient, incomingMessage, req) => {
      // send object = data
      this.webSocket.on('message', (data) => {
        console.log('\nDATA: ', data);
        this.webSocket.clients.forEach((client) => {
          // checking if the client is from the client who sends the data vs. receiving
          if (client !== currentClient && client.readyState === 
            WebSocket.OPEN)client.send(data);
          //^WebSocket is not camelcase because it's referring to the class rather than the variable
          //WebSocket.OPEN connects to our websocket 
          //OPEN is a constant variable
        });
      });
    });
  }

  

}

module.exports = SignalServer;
