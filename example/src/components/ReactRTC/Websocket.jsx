import React, { Component } from 'react';
import { TYPE_CONNECTION, TYPE_OFFER, TYPE_ANSWER } from './functions/constants';

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
    const { setSendMethod, handleConnectionReady } = this.props;

    socket.onopen = () => {
      console.log('Websocket connected');
    }

    socket.onmessage = (message) => {
      console.log('Recieving Websocket message: ', message);
      const data = JSON.parse(message.data);
      switch(data.type) {
        case TYPE_CONNECTION:
          handleConnectionReady(data);
          break;
        case TYPE_OFFER:
          console.log('case Offer')
          break;
        case TYPE_ANSWER:
          console.log('case Answer')
          break;
        default:
          console.error('Recieving message failed');
      }
    }

    socket.onclose = (event) => {
      console.log('Websocket closed: ', event);
    }

    socket.onerror = (error) => {
      console.error('Websocket error: ', error);
    }
    // Binds send method to socket instance to not lose context
    // Saves websocket.send method definition inside RTCMesh's state
    setSendMethod(socket.send.bind(socket));
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
