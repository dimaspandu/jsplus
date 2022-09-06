/**
 * @license JS+ (DOM) v1.0.0
 * jsplus/element-builder-only.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (global) {
  "use strict";

  var ELEMENT_RECORD = {};
  var BOOLEAN_ATTRIBUTES = {
    autofocus: true,
    disabled: true,
    selected: true,
    multiple: true,
    recorded: true
  };
  var BOOLEAN_ATTRIBUTES_TRANSPILER = {
    "0": false,
    "1": true,
    "false": false,
    "true": true
  };

  var storeElementRecord = function (id, instance) {
    ELEMENT_RECORD[id] = {
      instance: instance,
      iteration: 0
    };
  };

  var getElementRecord = function (id) {
    return ELEMENT_RECORD[id];
  };

  var cleanNodes = function (nodeAsSelector) {
    for(var i = 0; i < nodeAsSelector.childNodes.length; i++) {
      var child = nodeAsSelector.childNodes[i];

      if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
        nodeAsSelector.removeChild(child);
        i--;
      } else if(child.nodeType === 1) {
        cleanNodes(child);
      }
    }
  };

  var lineageAssimilation = function (builder, nodeAsSelector) {
    var index = 0;
    if (nodeAsSelector === undefined) {
      return;
    }
    if (nodeAsSelector.attributes.length > 0) {
      var attributes = nodeAsSelector.attributes;
      for (var i = attributes.length - 1; i >= 0; i--) {
        if (BOOLEAN_ATTRIBUTES[attributes[i].name] !== undefined) {
          builder.struct.attributes[attributes[i].name] = attributes[i].value.length === 0 ?
            BOOLEAN_ATTRIBUTES[attributes[i].name] : BOOLEAN_ATTRIBUTES_TRANSPILER[attributes[i].value]
        } else {
          builder.struct.attributes[attributes[i].name] = attributes[i].value;
        }
      }
      if (builder.struct.attributes.recorded !== undefined) {
        if (builder.struct.attributes.id !== undefined) {
          if (getElementRecord(builder.struct.attributes.id) === undefined) {
            storeElementRecord(builder.struct.attributes.id, builder);
          }
        } else {
          console.warn("[unrecordElementBuilder]: id required");
        }
      }
    }
    builder.struct.children = [];
    nodeAsSelector.childNodes.forEach(function (childNode) {
      if (childNode.nodeType === 3) {
        builder.struct.children[index] = childNode.textContent;
      } else {
        builder.struct.children[index] = new ElementBuilder(childNode);
      }
      if (childNode.childNodes.length > 0) {
        lineageAssimilation(builder.struct.children[index], builder.struct.children[index].selector);
      }
      index++;
    });
  };

  var createChildren = function (parent, children) {
    parent.struct.children = children;
  };

  var replaceChildren = function (newChildren, oldChildren) {
    oldChildren.setAttributes(newChildren.struct.attributes);
    oldChildren.setStyles(newChildren.struct.styles);
    oldChildren.setChildren(newChildren.struct.children);
    if (Object.keys(newChildren.struct.events).length > 0) {
      Object.keys(newChildren.struct.events).forEach(function (eventType) {
        oldChildren.setEvent(eventType, function (e, root) {
          newChildren.struct.events[eventType](e, root);
        });
      });
    }
  };

  var updateChildren = function (parent, newChildren) {
    var justShift = false;
    var shiftIndex = 0;
    for (var i = 0; i < newChildren.length; i++) {
      if (JSON.stringify(newChildren[i]) === JSON.stringify(parent.struct.children[0]) && i > 0) {
        justShift = true;
        shiftIndex = i;
        break;
      }
      if (i >= 20) {
        break;
      }
    }

    if (justShift) {
      parent.prependChildren(newChildren, shiftIndex);
    }
    var startIndex = (justShift) ? shiftIndex : 0;
    for (var i = startIndex; i < newChildren.length; i++) {
      if (parent.struct.children[i] !== undefined) {
        if (typeof newChildren[i] === "object" && typeof parent.struct.children[i] === "object") {
          if (newChildren[i].struct.selector !== parent.struct.children[i].struct.selector) {
            parent.struct.children[i].struct = newChildren[i].struct;
          } else {
            replaceChildren(newChildren[i], parent.struct.children[i]);
          }
        } else {
          if (JSON.stringify(newChildren[i]) !== JSON.stringify(parent.struct.children[i])) {
            parent.struct.children[i] = newChildren[i];
          }
        }
      } else {
        parent.appendChildren(newChildren[i]);
      }
    }

    for (var i = parent.struct.children.length - 1; i >= newChildren.length; i--) {
      parent.struct.children.pop();
    }
  };

  function ElementBuilder (selector)
  { 
    this.struct = {
      selector: selector.nodeType !== undefined ? selector.tagName.toLowerCase() : selector,
      attributes: {},
      styles: {},
      events: {},
      children: []
    };
  
    if (selector.nodeType !== undefined)
    {
      cleanNodes(selector);
      lineageAssimilation(this, selector);
    }
  
    Object.seal(this);
    Object.seal(this.struct);
  }

  ElementBuilder.prototype.setChildren = function ()
  {
    var args = arguments;
    var children = (function () {
      if (args.length > 1) {
        var _children = [];
        for (var i = 0; i < args.length; i++) {
          _children.push(args[i]);
        }
        return _children;
      } else {
        if (Array.isArray(args[0])) {
          return args[0];
        } else {
          return [args[0]];
        }
      }
    }());
  
    if (this.struct.children.length > 0) {
      updateChildren(this, children);
    } else {
      createChildren(this, children);
    }
  
    return this;
  };

  ElementBuilder.prototype.prependChildren = function (newChildren, limit)
  {
    if (typeof newChildren === "string" || typeof newChildren === "number") {
      this.struct.children.unshift(newChildren);
    } else {
      var _newChildren = newChildren;
  
      if (newChildren.length === undefined) {
        _newChildren = [newChildren];
      }
  
      var max = limit === undefined ? _newChildren.length - 1 : limit - 1;
  
      for (var i = max; i >= 0; i--) {
        this.struct.children.unshift(_newChildren[i]);
      }
    }
  
    return this;
  };
  
  ElementBuilder.prototype.appendChildren = function (newChildren)
  {
    if (typeof newChildren === "string" || typeof newChildren === "number") {
      this.struct.children.push(newChildren);
    } else {
      var _newChildren = newChildren;
  
      if (newChildren.length === undefined) {
        _newChildren = [newChildren];
      }
  
      for (var i = 0; i < _newChildren.length; i++) {
        this.struct.children.push(_newChildren[i]);
      }
    }
    
    return this;
  };
  
  ElementBuilder.prototype.setAttributes = function (attributes)
  {
    var root = this;

    if (attributes.recorded !== undefined) {
      if (attributes.id !== undefined) {
        if (getElementRecord(attributes.id) === undefined) {
          storeElementRecord(attributes.id, root);
        }
      } else {
        console.warn("[unrecordElementBuilder]: id required");
      }
    } 
  
    Object.keys(attributes).forEach(function (attributeName)
    {
      if (attributes[attributeName] !== root.struct.attributes[attributeName]) {
        root.struct.attributes[attributeName] = attributes[attributeName];
      }
    });
  
    return this;
  };
  
  ElementBuilder.prototype.setStyles = function (styles)
  {
    var root = this;
  
    Object.keys(styles).forEach(function (styleKey)
    {
      if (styles[styleKey] !== root.struct.styles[styleKey])
      {
        root.struct.styles[styleKey] = styles[styleKey];
      }
    });
  
    return this;
  };
  
  ElementBuilder.prototype.setEvent = function (eventType, callback)
  {
    var root = this;

    this.struct.events[eventType] = function (e) {
      callback(e, root);
    };
  
    return this;
  };

  global.ElementBuilderOnly = ElementBuilder;
}(window));