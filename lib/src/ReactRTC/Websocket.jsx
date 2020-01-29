import React, { Component } from 'react';
import { TYPE_CONNECTION, TYPE_OFFER, TYPE_ANSWER, TYPE_NEW_USER, TYPE_ICECANDIDATE } from './functions/constants';

class Websocket extends Component {
  constructor(props) {
    super(props);
  }

  setupConnection = () => {
    const {
      socket,
      handleConnectionReady,
      handleSocketConnection,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
    } = this.props;

    socket.onopen = () => {
      console.log('Websocket connected');
    }

    socket.onmessage = (message) => {
      console.log('Recieving Websocket message: ', message);
      const data = JSON.parse(message.data);
      switch (data.type) {
        case TYPE_NEW_USER:
          handleSocketConnection(data.id);
          break;
        case TYPE_CONNECTION:
          handleConnectionReady(data);
          break;
        case TYPE_OFFER:
          console.log('case Offer')
          handleOffer(data);
          break;
        case TYPE_ANSWER:
          console.log('case Answer')
          handleAnswer(data);
          break;
        case TYPE_ICECANDIDATE:
          console.log('case Ice Candidate')
          handleIceCandidate(data);
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
