import React, { Component } from 'react';
import RTCVideo from './RTCVideo.jsx';
import Form from './Form.jsx'
import Websocket from './Websocket.jsx';
import PeerConnection from './PeerConnection.jsx';
import { DEFAULT_CONSTRAINTS, DEFAULT_ICE_SERVERS, TYPE_ROOM, TYPE_ANSWER } from '../constants';
import { buildServers, generateRoomKey, createMessage, createPayload } from '../utils';

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
      text: '',
    };
    this.socket = new WebSocket(this.props.URL);
    this.rtcPeerConnection = new RTCPeerConnection({ iceServers: this.state.iceServers });
  }

  /**
   * @param {Boolean} fromHandleOffer checks if its being invoked from #handleOffer or
   * inside render.
   */
  openCamera = async (fromHandleOffer) => {
    console.log('hitting openCamera')
    const { mediaConstraints, localMediaStream } = this.state;
    try {
      if (!localMediaStream) {
        // asks permission to use camera/audio
        const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        // returns a mediaStream or causes a re-render
        return fromHandleOffer === true ? mediaStream : this.setState({ localMediaStream: mediaStream });
      }
    } catch(error) {
      console.error('getUserMedia Error: ', error)
    }
  }

  /**
   * @param {Object} data contains an offer information that will be handled by a
   * receiving Peer.
   * 
   * saves the offer, checks if camera needs to be opened, then creates an answer
   * and sends it to a Peer.
   */
  handleOffer = async (data) => {
    const { localMediaStream, roomKey, socketID } = this.state;
    const { payload } = data;
    await this.rtcPeerConnection.setRemoteDescription(payload.message);
    // mediaStream will either be null if camera is off or a MediaStream instance if camera
    // is on
    let mediaStream = localMediaStream
    if (!mediaStream) mediaStream = await this.openCamera(true);
    this.setState({ connectionStarted: true, localMediaStream: mediaStream }, async function() {
      const answer = await this.rtcPeerConnection.createAnswer();
      await this.rtcPeerConnection.setLocalDescription(answer);
      const payload = createPayload(roomKey, socketID, answer);
      const answerMessage = createMessage(TYPE_ANSWER, payload);
      // sends an answer object to Peer who created an offer
      this.socket.send(JSON.stringify(answerMessage));
    });
  }

  /**
   * @param {Object} data contains an answer information that will be handled by a
   * receiving Peer.
   * 
   * after having sent an offer, will recieve an answer from remote peer and save
   * it.
   */
  handleAnswer = async (data) => {
    const { payload } = data;
    await this.rtcPeerConnection.setRemoteDescription(payload.message);
  }

  /**
   * @param {Object} data contains ice candidate information.
   * 
   * ice candidates will be used to know the best connection possible to communicate
   * with a remote peer.
   */
  handleIceCandidate = async (data) => {
    const { message } = data.payload;
    const candidate = JSON.parse(message);
    await this.rtcPeerConnection.addIceCandidate(candidate);
  }

  /**
   * @param {Integer} socketID
   */
  handleSocketConnection = (socketID) => {
    this.setState({ socketID });
  }

  /**
   * @param {Object} message contains a boolean to notify Peer to begin communicating
   * 
   * when a channel/room is successfully full, server will send a start connection
   * object that will begin an offer, answer and ice candidate exchanges between 
   * RTCPeerConnections
   */
  handleConnectionReady = (message) => {
    console.log('Inside handleConnectionReady: ', message);
    if (message.startConnection) {
      this.setState({ connectionStarted: message.startConnection });
    }
  }

  /**
   * @param {MediaStream} remoteMediaStream used to display a remote peer
   */
  addRemoteStream = (remoteMediaStream) => {
    this.setState({ remoteMediaStream });
  }

  /**
   * @param {SyntheticEvent} event
   * 
   * will submit to server to create or join a channel/room
   */
  handleSubmit = (event) => {
    event.preventDefault();
    const { text, socketID } = this.state;
    // send the roomKey
    // Remove leading and trailing whitespace
    if (text.trim()) {
      const roomKeyMessage = createMessage(TYPE_ROOM, createPayload(text, socketID));
      this.socket.send(JSON.stringify(roomKeyMessage));
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
    } = this.state;
    const sendMessage = this.socket.send.bind(this.socket);

    return (
      <>
        <Websocket 
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
