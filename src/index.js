import React from 'react';
import ReactDOM from 'react-dom';
import RTCMesh from '../lib/components/RTCMesh.jsx'
import '@babel/polyfill';
// import 'regenerator-runtime';
//check if this endpoint is correct
// import RTCMesh from './components/ReactRTC/RTCMesh.jsx';


// const Index = () => (
//   <div>
//     {/* <ReactRTC /> */}
//     <RTCMesh />
//   </div>
// );

ReactDOM.render(<RTCMesh />, document.getElementById('root'));