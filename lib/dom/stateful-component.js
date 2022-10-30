/**
 * @license JS+ (DOM) v1.0.0
 * jsplus/stateful-component.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

 (function (global) {
  "use strict";

  var rebuildStatefulComponent = function (instance)
  {
    var oldComponent = instance.component;
    var newComponent = instance.builder(instance.state,
      function (newState) {
        instance.setState(newState);
        return;
      },
      function (callback) {
        instance.setStateEffect(callback);
        return;
      }
    );
  
    oldComponent.setChildren(newComponent.struct.children);
    oldComponent.setAttributes(newComponent.struct.attributes);
    oldComponent.setStyles(newComponent.struct.styles);
    if (Object.keys(newComponent.struct.events).length > 0) {
      Object.keys(newComponent.struct.events).forEach(function (eventType) {
        oldComponent.setEvent(eventType, function (e, root) {
          newComponent.struct.events[eventType](e, root);
        });
      });
    }
  };
  
  function StatefulComponent (state)
  {
    this.state = state;
    this.builder = null;
    this.component = null;
  
    Object.seal(this);
  }
  
  StatefulComponent.prototype.build = function (callback)
  {
    var root = this;
  
    this.builder = callback;
    this.component = callback(root.state, function (newState) {
      root.setState(newState);
      return;
    });
  
    return this.component;
  };
  
  StatefulComponent.prototype.setStateOnly = function (input)
  {
    var root = this;

    if (typeof input === "object") {
      Object.keys(input).forEach(function (stateKey) {
        root.state[stateKey] = input[stateKey];
      });
    }

    if (typeof input === "function") {
      input(root.state);
    }
  };
  
  StatefulComponent.prototype.setState = function (input)
  {
    var root = this;

    root.setStateOnly(input);
  
    rebuildStatefulComponent(root);
  
    return;
  };

  global.StatefulComponent = StatefulComponent;
}(window));