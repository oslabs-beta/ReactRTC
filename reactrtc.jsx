import { Component } from 'react';

class ReactRTCVideo extends Component {

  const socketConnection = new WebSocket('wss://832475e4.ngrok.io')

  onCall() {
    this.socketConnection.send(data)
  }

  render () {
    return (
      <>
        <video 
          id="localVideo"
          autoplay
          style='width: 360px; border: 1px solid black'>
        </video>
        <button id="start">Start</button>
        <button id="stop">Stop</button>
        <button 
          id="call"
          onClick={this.onCall}
          >Call</button>
      <>
    )
  }
}