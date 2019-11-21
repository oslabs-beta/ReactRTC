<div align="center">
  <img src="https://github.com/oslabs-beta/ReactRTC/blob/master/ReactRTC2.png" alt="ReactRTC" width="400"></a>
  <br>
  <br>
</div>


ReactRTC-beta is a JS library that brings the real-time communication capabilities of WebRTC into React applications. 

ReactRTC simplifies the implementation of WebRTC by providing developers with a customizable react component and signalling server module for the back-end.

<h2>Features</h2>

- Live video & audio streaming capabilities. 
- GUI interface providing key user functionality.
- Signalling server module utilizing websockets.
- Multi-user support through the implementation of server side rooms.

<h2>Installing</h2>
<br>
<pre>npm install react-rtc-real</pre>

ReactRTC runs on React^16.11.0 and requires the following dependencies to operate. 

<pre>npm install --save @babel/polyfill
npm install --save style-loader
npm install --save css-loader
npm install --save regenerator-runtime</pre>

Import the `<RTCMesh />` component into your React application to begin.
<br>
<pre>import RTCMesh from 'react-rtc-real';
import '@babel/polyfill';
require('react-rtc-real/assets/index.css');</pre>

To set the URL of the signaling server pass the URL into props like so.
<br>
<br>
`<RTCMesh URL=*url goes here* />`

*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

To set up Signaling Server to find remote client, create a
SignalServer.js file and add the following:
<pre> require('react-rtc-real/server/server.js'); </pre>

Spin up the signaling server with the code in terminal:
<pre> node SignalServer.js </pre>

Choose your preferred tech for exposing a PORT for Signal Server.
Using ngrok: https://ngrok.com/download
Choose a PORT number to use and call in terminal (ie. 3000):
<pre> ./ngrok http 3000 </pre>

*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*_*

<h2>Authors</h2>

- Michael Romero
- Joseph Wolensky
- Diane Wu
- Edwin Lin

<h2>Licenses</h2>

This project is licensed under the MIT License - see the LICENSE file for details
