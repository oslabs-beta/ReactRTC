import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Form from './lib/components/Form';
import { shallow } from 'enzyme';
import React from 'react';
Enzyme.configure({ adapter: new Adapter() });


describe('React unit test', () =>{
  describe('Form Component', ()=>{
    let wrapper;
    const mockHandleSubmitCallback = jest.fn(x => 42 + x)
    const mockhandleChangeCallback = jest.fn(x => 4 + 4)
    const props = {
      handleChange:mockhandleChangeCallback(),
      handleSubmit:mockHandleSubmitCallback(),
      text:'',
      hasRoomKey: 88888888
    };
    
    beforeAll(() =>{
      wrapper = shallow(< Form {...props} />)
    })

    it('Renders a form', () =>{
      expect(wrapper.type()).toEqual('form');
    })
    it('testing handleSubmit', () => {
      expect(mockHandleSubmitCallback.mock.calls.length).toBe(1)
    })
    it('handle\s change', () =>{
      expect(mockhandleChangeCallback.mock.calls.length).toBe(1)
    })
  }
  )
})
