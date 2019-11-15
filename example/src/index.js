import React from 'react';
import ReactDOM from 'react-dom';
import ReactRTC from './components/ReactRTC/ReactRTC.jsx';
import RTCMesh from './components/ReactRTC/RTCMesh.jsx';

// const Index = () => (
//   <div>
//     {/* <ReactRTC /> */}
//     <RTCMesh />
//   </div>
// );

ReactDOM.render(<RTCMesh />, document.getElementById('root'));
