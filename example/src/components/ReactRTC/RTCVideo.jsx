import React from 'react';

const RTCVideo = ({ mediaStream }) => {
  const addMediaStream = (video) => {
    video.srcObject = mediaStream;
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
