
;(function(){

/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("component~raf@1.1.3", function (exports, module) {
/**
 * Expose `requestAnimationFrame()`.
 */

exports = module.exports = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.oRequestAnimationFrame
  || window.msRequestAnimationFrame
  || fallback;

/**
 * Fallback implementation.
 */

var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime();
  var ms = Math.max(0, 16 - (curr - prev));
  var req = setTimeout(fn, ms);
  prev = curr;
  return req;
}

/**
 * Cancel.
 */

var cancel = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || window.oCancelAnimationFrame
  || window.msCancelAnimationFrame
  || window.clearTimeout;

exports.cancel = function(id){
  cancel.call(window, id);
};

});

require.register("kenany~isinteger@1.0.4", function (exports, module) {
/**
 * Check if a Number is an integer
 *
 * @param {Number} x
 * @return {Boolean} is integer
 * @api public
 */
module.exports = function(x) {
  return (x === Math.round(x));
};
});

require.register("component~bind@0.0.1", function (exports, module) {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});

require.register("component~domify@1.2.2", function (exports, module) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});

require.register("component~autoscale-canvas@0.0.3", function (exports, module) {

/**
 * Retina-enable the given `canvas`.
 *
 * @param {Canvas} canvas
 * @return {Canvas}
 * @api public
 */

module.exports = function(canvas){
  var ctx = canvas.getContext('2d');
  var ratio = window.devicePixelRatio || 1;
  if (1 != ratio) {
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= ratio;
    canvas.height *= ratio;
    ctx.scale(ratio, ratio);
  }
  return canvas;
};
});

require.register("skyline", function (exports, module) {
'use strict';

var raf = require("component~raf@1.1.3");
var bind = require("component~bind@0.0.1");
var domify = require("component~domify@1.2.2");
var template = require("skyline/template.html");
var autoscale = require("component~autoscale-canvas@0.0.3");

/**
 * Expose `Skyline`.
 */

module.exports = Skyline;

/**
 * Initialize a new `Skyline`.
 *
 * @api public
 */

function Skyline() {
  this._barSpacing = 2;
  this._barWidth = 4;
  this._gutter = 40;
  this._width = 780;
  this._height = 280;
  this._backgroundBarColour = '#ddd';
  this._historyBarColour = '#00cccc';
  this._axesFont = '13px sans-serif';
  this._frameRate = 20;
  this.buffer = 0;
  this.el = domify(template);
  this.animate = bind(this, 'animate');
  this.backgroundBarCb = bind(this, 'backgroundBarCb');
  this.historyBarCb = bind(this, 'historyBarCb');
}

/**
 * Set the bar spacing.
 *
 * ```js
 * skyline.barSpacing(3)
 * ```
 *
 * @param {Number} barSpacing
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.barSpacing = function(barSpacing){
  this._barSpacing = barSpacing;
  return this;
};

/**
 * Set the bar width.
 *
 * ```js
 * skyline.barWidth(5)
 * ```
 *
 * @param {Number} barWidth
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.barWidth = function(barWidth){
  this._barWidth = barWidth;
  return this;
};

/**
 * Set the gutter.
 *
 * ```js
 * skyline.gutter(50)
 * ```
 *
 * @param {Number} gutter
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.gutter = function(gutter){
  this._gutter = gutter;
  return this;
};

/**
 * Set the width.
 *
 * ```js
 * skyline.width(600)
 * ```
 *
 * @param {Number} width
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.width = function(width){
  this._width = width;
  return this;
};

/**
 * Set the height.
 *
 * ```js
 * skyline.height(300)
 * ```
 *
 * @param {Number} height
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.height = function(height){
  this._height = height;
  return this;
};

/**
 * Set the background bar colour.
 *
 * ```js
 * skyline.backgroundBarColour('#dedede')
 * ```
 *
 * @param {String} backgroundBarColour
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.backgroundBarColour = function(backgroundBarColour){
  this._backgroundBarColour = backgroundBarColour;
  return this;
};

/**
 * Set the history bar colour.
 *
 * ```js
 * skyline.historyBarColour('#ababab')
 * ```
 *
 * @param {String} historyBarColour
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.historyBarColour = function(historyBarColour){
  this._historyBarColour = historyBarColour;
  return this;
};

/**
 * Set the axes font.
 *
 * ```js
 * skyline.axesFont('14px sans-serif')
 * ```
 *
 * @param {String} axesFont
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.axesFont = function(axesFont){
  this._axesFont = axesFont;
  return this;
};

/**
 * Set the frame rate (fps).
 *
 * ```js
 * skyline.frameRate(30)
 * ```
 *
 * @param {Number} frameRate
 * @return {Skyline} self
 * @api public
 */

Skyline.prototype.frameRate = function(frameRate){
  this._frameRate = frameRate;
  return this;
};

/**
 * Create the history array.
 *
 * @api private
 */

 Skyline.prototype.createHistoryArray = function(){
  this.history = [];
  var i = 0, j = this._width / (this._barSpacing + this._barWidth);
  for (; i < j; i++) this.history[i] = 0;
};

/**
 * Draw the background bars.
 *
 * @api private
 */

Skyline.prototype.drawBackground = function(){
  this.drawBars(this.backgroundBarCb);
};

/**
 * Draw a single background bar at the required position.
 *
 * @param {Number} xPos
 * @api private
 */

Skyline.prototype.backgroundBarCb = function(xPos){
  this.bgCtx.fillRect(xPos, this._gutter, this._barWidth, this._height - this._gutter * 2);
};

/**
 * Initialise the background canvas properties.
 *
 * @api private
 */

Skyline.prototype.initialiseBackgroundCanvas = function(){
  var canvas = this.el.querySelector('.skyline-background');
  canvas.width = this._width;
  canvas.height = this._height;
  autoscale(canvas);
  this.bgCtx = canvas.getContext('2d');
  this.bgCtx.fillStyle = this._backgroundBarColour;
};

/**
 * Initialise the non-changing history canvas properties.
 *
 * @api private
 */

Skyline.prototype.initialiseHistoryCanvas = function(){
  var canvas = this.el.querySelector('.skyline-history');
  canvas.width = this._width;
  canvas.height = this._height;
  autoscale(canvas);
  this.historyCtx = canvas.getContext('2d');
  this.historyCtx.fillStyle = this._historyBarColour;
};

/**
 * Start the graph animation.
 *
 * @api public
 */

Skyline.prototype.start = function(){
  this.createHistoryArray();
  this.initialiseBackgroundCanvas();
  this.initialiseHistoryCanvas();
  this.drawBackground();
  this.animateInterval = 1000 / this._frameRate;
  this.rafId = raf(this.animate);
};

/**
 * Animation loop.
 *
 * @api private
 */

Skyline.prototype.animate = function(){
  this.rafId = raf(this.animate);
  var now = Date.now();
  this.animateStart = this.animateStart || now;
  var animateDelta = now - this.animateStart;
  
  // Process the history interval at the required framerate.
  if (animateDelta > this.animateInterval) {

    // See: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
    // Basically, we want to eliminate the creep which may be present after
    // animateDelta > interval, in order to keep the framerate as accurate as possible.
    this.animateStart = now - (animateDelta % this.animateInterval);
    this.processHistoryFrame();
  }
};

/**
 * Process a history frame - draw the bar graph at this point in time.
 *
 * @api private
 */

Skyline.prototype.processHistoryFrame = function(){
  for (var i = 0, j = this.history.length - 1; i < j; i++) {
    this.history[i] = this.history[i + 1];
  }
  this.history[this.history.length - 1] = this.buffer;
  this.drawHistory();
  this.buffer = 0;
};

/**
 * Draw the history bars.
 *
 * @api private
 */

Skyline.prototype.drawHistory = function(){
  var maxHits = Math.max.apply(null, this.history);
  if (!this.maxAxesPoint || maxHits >= this.maxAxesPoint) this.drawAxes(maxHits);
  this.historyMultiplier = (this._height - this._gutter * 2) / this.maxAxesPoint;
  this.historyCtx.clearRect(0, 0, this._width, this._height);
  this.historyStartIndex = this.history.length - 1;
  this.drawBars(this.historyBarCb);
};

/**
 * Draw a single history bar scaled to the correct height.
 *
 * @param {Number} xPos
 * @api private
 */

Skyline.prototype.historyBarCb = function(xPos){
  var hits = this.history[this.historyStartIndex--] * this.historyMultiplier;
  this.historyCtx.fillRect(xPos, this._height - this._gutter - hits, this._barWidth, hits);
};

/**
 * Draw graph bars by executing a callback at the required interval.
 *
 * @param {Function} cb
 * @api private
 */

Skyline.prototype.drawBars = function(cb){
  var xPos = this._width - this._gutter - this._barWidth, start = this._gutter;
  for (; xPos >= start; xPos -= (this._barSpacing + this._barWidth)) cb(xPos);
};

/**
 * Draw the left and right y-axes scaled to `maxHits`.
 *
 * @param {Number} maxHits
 * @api private
 */

Skyline.prototype.drawAxes = function(maxHits){
  maxHits = maxHits || 1;
  var points = [0, maxHits, maxHits * 2, maxHits * 3, maxHits * 4];
  this.maxAxesPoint = points[4];
  this.bgCtx.font = this._axesFont;
  this.drawLeftYAxis(points);
  this.drawRightYAxis(points);
};

/**
 * Draw the left y-axis using the given points.
 *
 * @param {Array} points
 * @api private
 */

Skyline.prototype.drawLeftYAxis = function(points){
  var xPos = this._gutter - 5;
  var drawingAreaHeight = this._height - this._gutter * 2;
  this.bgCtx.clearRect(0, 0, xPos, this._height);
  this.bgCtx.textAlign = 'right';
  this.bgCtx.textBaseline = 'middle';
  this.bgCtx.fillText(points[4], xPos, this._gutter);
  this.bgCtx.fillText(points[3], xPos, this._gutter + drawingAreaHeight / 4);
  this.bgCtx.fillText(points[2], xPos, this._gutter + drawingAreaHeight / 2);
  this.bgCtx.fillText(points[1], xPos, this._height - this._gutter - drawingAreaHeight / 4);
  this.bgCtx.fillText(points[0], xPos, this._height - this._gutter);
};

/**
 * Draw the right y-axis using the given points.
 *
 * @param {Array} points
 * @api private
 */

Skyline.prototype.drawRightYAxis = function(points){
  var xPos = this._width - this._gutter + 5;
  var drawingAreaHeight = this._height - this._gutter * 2;
  this.bgCtx.clearRect(xPos, 0, this._width - xPos, this._height);
  this.bgCtx.textAlign = 'left';
  this.bgCtx.textBaseline = 'middle';
  this.bgCtx.fillText(points[4], xPos, this._gutter);
  this.bgCtx.fillText(points[3], xPos, this._gutter + drawingAreaHeight / 4);
  this.bgCtx.fillText(points[2], xPos, this._gutter + drawingAreaHeight / 2);
  this.bgCtx.fillText(points[1], xPos, this._height - this._gutter - drawingAreaHeight / 4);
  this.bgCtx.fillText(points[0], xPos, this._height - this._gutter);
};

/**
 * Add a hit to the graph.
 *
 * @api public
 */

Skyline.prototype.addHit = function(){
  this.buffer++;
};
});

require.define("skyline/template.html", "<div class=\"skyline\">\n  <canvas class=\"skyline-background\"></canvas>\n  <canvas class=\"skyline-history\"></canvas>\n</div>");

if (typeof exports == "object") {
  module.exports = require("skyline");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("skyline"); });
} else {
  this["Skyline"] = require("skyline");
}
})()
