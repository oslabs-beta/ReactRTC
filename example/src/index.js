import React from 'react';
import ReactDOM from 'react-dom';
import RTCMesh from './components/ReactRTC/RTCMesh.jsx';
import '@babel/polyfill';
// const Index = () => (
//   <div>
//     {/* <ReactRTC /> */}
//     <RTCMesh />
//   </div>
// );

ReactDOM.render(<RTCMesh URL="wss://89440dc0.ngrok.io" />, document.getElementById('root'));
