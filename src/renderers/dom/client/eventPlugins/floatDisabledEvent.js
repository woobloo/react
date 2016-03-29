/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule floatDisabledEvent
 */

'use strict';

var EventConstants = require('EventConstants');
var keyOf = require('keyOf');

var topLevelTypes = EventConstants.topLevelTypes;

var disableableEvents = [
  topLevelTypes.topClick,
  topLevelTypes.topDoubleClick,
  topLevelTypes.topMouseDown,
  topLevelTypes.topMouseMove,
  topLevelTypes.topMouseUp
];

var disableableTags = {
  input: true,
  button: true,
  select: true,
  textarea: true
};

var floatDisabledEvent = function (topLevelType, targetInst) {
  if (!targetInst || !disableableTags[targetInst._tag] || !disableableEvents.indexOf(topLevelType) <= 0) {
    return targetInst;
  }

  while (targetInst && targetInst._currentElement.props.disabled) {
    targetInst = targetInst._nativeParent;
  }

  return targetInst;
}

module.exports = floatDisabledEvent;
