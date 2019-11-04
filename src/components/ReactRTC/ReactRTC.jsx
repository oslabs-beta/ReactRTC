import React from 'react';
import ReactDOM from 'react-dom';

class ReactRTC extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>ReactRTC!!</h1>
        <video id="localVideo" autoPlay></video>
        <button onClick="lol" id="start">
          Start
        </button>
        <button onClick="lol" id="stop">
          Stop
        </button>
        <button onClick="lol" id="call">
          Call
        </button>
      </div>
    );
  }
}

export default ReactRTC;
