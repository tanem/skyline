;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-raf/index.js", function(exports, require, module){
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
require.register("kenany-isinteger/index.js", function(exports, require, module){
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
require.register("component-bind/index.js", function(exports, require, module){
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
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});

require.register("component-domify/index.js", function(exports, require, module){

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
require.register("component-autoscale-canvas/index.js", function(exports, require, module){

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
require.register("realtime-bar-graph/index.js", function(exports, require, module){
'use strict';

var raf = require('raf');
var bind = require('bind');
var domify = require('domify');
var template = require('./template.html');
var autoscale = require('autoscale-canvas');

/**
 * Expose `RealtimeBarGraph`.
 */

module.exports = RealtimeBarGraph;

/**
 * Initialize a new `RealtimeBarGraph`.
 *
 * @api public
 */

function RealtimeBarGraph() {
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
 * realtimeBarGraph.barSpacing(3)
 * ```
 *
 * @param {Number} barSpacing
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.barSpacing = function(barSpacing){
  this._barSpacing = barSpacing;
  return this;
};

/**
 * Set the bar width.
 *
 * ```js
 * realtimeBarGraph.barWidth(5)
 * ```
 *
 * @param {Number} barWidth
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.barWidth = function(barWidth){
  this._barWidth = barWidth;
  return this;
};

/**
 * Set the gutter.
 *
 * ```js
 * realtimeBarGraph.gutter(50)
 * ```
 *
 * @param {Number} gutter
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.gutter = function(gutter){
  this._gutter = gutter;
  return this;
};

/**
 * Set the width.
 *
 * ```js
 * realtimeBarGraph.width(600)
 * ```
 *
 * @param {Number} width
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.width = function(width){
  this._width = width;
  return this;
};

/**
 * Set the height.
 *
 * ```js
 * realtimeBarGraph.height(300)
 * ```
 *
 * @param {Number} height
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.height = function(height){
  this._height = height;
  return this;
};

/**
 * Set the background bar colour.
 *
 * ```js
 * realtimeBarGraph.backgroundBarColour('#dedede')
 * ```
 *
 * @param {String} backgroundBarColour
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.backgroundBarColour = function(backgroundBarColour){
  this._backgroundBarColour = backgroundBarColour;
  return this;
};

/**
 * Set the history bar colour.
 *
 * ```js
 * realtimeBarGraph.historyBarColour('#ababab')
 * ```
 *
 * @param {String} historyBarColour
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.historyBarColour = function(historyBarColour){
  this._historyBarColour = historyBarColour;
  return this;
};

/**
 * Set the axes font.
 *
 * ```js
 * realtimeBarGraph.axesFont('14px sans-serif')
 * ```
 *
 * @param {String} axesFont
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.axesFont = function(axesFont){
  this._axesFont = axesFont;
  return this;
};

/**
 * Set the frame rate (fps).
 *
 * ```js
 * realtimeBarGraph.frameRate(30)
 * ```
 *
 * @param {Number} frameRate
 * @return {RealtimeBarGraph} self
 * @api public
 */

RealtimeBarGraph.prototype.frameRate = function(frameRate){
  this._frameRate = frameRate;
  return this;
};

/**
 * Create the history array.
 *
 * @api private
 */

 RealtimeBarGraph.prototype.createHistoryArray = function(){
  this.history = [];
  var i = 0, j = this._width / (this._barSpacing + this._barWidth);
  for (; i < j; i++) this.history[i] = 0;
};

/**
 * Draw the background bars.
 *
 * @api private
 */

RealtimeBarGraph.prototype.drawBackground = function(){
  this.drawBars(this.backgroundBarCb);
};

/**
 * Draw a single background bar at the required position.
 *
 * @param {Number} xPos
 * @api private
 */

RealtimeBarGraph.prototype.backgroundBarCb = function(xPos){
  this.bgCtx.fillRect(xPos, this._gutter, this._barWidth, this._height - this._gutter * 2);
};

/**
 * Initialise the background canvas properties.
 *
 * @api private
 */

RealtimeBarGraph.prototype.initialiseBackgroundCanvas = function(){
  var canvas = this.el.querySelector('.rtbg-background');
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

RealtimeBarGraph.prototype.initialiseHistoryCanvas = function(){
  var canvas = this.el.querySelector('.rtbg-history');
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

RealtimeBarGraph.prototype.start = function(){
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

RealtimeBarGraph.prototype.animate = function(){
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

RealtimeBarGraph.prototype.processHistoryFrame = function(){
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

RealtimeBarGraph.prototype.drawHistory = function(){
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

RealtimeBarGraph.prototype.historyBarCb = function(xPos){
  var hits = this.history[this.historyStartIndex--] * this.historyMultiplier;
  this.historyCtx.fillRect(xPos, this._height - this._gutter - hits, this._barWidth, hits);
};

/**
 * Draw graph bars by executing a callback at the required interval.
 *
 * @param {Function} cb
 * @api private
 */

RealtimeBarGraph.prototype.drawBars = function(cb){
  var xPos = this._width - this._gutter - this._barWidth, start = this._gutter;
  for (; xPos >= start; xPos -= (this._barSpacing + this._barWidth)) cb(xPos);
};

/**
 * Draw the left and right y-axes scaled to `maxHits`.
 *
 * @param {Number} maxHits
 * @api private
 */

RealtimeBarGraph.prototype.drawAxes = function(maxHits){
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

RealtimeBarGraph.prototype.drawLeftYAxis = function(points){
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

RealtimeBarGraph.prototype.drawRightYAxis = function(points){
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

RealtimeBarGraph.prototype.addHit = function(){
  this.buffer++;
};
});












require.register("realtime-bar-graph/template.html", function(exports, require, module){
module.exports = '<div class="rtbg">\n  <canvas class="rtbg-background"></canvas>\n  <canvas class="rtbg-history"></canvas>\n</div>';
});
require.alias("component-raf/index.js", "realtime-bar-graph/deps/raf/index.js");
require.alias("component-raf/index.js", "raf/index.js");

require.alias("kenany-isinteger/index.js", "realtime-bar-graph/deps/isInteger/index.js");
require.alias("kenany-isinteger/index.js", "isInteger/index.js");

require.alias("component-bind/index.js", "realtime-bar-graph/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");


require.alias("component-domify/index.js", "realtime-bar-graph/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-autoscale-canvas/index.js", "realtime-bar-graph/deps/autoscale-canvas/index.js");
require.alias("component-autoscale-canvas/index.js", "autoscale-canvas/index.js");

require.alias("realtime-bar-graph/index.js", "realtime-bar-graph/index.js");if (typeof exports == "object") {
  module.exports = require("realtime-bar-graph");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("realtime-bar-graph"); });
} else {
  this["RealtimeBarGraph"] = require("realtime-bar-graph");
}})();