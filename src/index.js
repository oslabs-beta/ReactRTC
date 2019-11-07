import React from 'react';
import ReactDOM from 'react-dom';
import ReactRTC from './components/ReactRTC/ReactRTC.jsx';
const Index = () => (
  <div>
    <ReactRTC />
  </div>
);

ReactDOM.render(<Index />, document.getElementById('root'));
