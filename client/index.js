const localVideo = document.querySelector('#localVideo');
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
const callButton = document.querySelector('#call');
const socketConnection = new WebSocket('wss://localhost:3000');

socketConnection.onopen = () => {
  console.log('socket connection opened!')
}

let localStream = null;
// ______________________________ LOCALSTREAM ______________________________
/**
 * @Step - ONE -
 * @Part (A) get access to our own Camera/Audio
 */
function handleUserMedia(mediaStream) {
  localStream = mediaStream;
  localVideo.srcObject = mediaStream;
}

startButton.addEventListener('click', function(event) {
  navigator.mediaDevices.getUserMedia( {video: true, audio: false} )
    .then(handleUserMedia)
    .catch((err) => {
      console.log(err)
    })
});

stopButton.addEventListener('click', (event) => {
  localStream.getVideoTracks()[0].stop();
  localStream.getAudioTracks()[0].stop();
});

/**
 * @Step - TWO -
 * @Part (A) create a new instance of a local PeerConnection
 * @Part (B) setup handlers for "onicecandidate", "ontrack", & "onnegotiationneeded"
 * 
 * @Note the three handlers mentioned above are required;  you have to handle
 * them to do anything involving streamed media with WebRTC.
 */
callButton.addEventListener('click', async (event) => {
  // object with key iceServers that contains an array of URL objects to each STUN server
  const iceServerConfig = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
  // create a local peerConnection utilizing stun servers
  const peerConnection = new RTCPeerConnection(iceServerConfig);
  
  // Since ICE doesn't know about your signaling server, your code handles 
  // transmission of each candidate in your onIceHandler for the icecandidate event.
  peerConnection.onicecandidate = onIceHandler;
  peerConnection.ontrack = onTrackHandler;
  peerConnection.onnegotiationneeded = onNegotiationNeededHandler;
  /**
   * @Step - THREE -
   * @Part (A) add MediaStreamTracks to the PeerConnection
   * 
   * @Note Once the caller has created its  RTCPeerConnection, created a media stream, and
   * added its tracks to the connection as shown in Starting a call, the browser will 
   * deliver a negotiationneeded event to the RTCPeerConnection to indicate that it's ready to
   * begin negotiation with the other peer.
   */
  
  // getTracks() returns an array of MediaStreamTrack objects (Video and/or Audio)
  localStream.getTracks().forEach((mediaStreamTrack) => {
    // adding each MediaStreamTrack to the local Peer Connection
    // ! addStream is deprecated (do not use)
    // adding a track to connection triggers renegotiation by firing "negotiationneeded event"
    // This occurs both during the initial setup of the connection as well as any time a
    // change to the communication environment requires reconfiguring the connection.
    peerConnection.addTrack(mediaStreamTrack);
  });

  /**
   * @Step - FOUR -
   * @Part (A) create a offer and save it to the PeerConnections LOCALDESCRIPTION property
   * 
   * @Note Once setLocalDescription()'s fulfillment handler has run, the ICE agent begins 
   * sending icecandidate events to the RTCPeerConnection, one for each potential 
   * configuration it discovers.
   */
  let offer;
  try {
    // returns a RTCSessionDescription Object with a TYPE & SDP property
    offer = await peerConnection.createOffer();
    // ! does not work with IE
    // * is Promised-based with Chrome (Android & Desktop) v51 | Opera (Android & Desktop) v43 | Android Webview v51 | Samsung Internet
    peerConnection.setLocalDescription(offer);
    // after setLocalDescription has been fulfilled, an "icecandidate event" is sent to the RTCPeerConnection
  } catch(err) {
    console.log("ERROR: ", err);
  }
  // debugger;
});
// _________________________________ CALLBUTTON END __________________________________________ //

/**
 * 
 * @param {*} RTCPeerConnectionIceEvent represents the icecandidate event
 * @Note if you need to sense the end of signaling, you should watch for a icegatheringstatechange 
 * event indicating that the ICE negotiation has transitioned to the complete state.
 * @Note Each peer sends candidates in the order they're discovered, and keeps sending candidates 
 * until it runs out of suggestions, even if media has already started streaming.
 */
const onIceHandler = (RTCPeerConnectionIceEvent) => {
  debugger
  // If the event's candidate property is null, ICE gathering has finished
  if (RTCPeerConnectionIceEvent.candidate) {
    // Send the candidate to the remote peer
  }
};
const onTrackHandler = (event) => {
  // TODO ------------------------> THIS IS WHERE YOU LEFT OFF FROM <-----------------------------------------------------
  // TODO ----------------------------------------------------------------------------------------------------------------
};
const onNegotiationNeededHandler = (event) => {

};