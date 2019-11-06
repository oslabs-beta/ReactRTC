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
            // this.state.socketConnection.onmessage = SocketConnectionMethods.onMessage();
            //add logic to render component with this.props
            // <ChildComponent testSocket = {this.testSocket}/>
            // console.log(SocketConnectionMethods.onMessage)
    
    return (
      <div>
        <h1>ReactRTC!!</h1>
        <video id="localVideo" autoPlay ></video>
        <button id="start" onClick = {this.getUserMedia}>Start</button>
        <button id="stop">Stop</button>
        <button id="call">Call</button>
      </div>
    );
  }
}

export default ReactRTC;
