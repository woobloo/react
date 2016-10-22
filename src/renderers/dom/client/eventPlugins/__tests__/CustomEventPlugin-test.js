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

describe('CustomEventPlugin', () => {
  var React = require('React');
  var ReactDOM = require('ReactDOM');
  var ReactTestUtils = require('ReactTestUtils');

  it('adds custom events', () => {
    var callback = jest.fn()

    // Custom events won't trigger unless the container element
    // is attached to the DOM. Why?
    var container = document.createElement('div');

    document.body.appendChild(container);

    // Use a custom component to avoid warnings about unknown props
    var el = ReactDOM.render(<x-button onCustom={callback} />, container);

    var event = new CustomEvent('custom', { bubbles: true });

    el.dispatchEvent(event);

    expect(callback).toHaveBeenCalled();
  });

});
