import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Form from './Form.jsx';
import Websocket from './Websocket.jsx';
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS, ROOM_TYPE } from './functions/constants';
import { buildServers, generateRoomKey } from './functions/utils';

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
      sendMessage: () => (console.log('websocket.send function has not been set')),
      text: '',
    };

    // eslint-disable-next-line react/destructuring-assignment
    const iceServersFromState = this.state.iceServers;
    this.rtcPeerConnection = new RTCPeerConnection({ iceServers: iceServersFromState });
  }

  openCamera = async () => {
    const { mediaConstraints, localMediaStream } = this.state;
    try {
      if (!localMediaStream) {
        const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        this.setState({ localMediaStream: mediaStream }, this.sendRoomKey);
      }
    } catch(error) {
      console.error('getUserMedia Error: ', error)
    }
  }

  sendRoomKey = () => {
    const { roomKey } = this.state;
    if (!roomKey) {
      const room = { type: ROOM_TYPE, roomKey: generateRoomKey() };
      this.setState({ roomKey: room })
      this.state.sendMessage(JSON.stringify(room));
      alert(room.roomKey);
    }
  }

  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    console.log('Recieving negotiationNeededEvent: ', negotiationNeededEvent);
    const { sendMessage } = this.state;
    try {
      const offer = await this.rtcPeerConnection.createOffer();
      await this.rtcPeerConnection.setLocalDescription(offer);
      sendMessage(JSON.stringify(this.rtcPeerConnection.localDescription));
    } catch(error) {
      console.error('handleNegotiationNeeded Error: ', error)
    }
  }

  handleOnIceEvent = (rtcPeerConnectionIceEvent) => {
    if (rtcPeerConnectionIceEvent.candidate) {
      const { sendMessage } = this.state;
      const { type, candidate } = rtcPeerConnectionIceEvent;
      sendMessage(JSON.stringify({ type, candidate}));
    }
  }

  handleOnTrack = (trackEvent) => {
    const remoteMediaStream = new MediaStream([ trackEvent.track ]);
    this.setState({ remoteMediaStream });
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

  handleSubmit = (event) => {
    event.preventDefault();
    const { text, roomKey } = this.state;
    // send the roomKey
    // if (roomKey && text.length )
    const roomKeyMessage = JSON.stringify({
      type: ROOM_TYPE,
      roomKey: this.state.text
    });
    this.state.sendMessage(roomKeyMessage);
    this.setState({ text: '' });
  }

  handleChange = (event) => {
    this.setState({
      text: event.target.value
    });
  }

  componentDidMount() {
    this.rtcPeerConnection.onnegotiationneeded = this.handleOnNegotiationNeeded;
    this.rtcPeerConnection.onicecandidate = this.handleOnIceEvent;
    this.rtcPeerConnection.ontrack = this.handleOnTrack;
  }

  render() {
    const { localMediaStream, remoteMediaStream, text, roomKey } = this.state;
    return (
      <>
        <Websocket 
          url="wss://94a57304.ngrok.io" 
          setSendMethod={this.setSendMethod}
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
