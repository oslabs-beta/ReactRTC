import React from 'react';
import {onMessage} from './functions/socketConnection.js';
import "regenerator-runtime/runtime";
import "core-js/stable";
import cameraIcon from '../../../dist/assets/images/camera-icon.png';
import phoneIcon from '../../../dist/assets/images/phone-icon.png';
import stopIcon from '../../../dist/assets/images/stop-icon.png';
import reactRTCLogo from '../../../dist/assets/images/reactrtc.png';

// console.log('testing here ===>', this.onMessage)
class ReactRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      sessionConstraints:{video:true, audio:false},
      localStream:null
    }

    this.getUserMedia = this.getUserMedia.bind(this);
    this.handleUserMedia = this.handleUserMedia.bind(this);
    this.stopStream = this.stopStream.bind(this);
    this.onIceHandler = this.onIceHandler.bind(this);
    this.onTrackHandler = this.onTrackHandler.bind(this);
    this.onNegotiationNeededHandler = this.onNegotiationNeededHandler.bind(this);
    this.callButtonGetTracks = this.callButtonGetTracks.bind(this)
  }
  // sessionConstraints = {video:true, audio:false}
  socketConnection = new WebSocket('wss://b04f9a71.ngrok.io');
  iceServerConfig = {iceServers:[{ urls: 'stun:stun.l.google.com:19302' }]}
  peerConnection = new RTCPeerConnection(this.iceServerConfig);
  
  handleUserMedia(mediaStream){
    const reactLogo = document.querySelector('.react-rtc__logo');
    reactLogo.style.display = 'none';
    this.setState({localStream:mediaStream},()=> {
      console.log('hitting setState for handleUserMedia')
    })
    // console.log('localstream', this.state.localStream)
    const localVideo = document.querySelector('#localVideo');
    localVideo.srcObject = this.state.localStream;
  }

  getUserMedia(event){
    navigator.mediaDevices.getUserMedia(this.state.sessionConstraints)
    .then(this.handleUserMedia)
    .catch((err) => { console.error('Err:'. err)})
  }
  stopStream(event){
    const endVideoStream = this.state.localStream.getVideoTracks()[0].stop()
    // const endAudioStream = this.state.localStream.getAudioTracks()[0].stop()
    this.setState({localStream:endVideoStream});
  //NOTE: will need to add audio tracks later
      console.log('hitting both endVideoStream')
  
    // this.setState({localStream:endAudioStream})
  }
  async callButtonGetTracks(){
 
    console.log('looking for localStream -->', this.state.localStream)
    await this.state.localStream.getTracks().forEach((mediaStreamTrack)=>{
        console.log('hitting forEach getTracks')
        this.peerConnection.addTrack(mediaStreamTrack);
      });
    
  }

  onIceHandler(RTCPeerConnectionIceEvent){
    if(RTCPeerConnectionIceEvent.candidate){
      const {type, candidate} = RTCPeerConnectionIceEvent;
      this.socketConnection.send(JSON.stringify({type, candidate}))
    }
  }
  
  onTrackHandler(event){
    console.log('hitting onTrackHandler')
    const remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = new MediaStream([event.track]);
    remoteVideo.style.display = 'block'
  }
  async onNegotiationNeededHandler(negotiationNeededEvent){
    console.log('hitting onNegotiationNeededHandler')
      try{
        const offer = await this.peerConnection.createOffer();
        console.log('offer is about to be created before sending');

        await this.peerConnection.setLocalDescription(offer);

        console.log('About to send data');

        this.socketConnection.send(JSON.stringify(this.peerConnection.localDescription));
      }
      catch(err){
        console.error("ERROR:", err);
      }
    
  }

  componentDidMount(){

        this.socketConnection.onopen = () =>{
          console.log('connected')
        }
        this.socketConnection.onmessage = event =>{
          console.log('event', event)
          // console.log('eventdata', JSON.parse(event.data))

          // testing = OnMessage()
          // console.log('hitting')
          const messageData = JSON.parse(event.data);
          console.log('messageData', messageData)
           onMessage(messageData, this.peerConnection, this.socketConnection, this.state.sessionConstraints)
          } 
          this.socketConnection.onclose = (event) => {
            // console.log('Socket is closed. Reconnecting will be attempted in 1 second', event.reason);
            // setTimeout(()=>{
              //   connect();
              // },1000)
              console.log('outside reconnect')
            }
            
            this.socketConnection.onerror = (err) => {
              console.error('Socket encountered this error ==>', err.message, 'Closing socket');
            }
          }
          
          render() {
            //move these to componentDidmount
            this.peerConnection.onicecandidate = this.onIceHandler;
            this.peerConnection.ontrack= this.onTrackHandler;
            this.peerConnection.onnegotiationneeded = this.onNegotiationNeededHandler;
          
    
    return (
      <div className='react-rtc'>
        <div className='videoContainer'>
        <img className='react-rtc__logo' src={reactRTCLogo} alt=""/>
        <video id='localVideo' autoPlay ></video>
        <video id='remoteVideo' autoPlay ></video>
        </div>

        <section className='button-container'>
          <div className='button button--start-color' onClick = {this.getUserMedia}>
            {/* <div 
            className='icon icon--start'
            style={{backgroundImage: cameraIcon}}
            ></div> */}
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
