const localVideo = document.querySelector('#localVideo');
const remoteVideo = document.querySelector('#remoteVideo');
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
const callButton = document.querySelector('#call');
const socketConnection = new WebSocket('wss://832475e4.ngrok.io');
const sessionConstraints = {video: true, audio: false};
// .........................................................
const chatBox = document.querySelector('.chat');
const inputField = document.querySelector('.text');
const sendMessageButton = document.querySelector('.sendMessage');
// ...................................................
// object with key iceServers that contains an array of URL objects to each STUN server
const iceServerConfig = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
// create a local peerConnection utilizing stun servers
const peerConnection = new RTCPeerConnection(iceServerConfig);
let userID;
socketConnection.onopen = () => {
  console.log('socket connection opened!')
}

/**
 * @Step - SIX -
 * @Part (A) 
 */
socketConnection.onmessage = async ({ data }) => {
  console.log('receiving data from signaling server aka WebSockets')
  const parsedData = JSON.parse(data);
  try {
    if (parsedData.type) {
      switch(parsedData.type) {
        case 'offer': 
          console.log('Offer has been recieved')
          await peerConnection.setRemoteDescription(parsedData);
          const localUserStream = await navigator.mediaDevices.getUserMedia(sessionConstraints)
          localUserStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localUserStream);
          });
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socketConnection.send(JSON.stringify(peerConnection.localDescription));
          break;
        case 'answer':
          console.log('Answer has been recieved')
          await peerConnection.setRemoteDescription(parsedData);
          break;
        case 'icecandidate':
          await peerConnection.addIceCandidate(parsedData.candidate);
          break;
        default:
          console.error('Unsupported SDP type');
      }
    } else if (parsedData.text) {
      chatBox.innerHTML += `<li>${parsedData.text}</li>`;
      console.log('hi user number ', userID);
    } else if (parsedData.userID) userID = parsedData.userID;
  } catch(err) {
    console.error("ERROR: ", err);
  }
};

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
  navigator.mediaDevices.getUserMedia(sessionConstraints)
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
});
// _________________________________ CALLBUTTON END __________________________________________ //

/**
 * @Step - FIVE -
 * @Part (A) recieves RTCPeerConnectionIceEvent after STEP 4 has been completed
 * 
 * @param {*} RTCPeerConnectionIceEvent represents the icecandidate event
 * @Note if you need to sense the end of signaling, you should watch for a icegatheringstatechange 
 * event indicating that the ICE negotiation has transitioned to the complete state.
 * @Note Each peer sends candidates in the order they're discovered, and keeps sending candidates 
 * until it runs out of suggestions, even if media has already started streaming.
 */
const onIceHandler = (RTCPeerConnectionIceEvent) => {
  // If the event's candidate property is null, ICE gathering has finished
  if (RTCPeerConnectionIceEvent.candidate) {
    // Send the candidate to the remote peer
    const { type, candidate } = RTCPeerConnectionIceEvent;
    socketConnection.send(JSON.stringify({ type, candidate }));
  }
};

/**
 * 
 * @param {*} e 
 * @Note The track event is sent to the ontrack event handler on RTCPeerConnections after a new 
 * track has been added to an RTCRtpReceiver which is part of the connection.
 */
const onTrackHandler = (e) => {
  if (remoteVideo.srcObject) return console.log('Remote Video srcObject exist');
  // remoteVideo.srcObject = e.streams[0];
  remoteVideo.srcObject = new MediaStream([e.track]);
  console.log('inside onTrackHandler', e)
  console.log('Created remoteVideo.srcObject')
};
const onNegotiationNeededHandler = async (negotiationNeededEvent) => {
  /**
   * @Step - FOUR -
   * @Part (A) create a offer and save it to the PeerConnections LOCALDESCRIPTION property
   * @Part (B) send the localDescription to remote peer
   * 
   * @Note Once setLocalDescription()'s fulfillment handler has run, the ICE agent begins 
   * sending icecandidate events to the RTCPeerConnection, one for each potential 
   * configuration it discovers.
   */
  try {
    // returns a RTCSessionDescription Object with a TYPE & SDP property
    const offer = await peerConnection.createOffer();
    console.log('offer is about to be created before sending')
    // ! does not work with IE
    // * is Promised-based with Chrome (Android & Desktop) v51 | Opera (Android & Desktop) v43 | Android Webview v51 | Samsung Internet
    await peerConnection.setLocalDescription(offer);
    // after setLocalDescription has been fulfilled, an "icecandidate event" is sent to the RTCPeerConnection
    console.log('About to send data')
    // (B) send localDescription to remote peer
    // ? possibly add a userID to send over to peer
    socketConnection.send(JSON.stringify(peerConnection.localDescription));
  } catch(err) {
    console.log("ERROR: ", err);
  }
};

// Since ICE doesn't know about your signaling server, your code handles 
// transmission of each candidate in your onIceHandler for the icecandidate event.
peerConnection.onicecandidate = onIceHandler;
// ? pc.ontrack only listens for tracks coming from remote peer (not local)
// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/track_event
peerConnection.ontrack = onTrackHandler;
// Its job is to create and send an offer, to the callee, asking it to connect with us
peerConnection.onnegotiationneeded = onNegotiationNeededHandler;

// _______________________________________________ SEND MESSAGE __________________________________________________

sendMessageButton.addEventListener('click', (e) => {
  const text = inputField.value;
  socketConnection.send(JSON.stringify({text}));
});