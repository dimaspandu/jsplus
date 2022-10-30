/**
 * @license JS+ (DOM) v1.0.0
 * jsplus/stateful-component.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ !function(t){"use strict";var e=function(t){var e=t.component,n=t.builder(t.state,function(e){t.setState(e)},function(e){t.setStateEffect(e)});e.setChildren(n.struct.children),e.setAttributes(n.struct.attributes),e.setStyles(n.struct.styles),Object.keys(n.struct.events).length>0&&Object.keys(n.struct.events).forEach(function(t){e.setEvent(t,function(e,s){n.struct.events[t](e,s)})})};function n(t){this.state=t,this.builder=null,this.component=null,Object.seal(this)}n.prototype.build=function(t){var e=this;return this.builder=t,this.component=t(e.state,function(t){e.setState(t)}),this.component},n.prototype.setStateOnly=function(t){var e=this;"object"==typeof t&&Object.keys(t).forEach(function(n){e.state[n]=t[n]}),"function"==typeof t&&t(e.state)},n.prototype.setState=function(t){this.setStateOnly(t),e(this)},t.StatefulComponent=n}(window);