<div align="center">
  <img src="https://github.com/oslabs-beta/ReactRTC/blob/master/ReactRTC2.png" alt="ReactRTC" width="400"></a>
  <br>
  <br>
</div>


ReactRTC is a JS library that brings the real-time communication capabilities of WebRTC into React applications. 

ReactRTC simplifies the implementation of WebRTC by providing developers with a customizable react component and signalling server module for the back-end.

<h2>Features</h2>

- Live video & audio streaming capabilities. 
- GUI interface providing key user functionality.
- Signalling server module utilizing websockets.
- Multi-user support through the implementation of server side rooms.

<h2>Installing</h2>
<br>
<pre>npm install react-rtc-real</pre>
<pre>npm install @babel/polyfill</pre>

Import the following into the Top React Component (App)
<pre>import RTCMesh from 'react-rtc-real';
import '@babel/polyfill';
require('react-rtc-real/assets/index.css');</pre>

Add RTCMesh Child Component with URL prop set to Signal Server address like so:
<pre>RTCMesh URL="wss://dacbab13.ngrok.io"</pre>

<h2>Authors</h2>

- Michael Romero
- Joseph Wolensky
- Diane Wu
- Edwin Lin

<h2>Licenses</h2>

This project is licensed under the MIT License - see the LICENSE file for details
