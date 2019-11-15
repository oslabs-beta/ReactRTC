import React, { Component } from 'react';

class Websocket extends Component {
  constructor(props) {
    super(props);
    const { url } = props;
    this.state = {
      socket: new Websocket(url),
    };
  }

  setupConnection = () => {
    const { socket } = this.state;

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
