describe('Hits graph', function(){

  var hitsGraph,
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
    dummyDiv.innerHTML = '<div class="hg" style="width:600px;height:200px;">' +
      '<canvas class="hg-background"></canvas>' +
      '<canvas class="hg-history"></canvas>' +
      '<div class="hg-hps"><span class="hg-hps-count"></span> <span class="hg-hps-label">hits / second</span></div>' +
      '<div class="hg-fps"><span class="hg-fps-count"></span> <span class="hg-fps-label">frames / second</span></div>' +
    '</div>';
    rootEl = dummyDiv.childNodes[0];

    backgroundCanvas = rootEl.getElementsByClassName('hg-background')[0];
    historyCanvas = rootEl.getElementsByClassName('hg-history')[0];

    hitsGraph = new HitsGraph({
      rootEl: rootEl,
      height: 200,
      width: 600
    });

  });

  describe('Instantiation:', function(){

    it('Should throw an error if rootEl is not defined', function(){
      expect(function(){
        hitsGraph = new HitsGraph({
          height: 100,
          width: 100
        });
      }).toThrow('rootEl must be defined');
    });

    it('Should throw an error if height is not a number', function(){
      expect(function(){
        hitsGraph = new HitsGraph({
          rootEl: rootEl,
          width: 100
        });
      }).toThrow('height must be a number');
    });

    it('Should throw an error if width is not a number', function(){
      expect(function(){
        hitsGraph = new HitsGraph({
          rootEl: rootEl,
          height: 100
        });
      }).toThrow('width must be a number');
    });

  });

  describe('Initialisation:', function(){

    beforeEach(function(){
      spyOn(hitsGraph, '_createBuffer');
      spyOn(hitsGraph, '_createHistoryArray');
      spyOn(hitsGraph, '_drawBackground');
      spyOn(hitsGraph, '_initialiseHistoryCanvas');
      hitsGraph._init();
    });

    it('Should create the hits buffer', function(){
      expect(hitsGraph._createBuffer).toHaveBeenCalled();
    });

    it('Should create the hits history array', function(){
      expect(hitsGraph._createHistoryArray).toHaveBeenCalled();
    });

    it('Should draw the background', function(){
      expect(hitsGraph._drawBackground).toHaveBeenCalled();
    });

    it('Should initialise the hits history canvas', function(){
      expect(hitsGraph._initialiseHistoryCanvas).toHaveBeenCalled();
    });

  });

  describe('Background:', function(){

    beforeEach(function(){
      spyOn(hitsGraph, '_drawBars');
      spyOn(hitsGraph.bgCtx, 'fillRect');
      hitsGraph._drawBackground();
    });

    it('Should correctly set the background canvas width', function(){
      expect(backgroundCanvas.width).toBe(600);
    });

    it('Should correctly set the background canvas height', function(){
      expect(backgroundCanvas.height).toBe(200);
    });

    it('Should correctly set the background bar colour', function(){
      expect(hitsGraph.bgCtx.fillStyle).toBe('#cdcdcd');
    });

    it('Should draw the background bars at the correct intervals', function(){
      expect(hitsGraph._drawBars).toHaveBeenCalledWith(hitsGraph._backgroundBarCb);
    });

    it('Should draw a single background bar correctly', function(){
      hitsGraph._backgroundBarCb(10);
      expect(hitsGraph.bgCtx.fillRect).toHaveBeenCalledWith(10, 0, 4, 200);
    });

  });

  describe('History:', function(){

    describe('Initialise:', function(){

      beforeEach(function(){
        spyOn(hitsGraph.historyCtx, 'fillRect');
        hitsGraph._initialiseHistoryCanvas();
      });

      it('Should correctly set the history canvas width', function(){
        expect(backgroundCanvas.width).toBe(600);
      });

      it('Should correctly set the history canvas height', function(){
        expect(backgroundCanvas.height).toBe(200);
      });

      it('Should correctly set the history bar colour', function(){
        expect(hitsGraph.historyCtx.fillStyle).toBe('#00cccc');
      });

    });

    describe('Draw:', function(){

      beforeEach(function(){
        spyOn(hitsGraph, '_drawBars');
        hitsGraph.history.shift();
        hitsGraph.history.push(10);
        hitsGraph._drawHistory();
      });

      it('Should calculate the history multiplier correctly', function(){
        expect(hitsGraph.historyMultiplier).toBe(18);
      });

      it('Should draw the history from right to left', function(){
        expect(hitsGraph.historyStartIndex).toBe(99);
      });

      it('Should draw the bars at the correct height', function(){
        spyOn(hitsGraph.historyCtx, 'fillRect');
        hitsGraph._historyBarCb(10);
        expect(hitsGraph.historyCtx.fillRect).toHaveBeenCalledWith(10, 20, 4, 180);
      });

    });

  });

  describe('Start:', function(){

    beforeEach(function(){
      // Doing this to ensure a consistent value for testing.
      spyOn(Date, 'now').andReturn(100);
      spyOn(hitsGraph, '_animate');
      hitsGraph.start();
    });

    it('Should initialise the frames per second count', function(){
      expect(hitsGraph.framesPerSecondCount).toBe(0);
    });

    it('Should initialise the hits per second count', function(){
      expect(hitsGraph.hitsPerSecondHits).toBe(0);
    });

    it('Should initialise the animation start time', function(){
      expect(hitsGraph.animateStart).toBe(100);
    });

    it('Should initialise the per second start time', function(){
      expect(hitsGraph.animateStart).toBe(100);
    });

    it('Should set up the animation interval time', function(){
      expect(hitsGraph.animateInterval).toBe(100);
    });

    it('Should start the animation', function(){
      expect(hitsGraph._animate).toHaveBeenCalled();
    });

  });

  describe('Animate:', function(){

    var fakeNow = 0;

    // Fakes some animation loops by running the animate method for a certain
    // amount of time at a certain interval.
    var runAnimation = function(time, step){
      for (var i = 0; i < time + step; i += step) {
        fakeNow += step;
        hitsGraph._animate();
      }
    };

    beforeEach(function(){
      spyOn(Date, 'now').andCallFake(function() { return fakeNow; });
      spyOn(window, 'requestAnimFrame');
      hitsGraph.start();
      hitsGraph.animateInterval = 1000;
    });

    it('Should provide the animate function as the argument to requestAnimFrame', function(){
      expect(window.requestAnimFrame).toHaveBeenCalledWith(hitsGraph._animate);
    });

    it('Should process the history interval at the required framerate', function(){
      spyOn(hitsGraph, '_processHistoryInterval');
      runAnimation(5000, 16);
      expect(hitsGraph._processHistoryInterval.callCount).toBe(5);
    });

    it('Should update the hits per second count after 1 second has elapsed', function(){
      hitsGraph.buffer = 10;
      runAnimation(1000, 16);
      expect(hitsGraph.hitsPerSecondCountEl.innerText).toBe('10');
    });

    it('Should update the frames per second count after 1 second has elapsed', function(){
      hitsGraph.buffer = 10;
      runAnimation(1000, 16);
      expect(hitsGraph.framesPerSecondCountEl.innerText).toBe('1');
    });

  });

  describe('Process history interval:', function(){

    beforeEach(function(){
      spyOn(hitsGraph, '_drawHistory');
      hitsGraph.history[0] = 10;
      hitsGraph.buffer = 10;
      hitsGraph._processHistoryInterval();
    });

    it('Should discard the oldest value from the history array', function(){
      expect(hitsGraph.history[0]).toBe(0);
    });

    it('Should add the buffer value to the end of the history array', function(){
      expect(hitsGraph.history[hitsGraph.history.length - 1]).toBe(10);
    });

    it('Should redraw the history graph', function(){
      expect(hitsGraph._drawHistory).toHaveBeenCalled();
    });

    it('Should reset the buffer', function(){
      expect(hitsGraph.buffer).toBe(0);
    });

  });

  it('should create the hits buffer correctly', function(){
    expect(hitsGraph.buffer).toBe(0);
  });

  it('should create the hits history correctly', function(){
    expect(hitsGraph.history).toBeAnInstanceOf(Array);
    expect(hitsGraph.history.length).toEqual(100);
  });

  it('should draw bars at the correct location on the canvas', function(){
    // Recreate the graph with a custom width to make it easier to test.
    hitsGraph = new HitsGraph({
      rootEl: rootEl,
      height: 200,
      width: 18
    });
    var cb = jasmine.createSpy();

    hitsGraph._drawBars(cb);

    expect(cb.callCount).toBe(3);
    expect(cb.argsForCall[0]).toEqual([14]);
    expect(cb.argsForCall[1]).toEqual([8]);
    expect(cb.argsForCall[2]).toEqual([2]);
  });

  it('should add a hit to the buffer', function(){
    hitsGraph.addHit();
    expect(hitsGraph.buffer).toBe(1);
  });

});