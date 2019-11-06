import React from 'react';
import {onMessage} from './functions/socketConnection.js';
import "regenerator-runtime/runtime";
import "core-js/stable";

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
  }
  // sessionConstraints = {video:true, audio:false}
  socketConnection = new WebSocket('ws://localhost:3000/');
  iceServerConfig = {iceServers:[{ urls: 'stun:stun.l.google.com:19302' }]}
  peerConnection = new RTCPeerConnection(this.iceServerConfig);
  
  handleUserMedia(mediaStream){
    this.setState({localStream:mediaStream},()=> {
      console.log('hitting setState')
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
  callButtonGetTracks(){
    async() => {
     
      this.state.localStream.getTracks().forEach((mediaStreamTrack)=>{
        this.peerConnection.addTrack(mediaStreamTrack);
      })
      
    }
  }

  onIceHandler(RTCPeerConnectionIceEvent){
    if(RTCPeerConnectionIceEvent.candidate){
      const {type, candidate} = RTCPeerConnectionIceEvent;
      this.socketConnection.send(JSON.stringify({type, candidate}))
    }
  }
  
  onTrackHandler(event){
    const remoteVideo = document.querySelector('#remoteVideo');
    remoteVideo.srcObject = new MediaStream([event.track]);
  }
  onNegotiationNeededHandler(){
    async(negotiationNeededEvent)=>{
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
  }

  componentDidMount(){

        this.socketConnection.onopen = () =>{
          console.log('connected')
        }
        this.socketConnection.onmessage = event =>{
          console.log('event', event)
          console.log('eventdata', JSON.parse(event.data))

          // testing = OnMessage()
          // console.log('hitting')
          const messageData = JSON.parse(event.data);
          console.log('messageData', messageData)
           onMessage(messageData, this.peerConnection, this.socketConnection)
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
            this.peerConnection.onicecandidate = this.onIceHandler;
            this.peerConnection.ontrack= this.onTrackHandler;
            this.peerConnection.onnegotiationneeded = this.onNegotiationNeededHandler;
          
    
    return (
      <div>
        <h1>ReactRTC!!</h1>
        <video id="localVideo" autoPlay ></video>
        <video id="remoteVideo" autoPlay ></video>
        <button id="start" onClick = {this.getUserMedia}>Start</button>
        <button id="stop" onClick = {this.stopStream}>Stop</button>
        <button id="call"onClick = {this.callButtonGetTracks}>Call</button>
      </div>
    );
  }
}

export default ReactRTC;
