'use strict';

var raf = require('raf');
var expect = require('expect.js');
var sinon = require('sinon');
var Skyline = require('skyline');

describe('Skyline', function(){

  var skyline;

  beforeEach(function(){
    skyline = new Skyline();
  });

  afterEach(function(){
    raf.cancel(skyline.rafId);
  });

  it('should allow setting of the bar spacing', function(){
    skyline.barSpacing(3);
    expect(skyline._barSpacing).to.be(3);
  });

  it('should allow setting of the background bar width', function(){
    skyline.barWidth(3);
    expect(skyline._barWidth).to.be(3);
  });

  it('should allow setting of the background bar colour', function(){
    skyline.backgroundBarColour('#000000');
    expect(skyline._backgroundBarColour).to.be('#000000');
  });

  it('should allow setting of the history bar colour', function(){
    skyline.historyBarColour('#000000');
    expect(skyline._historyBarColour).to.be('#000000');
  });

  it('should allow setting of the gutter size', function(){
    skyline.gutter(45);
    expect(skyline._gutter).to.be(45);
  });

  it('should allow setting of the width', function(){
    skyline.width(300);
    expect(skyline._width).to.be(300);
  });

  it('should allow setting of the height', function(){
    skyline.height(200);
    expect(skyline._height).to.be(200);
  });

  it('should allow setting of the frame rate', function(){
    skyline.frameRate(10);
    expect(skyline._frameRate).to.be(10);
  });

  it('should allow setting of the axes font', function(){
    skyline.axesFont('12px sans-serif');
    expect(skyline._axesFont).to.be('12px sans-serif');
  });

  it('should draw the left y axis correctly', function(){
    skyline.initialiseBackgroundCanvas();
    var clearRectStub = sinon.stub(skyline.bgCtx, 'clearRect');
    var fillTextStub = sinon.stub(skyline.bgCtx, 'fillText');

    skyline.drawLeftYAxis([0, 1, 2, 3, 4]);

    expect(skyline.bgCtx.textAlign).to.be('right');
    expect(skyline.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(clearRectStub.args[0])).to.eql([0, 0, 35, 280]);
    expect([].slice.call(fillTextStub.args[0])).to.eql([4, 35, 40]);
    expect([].slice.call(fillTextStub.args[1])).to.eql([3, 35, 90]);
    expect([].slice.call(fillTextStub.args[2])).to.eql([2, 35, 140]);
    expect([].slice.call(fillTextStub.args[3])).to.eql([1, 35, 190]);
    expect([].slice.call(fillTextStub.args[4])).to.eql([0, 35, 240]);
  });

  it('should draw the right y axis correctly', function(){
    skyline.initialiseBackgroundCanvas();
    var clearRectStub = sinon.stub(skyline.bgCtx, 'clearRect');
    var fillTextStub = sinon.stub(skyline.bgCtx, 'fillText');

    skyline.drawRightYAxis([0, 1, 2, 3, 4]);

    expect(skyline.bgCtx.textAlign).to.be('left');
    expect(skyline.bgCtx.textBaseline).to.be('middle');
    expect([].slice.call(clearRectStub.args[0])).to.eql([745, 0, 35, 280]);
    expect([].slice.call(fillTextStub.args[0])).to.eql([4, 745, 40]);
    expect([].slice.call(fillTextStub.args[1])).to.eql([3, 745, 90]);
    expect([].slice.call(fillTextStub.args[2])).to.eql([2, 745, 140]);
    expect([].slice.call(fillTextStub.args[3])).to.eql([1, 745, 190]);
    expect([].slice.call(fillTextStub.args[4])).to.eql([0, 745, 240]);
  });

  it('should start with a range of 0-4 on both y-axes', function(){
    skyline.initialiseBackgroundCanvas();
    var drawLeftYAxisStub = sinon.stub(skyline, 'drawLeftYAxis');
    var drawRightYAxisStub = sinon.stub(skyline, 'drawRightYAxis');

    skyline.drawAxes();

    expect(drawLeftYAxisStub.args[0][0]).to.eql([0, 1, 2, 3, 4]);
    expect(drawRightYAxisStub.args[0][0]).to.eql([0, 1, 2, 3, 4]);
  });

  it('should draw the background bars correctly', function(){
    skyline.width(16).gutter(0);
    skyline.initialiseBackgroundCanvas();
    var fillRectStub = sinon.stub(skyline.bgCtx, 'fillRect');

    skyline.drawBackground();

    expect([].slice.call(fillRectStub.args[0])).to.eql([12, 0, 4, 280]);
    expect([].slice.call(fillRectStub.args[1])).to.eql([6, 0, 4, 280]);
    expect([].slice.call(fillRectStub.args[2])).to.eql([0, 0, 4, 280]);
  });

  it('should draw the history bars correctly', function(){
    skyline.width(16).gutter(0);
    skyline.initialiseBackgroundCanvas();
    skyline.initialiseHistoryCanvas();
    skyline.history = [0, 1, 2];
    var fillRectStub = sinon.stub(skyline.historyCtx, 'fillRect');

    skyline.drawHistory();

    expect([].slice.call(fillRectStub.args[0])).to.eql([12, 210, 4, 70]);
    expect([].slice.call(fillRectStub.args[1])).to.eql([6, 245, 4, 35]);
    expect([].slice.call(fillRectStub.args[2])).to.eql([0, 280, 4, 0]);
  });

  it('should animate the history at the correct framerate', function(){
    var orglRaf = raf;
    var orglNow = Date.now;
    raf = function(){};
    // Set the framerate at 50fps.
    skyline.animateInterval = 1000 / 50;
    skyline.animateStart = 1000;
    // Ensure enough time has passed so that a frame should have been executed.
    Date.now = function(){ return 1021; };
    var processHistoryFrameStub = sinon.stub(skyline, 'processHistoryFrame');

    skyline.animate();
    
    expect(processHistoryFrameStub.callCount).to.be(1);
    raf = orglRaf;
    Date.now = orglNow;
  });

  it('should rescale if a history point is greater than the y-axes ranges', function(){
    var drawAxesStub = sinon.stub(skyline, 'drawAxes');
    skyline.maxAxesPoint = 12;
    skyline.history = [13];
    skyline.initialiseHistoryCanvas();

    skyline.drawHistory();

    expect(drawAxesStub.args[0][0]).to.be(13);
  });

  it('should update the history bars correctly when rescaling', function(){
    skyline.width(4).gutter(0).height(100);
    skyline.initialiseBackgroundCanvas();
    skyline.initialiseHistoryCanvas();
    var fillRectStub = sinon.stub(skyline.historyCtx, 'fillRect');
    skyline.history = [5];

    skyline.drawHistory();

    expect([].slice.call(fillRectStub.args[0])).to.eql([0, 75, 4, 25]);
  });

  it('should allow adding of a hit', function(){
    skyline.addHit();
    expect(skyline.buffer).to.be(1);
  });

});