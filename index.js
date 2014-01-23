'use strict';

var raf = require('raf');
var bind = require('bind');
var domify = require('domify');
var template = require('./template');
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