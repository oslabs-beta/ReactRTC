import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Websocket from './Websocket.jsx';
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS } from './functions/constants';
import { buildServers, roomKeyGenerator } from './functions/utils';

class RTCMesh extends Component {
  constructor(props) {
    super(props);
    const { sessionConstraints, iceServers } = props;
    // build iceServers config for RTCPeerConnection
    const iceServerURLs = buildServers(iceServers);
    this.state = {
      iceServers: iceServerURLs || DEFAULT_ICE_SERVERS,
      sessionConstraints: sessionConstraints || DEFAULT_CONSTRAINTS,
      localMediaStream: null,
      remoteMediaStream: null,
      text: '',
    };

    // eslint-disable-next-line react/destructuring-assignment
    const iceServersFromState = this.state.iceServers;
    this.peerConnection = new RTCPeerConnection({ iceServers: iceServersFromState });
  }

  render() {
    const { localMediaStream, remoteMediaStream } = this.state;
    return (
      <>
        <Websocket url="wss://94a57304.ngrok.io" />
        <RTCVideo mediaStream={localMediaStream} />
        <RTCVideo mediaStream={remoteMediaStream} />
      </>
    );
  }
}

export default RTCMesh;
