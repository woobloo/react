/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails react-core
 */

'use strict';


describe('SimpleEventPlugin', function() {
  var React;
  var ReactDOM;
  var ReactTestUtils;

  var onClick = jest.fn();

  function expectClickThru(element) {
    onClick.mockClear();
    ReactTestUtils.SimulateNative.click(ReactDOM.findDOMNode(element));
    expect(onClick.mock.calls.length).toBe(1);
  }

  function expectNoClickThru(element) {
    onClick.mockClear();
    ReactTestUtils.SimulateNative.click(ReactDOM.findDOMNode(element));
    expect(onClick.mock.calls.length).toBe(0);
  }

  function mounted(element) {
    element = ReactTestUtils.renderIntoDocument(element);
    return element;
  }

  beforeEach(function() {
    React = require('React');
    ReactDOM = require('ReactDOM');
    ReactTestUtils = require('ReactTestUtils');
  });

  it('A non-interactive tags click when disabled', function() {
    var element = (<div onClick={ onClick } />);
    expectClickThru(mounted(element));
  });

  it('A non-interactive tags clicks bubble when disabled', function() {
    var element = ReactTestUtils.renderIntoDocument(
      <div onClick={onClick}><div /></div>
    );
    var child = ReactDOM.findDOMNode(element).firstChild;

    onClick.mockClear();
    ReactTestUtils.SimulateNative.click(child);
    expect(onClick.mock.calls.length).toBe(1);
  });

  ['button', 'input', 'select', 'textarea'].forEach(function(tagName) {

    describe(tagName, function() {

      it('should forward clicks when it starts out not disabled', () => {
        var element = React.createElement(tagName, {
          onClick: onClick,
        });

        expectClickThru(mounted(element));
      });

      it('should not forward clicks when it starts out disabled', () => {
        var element = React.createElement(tagName, {
          onClick: onClick,
          disabled: true,
        });

        expectNoClickThru(mounted(element));
      });

      it('should forward clicks when it becomes not disabled', () => {
        var container = document.createElement('div');
        var element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick, disabled: true }),
          container
        );
        element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick }),
          container
        );
        expectClickThru(element);
      });

      it('should not forward clicks when it becomes disabled', () => {
        var container = document.createElement('div');
        var element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick }),
          container
        );
        element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick, disabled: true }),
          container
        );
        expectNoClickThru(element);
      });

      it('should work correctly if the listener is changed', () => {
        var container = document.createElement('div');
        var element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick, disabled: true }),
          container
        );
        element = ReactDOM.render(
          React.createElement(tagName, { onClick: onClick, disabled: false }),
          container
        );
        expectClickThru(element);
      });
    });
  });


  describe('iOS bubbling click fix', function() {
    // See http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html

    beforeEach(function() {
      onClick.mockClear();
    });

    it('does not add a local click to interactive elements', function() {
      var container = document.createElement('div');

      ReactDOM.render(<button onClick={ onClick }></button>, container);

      var node = container.firstChild;

      node.dispatchEvent(new MouseEvent('click'));

      expect(onClick.mock.calls.length).toBe(0);
    });

    it('adds a local click listener to non-interactive elements', function() {
      var container = document.createElement('div');

      ReactDOM.render(<div onClick={ onClick }></div>, container);

      var node = container.firstChild;

      node.dispatchEvent(new MouseEvent('click'));

      expect(onClick.mock.calls.length).toBe(0);
    });
  });

  describe('Custom Events', () => {

    it('dispatches custom events directly on elements', () => {
      var callback = jest.fn();

      // Custom events won't trigger unless the container element
      // is attached to the DOM. Why?
      var container = document.createElement('div');

      document.body.appendChild(container);

      // Use a custom component to avoid warnings about unknown props
      var el = ReactDOM.render(<button onCustom={callback} />, container);
      var event = new CustomEvent('custom', { bubbles: true });

      el.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
    });

    it('captures custom events on parents', () => {
      var callback = jest.fn();
      var container = document.createElement('div');

      document.body.appendChild(container);

      var el = ReactDOM.render((
        <div onCustomCapture={() => callback('capture')}>
          <button onCustom={() => callback('bubble')}/>
        </div>
      ), container);

      var event = new CustomEvent('custom', { bubbles: true });

      el.querySelector('button').dispatchEvent(event);

      var sequence = callback.mock.calls.map(args => args[0]);

      expect(sequence).toEqual(['capture', 'bubble']);
    });

    it('bubbles custom events to parents', () => {
      var callback = jest.fn();
      var container = document.createElement('div');

      document.body.appendChild(container);

      var el = ReactDOM.render((
        <div onCustom={callback}>
          <button />
        </div>
      ), container);

      var event = new CustomEvent('custom', { bubbles: true });

      el.querySelector('button').dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
    });

    it('custom events can be simulated', () => {
      var callback = jest.fn();

      var el = ReactTestUtils.renderIntoDocument(<div onCustom={callback}/>);

      ReactTestUtils.Simulate('custom', el);

      expect(callback).toHaveBeenCalled();
    });

    it('simulated custom events bubble', () => {
      var callback = jest.fn();

      var el = ReactTestUtils.renderIntoDocument(<div onCustom={callback}><button /></div>);

      ReactTestUtils.Simulate('custom', el.querySelector('button'));

      expect(callback).toHaveBeenCalled();
    });

    it('simulated custom events capture', () => {
      var callback = jest.fn();

      var el = ReactTestUtils.renderIntoDocument((
        <div onCustomCapture={() => callback('capture')}>
          <button onCustom={() => callback('bubble')} />
        </div>
      ));

      ReactTestUtils.Simulate('custom', el.querySelector('button'));

      var sequence = callback.mock.calls.map(args => args[0]);

      expect(sequence).toEqual(['capture', 'bubble']);
    });

  });

});
