import React from 'react';
// import SocketConnectionMethods from './functions/socketConnection.js';

class ReactRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      // peerConnection: null,
      // iceServerConfig: null,
      // SocketConnectionMethods: null,
    };
  }

  testSocket = new WebSocket('ws://localhost:3000/');
  componentDidMount() {
    // this.setState({
    //   socketConnection: new WebSocket('ws://localhost:3000/'),
    //   peerConnection: new RTCPeerConnection({
    //     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    //   }),
    // });
    this.testSocket.onopen = () =>{
      console.log('connected')
    }
    this.testSocket.onmessage = event =>{
      const message = JSON.parse(event.data);
      this.setState({dataFromServer: message})
      console.log(message)
    } 
    this.testSocket.onclose = () => {
      console.log('disconnected')
    }
   }

  render() {
    // this.state.socketConnection.onmessage = SocketConnectionMethods.onMessage();
    return (
      <div>
        <h1>ReactRTC!!</h1>
        <video id="localVideo" autoPlay></video>
        <button id="start">Start</button>
        <button id="stop">Stop</button>
        <button id="call">Call</button>
      </div>
    );
  }
}

export default ReactRTC;
