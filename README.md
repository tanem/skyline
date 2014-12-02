# skyline

A bar graph that displays information in real time using canvas.

[![browser support](https://ci.testling.com/tanem/skyline.png)](https://ci.testling.com/tanem/skyline)

## Live Demo

[Check out the live demo on CodePen](http://codepen.io/tanem/pen/zkanq), which uses the stand-alone files.

## Installation

Ensure [component(1)](http://component.io) is installed, then:

```
$ component install tanem/skyline
```

## Stand-alone

This library may be used stand-alone without the component tool. To build the stand-alone files, ensure [UglifyJS2](https://github.com/mishoo/UglifyJS2) is installed, then: 

```
$ make standalone
```

Then add ./standalone/skyline.css and ./standalone/skyline.js to your application and reference the `Skyline` global.

## Unit Tests

To run the unit tests, ensure [testling](https://github.com/substack/testling) is installed. Then:

```
$ make test
```

## API

### new Skyline

Initialize a new `Skyline`.

### Skyline#barSpacing(barSpacing:Number)

Set the bar spacing.

```js
skyline.barSpacing(3)
```

### Skyline#barWidth(barWidth:Number)

Set the bar width.

```js
skyline.barSpacing(5)
```

### Skyline#gutter(gutter:Number)

Set the gutter.

```js
skyline.gutter(50)
```

### Skyline#width(width:Number)

Set the width.

```js
skyline.width(600)
```

### Skyline#height(height:Number)

Set the height.

```js
skyline.height(300)
```

### Skyline#backgroundBarColour(backgroundBarColour:String)

Set the background bar colour.

```js
skyline.backgroundBarColour('#dedede')
```

### Skyline#historyBarColour(historyBarColour:String)

Set the history bar colour.

```js
skyline.historyBarColour('#ababab')
```

### Skyline#axesFont(axesFont:String)

Set the axes font.

```js
skyline.axesFont('14px sans-serif')
```

### Skyline#frameRate(frameRate:Number)

Set the frame rate (fps).

```js
skyline.frameRate(30)
```

### Skyline#addHit

Add a hit to the graph.

```js
skyline.addHit()
```

### Skyline#start

Start the graph animation.

```js
skyline.start()
```
