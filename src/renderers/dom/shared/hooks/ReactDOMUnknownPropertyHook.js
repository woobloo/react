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
    'allowReorder',
    'allowTransparency',
    'attributeName',
    'attributeType',
    'autoCapitalize',
    'autoComplete',
    'autoCorrect',
    'autoFocus',
    'autoReverse',
    'autoSave',
    'baseFrequency',
    'baseProfile',
    'calcMode',
    'cellPadding',
    'cellSpacing',
    'charSet',
    'classID',
    'className',
    'clipPathUnits',
    'colSpan',
    'contentEditable',
    'contentScriptType',
    'contentStyleType',
    'contextMenu',
    'crossOrigin',
    'dateTime',
    'diffuseConstant',
    'edgeMode',
    'encType',
    'externalResourcesRequired',
    'filterRes',
    'filterUnits',
    'formAction',
    'formEncType',
    'formMethod',
    'formTarget',
    'frameBorder',
    'glyphRef',
    'gradientTransform',
    'gradientUnits',
    'hrefLang',
    'htmlFor',
    'httpEquiv',
    'inputMode',
    'itemID',
    'itemProp',
    'itemRef',
    'itemType',
    'kernelMatrix',
    'kernelUnitLength',
    'keyParams',
    'keyPoints',
    'keySplines',
    'keyTimes',
    'keyType',
    'lengthAdjust',
    'limitingConeAngle',
    'marginHeight',
    'marginWidth',
    'markerHeight',
    'markerUnits',
    'markerWidth',
    'maskContentUnits',
    'maskUnits',
    'maxLength',
    'mediaGroup',
    'minLength',
    'numOctaves',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'playsInline',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'preserveAlpha',
    'preserveAspectRatio',
    'primitiveUnits',
    'radioGroup',
    'referrerPolicy',
    'refX',
    'refY',
    'repeatCount',
    'repeatDur',
    'requiredExtensions',
    'requiredFeatures',
    'specularConstant',
    'specularExponent',
    'spellCheck',
    'spreadMethod',
    'srcDoc',
    'srcLang',
    'srcSet',
    'startOffset',
    'stdDeviation',
    'stitchTiles',
    'surfaceScale',
    'systemLanguage',
    'tabIndex',
    'tableValues',
    'targetX',
    'targetY',
    'textLength',
    'useMap',
    'viewBox',
    'viewTarget',
    'xChannelSelector',
    'yChannelSelector',
    'zoomAndPan',
  ];

  additionalProps.forEach(function(name) {
    DOMProperty.getPossibleStandardName[name.toLowerCase()] = name;
  });

  var additionalEvents = [
    'onAbort',
    'onAnimationEnd',
    'onAnimationIteration',
    'onAnimationStart',
    'onBlur',
    'onCanPlay',
    'onCanPlayThrough',
    'onClick',
    'onContextMenu',
    'onCopy',
    'onCut',
    'onDoubleClick',
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onDurationChange',
    'onEmptied',
    'onEncrypted',
    'onEnded',
    'onError',
    'onFocus',
    'onInput',
    'onInvalid',
    'onKeyDown',
    'onKeyPress',
    'onKeyUp',
    'onLoad',
    'onLoadedData',
    'onLoadedMetadata',
    'onLoadStart',
    'onMouseDown',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
    'onPaste',
    'onPause',
    'onPlay',
    'onPlaying',
    'onProgress',
    'onRateChange',
    'onReset',
    'onScroll',
    'onSeeked',
    'onSeeking',
    'onStalled',
    'onSubmit',
    'onSuspend',
    'onTimeUpdate',
    'onTouchCancel',
    'onTouchEnd',
    'onTouchMove',
    'onTouchStart',
    'onTransitionEnd',
    'onVolumeChange',
    'onWaiting',
    'onWheel',
    'onBeforeInput',
    'onChange',
    'onCompositionEnd',
    'onCompositionStart',
    'onCompositionUpdate',
    'onMouseEnter',
    'onMouseLeave',
    'onSelect',
  ];

  additionalEvents.forEach(function(name) {
    EventPluginRegistry.possibleRegistrationNames[name.toLowerCase()] = name;
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
    var correctEventName = EventPluginRegistry.possibleRegistrationNames[lowerCasedName];
    if (correctEventName !== null && correctEventName === name) {
      return true;
    }

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
