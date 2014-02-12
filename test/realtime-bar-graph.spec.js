'use strict';

var raf = require('raf');
var expect = require('expect.js');
var sinon = require('sinon');
var RealtimeBarGraph = require('realtime-bar-graph');

describe('Realtime bar graph', function(){

  var realtimeBarGraph;

  beforeEach(function(){
    realtimeBarGraph = new RealtimeBarGraph();
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
    var clearRectStub = sinon.stub(realtimeBarGraph.bgCtx, 'clearRect');
    var fillTextStub = sinon.stub(realtimeBarGraph.bgCtx, 'fillText');

    realtimeBarGraph.drawLeftYAxis([0, 1, 2, 3, 4]);

    expect(realtimeBarGraph.bgCtx.textAlign).to.be('right');
    expect(realtimeBarGraph.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(clearRectStub.args[0])).to.eql([0, 0, 35, 280]);
    expect([].slice.call(fillTextStub.args[0])).to.eql([4, 35, 40]);
    expect([].slice.call(fillTextStub.args[1])).to.eql([3, 35, 90]);
    expect([].slice.call(fillTextStub.args[2])).to.eql([2, 35, 140]);
    expect([].slice.call(fillTextStub.args[3])).to.eql([1, 35, 190]);
    expect([].slice.call(fillTextStub.args[4])).to.eql([0, 35, 240]);
  });

  it('should draw the right y axis correctly', function(){
    realtimeBarGraph.initialiseBackgroundCanvas();
    var clearRectStub = sinon.stub(realtimeBarGraph.bgCtx, 'clearRect');
    var fillTextStub = sinon.stub(realtimeBarGraph.bgCtx, 'fillText');

    realtimeBarGraph.drawRightYAxis([0, 1, 2, 3, 4]);

    expect(realtimeBarGraph.bgCtx.textAlign).to.be('left');
    expect(realtimeBarGraph.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(clearRectStub.args[0])).to.eql([745, 0, 35, 280]);
    expect([].slice.call(fillTextStub.args[0])).to.eql([4, 745, 40]);
    expect([].slice.call(fillTextStub.args[1])).to.eql([3, 745, 90]);
    expect([].slice.call(fillTextStub.args[2])).to.eql([2, 745, 140]);
    expect([].slice.call(fillTextStub.args[3])).to.eql([1, 745, 190]);
    expect([].slice.call(fillTextStub.args[4])).to.eql([0, 745, 240]);
  });

  it('should start with a range of 0-4 on both y-axes', function(){
    realtimeBarGraph.initialiseBackgroundCanvas();
    var drawLeftYAxisStub = sinon.stub(realtimeBarGraph, 'drawLeftYAxis');
    var drawRightYAxisStub = sinon.stub(realtimeBarGraph, 'drawRightYAxis');

    realtimeBarGraph.drawAxes();

    expect(drawLeftYAxisStub.args[0][0]).to.eql([0, 1, 2, 3, 4]);
    expect(drawRightYAxisStub.args[0][0]).to.eql([0, 1, 2, 3, 4]);
  });

  it('should draw the background bars correctly', function(){
    realtimeBarGraph.width(16).gutter(0);
    realtimeBarGraph.initialiseBackgroundCanvas();
    var fillRectStub = sinon.stub(realtimeBarGraph.bgCtx, 'fillRect');

    realtimeBarGraph.drawBackground();

    expect([].slice.call(fillRectStub.args[0])).to.eql([12, 0, 4, 280]);
    expect([].slice.call(fillRectStub.args[1])).to.eql([6, 0, 4, 280]);
    expect([].slice.call(fillRectStub.args[2])).to.eql([0, 0, 4, 280]);
  });

  it('should draw the history bars correctly', function(){
    realtimeBarGraph.width(16).gutter(0);
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.initialiseHistoryCanvas();
    realtimeBarGraph.history = [0, 1, 2];
    var fillRectStub = sinon.stub(realtimeBarGraph.historyCtx, 'fillRect');

    realtimeBarGraph.drawHistory();

    expect([].slice.call(fillRectStub.args[0])).to.eql([12, 210, 4, 70]);
    expect([].slice.call(fillRectStub.args[1])).to.eql([6, 245, 4, 35]);
    expect([].slice.call(fillRectStub.args[2])).to.eql([0, 280, 4, 0]);
  });

  it('should animate the history at the correct framerate', function(){
    var orglRaf = raf;
    var orglNow = Date.now;
    raf = function(){};
    // Set the framerate at 50fps.
    realtimeBarGraph.animateInterval = 1000 / 50;
    realtimeBarGraph.animateStart = 1000;
    // Ensure enough time has passed so that a frame should have been executed.
    Date.now = function(){ return 1021; };
    var processHistoryFrameStub = sinon.stub(realtimeBarGraph, 'processHistoryFrame');

    realtimeBarGraph.animate();
    
    expect(processHistoryFrameStub.callCount).to.be(1);
    raf = orglRaf;
    Date.now = orglNow;
  });

  it('should rescale if a history point is greater than the y-axes ranges', function(){
    var drawAxesStub = sinon.stub(realtimeBarGraph, 'drawAxes');
    realtimeBarGraph.maxAxesPoint = 12;
    realtimeBarGraph.history = [13];
    realtimeBarGraph.initialiseHistoryCanvas();

    realtimeBarGraph.drawHistory();

    expect(drawAxesStub.args[0][0]).to.be(13);
  });

  it('should update the history bars correctly when rescaling', function(){
    realtimeBarGraph.width(4).gutter(0).height(100);
    realtimeBarGraph.initialiseBackgroundCanvas();
    realtimeBarGraph.initialiseHistoryCanvas();
    var fillRectStub = sinon.stub(realtimeBarGraph.historyCtx, 'fillRect');
    realtimeBarGraph.history = [5];

    realtimeBarGraph.drawHistory();

    expect([].slice.call(fillRectStub.args[0])).to.eql([0, 75, 4, 25]);
  });

  it('should allow adding of a hit', function(){
    realtimeBarGraph.addHit();
    expect(realtimeBarGraph.buffer).to.be(1);
  });

});