import React, { Component } from 'react';
import { createMessage, createPayload } from './functions/utils';
import { TYPE_OFFER, TYPE_ICECANDIDATE } from './functions/constants';

class PeerConnection extends Component {
  constructor(props) {
    super(props)
  }

  addMediaStreamTrack = async () => {
    const { localMediaStream, rtcPeerConnection } = this.props
    console.log('addMediaStream: ', localMediaStream);
    if (localMediaStream) {
      await localMediaStream.getTracks().forEach((mediaStreamTrack) => {
        rtcPeerConnection.addTrack(mediaStreamTrack);
      });
    }
  }

  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    const { sendMessage, roomInfo, rtcPeerConnection } = this.props;
    try {
      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, rtcPeerConnection.localDescription);
      const offerMessage = createMessage(TYPE_OFFER, payload);
      sendMessage(JSON.stringify(offerMessage));
    } catch(error) {
      console.error('handleNegotiationNeeded Error: ', error)
    }
  }

  handleOnIceEvent = (rtcPeerConnectionIceEvent) => {
    if (rtcPeerConnectionIceEvent.candidate) {
      const { sendMessage, roomInfo } = this.props;
      const { candidate } = rtcPeerConnectionIceEvent;
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, JSON.stringify(candidate));
      const iceCandidateMessage = createMessage(TYPE_ICECANDIDATE, payload);
      sendMessage(JSON.stringify(iceCandidateMessage));
    }
  }

  handleOnTrack = (trackEvent) => {
    const remoteMediaStream = new MediaStream([ trackEvent.track ]);
    this.props.addRemoteStream(remoteMediaStream);
  }

  componentDidMount() {
    const { rtcPeerConnection } = this.props;
    rtcPeerConnection.onnegotiationneeded = this.handleOnNegotiationNeeded;
    rtcPeerConnection.onicecandidate = this.handleOnIceEvent;
    rtcPeerConnection.ontrack = this.handleOnTrack;
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
