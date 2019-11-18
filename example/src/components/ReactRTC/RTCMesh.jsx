import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Form from './Form.jsx';
import Websocket from './Websocket.jsx';
import PeerConnection from './PeerConnection.jsx';
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS, TYPE_ROOM, TYPE_OFFER, TYPE_ANSWER } from './functions/constants';
import { buildServers, generateRoomKey, createMessage, createPayload } from './functions/utils';

class RTCMesh extends Component {
  constructor(props) {
    super(props);
    const {mediaConstraints, iceServers } = props;
    // build iceServers config for RTCPeerConnection
    const iceServerURLs = buildServers(iceServers);
    this.state = {
      iceServers: iceServerURLs || DEFAULT_ICE_SERVERS,
      mediaConstraints: mediaConstraints || DEFAULT_CONSTRAINTS,
      localMediaStream: null,
      remoteMediaStream: null,
      roomKey: null,
      socketID: null,
      connectionStarted: false,
      sendMessage: () => (console.log('websocket.send function has not been set')),
      text: '',
    };
    this.socket = new WebSocket('wss://94a57304.ngrok.io');
    this.rtcPeerConnection = new RTCPeerConnection({ iceServers: this.state.iceServers });
  }

  openCamera = () => {
    const { mediaConstraints, localMediaStream } = this.state;
    if (!localMediaStream) {
      navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((mediaStream) => {
          console.log('opening camera: ', mediaStream);
          this.setState({ localMediaStream: mediaStream });
        })
        .catch((error) => {
          console.error('getUserMedia Error: ', error);
        });
    }
  }
  // openCamera = async () => {
  //   const { mediaConstraints, localMediaStream } = this.state;
  //   try {
  //     if (!localMediaStream) {
  //       const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  //       console.log('opening camera: ', mediaStream);
  //       this.setState({ localMediaStream: mediaStream }, this.sendRoomKey);
  //     }
  //   } catch(error) {
  //     console.error('getUserMedia Error: ', error)
  //   }
  // }

  // handleOffer = async (data) => {
  //   const { localMediaStream, roomKey, socketID, sendMessage } = this.state;
  //   const { payload } = data;
  //   await this.rtcPeerConnection.setRemoteDescription(payload.message);
  //   if (!localMediaStream) await this.openCamera();
  //   this.setState({ connectionStarted: true }, async function() {
  //     const answer = await this.rtcPeerConnection.createAnswer();
  //     await this.rtcPeerConnection.setLocalDescription(answer);
  //     const payload = createPayload(roomKey, socketID, answer);
  //     const answerMessage = createMessage(TYPE_ANSWER, payload);
  //     sendMessage(JSON.stringify(answerMessage));
  //   });
  // }
  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID, sendMessage, mediaConstraints } = this.state;
    const { payload } = data;
    await this.rtcPeerConnection.setRemoteDescription(payload.message);
    if (!localMediaStream) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        console.log('opening camera: ', mediaStream);
        this.setState({ localMediaStream: mediaStream, connectionStarted: true }, async function() {
          const answer = await this.rtcPeerConnection.createAnswer();
          await this.rtcPeerConnection.setLocalDescription(answer);
          const payload = createPayload(roomKey, socketID, answer);
          const answerMessage = createMessage(TYPE_ANSWER, payload);
          sendMessage(JSON.stringify(answerMessage));
        });
      } catch(error) {
        console.error('getUserMedia Error: ', error);
      }
    } else {
      this.setState({ connectionStarted: true }, async function() {
        const answer = await this.rtcPeerConnection.createAnswer();
        await this.rtcPeerConnection.setLocalDescription(answer);
        const payload = createPayload(roomKey, socketID, answer);
        const answerMessage = createMessage(TYPE_ANSWER, payload);
        sendMessage(JSON.stringify(answerMessage));
      });
    }
  }

  handleAnswer = async (data) => {
    const { payload } = data;
    await this.rtcPeerConnection.setRemoteDescription(payload.message);
  }

  handleIceCandidate = async (data) => {
    const { message } = data.payload;
    const candidate = JSON.parse(message);
    await this.rtcPeerConnection.addIceCandidate(candidate);
  }

  /**
   * @param {function} websocketSendMethod
   * upon successful creation of new Websocket instance, RTCMesh will recieve
   * websocket's send function definition and store it in state
   */
  setSendMethod = (websocketSendMethod) => {
    console.log ('Inside SocketCreation: ', websocketSendMethod);
    this.setState({ sendMessage: websocketSendMethod });
  }

  sendRoomKey = () => {
    const { roomKey, socketID } = this.state;
    if (!roomKey) {
      const key = generateRoomKey();
      const roomData = createMessage(TYPE_ROOM, createPayload(key, socketID));
      this.setState({ roomKey: key })
      this.state.sendMessage(JSON.stringify(roomData));
      alert(key);
    }
  }

  handleSocketConnection = (socketID) => {
    this.setState({ socketID });
  }

  handleConnectionReady = (message) => {
    console.log('Inside handleConnectionReady: ', message);
    if (message.startConnection) {
      this.setState({ connectionStarted: message.startConnection });
    }
  }

  addRemoteStream = (remoteMediaStream) => {
    this.setState({ remoteMediaStream });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { text, socketID } = this.state;
    // send the roomKey
    // Remove leading and trailing whitespace
    if (text.trim()) {
      const roomKeyMessage = createMessage(TYPE_ROOM, createPayload(text, socketID));
      this.state.sendMessage(JSON.stringify(roomKeyMessage));
    };
    this.setState({ text: '', roomKey: text.trim() });
  }

  handleChange = (event) => {
    this.setState({
      text: event.target.value
    });
  }

  render() {
    const { 
      localMediaStream,
      remoteMediaStream,
      text,
      roomKey,
      socketID,
      iceServers,
      connectionStarted,
      sendMessage,
    } = this.state;
    return (
      <>
        <Websocket 
          // url="wss://94a57304.ngrok.io"
          socket={this.socket}
          setSendMethod={this.setSendMethod}
          handleSocketConnection={this.handleSocketConnection}
          handleConnectionReady={this.handleConnectionReady}
          handleOffer={this.handleOffer}
          handleAnswer={this.handleAnswer}
          handleIceCandidate={this.handleIceCandidate}
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
        />
        <RTCVideo mediaStream={localMediaStream} />
        <RTCVideo mediaStream={remoteMediaStream} />

        <Form
          handleSubmit={this.handleSubmit}
          handleChange={this.handleChange}
          hasRoomKey={roomKey}
          text={text}
        />

        <section className='button-container'>
          <div className='button button--start-color' onClick={this.openCamera}>
          </div>
          <div className='button button--stop-color' onClick={null}>
          </div>
        </section>
      </>
    );
  }
}

export default RTCMesh;
