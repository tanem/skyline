(function(){

  'use strict';
  
  // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback){
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  // Copies source object properties onto target. 
  function extend(target) {
    var sourceObjects = Array.prototype.slice.call(arguments, 1);
    sourceObjects.forEach(function(object){
      Object.keys(object).forEach(function(key){
        target[key] = object[key];
      });
    });
  }

  // Binds methods to obj.
  function bind(obj) {
    var methodNames = Array.prototype.slice.call(arguments, 1);
    methodNames.forEach(function(methodName){
      obj[methodName] = obj[methodName].bind(obj);
    });
  }

  function isNumber(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
  }

  var ActivityGraph = window.ActivityGraph = function ActivityGraph(opts) {

    extend(this, {
      backgroundBarColour: '#cdcdcd',
      barSpacing: 2,
      barWidth: 4,
      frameRate: 10,
      historyBarColour: '#00cccc',
      scaleThreshold: 0.9
    }, opts);

    if (this.rootEl === void 0) throw new Error('rootEl must be defined');
    if (!isNumber(this.height)) throw new Error('height must be a number');
    if (!isNumber(this.width)) throw new Error('width must be a number');

    bind(this, '_animate', '_backgroundBarCb', '_historyBarCb');

    this._init();

  };

  ActivityGraph.prototype._init = function(){
    this.hitsPerSecondCountEl = this.rootEl.querySelector('.ag-hps-count');
    this.framesPerSecondCountEl = this.rootEl.querySelector('.ag-fps-count');
    this._createBuffer();
    this._createHistoryArray();
    this._drawBackground();
    this._initialiseHistoryCanvas();
  };

  // Hits are temporarily stored in the buffer
  // before being moved to the history array.
  ActivityGraph.prototype._createBuffer = function(){
    this.buffer = 0;
  };

  // The history array contains the actual hit counts.
  ActivityGraph.prototype._createHistoryArray = function(){
    this.history = [];
    var i = 0, j = this.width / (this.barSpacing + this.barWidth);
    for (; i < j; i++) this.history[i] = 0;
  };

  // Draws the background bars.
  ActivityGraph.prototype._drawBackground = function(){
    var canvas = this.rootEl.querySelector('.ag-background');
    this.bgCtx = canvas.getContext('2d');
    canvas.width = this.width;
    canvas.height = this.height;
    this.bgCtx.fillStyle = this.backgroundBarColour;
    this._drawBars(this._backgroundBarCb);
  };

  ActivityGraph.prototype._backgroundBarCb = function(xPos){
    this.bgCtx.fillRect(xPos, 0, this.barWidth, this.height);
  };

  // Sets up the non-changing history canvas properties.
  ActivityGraph.prototype._initialiseHistoryCanvas = function(){
    var canvas = this.rootEl.querySelector('.ag-history');
    canvas.width = this.width;
    canvas.height = this.height;
    this.historyCtx = canvas.getContext('2d');
    this.historyCtx.fillStyle = this.historyBarColour;
  };

  // Starts the activity graph.
  ActivityGraph.prototype.start = function(){
    this.framesPerSecondCount = this.hitsPerSecondHits = 0;
    this.animateInterval = 1000 / this.frameRate;
    window.requestAnimFrame(this._animate);
  };

  ActivityGraph.prototype._animate = function(){

    var now = Date.now();

    this.animateStart = this.animateStart || now;
    this.perSecondStart = this.perSecondStart || now;

    var animateDelta = now - this.animateStart;
    var perSecondDelta = now - this.perSecondStart;

    // Process the history interval at the required framerate.
    if (animateDelta > this.animateInterval) {
      // See: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
      // Basically, we want to eliminate the creep which may be present after
      // animateDelta > interval, in order to keep the framerate as accurate as possible.
      this.animateStart = now - (animateDelta % this.animateInterval);
      this.hitsPerSecondHits += this.buffer;
      this._processHistoryInterval();
      this.framesPerSecondCount++;
    }

    // Process the *-per-second information once a second has elapsed.
    if (perSecondDelta >= 1000) {
      this.hitsPerSecondCountEl.textContent = Math.round(this.hitsPerSecondHits / (perSecondDelta / 1000));
      this.framesPerSecondCountEl.textContent = Math.round(this.framesPerSecondCount / (perSecondDelta / 1000));
      this.perSecondStart = now - (perSecondDelta % 1000);
      this.framesPerSecondCount = this.hitsPerSecondHits = 0;
    }

    window.requestAnimFrame(this._animate);

  };

  ActivityGraph.prototype._processHistoryInterval = function(){
    this.history.shift();
    this.history.push(this.buffer);
    this._drawHistory();
    this.buffer = 0;
  };

  ActivityGraph.prototype._drawHistory = function(){
    var maxHits = Math.max.apply(Math, this.history);
    var maxBarHeight = this.height * this.scaleThreshold;
    this.historyMultiplier = maxHits === 0 ? 0 : maxBarHeight / maxHits;
    this.historyCtx.clearRect(0, 0, this.width, this.height);
    this.historyStartIndex = this.history.length - 1;
    this._drawBars(this._historyBarCb);
  };

  // Draws an activity bar scaled to the correct height.
  ActivityGraph.prototype._historyBarCb = function(xPos){
    var hits = this.history[this.historyStartIndex--] * this.historyMultiplier;
    this.historyCtx.fillRect(xPos, this.height - hits, this.barWidth, hits);
  };

  // Draws graph bars by executing a callback at the required interval.
  ActivityGraph.prototype._drawBars = function(cb){
    var xPos = this.width - this.barWidth, start = 0;
    for (; xPos > start; xPos -= (this.barSpacing + this.barWidth)) cb(xPos);
  };

  ActivityGraph.prototype.addHit = function(){
    this.buffer++;
  };

}());