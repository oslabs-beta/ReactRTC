import React, { Component } from 'react';
import {onMessage} from './functions/socketConnection.js';
import "regenerator-runtime/runtime";
import "core-js/stable";
import cameraIcon from '../../../dist/assets/images/camera-icon.png';
import phoneIcon from '../../../dist/assets/images/phone-icon.png';
import stopIcon from '../../../dist/assets/images/stop-icon.png';
import reactRTCLogo from '../../../dist/assets/images/reactrtc.png';

function socketConnection(url){
  return new WebSocket(url)
}

function uuidGenerator() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class ReactRTC extends Component {
  constructor() {
    super();
    this.state = {
      sessionConstraints:{video:true, audio:false},
      localStream:null,
      localVideo:null,
      remoteVideo:null,
      text: ''
    }
    // currently the url is hard-coded: need to change it to a variable for this.props.socketURL later
    this.socketConnection = socketConnection('wss://94a57304.ngrok.io');
    this.iceServerConfig = {iceServers:[{ urls: 'stun:stun.l.google.com:19302' }]}
    this.peerConnection = new RTCPeerConnection(this.iceServerConfig);

    this.getUserMedia = this.getUserMedia.bind(this);
    this.handleUserMedia = this.handleUserMedia.bind(this);
    this.stopStream = this.stopStream.bind(this);
    this.onIceHandler = this.onIceHandler.bind(this);
    this.onTrackHandler = this.onTrackHandler.bind(this);
    this.onNegotiationNeededHandler = this.onNegotiationNeededHandler.bind(this);
    this.callButtonGetTracks = this.callButtonGetTracks.bind(this)
  }
  
  handleUserMedia(mediaStream) {
    const reactLogo = document.querySelector('.react-rtc__logo');
    reactLogo.style.display = 'none';
    this.setState({ localStream: mediaStream }, () => {
      console.log('hitting setState for handleUserMedia')
    })
    // console.log('localstream', this.state.localStream)
    const localVideo = document.querySelector('#localVideo');
    localVideo.srcObject = this.state.localStream;
    // send the roomKey
    const roomKey = JSON.stringify({ roomKey: uuidGenerator() });
    this.socketConnection.send(roomKey);
    alert(roomKey);
  }

  getUserMedia(event) {
    navigator.mediaDevices.getUserMedia(this.state.sessionConstraints)
    .then(this.handleUserMedia)
    .catch((err) => { console.error('Err:'. err) })
  }

  stopStream(event) {
    const endVideoStream = this.state.localStream.getVideoTracks()[0].stop()
    // const endAudioStream = this.state.localStream.getAudioTracks()[0].stop()
    this.setState({ localStream: endVideoStream });
    //NOTE: will need to add audio tracks later
    console.log('hitting both endVideoStream')
  
    // this.setState({localStream:endAudioStream})
  }

  async callButtonGetTracks() {
    console.log('looking for localStream -->', this.state.localStream)
    await this.state.localStream.getTracks().forEach((mediaStreamTrack) => {
      console.log('hitting forEach getTracks')
      this.peerConnection.addTrack(mediaStreamTrack);
    });
  }

  onIceHandler(RTCPeerConnectionIceEvent) {
    if(RTCPeerConnectionIceEvent.candidate){
      const {type, candidate} = RTCPeerConnectionIceEvent;
      this.socketConnection.send(JSON.stringify({type, candidate}))
    }
  }
  
  onTrackHandler(event) {
    console.log('hitting onTrackHandler')
    const remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = new MediaStream([event.track]);
  }

  async onNegotiationNeededHandler(negotiationNeededEvent) {
    console.log('hitting onNegotiationNeededHandler')
    try {
      const offer = await this.peerConnection.createOffer();
      console.log('offer is about to be created before sending');

      await this.peerConnection.setLocalDescription(offer);

      console.log('About to send data');

      this.socketConnection.send(JSON.stringify(this.peerConnection.localDescription));
    } catch(err) {
      console.error("ERROR:", err);
    }
  }

  componentDidMount() {
    this.peerConnection.onicecandidate = this.onIceHandler;
    this.peerConnection.ontrack= this.onTrackHandler;
    this.peerConnection.onnegotiationneeded = this.onNegotiationNeededHandler;

    this.socketConnection.onopen = () => {
      console.log('connected')
    }
    this.socketConnection.onmessage = (event) => {
      console.log('event', event)
      const messageData = JSON.parse(event.data);
      console.log('messageData', messageData)
      if (messageData.startConnection) {
        console.log('Connection Started: ', messageData);
        this.callButtonGetTracks();
      } else {
        onMessage(messageData, this.peerConnection, this.socketConnection, this.state.sessionConstraints)
      }
    } 
    this.socketConnection.onclose = (event) => {
      // console.log('Socket is closed. Reconnecting will be attempted in 1 second', event.reason);
      // setTimeout(()=>{
      //   connect();
      // },1000)
      console.log('outside reconnect', event)
    }
        
    this.socketConnection.onerror = (err) => {
      console.error('Socket encountered this error ==>', err.message, 'Closing socket');
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    // send the roomKey
    const roomKey = JSON.stringify({ roomKey: this.state.text });
    this.socketConnection.send(roomKey);
  }

  handleChange = (event) => {
    this.setState({
      text: event.target.value
    });
  }
        
  render() {
    return (
      <div className='react-rtc'>
        <div className='videoContainer'>
          <img className='react-rtc__logo' src={reactRTCLogo} alt=""/>
          <video id='localVideo' autoPlay ></video>
          <video id='remoteVideo' autoPlay ></video>
        </div>

        <form onSubmit={this.handleSubmit}>
          <input 
            type="text" 
            onChange={this.handleChange}
            value={this.state.text}/>
          <input type="submit"/>
        </form>

        <section className='button-container'>
          <div className='button button--start-color' onClick = {this.getUserMedia}>
            <img className='icon icon--start' src={cameraIcon} alt=""/>
          </div>
          <div className='button button--stop-color' onClick = {this.stopStream}>
            <img className='icon icon--stop' src={stopIcon} />
          </div>
          <div className='button button--call-color'onClick = {this.callButtonGetTracks}>
            <img className='icon icon--call' src={phoneIcon} />
          </div>
        </section>
      </div>
    );
  }
}

export default ReactRTC;
