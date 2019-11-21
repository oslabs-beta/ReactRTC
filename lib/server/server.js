const path = require('path');
const express = require('express');
const https = require('http');
const app = express();
const WebSocket = require('ws');
// const test = path.resolve(__dirname, '../client/index.js')
const PORT = 3000;
// let count = 0;
// const users = {};

// app.get('/index.js', (req, res) => res.sendFile(path.resolve(__dirname, '../client/index.js')));
// app.use(express.static(path.resolve(__dirname, './dist')));
// app.use(express.static(path.resolve(__dirname, './dist/assets/images')));
app.get('/main.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist/main.js'));
});
app.get('/index.css', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index.css'));
});
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../dist/index.html'));
});
// Adding in a express server to HTTPS to allow HTTPS
const server = https.createServer(
  // {
  //   key: fs.readFileSync(path.resolve(__dirname, './ssl_diane/server.key')),
  //   // // is required to allow localhost to run on HTTPS
  //   // // otherwise you either get an error or a certified invalid warning
  //   cert: fs.readFileSync(path.resolve(__dirname, './ssl_diane/server.crt')),
  // },
  app
);

// variable for websocket rooms
let roomChannels = {};
let userCount = 0;
// WEBSOCKET SECURED CONNECTION //
const wss = new WebSocket.Server({ server });
// const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (currentClient, incomingMessage) => {
  const initialMessage = { type: 'NEW USER', id: userCount };
  console.log('New Websocket Connection ID: ', userCount);
  userCount += 1;
  currentClient.send(JSON.stringify(initialMessage));

  currentClient.on('message', (data) => {
    console.log('\nDATA: ', data);
    const parsedData = JSON.parse(data);
    const { roomKey, message, socketID } = parsedData.payload;

    switch (parsedData.type) {
      // Creation of a new Room or joining Room
      case 'ROOM':
        // if room exist and room is not full (max of 2 clients per room)
        if (roomChannels.hasOwnProperty(roomKey) && Object.keys(roomChannels[roomKey]).length < 2) {
          console.log('New client has joined room ', roomKey);
          // client joins the room
          roomChannels[roomKey][socketID] = currentClient;
          // set room ready object
          const ready = { type: 'CONNECTION', startConnection: true };
          // notify client that created the room to begin WebRTC Connection
          const clients = roomChannels[roomKey];
          Object.keys(clients).forEach((id) => {
            const client = clients[id];
            if (client !== currentClient && client.readyState === WebSocket.OPEN) client.send(JSON.stringify(ready));
          });
        // if room doesn't exist
        } else if (!roomChannels.hasOwnProperty(roomKey)) {
          // create new room & store current client in an array
          roomChannels[roomKey] = { [socketID]: currentClient };
          console.log('New room has been created with key: ', roomKey, ' by User: ', socketID);
          console.log('Room Count: ', Object.keys(roomChannels).length);
        }
        break;
      // Sending messages to client in existing room
      default:
        if (parsedData) {
          const clients = roomChannels[roomKey];
          Object.keys(clients).forEach((id) => {
            const client = clients[id];
            if (client !== currentClient && client.readyState === WebSocket.OPEN) client.send(data);
          });
        }
    }
  });
});

// wss.on('connection', (websocket, incomingMessage, req) => {
//   console.log('web socket fired up');
//   // websocket.send(JSON.stringify({ userID: ++count }));
//   websocket.on('message', data => {
//     console.log('\nDATA: ', data);
//     //check if roomcode exists
//     const parsedMessage = JSON.parse(data);
//     if (parsedMessage.roomKey) {
//       const { roomKey } = parsedMessage;
//       // if room exist and room is not full (max of 2 clients per room)
//       if (roomChannels.hasOwnProperty(roomKey) && roomChannels[roomKey].length < 2) {
//         console.log('New client has joined room ', roomKey);
//         // client joins the room
//         roomChannels[roomKey].push(websocket);
//         // set room ready object
//         const ready = { type: 'CONNECTION', startConnection: true };
//         // notify client that created the room to begin WebRTC Connection
//         roomChannels[roomKey][0].send(JSON.stringify(ready));
//       // if room doesn't exist
//       } else if (!roomChannels.hasOwnProperty(roomKey)) {
//         // create new room & store current client in an array
//         roomChannels[roomKey] = [websocket];
//         console.log('New room has been created with key: ', roomKey)
//         console.log('Room Count: ', Object.keys(roomChannels).length);
//       } else {
//         const isFull = { isfull: true };
//         websocket.send(JSON.stringify(isFull));
//       }
//     } else {
//       console.log('\nINSIDE SERVER VIDEO OFFER');
//       wss.clients.forEach(client => {
//         console.log('IS CLIENT? ', client === websocket);
//         console.log('READYSTATE: ', client.readyState === WebSocket.OPEN)
//         if (client !== websocket && client.readyState === WebSocket.OPEN)
//           client.send(data);
//       });
//     }
//   });
// });

// ____________________________ //

server.listen(PORT, () => {
  console.log('\nListening on PORT: ', PORT);
});
