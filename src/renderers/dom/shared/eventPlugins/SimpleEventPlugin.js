/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule SimpleEventPlugin
 * @flow
 */

'use strict';

var EventPropagators = require('EventPropagators');
var EventPluginRegistry = require('EventPluginRegistry');
var SyntheticAnimationEvent = require('SyntheticAnimationEvent');
var SyntheticClipboardEvent = require('SyntheticClipboardEvent');
var SyntheticEvent = require('SyntheticEvent');
var SyntheticFocusEvent = require('SyntheticFocusEvent');
var SyntheticKeyboardEvent = require('SyntheticKeyboardEvent');
var SyntheticMouseEvent = require('SyntheticMouseEvent');
var SyntheticDragEvent = require('SyntheticDragEvent');
var SyntheticTouchEvent = require('SyntheticTouchEvent');
var SyntheticTransitionEvent = require('SyntheticTransitionEvent');
var SyntheticUIEvent = require('SyntheticUIEvent');
var SyntheticWheelEvent = require('SyntheticWheelEvent');

var getEventCharCode = require('getEventCharCode');

import type {TopLevelTypes} from 'EventConstants';
import type {
  ReactSyntheticEvent,
} from 'ReactSyntheticEventType';
import type {ReactInstance} from 'ReactInstanceType';
import type {
  EventTypes,
  PluginModule,
} from 'PluginModuleType';

var eventTypes: EventTypes = {};

function findOrCreateDispatchConfig(topLevelType) {
  var eventName = EventPluginRegistry.getEventType(topLevelType);

  if (eventTypes[eventName] == null) {
    var type = EventPluginRegistry.findOrCreateDispatchConfig(topLevelType);

    eventTypes[eventName] = type;
  }

  return eventTypes[eventName];
}

// We need click to greedily "put" click handlers. See didPutListener
findOrCreateDispatchConfig('topClick');

// We need doubleclick ahead of time to warn about about dblclick.
findOrCreateDispatchConfig('topDoubleClick');

function isInteractive(tag) {
  return (
    tag === 'button' || tag === 'input' ||
    tag === 'select' || tag === 'textarea'
  );
}

function shouldPreventMouseEvent(inst) {
  if (inst) {
    var disabled = inst._currentElement && inst._currentElement.props.disabled;

    if (disabled) {
      return isInteractive(inst._tag);
    }
  }

  return false;
}

function eventIsRegisteredByOtherPlugin(topLevelType) {
  var eventName = EventPluginRegistry.getEventType(topLevelType);

  return !eventTypes[eventName] &&
    EventPluginRegistry.eventNameDispatchConfigs[eventName];
}

var SimpleEventPlugin: PluginModule<MouseEvent> = {

  eventTypes: eventTypes,

  extractEvents: function(
    topLevelType: TopLevelTypes,
    targetInst: ReactInstance,
    nativeEvent: MouseEvent,
    nativeEventTarget: EventTarget,
  ): null | ReactSyntheticEvent {
    if (eventIsRegisteredByOtherPlugin(topLevelType)) {
      return null;
    }

    var EventConstructor = SyntheticEvent;

    switch (topLevelType) {
      case 'topKeyPress':
        // Firefox creates a keypress event for function keys too. This removes
        // the unwanted keypress events. Enter is however both printable and
        // non-printable. One would expect Tab to be as well (but it isn't).
        if (getEventCharCode(nativeEvent) === 0) {
          return null;
        }
        /* falls through */
      case 'topKeyDown':
      case 'topKeyUp':
        EventConstructor = SyntheticKeyboardEvent;
        break;
      case 'topBlur':
      case 'topFocus':
        EventConstructor = SyntheticFocusEvent;
        break;
      case 'topClick':
        // Firefox creates a click event on right mouse clicks. This removes the
        // unwanted click events.
        if (nativeEvent.button === 2) {
          return null;
        }
        /* falls through */
      case 'topDoubleClick':
      case 'topMouseDown':
      case 'topMouseMove':
      case 'topMouseUp':
        // Disabled elements should not respond to mouse events
        if (shouldPreventMouseEvent(targetInst)) {
          return null;
        }
        /* falls through */
      case 'topMouseOut':
      case 'topMouseOver':
      case 'topContextMenu':
        EventConstructor = SyntheticMouseEvent;
        break;
      case 'topDrag':
      case 'topDragEnd':
      case 'topDragEnter':
      case 'topDragExit':
      case 'topDragLeave':
      case 'topDragOver':
      case 'topDragStart':
      case 'topDrop':
        EventConstructor = SyntheticDragEvent;
        break;
      case 'topTouchCancel':
      case 'topTouchEnd':
      case 'topTouchMove':
      case 'topTouchStart':
        EventConstructor = SyntheticTouchEvent;
        break;
      case 'topAnimationEnd':
      case 'topAnimationIteration':
      case 'topAnimationStart':
        EventConstructor = SyntheticAnimationEvent;
        break;
      case 'topTransitionEnd':
        EventConstructor = SyntheticTransitionEvent;
        break;
      case 'topScroll':
        EventConstructor = SyntheticUIEvent;
        break;
      case 'topWheel':
        EventConstructor = SyntheticWheelEvent;
        break;
      case 'topCopy':
      case 'topCut':
      case 'topPaste':
        EventConstructor = SyntheticClipboardEvent;
        break;
    }

    var dispatchConfig = findOrCreateDispatchConfig(topLevelType);

    var event = EventConstructor.getPooled(
      dispatchConfig,
      targetInst,
      nativeEvent,
      nativeEventTarget
    );

    EventPropagators.accumulateTwoPhaseDispatches(event);

    return event;
  },

};

module.exports = SimpleEventPlugin;
