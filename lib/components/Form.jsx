import React from 'react';

const Form = ({handleChange, handleSubmit, text, hasRoomKey}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        value={text}
      />
      <input 
        type="submit"
        disabled={hasRoomKey ? true : false}
      />
    </form>
  );
};

export default Form;