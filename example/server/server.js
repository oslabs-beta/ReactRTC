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
  res.sendFile(path.resolve(__dirname, '../dist/main.js'));
});
app.get('/index.css', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.css'));
});
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../dist/index.html'));
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

//variable for websocket rooms
let room_Channels = {};
// WEBSOCKET SECURED CONNECTION //
const wss = new WebSocket.Server({ server });
// const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (websocket, incomingMessage, req) => {
  console.log('web socket fired up');
  // websocket.send(JSON.stringify({ userID: ++count }));
  websocket.on('message', data => {
    //check if roomcode exists
    let verified = false;
    let roomAccessCode = data.roomAccessCode
    if(roomcode){
      verified = true;
      room = room_Channels[data.roomAccessCode];
      if(!roomcode){
        room_channels[key] = [websocket];
        key = roomcode;
      }
      else{
        room_Channels.push(websocket)
      }
    }
    else{
      console.log('room access code doesnt match')
    }
    console.log('this is the room object', room_Channels)


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

server.listen(PORT, () => {
  console.log('\nListening on PORT: ', PORT);
});
