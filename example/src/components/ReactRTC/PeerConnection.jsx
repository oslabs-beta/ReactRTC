import React, { Component } from 'react';

class PeerConnection extends Component {
  constructor(props) {
    super(props)
    this.rtcPeerConnection = new RTCPeerConnection({ iceServers: props.iceServers });
  }

  addMediaStreamTrack = async () => {
    const { localMediaStream } = this.props
    await localMediaStream.getTracks().forEach((mediaStreamTrack) => {
      this.rtcPeerConnection.addTrack(mediaStreamTrack);
    });
  }

  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    console.log('Recieving negotiationNeededEvent: ', negotiationNeededEvent);
    const { sendMessage } = this.props;
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
      const { sendMessage } = this.props;
      const { type, candidate } = rtcPeerConnectionIceEvent;
      sendMessage(JSON.stringify({ type, candidate}));
    }
  }

  handleOnTrack = (trackEvent) => {
    const remoteMediaStream = new MediaStream([ trackEvent.track ]);
    this.props.addRemoteStream(remoteMediaStream);
  }

  componentDidMount() {
    this.rtcPeerConnection.onnegotiationneeded = this.handleOnNegotiationNeeded;
    this.rtcPeerConnection.onicecandidate = this.handleOnIceEvent;
    this.rtcPeerConnection.ontrack = this.handleOnTrack;
  }

  componentDidUpdate(prevProps) {
    if (this.props.startConnection !== prevProps.startConnection) {
      this.addMediaStreamTrack();
    }
  }

  render() {
    return(
      <>
      </>
    );
  }
}

export default PeerConnection;
