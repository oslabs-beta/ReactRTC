import React, { Component } from 'react';

class Websocket extends Component {
  constructor(props) {
    super(props);
    const { url } = this.props;
    console.log('Websocket Props: ', url)
    this.state = {
      socket: new WebSocket(url),
    };
  }

  setupConnection = () => {
    const { socket } = this.state;
    const { setSendMethod } = this.props;

    socket.onopen = () => {
      console.log('Websocket connected');
    }

    socket.onmessage = (message) => {
      console.log('Recieving Websocket message: ', message);
    }

    socket.onclose = (event) => {
      console.log('Websocket closed: ', event);
    }

    socket.onerror = (error) => {
      console.error('Websocket error: ', error);
    }
    // Saves websocket.send method definition inside RTCMesh's state
    setSendMethod(socket.send);
  }

  componentDidMount() {
    this.setupConnection();
  }

  render() {
    return (
      <>
      </>
    )
  }
}

export default Websocket;
