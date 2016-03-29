/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DisabledInputUtils
 */

'use strict';

var assign = require('Object.assign');
var invariant = require('invariant');

var disableableMouseListenerNames = {
  onClick: true,
  onDoubleClick: true,
  onMouseDown: true,
  onMouseMove: true,
  onMouseUp: true,

  onClickCapture: true,
  onDoubleClickCapture: true,
  onMouseDownCapture: true,
  onMouseMoveCapture: true,
  onMouseUpCapture: true,
};

/**
 * Implements a native component that does not receive mouse events
 * when `disabled` is set.
 */
var DisabledInputUtils = {
  assignWithNativeProps: function(a,b,c,d,e,f,g) {
    invariant(!g, 'assignWithNativeProps only accepts 6 arguments');

    if (arguments.length === 1 && !a.disabled) {
      return a;
    }

    var nativeProps = assign({}, a, b, c, d, e, f);

    if (!nativeProps.disabled) {
      return nativeProps;
    }

    // We now know the component is disabled. Eliminate mouse listeners:
    for (var key in nativeProps) {
      if (disableableMouseListenerNames[key]) {
        delete nativeProps[key];
      }
    }

    return nativeProps;
  },
};

module.exports = DisabledInputUtils;
