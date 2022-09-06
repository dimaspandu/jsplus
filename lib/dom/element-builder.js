/**
 * @license JS+ (DOM) v1.0.0
 * jsplus/element-builder.js
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

  var setElementRecord = function (id, callback) {
    callback(ELEMENT_RECORD[id]);
  };

  var getElementRecord = function (id) {
    return ELEMENT_RECORD[id];
  };

  var getElementBuilderById = function (id) {
    if (ELEMENT_RECORD[id] === undefined) {
      console.warn("[undefinedElementBuilder]: recorded required");
    }
    return ELEMENT_RECORD[id].instance;
  };

  var cleanNodes = function (node) {
    for(var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];

      if (child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue))) {
        node.removeChild(child);
        i--;
      } else if(child.nodeType === 1) {
        cleanNodes(child);
      }
    }
  };

  var lineageAssimilation = function (instance, node) {
    var index = 0;
    if (node === undefined) {
      return;
    }
    if (node.attributes.length > 0) {
      var attributes = node.attributes;
      for (var i = attributes.length - 1; i >= 0; i--) {
        if (BOOLEAN_ATTRIBUTES[attributes[i].name] !== undefined) {
          instance.struct.attributes[attributes[i].name] = attributes[i].value.length === 0 ?
            BOOLEAN_ATTRIBUTES[attributes[i].name] : BOOLEAN_ATTRIBUTES_TRANSPILER[attributes[i].value]
        } else {
          instance.struct.attributes[attributes[i].name] = attributes[i].value;
        }
      }
      if (instance.struct.attributes.recorded !== undefined) {
        if (instance.struct.attributes.id !== undefined) {
          if (getElementRecord(instance.struct.attributes.id) === undefined) {
            storeElementRecord(instance.struct.attributes.id, instance);
          }
        } else {
          console.warn("[unrecordElementBuilder]: id required");
        }
      }
    }
    instance.struct.children = [];
    node.childNodes.forEach(function (childNode) {
      if (childNode.nodeType === 3) {
        instance.struct.children[index] = childNode.textContent;
      } else {
        instance.struct.children[index] = new ElementBuilder(childNode);
      }
      if (childNode.childNodes.length > 0) {
        lineageAssimilation(instance.struct.children[index], instance.struct.children[index].node);
      }
      index++;
    });
  };

  var elementNodeSync = function (instance, callback) {
    if (Array.isArray(instance)) {
      var passInstance = [];

      for (var i = 0; i < instance.length; i++) {
        if (instance[i].node !== undefined) {
          passInstance.push(instance[i]);
        }
      }
      
      callback.apply(null, passInstance);
    } else {
      if (instance.node !== undefined) {
        callback(instance);
      }
    }
  };

  var generateChildrenNodeByType = function (children) {
    return typeof children === "string" || typeof children === "number" ?
      document.createTextNode(children) : children.node;
  };

  var createChildren = function (parent, children) {
    elementNodeSync(parent, function (_parent) {
      for (var i = 0; i < children.length; i++) {
        _parent.node.appendChild(generateChildrenNodeByType(children[i]));
      }
    });
    parent.struct.children = children;
  };

  var replaceChildren = function (newChildren, oldChildren) {
    elementNodeSync([newChildren, oldChildren], function (_newChildren, _oldChildren) {
      if (!(_newChildren.node === undefined || _oldChildren === undefined)) {
        _newChildren.node = _oldChildren.node;
      }
    });
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
            elementNodeSync([parent, newChildren[i], parent.struct.children[i]], function (_parent, _newChildrenX, _parentChildrenX) {
              _parent.node.replaceChild(_newChildrenX.node, _parentChildrenX.node);
              _parentChildrenX.node = _newChildrenX.node;
            });
            parent.struct.children[i].struct = newChildren[i].struct;
          } else {
            replaceChildren(newChildren[i], parent.struct.children[i]);
          }
        } else {
          if (JSON.stringify(newChildren[i]) !== JSON.stringify(parent.struct.children[i])) {
            elementNodeSync(parent, function (_parent) {
              _parent.node.replaceChild(generateChildrenNodeByType(newChildren[i]), _parent.node.childNodes[i]);
            });
            parent.struct.children[i] = newChildren[i];
          }
        }
      } else {
        parent.appendChildren(newChildren[i]);
      }
    }

    for (var i = parent.struct.children.length - 1; i >= newChildren.length; i--) {
      elementNodeSync([parent, parent.struct.children[i]], function (_parent, _parentStructChildrenX) {
        _parent.node.removeChild(_parentStructChildrenX.node);
      });
      parent.struct.children.pop();
    }
  };
  
  function ElementBuilder (selector)
  {
    if (!(new RegExp("<StructOnly>").test(selector))) {
      this.node = (function () {
        if (selector.nodeType !== undefined) {
          return selector;
        }
        if (selector === "fragment") {
          return document.createDocumentFragment();
        }
        return document.createElement(selector);
      }());
    }
  
    this.struct = {
      selector: (function () {
        if (selector.nodeType !== undefined) {
          return selector.tagName.toLowerCase();
        }
        if (new RegExp("<StructOnly>").test(selector)) {
          return selector.split("<StructOnly>")[0];
        }
        return selector;
      }()),
      attributes: {},
      styles: {},
      events: {},
      children: []
    };
  
    if (selector.nodeType !== undefined)
    {
      cleanNodes(this.node);
      lineageAssimilation(this, this.node);
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
      elementNodeSync(this, function (_this) {
        _this.node.childNodes[0].insertAdjacentElement("beforebegin", document.createTextNode(newChildren));
      });
      this.struct.children.unshift(newChildren);
    } else {
      var _newChildren = newChildren;
  
      if (newChildren.length === undefined) {
        _newChildren = [newChildren];
      }
  
      var max = limit === undefined ? _newChildren.length - 1 : limit - 1;
  
      for (var i = max; i >= 0; i--) {
        elementNodeSync(this, function (_this) {
          if (typeof _newChildren[i] === "string" || typeof _newChildren[i] === "number") {
            _this.node.childNodes[0].insertAdjacentText("beforebegin", _newChildren[i]);
          } else {
            _this.node.childNodes[0].insertAdjacentElement("beforebegin", generateChildrenNodeByType(_newChildren[i]));
          }
        });
        this.struct.children.unshift(_newChildren[i]);
      }
    }
  
    return this;
  };
  
  ElementBuilder.prototype.appendChildren = function (newChildren)
  {
    if (typeof newChildren === "string" || typeof newChildren === "number") {
      elementNodeSync(this, function (_this) {
        _this.node.appendChild(document.createTextNode(newChildren));
      });
      this.struct.children.push(newChildren);
    } else {
      var _newChildren = newChildren;
  
      if (newChildren.length === undefined) {
        _newChildren = [newChildren];
      }
  
      for (var i = 0; i < _newChildren.length; i++) {
        elementNodeSync(this, function (_this) {
          _this.node.appendChild(generateChildrenNodeByType(_newChildren[i]));
        });
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
      if (attributes[attributeName] !== root.struct.attributes[attributeName])
      {
        elementNodeSync(root, function (_root) {
          if (typeof attributes[attributeName] === "boolean" && attributes[attributeName] === false) {
            if (attributeName === "value") {
              _root.node.value = "";
            } else {
              if (_root.node.removeProperty) {
                _root.node.removeProperty(attributeName);
              } else {
                _root.node.removeAttribute(attributeName);
              }
            }
          } else {
            if (attributeName === "value") {
              _root.node.value = attributes[attributeName];
            }
            _root.node.setAttribute(attributeName, attributes[attributeName]);
          }
        });
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
        elementNodeSync(root, function (_root) {
          if (typeof styles[styleKey] === "boolean" && styles[styleKey] === false) {
            _root.node.style[styleKey] = null;
          } else {
            _root.node.style[styleKey] = styles[styleKey];
          }
        });
        root.struct.styles[styleKey] = styles[styleKey];
      }
    });
  
    return this;
  };
  
  ElementBuilder.prototype.setEvent = function (eventType, callback)
  {
    var root = this;

    elementNodeSync(this, function (_this) {
      _this.node["on" + eventType] = function (e) {
        callback(e, _this);
      };
    });

    this.struct.events[eventType] = function (e) {
      callback(e, root);
    };
  
    return this;
  };

  function ElementFuture (term)
  {
    var ElementLoader = term.loader !== undefined ?
      term.loader() : new ElementBuilder("div");

    var selector = ElementLoader.struct.selector;
    var thresholds = term.thresholds !== undefined ? term.thresholds : 0;
    var errorThemeStyles = {
      backgroundColor: "#a30000",
      color: "#ffd485"
    };

    if (term.id === undefined || term.builder === undefined) {
      return new ElementBuilder(selector).setChildren(
        new ElementBuilder("i")
          .setStyles(errorThemeStyles)
          .setChildren("[Fallback]: id and builder required")
      );
    }

    if (getElementRecord(term.id) === undefined)
    {
      storeElementRecord(
        term.id,
        new ElementBuilder(selector).setAttributes({
          id: term.id,
          recorded: true
        })
      );
    }

    var Future = getElementRecord(term.id).instance;
    var Buffer;

    if (selector !== Future.struct.selector)
    {
      console.warn("[InconsistentSelector]: `loader` uses `" + selector + "`, but `builder` uses `" + Future.struct.selector + "`");
    }

    if (getElementRecord(term.id).iteration === 0)
    {
      if (ElementLoader.struct.children.length > 0) {
        Future.setChildren(ElementLoader.struct.children);
      }

      term.builder(function dispose (snapshot = function () {})
      {
        try {
          Buffer = snapshot();
        } catch (error) {
          Buffer = term.catcher !== undefined ?
            term.catcher({
              name: error.name,
              message: error.message,
              styles: errorThemeStyles
            }) :
            new ElementBuilder(selector).setChildren(
              new ElementBuilder("i")
                .setStyles(errorThemeStyles)
                .setChildren("[" + error.name + "]: " + error.message)
            );
        }

        if (Future.node.parentNode !== null)
        {
          Buffer.setAttributes(Future.struct.attributes);
          Future.node.parentNode.replaceChild(Buffer.node, Future.node);
          Future.node = Buffer.node;
          Future.struct.selector = Buffer.struct.selector;
          Future.setAttributes(Buffer.struct.attributes);
          Future.setStyles(Buffer.struct.styles);
          Future.setChildren(Buffer.struct.children);
          if (Object.keys(Buffer.struct.events).length > 0) {
            Object.keys(Buffer.struct.events).forEach(function (eventType) {
              Future.setEvent(eventType, function (e, root) {
                Buffer.struct.events[eventType](e, root);
              });
            });
          }
        }
      });
    }

    setElementRecord(term.id, function (ElementRecord) {
      ElementRecord.iteration++;
    });

    if (getElementRecord(term.id).iteration === thresholds)
    {
      setElementRecord(term.id, function (ElementRecord) {
        ElementRecord.iteration = 0;
      });
    }

    return Future;
  }

  global.ElementBuilder = ElementBuilder;
  global.ElementFuture = ElementFuture;
  global.getElementBuilderById = getElementBuilderById;
  global.document.getElementBuilderById = getElementBuilderById;
}(window));