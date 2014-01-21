# realtime-bar-graph

A bar graph that displays information in real time using canvas.

## Dependencies

```
npm install -g uglify-js mocha-phantomjs phantomjs component
```

## Installation

Install with [component(1)](http://component.io):

```sh
$ component install tanem/realtime-bar-graph
```

## Stand-alone

This library may be used stand-alone without the component tool, simply add ./standalone/realtime-bar-graph.css and ./standalone/realtime-bar-graph.js to your application and reference the `RealtimeBarGraph` global. With all its dependencies realtime-bar-graph is the following size:

```
20K standalone/realtime-bar-graph.js
12K  standalone/realtime-bar-graph.min.js
```

## Live Demo

[Check out the live demo on CodePen](http://codepen.io/tanem/pen/zkanq), which uses the stand-alone files.

## Unit Tests

Ensure [mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs) is installed, then:

```sh
$ make test
```

## API

### new RealtimeBarGraph

Initialize a new `RealtimeBarGraph`.

### RealtimeBarGraph#barSpacing(barSpacing:Number)

Set the bar spacing.

```js
realtimeBarGraph.barSpacing(3)
```

### RealtimeBarGraph#barWidth(barWidth:Number)

Set the bar width.

```js
realtimeBarGraph.barSpacing(5)
```

### RealtimeBarGraph#gutter(gutter:Number)

Set the gutter.

```js
realtimeBarGraph.gutter(50)
```

### RealtimeBarGraph#width(width:Number)

Set the width.

```js
realtimeBarGraph.width(600)
```

### RealtimeBarGraph#height(height:Number)

Set the height.

```js
realtimeBarGraph.height(300)
```

### RealtimeBarGraph#backgroundBarColour(backgroundBarColour:String)

Set the background bar colour.

```js
realtimeBarGraph.backgroundBarColour('#dedede')
```

### RealtimeBarGraph#historyBarColour(historyBarColour:String)

Set the history bar colour.

```js
realtimeBarGraph.historyBarColour('#ababab')
```

### RealtimeBarGraph#axesFont(axesFont:String)

Set the axes font.

```js
realtimeBarGraph.axesFont('14px sans-serif')
```

### RealtimeBarGraph#frameRate(frameRate:Number)

Set the frame rate (fps).

```js
realtimeBarGraph.frameRate(30)
```

### RealtimeBarGraph#addHit

Add a hit to the graph.

```js
realtimeBarGraph.addHit()
```

### RealtimeBarGraph#start

Start the graph animation.

```js
realtimeBarGraph.start()
```

## License

MIT