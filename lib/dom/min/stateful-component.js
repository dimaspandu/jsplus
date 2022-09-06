/**
 * @license JS+ (DOM) v1.0.0
 * jsplus/stateful-component.js
 *
 * Copyright (c) dimaspandu
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ !function(b){"use strict";var c=function(b){var c=b.component,a=b.builder(b.state,function(a){b.setState(a)},function(a){b.setStateEffect(a)});c.setChildren(a.struct.children),c.setAttributes(a.struct.attributes),c.setStyles(a.struct.styles),Object.keys(a.struct.events).length>0&&Object.keys(a.struct.events).forEach(function(b){c.setEvent(b,function(c,d){a.struct.events[b](c,d)})})};function a(a){this.state=a,this.builder=null,this.component=null,Object.seal(this)}a.prototype.build=function(a){var b=this;return this.builder=a,this.component=a(b.state,function(a){b.setState(a)},function(a){b.setStateEffect(a)}),this.component},a.prototype.setState=function(a){var b=this;Object.keys(a).forEach(function(c){b.state[c]=a[c]}),c(b)},a.prototype.setStateEffect=function(b){var a=this;b(a.state,function(b){a.setState(b)},function(b){a.setStateEffect(b)}),c(a)},b.StatefulComponent=a}(window)