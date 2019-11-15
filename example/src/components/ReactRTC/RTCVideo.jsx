import React from 'react';

const RTCVideo = ({ mediaStream }) => {
  console.log('mediaStream: ', mediaStream);
  const addMediaStream = (video) => {
    // Prevents throwing error upon a setState change when mediaStream is null
    if (mediaStream) video.srcObject = mediaStream;
  };

  return (
    <video
      className="rtc__video"
      autoPlay
      ref={addMediaStream}
    >
      <track default kind="captions" />
    </video>
  );
};

export default RTCVideo;
