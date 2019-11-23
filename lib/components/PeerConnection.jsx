import React, { Component } from 'react';
import { createMessage, createPayload } from '../utils';
import { TYPE_OFFER, TYPE_ICECANDIDATE } from '../constants';

class PeerConnection extends Component {
  constructor(props) {
    super(props)
  }

  /**
   * Tracks will be added and used to transmit to remote peer.
   */
  addMediaStreamTrack = async () => {
    const { localMediaStream, rtcPeerConnection } = this.props
    console.log('addMediaStream: ', localMediaStream);
    if (localMediaStream) {
      await localMediaStream.getTracks().forEach((mediaStreamTrack) => {
        // after tracks get added to RTCPeerConnection, will fire off a 
        // negotiationneeded event
        rtcPeerConnection.addTrack(mediaStreamTrack);
      });
    }
  }

  /**
   * @param {negotiationneeded} negotiationNeededEvent dispatched after media has
   * been added to a RTCPeerConnection; has access to an instance of RTCPeerConnection
   * if needed.
   */
  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    const { sendMessage, roomInfo, rtcPeerConnection } = this.props;
    try {
      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, rtcPeerConnection.localDescription);
      const offerMessage = createMessage(TYPE_OFFER, payload);
      // sending an offer to remote peer inside the same channel/room
      sendMessage(JSON.stringify(offerMessage));
    } catch(error) {
      console.error('handleNegotiationNeeded Error: ', error)
    }
  }

  /**
   * @param {icecandidate} rtcPeerConnectionIceEvent 
   */
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
    // setting up eventListeners
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
