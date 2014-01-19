'use strict';

var raf = require('raf');
var RealtimeBarGraph = require('realtime-bar-graph');

describe('Realtime bar graph', function(){

  var realtimeBarGraph,
    log;

  beforeEach(function(){
    realtimeBarGraph = new RealtimeBarGraph();
    log = {};
  });

  afterEach(function(){
    raf.cancel(realtimeBarGraph.rafId);
  });

  it('should allow setting of the bar spacing', function(){
    realtimeBarGraph.barSpacing(3);
    expect(realtimeBarGraph._barSpacing).to.be(3);
  });

  it('should allow setting of the background bar width', function(){
    realtimeBarGraph.barWidth(3);
    expect(realtimeBarGraph._barWidth).to.be(3);
  });

  it('should allow setting of the background bar colour', function(){
    realtimeBarGraph.backgroundBarColour('#000000');
    expect(realtimeBarGraph._backgroundBarColour).to.be('#000000');
  });

  it('should allow setting of the history bar colour', function(){
    realtimeBarGraph.historyBarColour('#000000');
    expect(realtimeBarGraph._historyBarColour).to.be('#000000');
  });

  it('should allow setting of the gutter size', function(){
    realtimeBarGraph.gutter(45);
    expect(realtimeBarGraph._gutter).to.be(45);
  });

  it('should allow setting of the width', function(){
    realtimeBarGraph.width(300);
    expect(realtimeBarGraph._width).to.be(300);
  });

  it('should allow setting of the height', function(){
    realtimeBarGraph.height(200);
    expect(realtimeBarGraph._height).to.be(200);
  });

  it('should allow setting of the frame rate', function(){
    realtimeBarGraph.frameRate(10);
    expect(realtimeBarGraph._frameRate).to.be(10);
  });

  it('should allow setting of the axes font', function(){
    realtimeBarGraph.axesFont('12px sans-serif');
    expect(realtimeBarGraph._axesFont).to.be('12px sans-serif');
  });

  it('should draw the left y axis correctly', function(){
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.bgCtx.clearRect = spooks.fn({
      name: 'clearRect',
      log: log
    });
    realtimeBarGraph.bgCtx.fillText = spooks.fn({
      name: 'fillText',
      log: log
    });

    realtimeBarGraph.drawLeftYAxis([0, 1, 2, 3, 4]);

    expect(realtimeBarGraph.bgCtx.textAlign).to.be('right');
    expect(realtimeBarGraph.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(log.args.clearRect[0])).to.eql([0, 0, 35, 280]);
    expect([].slice.call(log.args.fillText[0])).to.eql([4, 35, 40]);
    expect([].slice.call(log.args.fillText[1])).to.eql([3, 35, 90]);
    expect([].slice.call(log.args.fillText[2])).to.eql([2, 35, 140]);
    expect([].slice.call(log.args.fillText[3])).to.eql([1, 35, 190]);
    expect([].slice.call(log.args.fillText[4])).to.eql([0, 35, 240]);
  });

  it('should draw the right y axis correctly', function(){
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.bgCtx.clearRect = spooks.fn({
      name: 'clearRect',
      log: log
    });
    realtimeBarGraph.bgCtx.fillText = spooks.fn({
      name: 'fillText',
      log: log
    });

    realtimeBarGraph.drawRightYAxis([0, 1, 2, 3, 4]);

    expect(realtimeBarGraph.bgCtx.textAlign).to.be('left');
    expect(realtimeBarGraph.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(log.args.clearRect[0])).to.eql([745, 0, 35, 280]);
    expect([].slice.call(log.args.fillText[0])).to.eql([4, 745, 40]);
    expect([].slice.call(log.args.fillText[1])).to.eql([3, 745, 90]);
    expect([].slice.call(log.args.fillText[2])).to.eql([2, 745, 140]);
    expect([].slice.call(log.args.fillText[3])).to.eql([1, 745, 190]);
    expect([].slice.call(log.args.fillText[4])).to.eql([0, 745, 240]);
  });

  it('should start with a range of 0-4 on both y-axes', function(){
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.drawLeftYAxis = spooks.fn({
      name: 'drawLeftYAxis',
      log: log
    });
    realtimeBarGraph.drawRightYAxis = spooks.fn({
      name: 'drawRightYAxis',
      log: log
    });

    realtimeBarGraph.drawAxes();

    expect(log.args.drawLeftYAxis[0][0]).to.eql([0, 1, 2, 3, 4]);
    expect(log.args.drawRightYAxis[0][0]).to.eql([0, 1, 2, 3, 4]);
  });

  it('should draw the background bars correctly', function(){
    realtimeBarGraph.width(16).gutter(0);
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.bgCtx.fillRect = spooks.fn({
      name: 'fillRect',
      log: log
    });

    realtimeBarGraph.drawBackground();

    expect([].slice.call(log.args.fillRect[0])).to.eql([12, 0, 4, 280]);
    expect([].slice.call(log.args.fillRect[1])).to.eql([6, 0, 4, 280]);
    expect([].slice.call(log.args.fillRect[2])).to.eql([0, 0, 4, 280]);
  });

  it('should draw the history bars correctly', function(){
    realtimeBarGraph.width(16).gutter(0);
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.initialiseHistoryCanvas();
    realtimeBarGraph.history = [0, 1, 2];
    realtimeBarGraph.historyCtx.fillRect = spooks.fn({
      name: 'fillRect',
      log: log
    });

    realtimeBarGraph.drawHistory();

    expect([].slice.call(log.args.fillRect[0])).to.eql([12, 210, 4, 70]);
    expect([].slice.call(log.args.fillRect[1])).to.eql([6, 245, 4, 35]);
    expect([].slice.call(log.args.fillRect[2])).to.eql([0, 280, 4, 0]);
  });

  // Just testing that `processHistoryFrame` is called within the required
  // `animateInterval` (which is based on frame rate).
  it('should animate the history at the correct framerate', function(done){
    var start = Date.now();
    realtimeBarGraph.frameRate(60);
    realtimeBarGraph.processHistoryFrame = spooks.fn({
      name: 'processHistoryFrame',
      log: log,
      callback: function(){
        raf.cancel(realtimeBarGraph.rafId);
        expect(Date.now() - start).to.be.above(realtimeBarGraph.animateInterval);
        done();
      }
    });

    realtimeBarGraph.start();
  });

  it('should rescale if a history point is greater than the y-axes ranges', function(){
    realtimeBarGraph.drawAxes = spooks.fn({
      name: 'drawAxes',
      log: log
    });
    realtimeBarGraph.maxAxesPoint = 12;
    realtimeBarGraph.history = [13];
    realtimeBarGraph.initialiseHistoryCanvas();

    realtimeBarGraph.drawHistory();

    expect(log.args.drawAxes[0][0]).to.be(13);
  });

  it('should update the history bars correctly when rescaling', function(){
    realtimeBarGraph.width(4).gutter(0).height(100);
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.initialiseHistoryCanvas();
    realtimeBarGraph.historyCtx.fillRect = spooks.fn({
      name: 'fillRect',
      log: log
    });
    realtimeBarGraph.history = [5];

    realtimeBarGraph.drawHistory();

    expect([].slice.call(log.args.fillRect[0])).to.eql([0, 75, 4, 25]);
  });

  it('should allow adding of a hit', function(){
    realtimeBarGraph.addHit();
    expect(realtimeBarGraph.buffer).to.be(1);
  });

});