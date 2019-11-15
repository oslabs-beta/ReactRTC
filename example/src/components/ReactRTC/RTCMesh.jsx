import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
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
      sendMessage: () => (console.log('websocket.send function has not been set')),
      text: '',
    };

    // eslint-disable-next-line react/destructuring-assignment
    const iceServersFromState = this.state.iceServers;
    this.rtcPeerConnection = new RTCPeerConnection({ iceServers: iceServersFromState });
  }

  openCamera = async () => {
    const { mediaConstraints } = this.state;
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      this.setState({ localMediaStream: mediaStream });
    } catch(error) {
      console.error('getUserMedia Error: ', error)
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
    // send the roomKey
    const roomKey = JSON.stringify({
      type: ROOM_TYPE,
      roomKey: this.state.text
    });
    this.state.sendMessage(roomKey);
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
    this.openCamera();
  }

  render() {
    const { localMediaStream, remoteMediaStream } = this.state;
    return (
      <>
        <Websocket 
          url="wss://94a57304.ngrok.io" 
          setSendMethod={this.setSendMethod}
        />
        <RTCVideo mediaStream={localMediaStream} />
        <RTCVideo mediaStream={remoteMediaStream} />

        <form onSubmit={this.handleSubmit}>
          <input 
            type="text" 
            onChange={this.handleChange}
            value={this.state.text}/>
          <input type="submit"/>
        </form>
      </>
    );
  }
}

export default RTCMesh;
