(function(){

  // http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function(callback){
        window.setTimeout(callback, 1000 / 60);
      };
  })();

  function extend(target) {
    var args = Array.prototype.slice.call(arguments, 1);
    args.forEach(function(arg){
      Object.keys(arg).forEach(function(key){
        target[key] = arg[key];
      });
    });
  }

  function isNumber(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
  }

  window.HitsGraph = HitsGraph;

  function HitsGraph(opts) {

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

    this._animate = this._animate.bind(this);
    this._backgroundBarCb = this._backgroundBarCb.bind(this);
    this._historyBarCb = this._historyBarCb.bind(this);

    this._init();

  }

  HitsGraph.prototype._init = function(){
    this.hitsPerSecondCountEl = this.rootEl.getElementsByClassName('hg-hps-count')[0];
    this.framesPerSecondCountEl = this.rootEl.getElementsByClassName('hg-fps-count')[0];
    this._createBuffer();
    this._createHistoryArray();
    this._drawBackground();
    this._initialiseHistoryCanvas();
  };

  // Hits are temporarily stored in the buffer
  // before being moved to the history array.
  HitsGraph.prototype._createBuffer = function(){
    this.buffer = 0;
  };

  // The history array contains the actual hit counts.
  HitsGraph.prototype._createHistoryArray = function(){
    this.history = [];
    var i = 0, j = this.width / (this.barSpacing + this.barWidth);
    for (; i < j; i++) this.history[i] = 0;
  };

  // Draws the background bars.
  HitsGraph.prototype._drawBackground = function(){
    var canvas = this.rootEl.getElementsByClassName('hg-background')[0];
    this.bgCtx = canvas.getContext('2d');
    canvas.width = this.width;
    canvas.height = this.height;
    this.bgCtx.fillStyle = this.backgroundBarColour;
    this._drawBars(this._backgroundBarCb);
  };

  HitsGraph.prototype._backgroundBarCb = function(xPos){
    this.bgCtx.fillRect(xPos, 0, this.barWidth, this.height);
  };

  // Sets up the non-changing history canvas properties.
  HitsGraph.prototype._initialiseHistoryCanvas = function(){
    var canvas = this.rootEl.getElementsByClassName('hg-history')[0];
    canvas.width = this.width;
    canvas.height = this.height;
    this.historyCtx = canvas.getContext('2d');
    this.historyCtx.fillStyle = this.historyBarColour;
  };

  // Starts the hits graph.
  HitsGraph.prototype.start = function(){
    this.framesPerSecondCount = this.hitsPerSecondHits = 0;
    this.animateStart = this.perSecondStart = Date.now();
    this.animateInterval = 1000 / this.frameRate;
    this._animate();
  };

  HitsGraph.prototype._animate = function(){
    window.requestAnimFrame(this._animate);

    var now = Date.now();
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
      this.hitsPerSecondCountEl.innerText = Math.round(this.hitsPerSecondHits / (perSecondDelta / 1000));
      this.framesPerSecondCountEl.innerText = Math.round(this.framesPerSecondCount / (perSecondDelta / 1000));
      this.perSecondStart = now - (perSecondDelta % 1000);
      this.framesPerSecondCount = this.hitsPerSecondHits = 0;
    }

  };

  HitsGraph.prototype._processHistoryInterval = function(){
    this.history.shift();
    this.history.push(this.buffer);
    this._drawHistory();
    this.buffer = 0;
  };

  HitsGraph.prototype._drawHistory = function(){
    var maxHits = Math.max.apply(Math, this.history);
    var maxBarHeight = this.height * this.scaleThreshold;
    this.historyMultiplier = maxHits === 0 ? 0 : maxBarHeight / maxHits;
    this.historyCtx.clearRect(0, 0, this.width, this.height);
    this.historyStartIndex = this.history.length - 1;
    this._drawBars(this._historyBarCb);
  };

  HitsGraph.prototype._historyBarCb = function(xPos){
    var hits = this.history[this.historyStartIndex--] * this.historyMultiplier;
    this.historyCtx.fillRect(xPos, this.height - hits, this.barWidth, hits);
  };

  // Draws graph bars by executing a callback at the required interval.
  HitsGraph.prototype._drawBars = function(cb){
    var xPos = this.width - this.barWidth, start = 0;
    for (; xPos > start; xPos -= (this.barSpacing + this.barWidth)) cb(xPos);
  };

  HitsGraph.prototype.addHit = function(){
    this.buffer++;
  };

}());