import React from 'react';
import ReactDOM from 'react-dom';
import SocketConnectionMethods from './functions/socketConnection.js';

class ReactRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      peerConnection: null,
      iceServerConfig: null,
      SocketConnectionMethods: null,
    };
  }

  componentDidMount() {
    // const testSocket = new WebSocket('ws://localhost:3000/');
    this.setState({
      socketConnection: new WebSocket('ws://localhost:3000/'),
      peerConnection: new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      }),
    });
  }

  render() {
    this.state.socketConnection.onmessage = SocketConnectionMethods.onMessage();
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
