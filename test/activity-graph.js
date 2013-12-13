describe('Activity Graph', function(){

  'use strict';

  var activityGraph,
    rootEl,
    backgroundCanvas,
    historyCanvas;

  beforeEach(function(){

    this.addMatchers({
      toBeAnInstanceOf: function(expected){
        var actual = this.actual;
        var notText = this.isNot ? ' not' : '';
        this.message = function(){
          return 'Expected ' + actual + notText + ' to be an instance of ' + expected;
        };
        return this.actual instanceof expected;
      }
    });

    // http://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
    var dummyDiv = document.createElement('div');
    dummyDiv.innerHTML = '<div class="ag" style="width:600px;height:200px;">' +
      '<canvas class="ag-background"></canvas>' +
      '<canvas class="ag-history"></canvas>' +
      '<div class="ag-hps"><span class="ag-hps-count"></span> <span class="ag-hps-label">hits / second</span></div>' +
      '<div class="ag-fps"><span class="ag-fps-count"></span> <span class="ag-fps-label">frames / second</span></div>' +
    '</div>';
    rootEl = dummyDiv.childNodes[0];

    backgroundCanvas = rootEl.querySelector('.ag-background');
    historyCanvas = rootEl.querySelector('.ag-history');

    activityGraph = new ActivityGraph({
      rootEl: rootEl,
      height: 200,
      width: 600
    });

  });

  describe('Instantiation:', function(){

    it('Should throw an error if rootEl is not defined', function(){
      expect(function(){
        activityGraph = new ActivityGraph({
          height: 100,
          width: 100
        });
      }).toThrow('rootEl must be defined');
    });

    it('Should throw an error if height is not a number', function(){
      expect(function(){
        activityGraph = new ActivityGraph({
          rootEl: rootEl,
          width: 100
        });
      }).toThrow('height must be a number');
    });

    it('Should throw an error if width is not a number', function(){
      expect(function(){
        activityGraph = new ActivityGraph({
          rootEl: rootEl,
          height: 100
        });
      }).toThrow('width must be a number');
    });

  });

  describe('Initialisation:', function(){

    beforeEach(function(){
      spyOn(activityGraph, '_createBuffer');
      spyOn(activityGraph, '_createHistoryArray');
      spyOn(activityGraph, '_drawBackground');
      spyOn(activityGraph, '_initialiseHistoryCanvas');
      activityGraph._init();
    });

    it('Should create the hits buffer', function(){
      expect(activityGraph._createBuffer).toHaveBeenCalled();
    });

    it('Should create the hits history array', function(){
      expect(activityGraph._createHistoryArray).toHaveBeenCalled();
    });

    it('Should draw the background', function(){
      expect(activityGraph._drawBackground).toHaveBeenCalled();
    });

    it('Should initialise the hits history canvas', function(){
      expect(activityGraph._initialiseHistoryCanvas).toHaveBeenCalled();
    });

  });

  describe('Background:', function(){

    beforeEach(function(){
      spyOn(activityGraph, '_drawBars');
      spyOn(activityGraph.bgCtx, 'fillRect');
      activityGraph._drawBackground();
    });

    it('Should correctly set the background canvas width', function(){
      expect(backgroundCanvas.width).toBe(600);
    });

    it('Should correctly set the background canvas height', function(){
      expect(backgroundCanvas.height).toBe(200);
    });

    it('Should correctly set the background bar colour', function(){
      expect(activityGraph.bgCtx.fillStyle).toBe('#cdcdcd');
    });

    it('Should draw the background bars at the correct intervals', function(){
      expect(activityGraph._drawBars).toHaveBeenCalledWith(activityGraph._backgroundBarCb);
    });

    it('Should draw a single background bar correctly', function(){
      activityGraph._backgroundBarCb(10);
      expect(activityGraph.bgCtx.fillRect).toHaveBeenCalledWith(10, 0, 4, 200);
    });

  });

  describe('History:', function(){

    describe('Initialise:', function(){

      beforeEach(function(){
        spyOn(activityGraph.historyCtx, 'fillRect');
        activityGraph._initialiseHistoryCanvas();
      });

      it('Should correctly set the history canvas width', function(){
        expect(backgroundCanvas.width).toBe(600);
      });

      it('Should correctly set the history canvas height', function(){
        expect(backgroundCanvas.height).toBe(200);
      });

      it('Should correctly set the history bar colour', function(){
        expect(activityGraph.historyCtx.fillStyle).toBe('#00cccc');
      });

    });

    describe('Draw:', function(){

      beforeEach(function(){
        spyOn(activityGraph, '_drawBars');
        activityGraph.history.shift();
        activityGraph.history.push(10);
        activityGraph._drawHistory();
      });

      it('Should calculate the history multiplier correctly', function(){
        expect(activityGraph.historyMultiplier).toBe(18);
      });

      it('Should draw the history from right to left', function(){
        expect(activityGraph.historyStartIndex).toBe(99);
      });

      it('Should draw the bars at the correct height', function(){
        spyOn(activityGraph.historyCtx, 'fillRect');
        activityGraph._historyBarCb(10);
        expect(activityGraph.historyCtx.fillRect).toHaveBeenCalledWith(10, 20, 4, 180);
      });

    });

  });

  describe('Start:', function(){

    beforeEach(function(){
      // Doing this to ensure a consistent value for testing.
      spyOn(Date, 'now').andReturn(100);
      spyOn(window, 'requestAnimFrame');
      spyOn(activityGraph, '_animate');
      activityGraph.start();
    });

    it('Should initialise the frames per second count', function(){
      expect(activityGraph.framesPerSecondCount).toBe(0);
    });

    it('Should initialise the hits per second count', function(){
      expect(activityGraph.hitsPerSecondHits).toBe(0);
    });

    it('Should set up the animation interval time', function(){
      expect(activityGraph.animateInterval).toBe(100);
    });

    it('Should start the animation', function(){
      expect(window.requestAnimFrame).toHaveBeenCalledWith(activityGraph._animate);
    });

  });

  describe('Animate:', function(){

    var fakeNow = 0;

    // Fakes some animation loops by running the animate method for a certain
    // amount of time at a certain interval.
    var runAnimation = function(time, step){
      for (var i = 0; i < time + step; i += step) {
        fakeNow += step;
        activityGraph._animate();
      }
    };

    beforeEach(function(){
      spyOn(Date, 'now').andCallFake(function() { return fakeNow; });
      spyOn(window, 'requestAnimFrame');
      activityGraph.start();
      activityGraph.animateInterval = 1000;
    });

    it('Should initialise the animation start time when needed', function(){
      activityGraph._animate();
      expect(activityGraph.animateStart).toBe(0);
    });

    it('Should initialise the per second start time when needed', function(){
      activityGraph._animate();
      expect(activityGraph.animateStart).toBe(0);
    });

    it('Should provide the animate function as the argument to requestAnimFrame', function(){
      expect(window.requestAnimFrame).toHaveBeenCalledWith(activityGraph._animate);
    });

    it('Should process the history interval at the required framerate', function(){
      spyOn(activityGraph, '_processHistoryInterval');
      runAnimation(5000, 16);
      expect(activityGraph._processHistoryInterval.callCount).toBe(5);
    });

    it('Should update the hits per second count after 1 second has elapsed', function(){
      activityGraph.buffer = 10;
      runAnimation(1000, 16);
      expect(activityGraph.hitsPerSecondCountEl.textContent).toBe('10');
    });

    it('Should update the frames per second count after 1 second has elapsed', function(){
      activityGraph.buffer = 10;
      runAnimation(1000, 16);
      expect(activityGraph.framesPerSecondCountEl.textContent).toBe('1');
    });

  });

  describe('Process history interval:', function(){

    beforeEach(function(){
      spyOn(activityGraph, '_drawHistory');
      activityGraph.history[0] = 10;
      activityGraph.buffer = 10;
      activityGraph._processHistoryInterval();
    });

    it('Should discard the oldest value from the history array', function(){
      expect(activityGraph.history[0]).toBe(0);
    });

    it('Should add the buffer value to the end of the history array', function(){
      expect(activityGraph.history[activityGraph.history.length - 1]).toBe(10);
    });

    it('Should redraw the history graph', function(){
      expect(activityGraph._drawHistory).toHaveBeenCalled();
    });

    it('Should reset the buffer', function(){
      expect(activityGraph.buffer).toBe(0);
    });

  });

  it('should create the hits buffer correctly', function(){
    expect(activityGraph.buffer).toBe(0);
  });

  it('should create the hits history correctly', function(){
    expect(activityGraph.history).toBeAnInstanceOf(Array);
    expect(activityGraph.history.length).toEqual(100);
  });

  it('should draw bars at the correct location on the canvas', function(){
    // Recreate the graph with a custom width to make it easier to test.
    activityGraph = new ActivityGraph({
      rootEl: rootEl,
      height: 200,
      width: 18
    });
    var cb = jasmine.createSpy();

    activityGraph._drawBars(cb);

    expect(cb.callCount).toBe(3);
    expect(cb.argsForCall[0]).toEqual([14]);
    expect(cb.argsForCall[1]).toEqual([8]);
    expect(cb.argsForCall[2]).toEqual([2]);
  });

  it('should add a hit to the buffer', function(){
    activityGraph.addHit();
    expect(activityGraph.buffer).toBe(1);
  });

});