// we will need to add custom url to WS arg

// class SocketConnectionMethods {
// const async socketConnectionFunc = () => {
  //check if it needs to be static 
module.exports ={
 onMessage: onMessage = async (parsedData, peerConnection, socketConnection, sessionConstraints) => {
  //  console.log('parsedData.type: ', parsedData.type)
    // console.log('receiving data from signaling server aka WebSockets', data);
    // const parsedData = JSON.parse(data.data);

    console.log('parsed data var', parsedData)
    try {
      if (parsedData.type) {
        console.log('parsedData.type: ', parsedData.type)
        switch (parsedData.type) {
          case 'offer':
            console.log('Offer has been recieved');
            await peerConnection.setRemoteDescription(parsedData);

            const localUserStream = await navigator.mediaDevices.getUserMedia(
              sessionConstraints
            );
            localUserStream.getTracks().forEach(track => {
              peerConnection.addTrack(track, localUserStream);
            });
            const answer = await peerConnection.createAnswer();
            console.log('Answer is being created' )
            await peerConnection.setLocalDescription(answer);
            socketConnection.send(
              JSON.stringify(peerConnection.localDescription)
            );
            break;
          case 'answer':
            console.log('Answer has been recieved');
            await peerConnection.setRemoteDescription(parsedData);
            break;
          case 'icecandidate':
            await peerConnection.addIceCandidate(parsedData.candidate);
            break;
          default:
            console.error('Unsupported SDP type');
        }
      } else if (parsedData.startConnection) {
        console.log('current room is ready for RTC Peer Connection')
      }
    } catch (err) {
      console.error('ERROR: ', err);
    }
  }
//    onMessage(data, peerConnection, socketConnection) {
//     console.log('receiving data from signaling server aka WebSockets');
//     const parsedData = JSON.parse(data);
//     try {
//       if (parsedData.type) {
//         switch (parsedData.type) {
//           case 'offer':
//             console.log('Offer has been recieved');
//             await peerConnection.setRemoteDescription(parsedData);
//             const localUserStream = await navigator.mediaDevices.getUserMedia(
//               sessionConstraints
//             );
//             localUserStream.getTracks().forEach(track => {
//               peerConnection.addTrack(track, localUserStream);
//             });
//             const answer = await peerConnection.createAnswer();
//             await peerConnection.setLocalDescription(answer);
//             socketConnection.send(
//               JSON.stringify(peerConnection.localDescription)
//             );
//             break;
//           case 'answer':
//             console.log('Answer has been recieved');
//             await peerConnection.setRemoteDescription(parsedData);
//             break;
//           case 'icecandidate':
//             await peerConnection.addIceCandidate(parsedData.candidate);
//             break;
//           default:
//             console.error('Unsupported SDP type');
//         }
//       } else if (parsedData.text) {
//         chatBox.innerHTML += `<li>${parsedData.text}</li>`;
//         console.log('hi user number ', userID);
//       } else if (parsedData.userID) userID = parsedData.userID;
//     } catch (err) {
//       console.error('ERROR: ', err);
//     }
//   }
// }

// export default onMessage;
}
