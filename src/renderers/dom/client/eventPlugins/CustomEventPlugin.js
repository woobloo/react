/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CustomEventPlugin
 * @flow
 */

'use strict';

var EventPropagators = require('EventPropagators');
var EventPluginRegistry = require('EventPluginRegistry');
var SyntheticEvent = require('SyntheticEvent');

var eventTypes = {};

function baseEventName (topLevelType) {
  return topLevelType.replace(/^top/, '');
}

function eventIsRegisteredByOtherPlugin (topLevelType) {
  var eventName = baseEventName(topLevelType).toLowerCase();

  return EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName);
}

function findOrCreateDispatchConfig (topLevelType) {
  var base = baseEventName(topLevelType);
  var eventName = base.toLowerCase();

  if (eventTypes[eventName] == null) {
    eventTypes[eventName] = {
      phasedRegistrationNames: {
        bubbled  : 'on' + base,
        captured : 'on' + base + 'Captured',
      },
      dependencies: [ topLevelType ],
    };

    if (__DEV__) {
      EventPluginRegistry.possibleRegistrationNames[eventName] = 'on' + base;
    }
  }

  return eventTypes[eventName];
}

var CustomEventPlugin: PluginModule<MouseEvent> = {

  extractEvents: function(
    topLevelType: TopLevelTypes,
    targetInst: ReactInstance,
    nativeEvent: MouseEvent,
    nativeEventTarget: EventTarget,
  ): null | ReactSyntheticEvent {
    // Is the event name already tagged?
    if (eventIsRegisteredByOtherPlugin(topLevelType)) {
      return null;
    }

    var event = SyntheticEvent.getPooled(
      findOrCreateDispatchConfig(topLevelType),
      targetInst,
      nativeEvent,
      nativeEventTarget
    );

    EventPropagators.accumulateTwoPhaseDispatches(event);

    return event;
  },

};

module.exports = CustomEventPlugin
