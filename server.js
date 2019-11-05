const fs = require('fs');
const path = require('path');
const express = require('express');
const https = require('http');

const app = express();
const WebSocket = require('ws');
// const test = path.resolve(__dirname, '../client/index.js')
const PORT = 3000;
let count = 0;
// const users = {};

// app.get('/index.js', (req, res) => res.sendFile(path.resolve(__dirname, '../client/index.js')));
// app.get('/', (req,res) => {
//   res.sendFile(path.resolve(__dirname,'../client/index.html'));
// });
// // Adding in a express server to HTTPS to allow HTTPS
// const server = https.createServer(
//   {
//     key: fs.readFileSync(path.resolve(__dirname, '../ssl/server.key')),
//     // is required to allow localhost to run on HTTPS
//     // otherwise you either get an error or a certified invalid warning
//     cert: fs.readFileSync(path.resolve(__dirname, '../ssl/server.crt')),
//   },
//   app
// );

// WEBSOCKET SECURED CONNECTION //
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (websocket, incomingMessage, req) => {
  console.log('web socket fired up');
  websocket.send(JSON.stringify({ userID: ++count }));
  websocket.on('message', data => {
    console.log('\nINSIDE SERVER VIDEO OFFER');
    console.log('\nDATA: ', data);
    wss.clients.forEach(client => {
      console.log('IS CLIENT? ', client === websocket);
      if (client !== websocket && client.readyState === WebSocket.OPEN)
        client.send(data);
    });
  });
});

// ____________________________ //

// app.listen(PORT, () => {
//   console.log('\nListening on PORT: ', PORT);
// });
