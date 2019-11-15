import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Websocket from './Websocket.jsx';
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS } from './functions/constants';
import { buildServers, roomKeyGenerator } from './functions/utils';

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
      sendMessage: () => console.log('websocket.send function has not been set'),
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
    try {
      const offer = await this.rtcPeerConnection.createOffer();
      await this.rtcPeerConnection.setLocalDescription(offer);
    } catch(error) {
      console.error('handleNegotiationNeeded Error: ', error)
    }
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

  componentDidMount() {
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
      </>
    );
  }
}

export default RTCMesh;
