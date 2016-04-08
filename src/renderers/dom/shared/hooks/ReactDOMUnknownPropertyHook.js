/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactDOMUnknownPropertyHook
 */

'use strict';

var DOMProperty = require('DOMProperty');
var EventPluginRegistry = require('EventPluginRegistry');
var ReactComponentTreeHook = require('ReactComponentTreeHook');

var warning = require('warning');

if (__DEV__) {
  var additionalProps = [
    // Case sensitive properties not included in properties list
    'acceptCharset',
    'accessKey',
    'allowTransparency',
    'autoCapitalize',
    'autoComplete',
    'autoCorrect',
    'autoFocus',
    'autoSave',
    'cellPadding',
    'cellSpacing',
    'charSet',
    'classID',
    'className',
    'colSpan',
    'contentEditable',
    'contextMenu',
    'crossOrigin',
    'dateTime',
    'encType',
    'formAction',
    'formEncType',
    'formMethod',
    'formTarget',
    'frameBorder',
    'hrefLang',
    'htmlFor',
    'httpEquiv',
    'inputMode',
    'itemID',
    'itemProp',
    'itemRef',
    'itemType',
    'keyParams',
    'keyType',
    'marginHeight',
    'marginWidth',
    'maxLength',
    'mediaGroup',
    'minLength',
    'playsInline',
    'radioGroup',
    'referrerPolicy',
    'spellCheck',
    'srcDoc',
    'srcLang',
    'srcSet',
    'tabIndex',
    'useMap',
  ];

  additionalProps.forEach(function(name) {
    DOMProperty.getPossibleStandardName[name.toLowerCase()] = name;
  });

  var warnedProperties = {};

  var validateProperty = function(tagName, name, debugID) {
    if (DOMProperty.properties.hasOwnProperty(name)) {
      return true;
    }
    if (DOMProperty.isReservedProp(name) ||
        warnedProperties.hasOwnProperty(name) && warnedProperties[name]) {
      return true;
    }
    if (EventPluginRegistry.registrationNameModules.hasOwnProperty(name)) {
      return true;
    }
    warnedProperties[name] = true;
    var lowerCasedName = name.toLowerCase();

    var standardName = DOMProperty.getPossibleStandardName.hasOwnProperty(name) ?
        DOMProperty.getPossibleStandardName[name] : null;

    var registrationName = (
      EventPluginRegistry.possibleRegistrationNames.hasOwnProperty(
        lowerCasedName
      ) ?
      EventPluginRegistry.possibleRegistrationNames[lowerCasedName] :
      null
    );

    if (standardName != null) {
      warning(
        false,
        'Unknown DOM property %s. Did you mean %s?%s',
        name,
        standardName,
        ReactComponentTreeHook.getStackAddendumByID(debugID)
      );
      return true;
    } else if (registrationName != null) {
      warning(
        false,
        'Unknown event handler property %s. Did you mean `%s`?%s',
        name,
        registrationName,
        ReactComponentTreeHook.getStackAddendumByID(debugID)
      );
      return true;
    } else {
      // We were unable to guess which prop the user intended.
      // It is likely that the user was just blindly spreading/forwarding props
      // Components should be careful to only render valid props/attributes.
      // Warning will be invoked in warnUnknownProperties to allow grouping.
      return false;
    }
  };
}

function handleElement(debugID, element) {
  if (element == null || typeof element.type !== 'string') {
    return;
  }
  if (element.type.indexOf('-') >= 0 || element.props.is) {
    return;
  }

  for (var key in element.props) {
    validateProperty(element.type, key, debugID);
  }
}

var ReactDOMUnknownPropertyHook = {
  onBeforeMountComponent(debugID, element) {
    handleElement(debugID, element);
  },
  onBeforeUpdateComponent(debugID, element) {
    handleElement(debugID, element);
  },
};

module.exports = ReactDOMUnknownPropertyHook;
