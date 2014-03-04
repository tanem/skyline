
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-raf/index.js", Function("exports, require, module",
"/**\n\
 * Expose `requestAnimationFrame()`.\n\
 */\n\
\n\
exports = module.exports = window.requestAnimationFrame\n\
  || window.webkitRequestAnimationFrame\n\
  || window.mozRequestAnimationFrame\n\
  || window.oRequestAnimationFrame\n\
  || window.msRequestAnimationFrame\n\
  || fallback;\n\
\n\
/**\n\
 * Fallback implementation.\n\
 */\n\
\n\
var prev = new Date().getTime();\n\
function fallback(fn) {\n\
  var curr = new Date().getTime();\n\
  var ms = Math.max(0, 16 - (curr - prev));\n\
  var req = setTimeout(fn, ms);\n\
  prev = curr;\n\
  return req;\n\
}\n\
\n\
/**\n\
 * Cancel.\n\
 */\n\
\n\
var cancel = window.cancelAnimationFrame\n\
  || window.webkitCancelAnimationFrame\n\
  || window.mozCancelAnimationFrame\n\
  || window.oCancelAnimationFrame\n\
  || window.msCancelAnimationFrame\n\
  || window.clearTimeout;\n\
\n\
exports.cancel = function(id){\n\
  cancel.call(window, id);\n\
};\n\
//@ sourceURL=component-raf/index.js"
));
require.register("kenany-isinteger/index.js", Function("exports, require, module",
"/**\n\
 * Check if a Number is an integer\n\
 *\n\
 * @param {Number} x\n\
 * @return {Boolean} is integer\n\
 * @api public\n\
 */\n\
module.exports = function(x) {\n\
  return (x === Math.round(x));\n\
};//@ sourceURL=kenany-isinteger/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));

require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
  \n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-autoscale-canvas/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Retina-enable the given `canvas`.\n\
 *\n\
 * @param {Canvas} canvas\n\
 * @return {Canvas}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(canvas){\n\
  var ctx = canvas.getContext('2d');\n\
  var ratio = window.devicePixelRatio || 1;\n\
  if (1 != ratio) {\n\
    canvas.style.width = canvas.width + 'px';\n\
    canvas.style.height = canvas.height + 'px';\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx.scale(ratio, ratio);\n\
  }\n\
  return canvas;\n\
};//@ sourceURL=component-autoscale-canvas/index.js"
));
require.register("danzajdband-random/index.js", Function("exports, require, module",
"\n\
module.exports = function(min, max, truncate) {\n\
  min = min || 0;\n\
  max = max || min + 1;\n\
\n\
  if(truncate)\n\
    return Math.floor(Math.random() * (max - min + 1)) + min;\n\
  \n\
  return Math.random() * (max - min) + min;\n\
};\n\
//@ sourceURL=danzajdband-random/index.js"
));
require.register("visionmedia-mocha/mocha.js", Function("exports, require, module",
";(function(){\n\
\n\
// CommonJS require()\n\
\n\
function require(p){\n\
    var path = require.resolve(p)\n\
      , mod = require.modules[path];\n\
    if (!mod) throw new Error('failed to require \"' + p + '\"');\n\
    if (!mod.exports) {\n\
      mod.exports = {};\n\
      mod.call(mod.exports, mod, mod.exports, require.relative(path));\n\
    }\n\
    return mod.exports;\n\
  }\n\
\n\
require.modules = {};\n\
\n\
require.resolve = function (path){\n\
    var orig = path\n\
      , reg = path + '.js'\n\
      , index = path + '/index.js';\n\
    return require.modules[reg] && reg\n\
      || require.modules[index] && index\n\
      || orig;\n\
  };\n\
\n\
require.register = function (path, fn){\n\
    require.modules[path] = fn;\n\
  };\n\
\n\
require.relative = function (parent) {\n\
    return function(p){\n\
      if ('.' != p.charAt(0)) return require(p);\n\
\n\
      var path = parent.split('/')\n\
        , segs = p.split('/');\n\
      path.pop();\n\
\n\
      for (var i = 0; i < segs.length; i++) {\n\
        var seg = segs[i];\n\
        if ('..' == seg) path.pop();\n\
        else if ('.' != seg) path.push(seg);\n\
      }\n\
\n\
      return require(path.join('/'));\n\
    };\n\
  };\n\
\n\
\n\
require.register(\"browser/debug.js\", function(module, exports, require){\n\
\n\
module.exports = function(type){\n\
  return function(){\n\
  }\n\
};\n\
\n\
}); // module: browser/debug.js\n\
\n\
require.register(\"browser/diff.js\", function(module, exports, require){\n\
/* See LICENSE file for terms of use */\n\
\n\
/*\n\
 * Text diff implementation.\n\
 *\n\
 * This library supports the following APIS:\n\
 * JsDiff.diffChars: Character by character diff\n\
 * JsDiff.diffWords: Word (as defined by \\b regex) diff which ignores whitespace\n\
 * JsDiff.diffLines: Line based diff\n\
 *\n\
 * JsDiff.diffCss: Diff targeted at CSS content\n\
 *\n\
 * These methods are based on the implementation proposed in\n\
 * \"An O(ND) Difference Algorithm and its Variations\" (Myers, 1986).\n\
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927\n\
 */\n\
var JsDiff = (function() {\n\
  /*jshint maxparams: 5*/\n\
  function clonePath(path) {\n\
    return { newPos: path.newPos, components: path.components.slice(0) };\n\
  }\n\
  function removeEmpty(array) {\n\
    var ret = [];\n\
    for (var i = 0; i < array.length; i++) {\n\
      if (array[i]) {\n\
        ret.push(array[i]);\n\
      }\n\
    }\n\
    return ret;\n\
  }\n\
  function escapeHTML(s) {\n\
    var n = s;\n\
    n = n.replace(/&/g, '&amp;');\n\
    n = n.replace(/</g, '&lt;');\n\
    n = n.replace(/>/g, '&gt;');\n\
    n = n.replace(/\"/g, '&quot;');\n\
\n\
    return n;\n\
  }\n\
\n\
  var Diff = function(ignoreWhitespace) {\n\
    this.ignoreWhitespace = ignoreWhitespace;\n\
  };\n\
  Diff.prototype = {\n\
      diff: function(oldString, newString) {\n\
        // Handle the identity case (this is due to unrolling editLength == 0\n\
        if (newString === oldString) {\n\
          return [{ value: newString }];\n\
        }\n\
        if (!newString) {\n\
          return [{ value: oldString, removed: true }];\n\
        }\n\
        if (!oldString) {\n\
          return [{ value: newString, added: true }];\n\
        }\n\
\n\
        newString = this.tokenize(newString);\n\
        oldString = this.tokenize(oldString);\n\
\n\
        var newLen = newString.length, oldLen = oldString.length;\n\
        var maxEditLength = newLen + oldLen;\n\
        var bestPath = [{ newPos: -1, components: [] }];\n\
\n\
        // Seed editLength = 0\n\
        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);\n\
        if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {\n\
          return bestPath[0].components;\n\
        }\n\
\n\
        for (var editLength = 1; editLength <= maxEditLength; editLength++) {\n\
          for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {\n\
            var basePath;\n\
            var addPath = bestPath[diagonalPath-1],\n\
                removePath = bestPath[diagonalPath+1];\n\
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;\n\
            if (addPath) {\n\
              // No one else is going to attempt to use this value, clear it\n\
              bestPath[diagonalPath-1] = undefined;\n\
            }\n\
\n\
            var canAdd = addPath && addPath.newPos+1 < newLen;\n\
            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;\n\
            if (!canAdd && !canRemove) {\n\
              bestPath[diagonalPath] = undefined;\n\
              continue;\n\
            }\n\
\n\
            // Select the diagonal that we want to branch from. We select the prior\n\
            // path whose position in the new string is the farthest from the origin\n\
            // and does not pass the bounds of the diff graph\n\
            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {\n\
              basePath = clonePath(removePath);\n\
              this.pushComponent(basePath.components, oldString[oldPos], undefined, true);\n\
            } else {\n\
              basePath = clonePath(addPath);\n\
              basePath.newPos++;\n\
              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);\n\
            }\n\
\n\
            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);\n\
\n\
            if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {\n\
              return basePath.components;\n\
            } else {\n\
              bestPath[diagonalPath] = basePath;\n\
            }\n\
          }\n\
        }\n\
      },\n\
\n\
      pushComponent: function(components, value, added, removed) {\n\
        var last = components[components.length-1];\n\
        if (last && last.added === added && last.removed === removed) {\n\
          // We need to clone here as the component clone operation is just\n\
          // as shallow array clone\n\
          components[components.length-1] =\n\
            {value: this.join(last.value, value), added: added, removed: removed };\n\
        } else {\n\
          components.push({value: value, added: added, removed: removed });\n\
        }\n\
      },\n\
      extractCommon: function(basePath, newString, oldString, diagonalPath) {\n\
        var newLen = newString.length,\n\
            oldLen = oldString.length,\n\
            newPos = basePath.newPos,\n\
            oldPos = newPos - diagonalPath;\n\
        while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {\n\
          newPos++;\n\
          oldPos++;\n\
\n\
          this.pushComponent(basePath.components, newString[newPos], undefined, undefined);\n\
        }\n\
        basePath.newPos = newPos;\n\
        return oldPos;\n\
      },\n\
\n\
      equals: function(left, right) {\n\
        var reWhitespace = /\\S/;\n\
        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {\n\
          return true;\n\
        } else {\n\
          return left === right;\n\
        }\n\
      },\n\
      join: function(left, right) {\n\
        return left + right;\n\
      },\n\
      tokenize: function(value) {\n\
        return value;\n\
      }\n\
  };\n\
\n\
  var CharDiff = new Diff();\n\
\n\
  var WordDiff = new Diff(true);\n\
  var WordWithSpaceDiff = new Diff();\n\
  WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {\n\
    return removeEmpty(value.split(/(\\s+|\\b)/));\n\
  };\n\
\n\
  var CssDiff = new Diff(true);\n\
  CssDiff.tokenize = function(value) {\n\
    return removeEmpty(value.split(/([{}:;,]|\\s+)/));\n\
  };\n\
\n\
  var LineDiff = new Diff();\n\
  LineDiff.tokenize = function(value) {\n\
    return value.split(/^/m);\n\
  };\n\
\n\
  return {\n\
    Diff: Diff,\n\
\n\
    diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },\n\
    diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },\n\
    diffWordsWithSpace: function(oldStr, newStr) { return WordWithSpaceDiff.diff(oldStr, newStr); },\n\
    diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },\n\
\n\
    diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },\n\
\n\
    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {\n\
      var ret = [];\n\
\n\
      ret.push('Index: ' + fileName);\n\
      ret.push('===================================================================');\n\
      ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\\t' + oldHeader));\n\
      ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\\t' + newHeader));\n\
\n\
      var diff = LineDiff.diff(oldStr, newStr);\n\
      if (!diff[diff.length-1].value) {\n\
        diff.pop();   // Remove trailing newline add\n\
      }\n\
      diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier\n\
\n\
      function contextLines(lines) {\n\
        return lines.map(function(entry) { return ' ' + entry; });\n\
      }\n\
      function eofNL(curRange, i, current) {\n\
        var last = diff[diff.length-2],\n\
            isLast = i === diff.length-2,\n\
            isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);\n\
\n\
        // Figure out if this is the last line for the given file and missing NL\n\
        if (!/\\n\
$/.test(current.value) && (isLast || isLastOfType)) {\n\
          curRange.push('\\\\ No newline at end of file');\n\
        }\n\
      }\n\
\n\
      var oldRangeStart = 0, newRangeStart = 0, curRange = [],\n\
          oldLine = 1, newLine = 1;\n\
      for (var i = 0; i < diff.length; i++) {\n\
        var current = diff[i],\n\
            lines = current.lines || current.value.replace(/\\n\
$/, '').split('\\n\
');\n\
        current.lines = lines;\n\
\n\
        if (current.added || current.removed) {\n\
          if (!oldRangeStart) {\n\
            var prev = diff[i-1];\n\
            oldRangeStart = oldLine;\n\
            newRangeStart = newLine;\n\
\n\
            if (prev) {\n\
              curRange = contextLines(prev.lines.slice(-4));\n\
              oldRangeStart -= curRange.length;\n\
              newRangeStart -= curRange.length;\n\
            }\n\
          }\n\
          curRange.push.apply(curRange, lines.map(function(entry) { return (current.added?'+':'-') + entry; }));\n\
          eofNL(curRange, i, current);\n\
\n\
          if (current.added) {\n\
            newLine += lines.length;\n\
          } else {\n\
            oldLine += lines.length;\n\
          }\n\
        } else {\n\
          if (oldRangeStart) {\n\
            // Close out any changes that have been output (or join overlapping)\n\
            if (lines.length <= 8 && i < diff.length-2) {\n\
              // Overlapping\n\
              curRange.push.apply(curRange, contextLines(lines));\n\
            } else {\n\
              // end the range and output\n\
              var contextSize = Math.min(lines.length, 4);\n\
              ret.push(\n\
                  '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)\n\
                  + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)\n\
                  + ' @@');\n\
              ret.push.apply(ret, curRange);\n\
              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));\n\
              if (lines.length <= 4) {\n\
                eofNL(ret, i, current);\n\
              }\n\
\n\
              oldRangeStart = 0;  newRangeStart = 0; curRange = [];\n\
            }\n\
          }\n\
          oldLine += lines.length;\n\
          newLine += lines.length;\n\
        }\n\
      }\n\
\n\
      return ret.join('\\n\
') + '\\n\
';\n\
    },\n\
\n\
    applyPatch: function(oldStr, uniDiff) {\n\
      var diffstr = uniDiff.split('\\n\
');\n\
      var diff = [];\n\
      var remEOFNL = false,\n\
          addEOFNL = false;\n\
\n\
      for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {\n\
        if(diffstr[i][0] === '@') {\n\
          var meh = diffstr[i].split(/@@ -(\\d+),(\\d+) \\+(\\d+),(\\d+) @@/);\n\
          diff.unshift({\n\
            start:meh[3],\n\
            oldlength:meh[2],\n\
            oldlines:[],\n\
            newlength:meh[4],\n\
            newlines:[]\n\
          });\n\
        } else if(diffstr[i][0] === '+') {\n\
          diff[0].newlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === '-') {\n\
          diff[0].oldlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === ' ') {\n\
          diff[0].newlines.push(diffstr[i].substr(1));\n\
          diff[0].oldlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === '\\\\') {\n\
          if (diffstr[i-1][0] === '+') {\n\
            remEOFNL = true;\n\
          } else if(diffstr[i-1][0] === '-') {\n\
            addEOFNL = true;\n\
          }\n\
        }\n\
      }\n\
\n\
      var str = oldStr.split('\\n\
');\n\
      for (var i = diff.length - 1; i >= 0; i--) {\n\
        var d = diff[i];\n\
        for (var j = 0; j < d.oldlength; j++) {\n\
          if(str[d.start-1+j] !== d.oldlines[j]) {\n\
            return false;\n\
          }\n\
        }\n\
        Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));\n\
      }\n\
\n\
      if (remEOFNL) {\n\
        while (!str[str.length-1]) {\n\
          str.pop();\n\
        }\n\
      } else if (addEOFNL) {\n\
        str.push('');\n\
      }\n\
      return str.join('\\n\
');\n\
    },\n\
\n\
    convertChangesToXML: function(changes){\n\
      var ret = [];\n\
      for ( var i = 0; i < changes.length; i++) {\n\
        var change = changes[i];\n\
        if (change.added) {\n\
          ret.push('<ins>');\n\
        } else if (change.removed) {\n\
          ret.push('<del>');\n\
        }\n\
\n\
        ret.push(escapeHTML(change.value));\n\
\n\
        if (change.added) {\n\
          ret.push('</ins>');\n\
        } else if (change.removed) {\n\
          ret.push('</del>');\n\
        }\n\
      }\n\
      return ret.join('');\n\
    },\n\
\n\
    // See: http://code.google.com/p/google-diff-match-patch/wiki/API\n\
    convertChangesToDMP: function(changes){\n\
      var ret = [], change;\n\
      for ( var i = 0; i < changes.length; i++) {\n\
        change = changes[i];\n\
        ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);\n\
      }\n\
      return ret;\n\
    }\n\
  };\n\
})();\n\
\n\
if (typeof module !== 'undefined') {\n\
    module.exports = JsDiff;\n\
}\n\
\n\
}); // module: browser/diff.js\n\
\n\
require.register(\"browser/events.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
exports.EventEmitter = EventEmitter;\n\
\n\
/**\n\
 * Check if `obj` is an array.\n\
 */\n\
\n\
function isArray(obj) {\n\
  return '[object Array]' == {}.toString.call(obj);\n\
}\n\
\n\
/**\n\
 * Event emitter constructor.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function EventEmitter(){};\n\
\n\
/**\n\
 * Adds a listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.on = function (name, fn) {\n\
  if (!this.$events) {\n\
    this.$events = {};\n\
  }\n\
\n\
  if (!this.$events[name]) {\n\
    this.$events[name] = fn;\n\
  } else if (isArray(this.$events[name])) {\n\
    this.$events[name].push(fn);\n\
  } else {\n\
    this.$events[name] = [this.$events[name], fn];\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.addListener = EventEmitter.prototype.on;\n\
\n\
/**\n\
 * Adds a volatile listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.once = function (name, fn) {\n\
  var self = this;\n\
\n\
  function on () {\n\
    self.removeListener(name, on);\n\
    fn.apply(this, arguments);\n\
  };\n\
\n\
  on.listener = fn;\n\
  this.on(name, on);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Removes a listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.removeListener = function (name, fn) {\n\
  if (this.$events && this.$events[name]) {\n\
    var list = this.$events[name];\n\
\n\
    if (isArray(list)) {\n\
      var pos = -1;\n\
\n\
      for (var i = 0, l = list.length; i < l; i++) {\n\
        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {\n\
          pos = i;\n\
          break;\n\
        }\n\
      }\n\
\n\
      if (pos < 0) {\n\
        return this;\n\
      }\n\
\n\
      list.splice(pos, 1);\n\
\n\
      if (!list.length) {\n\
        delete this.$events[name];\n\
      }\n\
    } else if (list === fn || (list.listener && list.listener === fn)) {\n\
      delete this.$events[name];\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Removes all listeners for an event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.removeAllListeners = function (name) {\n\
  if (name === undefined) {\n\
    this.$events = {};\n\
    return this;\n\
  }\n\
\n\
  if (this.$events && this.$events[name]) {\n\
    this.$events[name] = null;\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Gets all listeners for a certain event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.listeners = function (name) {\n\
  if (!this.$events) {\n\
    this.$events = {};\n\
  }\n\
\n\
  if (!this.$events[name]) {\n\
    this.$events[name] = [];\n\
  }\n\
\n\
  if (!isArray(this.$events[name])) {\n\
    this.$events[name] = [this.$events[name]];\n\
  }\n\
\n\
  return this.$events[name];\n\
};\n\
\n\
/**\n\
 * Emits an event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.emit = function (name) {\n\
  if (!this.$events) {\n\
    return false;\n\
  }\n\
\n\
  var handler = this.$events[name];\n\
\n\
  if (!handler) {\n\
    return false;\n\
  }\n\
\n\
  var args = [].slice.call(arguments, 1);\n\
\n\
  if ('function' == typeof handler) {\n\
    handler.apply(this, args);\n\
  } else if (isArray(handler)) {\n\
    var listeners = handler.slice();\n\
\n\
    for (var i = 0, l = listeners.length; i < l; i++) {\n\
      listeners[i].apply(this, args);\n\
    }\n\
  } else {\n\
    return false;\n\
  }\n\
\n\
  return true;\n\
};\n\
}); // module: browser/events.js\n\
\n\
require.register(\"browser/fs.js\", function(module, exports, require){\n\
\n\
}); // module: browser/fs.js\n\
\n\
require.register(\"browser/path.js\", function(module, exports, require){\n\
\n\
}); // module: browser/path.js\n\
\n\
require.register(\"browser/progress.js\", function(module, exports, require){\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
module.exports = Progress;\n\
\n\
/**\n\
 * Initialize a new `Progress` indicator.\n\
 */\n\
\n\
function Progress() {\n\
  this.percent = 0;\n\
  this.size(0);\n\
  this.fontSize(11);\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Set progress size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.size = function(n){\n\
  this._size = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.text = function(str){\n\
  this._text = str;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.fontSize = function(n){\n\
  this._fontSize = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font `family`.\n\
 *\n\
 * @param {String} family\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.font = function(family){\n\
  this._font = family;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.update = function(n){\n\
  this.percent = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.draw = function(ctx){\n\
  try {\n\
    var percent = Math.min(this.percent, 100)\n\
      , size = this._size\n\
      , half = size / 2\n\
      , x = half\n\
      , y = half\n\
      , rad = half - 1\n\
      , fontSize = this._fontSize;\n\
  \n\
    ctx.font = fontSize + 'px ' + this._font;\n\
  \n\
    var angle = Math.PI * 2 * (percent / 100);\n\
    ctx.clearRect(0, 0, size, size);\n\
  \n\
    // outer circle\n\
    ctx.strokeStyle = '#9f9f9f';\n\
    ctx.beginPath();\n\
    ctx.arc(x, y, rad, 0, angle, false);\n\
    ctx.stroke();\n\
  \n\
    // inner circle\n\
    ctx.strokeStyle = '#eee';\n\
    ctx.beginPath();\n\
    ctx.arc(x, y, rad - 1, 0, angle, true);\n\
    ctx.stroke();\n\
  \n\
    // text\n\
    var text = this._text || (percent | 0) + '%'\n\
      , w = ctx.measureText(text).width;\n\
  \n\
    ctx.fillText(\n\
        text\n\
      , x - w / 2 + 1\n\
      , y + fontSize / 2 - 1);\n\
  } catch (ex) {} //don't fail if we can't render progress\n\
  return this;\n\
};\n\
\n\
}); // module: browser/progress.js\n\
\n\
require.register(\"browser/tty.js\", function(module, exports, require){\n\
\n\
exports.isatty = function(){\n\
  return true;\n\
};\n\
\n\
exports.getWindowSize = function(){\n\
  if ('innerHeight' in global) {\n\
    return [global.innerHeight, global.innerWidth];\n\
  } else {\n\
    // In a Web Worker, the DOM Window is not available.\n\
    return [640, 480];\n\
  }\n\
};\n\
\n\
}); // module: browser/tty.js\n\
\n\
require.register(\"context.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Expose `Context`.\n\
 */\n\
\n\
module.exports = Context;\n\
\n\
/**\n\
 * Initialize a new `Context`.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Context(){}\n\
\n\
/**\n\
 * Set or get the context `Runnable` to `runnable`.\n\
 *\n\
 * @param {Runnable} runnable\n\
 * @return {Context}\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.runnable = function(runnable){\n\
  if (0 == arguments.length) return this._runnable;\n\
  this.test = this._runnable = runnable;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test timeout `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Context} self\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.timeout = function(ms){\n\
  this.runnable().timeout(ms);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test slowness threshold `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Context} self\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.slow = function(ms){\n\
  this.runnable().slow(ms);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Inspect the context void of `._runnable`.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.inspect = function(){\n\
  return JSON.stringify(this, function(key, val){\n\
    if ('_runnable' == key) return;\n\
    if ('test' == key) return;\n\
    return val;\n\
  }, 2);\n\
};\n\
\n\
}); // module: context.js\n\
\n\
require.register(\"hook.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Runnable = require('./runnable');\n\
\n\
/**\n\
 * Expose `Hook`.\n\
 */\n\
\n\
module.exports = Hook;\n\
\n\
/**\n\
 * Initialize a new `Hook` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Hook(title, fn) {\n\
  Runnable.call(this, title, fn);\n\
  this.type = 'hook';\n\
}\n\
\n\
/**\n\
 * Inherit from `Runnable.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Runnable.prototype;\n\
Hook.prototype = new F;\n\
Hook.prototype.constructor = Hook;\n\
\n\
\n\
/**\n\
 * Get or set the test `err`.\n\
 *\n\
 * @param {Error} err\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Hook.prototype.error = function(err){\n\
  if (0 == arguments.length) {\n\
    var err = this._error;\n\
    this._error = null;\n\
    return err;\n\
  }\n\
\n\
  this._error = err;\n\
};\n\
\n\
}); // module: hook.js\n\
\n\
require.register(\"interfaces/bdd.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * BDD-style interface:\n\
 *\n\
 *      describe('Array', function(){\n\
 *        describe('#indexOf()', function(){\n\
 *          it('should return -1 when not present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          it('should return the index when present', function(){\n\
 *\n\
 *          });\n\
 *        });\n\
 *      });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before running tests.\n\
     */\n\
\n\
    context.before = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after running tests.\n\
     */\n\
\n\
    context.after = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.beforeEach = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.afterEach = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`\n\
     * and callback `fn` containing nested suites\n\
     * and/or tests.\n\
     */\n\
\n\
    context.describe = context.context = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Pending describe.\n\
     */\n\
\n\
    context.xdescribe =\n\
    context.xcontext =\n\
    context.describe.skip = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suite.pending = true;\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
    };\n\
\n\
    /**\n\
     * Exclusive suite.\n\
     */\n\
\n\
    context.describe.only = function(title, fn){\n\
      var suite = context.describe(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.it = context.specify = function(title, fn){\n\
      var suite = suites[0];\n\
      if (suite.pending) var fn = null;\n\
      var test = new Test(title, fn);\n\
      suite.addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.it.only = function(title, fn){\n\
      var test = context.it(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.xit =\n\
    context.xspecify =\n\
    context.it.skip = function(title){\n\
      context.it(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/bdd.js\n\
\n\
require.register(\"interfaces/exports.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test');\n\
\n\
/**\n\
 * TDD-style interface:\n\
 *\n\
 *     exports.Array = {\n\
 *       '#indexOf()': {\n\
 *         'should return -1 when the value is not present': function(){\n\
 *\n\
 *         },\n\
 *\n\
 *         'should return the correct index when the value is present': function(){\n\
 *\n\
 *         }\n\
 *       }\n\
 *     };\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('require', visit);\n\
\n\
  function visit(obj) {\n\
    var suite;\n\
    for (var key in obj) {\n\
      if ('function' == typeof obj[key]) {\n\
        var fn = obj[key];\n\
        switch (key) {\n\
          case 'before':\n\
            suites[0].beforeAll(fn);\n\
            break;\n\
          case 'after':\n\
            suites[0].afterAll(fn);\n\
            break;\n\
          case 'beforeEach':\n\
            suites[0].beforeEach(fn);\n\
            break;\n\
          case 'afterEach':\n\
            suites[0].afterEach(fn);\n\
            break;\n\
          default:\n\
            suites[0].addTest(new Test(key, fn));\n\
        }\n\
      } else {\n\
        var suite = Suite.create(suites[0], key);\n\
        suites.unshift(suite);\n\
        visit(obj[key]);\n\
        suites.shift();\n\
      }\n\
    }\n\
  }\n\
};\n\
\n\
}); // module: interfaces/exports.js\n\
\n\
require.register(\"interfaces/index.js\", function(module, exports, require){\n\
\n\
exports.bdd = require('./bdd');\n\
exports.tdd = require('./tdd');\n\
exports.qunit = require('./qunit');\n\
exports.exports = require('./exports');\n\
\n\
}); // module: interfaces/index.js\n\
\n\
require.register(\"interfaces/qunit.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * QUnit-style interface:\n\
 *\n\
 *     suite('Array');\n\
 *\n\
 *     test('#length', function(){\n\
 *       var arr = [1,2,3];\n\
 *       ok(arr.length == 3);\n\
 *     });\n\
 *\n\
 *     test('#indexOf()', function(){\n\
 *       var arr = [1,2,3];\n\
 *       ok(arr.indexOf(1) == 0);\n\
 *       ok(arr.indexOf(2) == 1);\n\
 *       ok(arr.indexOf(3) == 2);\n\
 *     });\n\
 *\n\
 *     suite('String');\n\
 *\n\
 *     test('#length', function(){\n\
 *       ok('foo'.length == 3);\n\
 *     });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before running tests.\n\
     */\n\
\n\
    context.before = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after running tests.\n\
     */\n\
\n\
    context.after = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.beforeEach = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.afterEach = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`.\n\
     */\n\
\n\
    context.suite = function(title){\n\
      if (suites.length > 1) suites.shift();\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.suite.only = function(title, fn){\n\
      var suite = context.suite(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.test = function(title, fn){\n\
      var test = new Test(title, fn);\n\
      suites[0].addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.test.only = function(title, fn){\n\
      var test = context.test(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.test.skip = function(title){\n\
      context.test(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/qunit.js\n\
\n\
require.register(\"interfaces/tdd.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');;\n\
\n\
/**\n\
 * TDD-style interface:\n\
 *\n\
 *      suite('Array', function(){\n\
 *        suite('#indexOf()', function(){\n\
 *          suiteSetup(function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          test('should return -1 when not present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          test('should return the index when present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          suiteTeardown(function(){\n\
 *\n\
 *          });\n\
 *        });\n\
 *      });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.setup = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.teardown = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before the suite.\n\
     */\n\
\n\
    context.suiteSetup = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after the suite.\n\
     */\n\
\n\
    context.suiteTeardown = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`\n\
     * and callback `fn` containing nested suites\n\
     * and/or tests.\n\
     */\n\
\n\
    context.suite = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Pending suite.\n\
     */\n\
    context.suite.skip = function(title, fn) {\n\
      var suite = Suite.create(suites[0], title);\n\
      suite.pending = true;\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.suite.only = function(title, fn){\n\
      var suite = context.suite(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.test = function(title, fn){\n\
      var suite = suites[0];\n\
      if (suite.pending) var fn = null;\n\
      var test = new Test(title, fn);\n\
      suite.addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.test.only = function(title, fn){\n\
      var test = context.test(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.test.skip = function(title){\n\
      context.test(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/tdd.js\n\
\n\
require.register(\"mocha.js\", function(module, exports, require){\n\
/*!\n\
 * mocha\n\
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var path = require('browser/path')\n\
  , utils = require('./utils');\n\
\n\
/**\n\
 * Expose `Mocha`.\n\
 */\n\
\n\
exports = module.exports = Mocha;\n\
\n\
/**\n\
 * Expose internals.\n\
 */\n\
\n\
exports.utils = utils;\n\
exports.interfaces = require('./interfaces');\n\
exports.reporters = require('./reporters');\n\
exports.Runnable = require('./runnable');\n\
exports.Context = require('./context');\n\
exports.Runner = require('./runner');\n\
exports.Suite = require('./suite');\n\
exports.Hook = require('./hook');\n\
exports.Test = require('./test');\n\
\n\
/**\n\
 * Return image `name` path.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function image(name) {\n\
  return __dirname + '/../images/' + name + '.png';\n\
}\n\
\n\
/**\n\
 * Setup mocha with `options`.\n\
 *\n\
 * Options:\n\
 *\n\
 *   - `ui` name \"bdd\", \"tdd\", \"exports\" etc\n\
 *   - `reporter` reporter instance, defaults to `mocha.reporters.Dot`\n\
 *   - `globals` array of accepted globals\n\
 *   - `timeout` timeout in milliseconds\n\
 *   - `bail` bail on the first test failure\n\
 *   - `slow` milliseconds to wait before considering a test slow\n\
 *   - `ignoreLeaks` ignore global leaks\n\
 *   - `grep` string or regexp to filter tests with\n\
 *\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Mocha(options) {\n\
  options = options || {};\n\
  this.files = [];\n\
  this.options = options;\n\
  this.grep(options.grep);\n\
  this.suite = new exports.Suite('', new exports.Context);\n\
  this.ui(options.ui);\n\
  this.bail(options.bail);\n\
  this.reporter(options.reporter);\n\
  if (null != options.timeout) this.timeout(options.timeout);\n\
  this.useColors(options.useColors)\n\
  if (options.slow) this.slow(options.slow);\n\
\n\
  this.suite.on('pre-require', function (context) {\n\
    exports.afterEach = context.afterEach || context.teardown;\n\
    exports.after = context.after || context.suiteTeardown;\n\
    exports.beforeEach = context.beforeEach || context.setup;\n\
    exports.before = context.before || context.suiteSetup;\n\
    exports.describe = context.describe || context.suite;\n\
    exports.it = context.it || context.test;\n\
    exports.setup = context.setup || context.beforeEach;\n\
    exports.suiteSetup = context.suiteSetup || context.before;\n\
    exports.suiteTeardown = context.suiteTeardown || context.after;\n\
    exports.suite = context.suite || context.describe;\n\
    exports.teardown = context.teardown || context.afterEach;\n\
    exports.test = context.test || context.it;\n\
  });\n\
}\n\
\n\
/**\n\
 * Enable or disable bailing on the first failure.\n\
 *\n\
 * @param {Boolean} [bail]\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.bail = function(bail){\n\
  if (0 == arguments.length) bail = true;\n\
  this.suite.bail(bail);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add test `file`.\n\
 *\n\
 * @param {String} file\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.addFile = function(file){\n\
  this.files.push(file);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set reporter to `reporter`, defaults to \"dot\".\n\
 *\n\
 * @param {String|Function} reporter name or constructor\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.reporter = function(reporter){\n\
  if ('function' == typeof reporter) {\n\
    this._reporter = reporter;\n\
  } else {\n\
    reporter = reporter || 'dot';\n\
    var _reporter;\n\
    try { _reporter = require('./reporters/' + reporter); } catch (err) {};\n\
    if (!_reporter) try { _reporter = require(reporter); } catch (err) {};\n\
    if (!_reporter && reporter === 'teamcity')\n\
      console.warn('The Teamcity reporter was moved to a package named ' +\n\
        'mocha-teamcity-reporter ' +\n\
        '(https://npmjs.org/package/mocha-teamcity-reporter).');\n\
    if (!_reporter) throw new Error('invalid reporter \"' + reporter + '\"');\n\
    this._reporter = _reporter;\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test UI `name`, defaults to \"bdd\".\n\
 *\n\
 * @param {String} bdd\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.ui = function(name){\n\
  name = name || 'bdd';\n\
  this._ui = exports.interfaces[name];\n\
  if (!this._ui) try { this._ui = require(name); } catch (err) {};\n\
  if (!this._ui) throw new Error('invalid interface \"' + name + '\"');\n\
  this._ui = this._ui(this.suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Load registered files.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Mocha.prototype.loadFiles = function(fn){\n\
  var self = this;\n\
  var suite = this.suite;\n\
  var pending = this.files.length;\n\
  this.files.forEach(function(file){\n\
    file = path.resolve(file);\n\
    suite.emit('pre-require', global, file, self);\n\
    suite.emit('require', require(file), file, self);\n\
    suite.emit('post-require', global, file, self);\n\
    --pending || (fn && fn());\n\
  });\n\
};\n\
\n\
/**\n\
 * Enable growl support.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Mocha.prototype._growl = function(runner, reporter) {\n\
  var notify = require('growl');\n\
\n\
  runner.on('end', function(){\n\
    var stats = reporter.stats;\n\
    if (stats.failures) {\n\
      var msg = stats.failures + ' of ' + runner.total + ' tests failed';\n\
      notify(msg, { name: 'mocha', title: 'Failed', image: image('error') });\n\
    } else {\n\
      notify(stats.passes + ' tests passed in ' + stats.duration + 'ms', {\n\
          name: 'mocha'\n\
        , title: 'Passed'\n\
        , image: image('ok')\n\
      });\n\
    }\n\
  });\n\
};\n\
\n\
/**\n\
 * Add regexp to grep, if `re` is a string it is escaped.\n\
 *\n\
 * @param {RegExp|String} re\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.grep = function(re){\n\
  this.options.grep = 'string' == typeof re\n\
    ? new RegExp(utils.escapeRegexp(re))\n\
    : re;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invert `.grep()` matches.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.invert = function(){\n\
  this.options.invert = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Ignore global leaks.\n\
 *\n\
 * @param {Boolean} ignore\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.ignoreLeaks = function(ignore){\n\
  this.options.ignoreLeaks = !!ignore;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable global leak checking.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.checkLeaks = function(){\n\
  this.options.ignoreLeaks = false;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable growl support.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.growl = function(){\n\
  this.options.growl = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Ignore `globals` array or string.\n\
 *\n\
 * @param {Array|String} globals\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.globals = function(globals){\n\
  this.options.globals = (this.options.globals || []).concat(globals);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit color output.\n\
 *\n\
 * @param {Boolean} colors\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.useColors = function(colors){\n\
  this.options.useColors = arguments.length && colors != undefined\n\
    ? colors\n\
    : true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Use inline diffs rather than +/-.\n\
 *\n\
 * @param {Boolean} inlineDiffs\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.useInlineDiffs = function(inlineDiffs) {\n\
  this.options.useInlineDiffs = arguments.length && inlineDiffs != undefined\n\
  ? inlineDiffs\n\
  : false;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the timeout in milliseconds.\n\
 *\n\
 * @param {Number} timeout\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.timeout = function(timeout){\n\
  this.suite.timeout(timeout);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set slowness threshold in milliseconds.\n\
 *\n\
 * @param {Number} slow\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.slow = function(slow){\n\
  this.suite.slow(slow);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Makes all tests async (accepting a callback)\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.asyncOnly = function(){\n\
  this.options.asyncOnly = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run tests and invoke `fn()` when complete.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Runner}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.run = function(fn){\n\
  if (this.files.length) this.loadFiles();\n\
  var suite = this.suite;\n\
  var options = this.options;\n\
  var runner = new exports.Runner(suite);\n\
  var reporter = new this._reporter(runner);\n\
  runner.ignoreLeaks = false !== options.ignoreLeaks;\n\
  runner.asyncOnly = options.asyncOnly;\n\
  if (options.grep) runner.grep(options.grep, options.invert);\n\
  if (options.globals) runner.globals(options.globals);\n\
  if (options.growl) this._growl(runner, reporter);\n\
  exports.reporters.Base.useColors = options.useColors;\n\
  exports.reporters.Base.inlineDiffs = options.useInlineDiffs;\n\
  return runner.run(fn);\n\
};\n\
\n\
}); // module: mocha.js\n\
\n\
require.register(\"ms.js\", function(module, exports, require){\n\
/**\n\
 * Helpers.\n\
 */\n\
\n\
var s = 1000;\n\
var m = s * 60;\n\
var h = m * 60;\n\
var d = h * 24;\n\
var y = d * 365.25;\n\
\n\
/**\n\
 * Parse or format the given `val`.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `long` verbose formatting [false]\n\
 *\n\
 * @param {String|Number} val\n\
 * @param {Object} options\n\
 * @return {String|Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val, options){\n\
  options = options || {};\n\
  if ('string' == typeof val) return parse(val);\n\
  return options.long ? longFormat(val) : shortFormat(val);\n\
};\n\
\n\
/**\n\
 * Parse the given `str` and return milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  var match = /^((?:\\d+)?\\.?\\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);\n\
  if (!match) return;\n\
  var n = parseFloat(match[1]);\n\
  var type = (match[2] || 'ms').toLowerCase();\n\
  switch (type) {\n\
    case 'years':\n\
    case 'year':\n\
    case 'y':\n\
      return n * y;\n\
    case 'days':\n\
    case 'day':\n\
    case 'd':\n\
      return n * d;\n\
    case 'hours':\n\
    case 'hour':\n\
    case 'h':\n\
      return n * h;\n\
    case 'minutes':\n\
    case 'minute':\n\
    case 'm':\n\
      return n * m;\n\
    case 'seconds':\n\
    case 'second':\n\
    case 's':\n\
      return n * s;\n\
    case 'ms':\n\
      return n;\n\
  }\n\
}\n\
\n\
/**\n\
 * Short format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function shortFormat(ms) {\n\
  if (ms >= d) return Math.round(ms / d) + 'd';\n\
  if (ms >= h) return Math.round(ms / h) + 'h';\n\
  if (ms >= m) return Math.round(ms / m) + 'm';\n\
  if (ms >= s) return Math.round(ms / s) + 's';\n\
  return ms + 'ms';\n\
}\n\
\n\
/**\n\
 * Long format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function longFormat(ms) {\n\
  return plural(ms, d, 'day')\n\
    || plural(ms, h, 'hour')\n\
    || plural(ms, m, 'minute')\n\
    || plural(ms, s, 'second')\n\
    || ms + ' ms';\n\
}\n\
\n\
/**\n\
 * Pluralization helper.\n\
 */\n\
\n\
function plural(ms, n, name) {\n\
  if (ms < n) return;\n\
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;\n\
  return Math.ceil(ms / n) + ' ' + name + 's';\n\
}\n\
\n\
}); // module: ms.js\n\
\n\
require.register(\"reporters/base.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var tty = require('browser/tty')\n\
  , diff = require('browser/diff')\n\
  , ms = require('../ms')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Check if both stdio streams are associated with a tty.\n\
 */\n\
\n\
var isatty = tty.isatty(1) && tty.isatty(2);\n\
\n\
/**\n\
 * Expose `Base`.\n\
 */\n\
\n\
exports = module.exports = Base;\n\
\n\
/**\n\
 * Enable coloring by default.\n\
 */\n\
\n\
exports.useColors = isatty || (process.env.MOCHA_COLORS !== undefined);\n\
\n\
/**\n\
 * Inline diffs instead of +/-\n\
 */\n\
\n\
exports.inlineDiffs = false;\n\
\n\
/**\n\
 * Default color map.\n\
 */\n\
\n\
exports.colors = {\n\
    'pass': 90\n\
  , 'fail': 31\n\
  , 'bright pass': 92\n\
  , 'bright fail': 91\n\
  , 'bright yellow': 93\n\
  , 'pending': 36\n\
  , 'suite': 0\n\
  , 'error title': 0\n\
  , 'error message': 31\n\
  , 'error stack': 90\n\
  , 'checkmark': 32\n\
  , 'fast': 90\n\
  , 'medium': 33\n\
  , 'slow': 31\n\
  , 'green': 32\n\
  , 'light': 90\n\
  , 'diff gutter': 90\n\
  , 'diff added': 42\n\
  , 'diff removed': 41\n\
};\n\
\n\
/**\n\
 * Default symbol map.\n\
 */\n\
\n\
exports.symbols = {\n\
  ok: '✓',\n\
  err: '✖',\n\
  dot: '․'\n\
};\n\
\n\
// With node.js on Windows: use symbols available in terminal default fonts\n\
if ('win32' == process.platform) {\n\
  exports.symbols.ok = '\\u221A';\n\
  exports.symbols.err = '\\u00D7';\n\
  exports.symbols.dot = '.';\n\
}\n\
\n\
/**\n\
 * Color `str` with the given `type`,\n\
 * allowing colors to be disabled,\n\
 * as well as user-defined color\n\
 * schemes.\n\
 *\n\
 * @param {String} type\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var color = exports.color = function(type, str) {\n\
  if (!exports.useColors) return str;\n\
  return '\\u001b[' + exports.colors[type] + 'm' + str + '\\u001b[0m';\n\
};\n\
\n\
/**\n\
 * Expose term window size, with some\n\
 * defaults for when stderr is not a tty.\n\
 */\n\
\n\
exports.window = {\n\
  width: isatty\n\
    ? process.stdout.getWindowSize\n\
      ? process.stdout.getWindowSize(1)[0]\n\
      : tty.getWindowSize()[1]\n\
    : 75\n\
};\n\
\n\
/**\n\
 * Expose some basic cursor interactions\n\
 * that are common among reporters.\n\
 */\n\
\n\
exports.cursor = {\n\
  hide: function(){\n\
    isatty && process.stdout.write('\\u001b[?25l');\n\
  },\n\
\n\
  show: function(){\n\
    isatty && process.stdout.write('\\u001b[?25h');\n\
  },\n\
\n\
  deleteLine: function(){\n\
    isatty && process.stdout.write('\\u001b[2K');\n\
  },\n\
\n\
  beginningOfLine: function(){\n\
    isatty && process.stdout.write('\\u001b[0G');\n\
  },\n\
\n\
  CR: function(){\n\
    if (isatty) {\n\
      exports.cursor.deleteLine();\n\
      exports.cursor.beginningOfLine();\n\
    } else {\n\
      process.stdout.write('\\r');\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Outut the given `failures` as a list.\n\
 *\n\
 * @param {Array} failures\n\
 * @api public\n\
 */\n\
\n\
exports.list = function(failures){\n\
  console.error();\n\
  failures.forEach(function(test, i){\n\
    // format\n\
    var fmt = color('error title', '  %s) %s:\\n\
')\n\
      + color('error message', '     %s')\n\
      + color('error stack', '\\n\
%s\\n\
');\n\
\n\
    // msg\n\
    var err = test.err\n\
      , message = err.message || ''\n\
      , stack = err.stack || message\n\
      , index = stack.indexOf(message) + message.length\n\
      , msg = stack.slice(0, index)\n\
      , actual = err.actual\n\
      , expected = err.expected\n\
      , escape = true;\n\
\n\
    // uncaught\n\
    if (err.uncaught) {\n\
      msg = 'Uncaught ' + msg;\n\
    }\n\
\n\
    // explicitly show diff\n\
    if (err.showDiff && sameType(actual, expected)) {\n\
      escape = false;\n\
      err.actual = actual = stringify(canonicalize(actual));\n\
      err.expected = expected = stringify(canonicalize(expected));\n\
    }\n\
\n\
    // actual / expected diff\n\
    if ('string' == typeof actual && 'string' == typeof expected) {\n\
      fmt = color('error title', '  %s) %s:\\n\
%s') + color('error stack', '\\n\
%s\\n\
');\n\
      var match = message.match(/^([^:]+): expected/);\n\
      msg = '\\n\
      ' + color('error message', match ? match[1] : msg);\n\
\n\
      if (exports.inlineDiffs) {\n\
        msg += inlineDiff(err, escape);\n\
      } else {\n\
        msg += unifiedDiff(err, escape);\n\
      }\n\
    }\n\
\n\
    // indent stack trace without msg\n\
    stack = stack.slice(index ? index + 1 : index)\n\
      .replace(/^/gm, '  ');\n\
\n\
    console.error(fmt, (i + 1), test.fullTitle(), msg, stack);\n\
  });\n\
};\n\
\n\
/**\n\
 * Initialize a new `Base` reporter.\n\
 *\n\
 * All other reporters generally\n\
 * inherit from this reporter, providing\n\
 * stats such as test duration, number\n\
 * of tests passed / failed etc.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Base(runner) {\n\
  var self = this\n\
    , stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }\n\
    , failures = this.failures = [];\n\
\n\
  if (!runner) return;\n\
  this.runner = runner;\n\
\n\
  runner.stats = stats;\n\
\n\
  runner.on('start', function(){\n\
    stats.start = new Date;\n\
  });\n\
\n\
  runner.on('suite', function(suite){\n\
    stats.suites = stats.suites || 0;\n\
    suite.root || stats.suites++;\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    stats.tests = stats.tests || 0;\n\
    stats.tests++;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    stats.passes = stats.passes || 0;\n\
\n\
    var medium = test.slow() / 2;\n\
    test.speed = test.duration > test.slow()\n\
      ? 'slow'\n\
      : test.duration > medium\n\
        ? 'medium'\n\
        : 'fast';\n\
\n\
    stats.passes++;\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    stats.failures = stats.failures || 0;\n\
    stats.failures++;\n\
    test.err = err;\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    stats.end = new Date;\n\
    stats.duration = new Date - stats.start;\n\
  });\n\
\n\
  runner.on('pending', function(){\n\
    stats.pending++;\n\
  });\n\
}\n\
\n\
/**\n\
 * Output common epilogue used by many of\n\
 * the bundled reporters.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Base.prototype.epilogue = function(){\n\
  var stats = this.stats;\n\
  var tests;\n\
  var fmt;\n\
\n\
  console.log();\n\
\n\
  // passes\n\
  fmt = color('bright pass', ' ')\n\
    + color('green', ' %d passing')\n\
    + color('light', ' (%s)');\n\
\n\
  console.log(fmt,\n\
    stats.passes || 0,\n\
    ms(stats.duration));\n\
\n\
  // pending\n\
  if (stats.pending) {\n\
    fmt = color('pending', ' ')\n\
      + color('pending', ' %d pending');\n\
\n\
    console.log(fmt, stats.pending);\n\
  }\n\
\n\
  // failures\n\
  if (stats.failures) {\n\
    fmt = color('fail', '  %d failing');\n\
\n\
    console.error(fmt,\n\
      stats.failures);\n\
\n\
    Base.list(this.failures);\n\
    console.error();\n\
  }\n\
\n\
  console.log();\n\
};\n\
\n\
/**\n\
 * Pad the given `str` to `len`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String} len\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function pad(str, len) {\n\
  str = String(str);\n\
  return Array(len - str.length + 1).join(' ') + str;\n\
}\n\
\n\
\n\
/**\n\
 * Returns an inline diff between 2 strings with coloured ANSI output\n\
 *\n\
 * @param {Error} Error with actual/expected\n\
 * @return {String} Diff\n\
 * @api private\n\
 */\n\
\n\
function inlineDiff(err, escape) {\n\
  var msg = errorDiff(err, 'WordsWithSpace', escape);\n\
\n\
  // linenos\n\
  var lines = msg.split('\\n\
');\n\
  if (lines.length > 4) {\n\
    var width = String(lines.length).length;\n\
    msg = lines.map(function(str, i){\n\
      return pad(++i, width) + ' |' + ' ' + str;\n\
    }).join('\\n\
');\n\
  }\n\
\n\
  // legend\n\
  msg = '\\n\
'\n\
    + color('diff removed', 'actual')\n\
    + ' '\n\
    + color('diff added', 'expected')\n\
    + '\\n\
\\n\
'\n\
    + msg\n\
    + '\\n\
';\n\
\n\
  // indent\n\
  msg = msg.replace(/^/gm, '      ');\n\
  return msg;\n\
}\n\
\n\
/**\n\
 * Returns a unified diff between 2 strings\n\
 *\n\
 * @param {Error} Error with actual/expected\n\
 * @return {String} Diff\n\
 * @api private\n\
 */\n\
\n\
function unifiedDiff(err, escape) {\n\
  var indent = '      ';\n\
  function cleanUp(line) {\n\
    if (escape) {\n\
      line = escapeInvisibles(line);\n\
    }\n\
    if (line[0] === '+') return indent + colorLines('diff added', line);\n\
    if (line[0] === '-') return indent + colorLines('diff removed', line);\n\
    if (line.match(/\\@\\@/)) return null;\n\
    if (line.match(/\\\\ No newline/)) return null;\n\
    else return indent + line;\n\
  }\n\
  function notBlank(line) {\n\
    return line != null;\n\
  }\n\
  msg = diff.createPatch('string', err.actual, err.expected);\n\
  var lines = msg.split('\\n\
').splice(4);\n\
  return '\\n\
      '\n\
         + colorLines('diff added',   '+ expected') + ' '\n\
         + colorLines('diff removed', '- actual')\n\
         + '\\n\
\\n\
'\n\
         + lines.map(cleanUp).filter(notBlank).join('\\n\
');\n\
}\n\
\n\
/**\n\
 * Return a character diff for `err`.\n\
 *\n\
 * @param {Error} err\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function errorDiff(err, type, escape) {\n\
  var actual   = escape ? escapeInvisibles(err.actual)   : err.actual;\n\
  var expected = escape ? escapeInvisibles(err.expected) : err.expected;\n\
  return diff['diff' + type](actual, expected).map(function(str){\n\
    if (str.added) return colorLines('diff added', str.value);\n\
    if (str.removed) return colorLines('diff removed', str.value);\n\
    return str.value;\n\
  }).join('');\n\
}\n\
\n\
/**\n\
 * Returns a string with all invisible characters in plain text\n\
 *\n\
 * @param {String} line\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
function escapeInvisibles(line) {\n\
    return line.replace(/\\t/g, '<tab>')\n\
               .replace(/\\r/g, '<CR>')\n\
               .replace(/\\n\
/g, '<LF>\\n\
');\n\
}\n\
\n\
/**\n\
 * Color lines for `str`, using the color `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function colorLines(name, str) {\n\
  return str.split('\\n\
').map(function(str){\n\
    return color(name, str);\n\
  }).join('\\n\
');\n\
}\n\
\n\
/**\n\
 * Stringify `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function stringify(obj) {\n\
  if (obj instanceof RegExp) return obj.toString();\n\
  return JSON.stringify(obj, null, 2);\n\
}\n\
\n\
/**\n\
 * Return a new object that has the keys in sorted order.\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
 function canonicalize(obj, stack) {\n\
   stack = stack || [];\n\
\n\
   if (utils.indexOf(stack, obj) !== -1) return obj;\n\
\n\
   var canonicalizedObj;\n\
\n\
   if ('[object Array]' == {}.toString.call(obj)) {\n\
     stack.push(obj);\n\
     canonicalizedObj = utils.map(obj, function(item) {\n\
       return canonicalize(item, stack);\n\
     });\n\
     stack.pop();\n\
   } else if (typeof obj === 'object' && obj !== null) {\n\
     stack.push(obj);\n\
     canonicalizedObj = {};\n\
     utils.forEach(utils.keys(obj).sort(), function(key) {\n\
       canonicalizedObj[key] = canonicalize(obj[key], stack);\n\
     });\n\
     stack.pop();\n\
   } else {\n\
     canonicalizedObj = obj;\n\
   }\n\
\n\
   return canonicalizedObj;\n\
 }\n\
\n\
/**\n\
 * Check that a / b have the same type.\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function sameType(a, b) {\n\
  a = Object.prototype.toString.call(a);\n\
  b = Object.prototype.toString.call(b);\n\
  return a == b;\n\
}\n\
\n\
\n\
}); // module: reporters/base.js\n\
\n\
require.register(\"reporters/doc.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * Expose `Doc`.\n\
 */\n\
\n\
exports = module.exports = Doc;\n\
\n\
/**\n\
 * Initialize a new `Doc` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Doc(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total\n\
    , indents = 2;\n\
\n\
  function indent() {\n\
    return Array(indents).join('  ');\n\
  }\n\
\n\
  runner.on('suite', function(suite){\n\
    if (suite.root) return;\n\
    ++indents;\n\
    console.log('%s<section class=\"suite\">', indent());\n\
    ++indents;\n\
    console.log('%s<h1>%s</h1>', indent(), utils.escape(suite.title));\n\
    console.log('%s<dl>', indent());\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    if (suite.root) return;\n\
    console.log('%s</dl>', indent());\n\
    --indents;\n\
    console.log('%s</section>', indent());\n\
    --indents;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    console.log('%s  <dt>%s</dt>', indent(), utils.escape(test.title));\n\
    var code = utils.escape(utils.clean(test.fn.toString()));\n\
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);\n\
  });\n\
}\n\
\n\
}); // module: reporters/doc.js\n\
\n\
require.register(\"reporters/dot.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Dot`.\n\
 */\n\
\n\
exports = module.exports = Dot;\n\
\n\
/**\n\
 * Initialize a new `Dot` matrix test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Dot(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    process.stdout.write('\\n\
  ');\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    process.stdout.write(color('pending', Base.symbols.dot));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    if (++n % width == 0) process.stdout.write('\\n\
  ');\n\
    if ('slow' == test.speed) {\n\
      process.stdout.write(color('bright yellow', Base.symbols.dot));\n\
    } else {\n\
      process.stdout.write(color(test.speed, Base.symbols.dot));\n\
    }\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    if (++n % width == 0) process.stdout.write('\\n\
  ');\n\
    process.stdout.write(color('fail', Base.symbols.dot));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Dot.prototype = new F;\n\
Dot.prototype.constructor = Dot;\n\
\n\
}); // module: reporters/dot.js\n\
\n\
require.register(\"reporters/html-cov.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var JSONCov = require('./json-cov')\n\
  , fs = require('browser/fs');\n\
\n\
/**\n\
 * Expose `HTMLCov`.\n\
 */\n\
\n\
exports = module.exports = HTMLCov;\n\
\n\
/**\n\
 * Initialize a new `JsCoverage` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function HTMLCov(runner) {\n\
  var jade = require('jade')\n\
    , file = __dirname + '/templates/coverage.jade'\n\
    , str = fs.readFileSync(file, 'utf8')\n\
    , fn = jade.compile(str, { filename: file })\n\
    , self = this;\n\
\n\
  JSONCov.call(this, runner, false);\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write(fn({\n\
        cov: self.cov\n\
      , coverageClass: coverageClass\n\
    }));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return coverage class for `n`.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function coverageClass(n) {\n\
  if (n >= 75) return 'high';\n\
  if (n >= 50) return 'medium';\n\
  if (n >= 25) return 'low';\n\
  return 'terrible';\n\
}\n\
}); // module: reporters/html-cov.js\n\
\n\
require.register(\"reporters/html.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils')\n\
  , Progress = require('../browser/progress')\n\
  , escape = utils.escape;\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Expose `HTML`.\n\
 */\n\
\n\
exports = module.exports = HTML;\n\
\n\
/**\n\
 * Stats template.\n\
 */\n\
\n\
var statsTemplate = '<ul id=\"mocha-stats\">'\n\
  + '<li class=\"progress\"><canvas width=\"40\" height=\"40\"></canvas></li>'\n\
  + '<li class=\"passes\"><a href=\"#\">passes:</a> <em>0</em></li>'\n\
  + '<li class=\"failures\"><a href=\"#\">failures:</a> <em>0</em></li>'\n\
  + '<li class=\"duration\">duration: <em>0</em>s</li>'\n\
  + '</ul>';\n\
\n\
/**\n\
 * Initialize a new `HTML` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function HTML(runner, root) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total\n\
    , stat = fragment(statsTemplate)\n\
    , items = stat.getElementsByTagName('li')\n\
    , passes = items[1].getElementsByTagName('em')[0]\n\
    , passesLink = items[1].getElementsByTagName('a')[0]\n\
    , failures = items[2].getElementsByTagName('em')[0]\n\
    , failuresLink = items[2].getElementsByTagName('a')[0]\n\
    , duration = items[3].getElementsByTagName('em')[0]\n\
    , canvas = stat.getElementsByTagName('canvas')[0]\n\
    , report = fragment('<ul id=\"mocha-report\"></ul>')\n\
    , stack = [report]\n\
    , progress\n\
    , ctx\n\
\n\
  root = root || document.getElementById('mocha');\n\
\n\
  if (canvas.getContext) {\n\
    var ratio = window.devicePixelRatio || 1;\n\
    canvas.style.width = canvas.width;\n\
    canvas.style.height = canvas.height;\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx = canvas.getContext('2d');\n\
    ctx.scale(ratio, ratio);\n\
    progress = new Progress;\n\
  }\n\
\n\
  if (!root) return error('#mocha div missing, add it to your document');\n\
\n\
  // pass toggle\n\
  on(passesLink, 'click', function(){\n\
    unhide();\n\
    var name = /pass/.test(report.className) ? '' : ' pass';\n\
    report.className = report.className.replace(/fail|pass/g, '') + name;\n\
    if (report.className.trim()) hideSuitesWithout('test pass');\n\
  });\n\
\n\
  // failure toggle\n\
  on(failuresLink, 'click', function(){\n\
    unhide();\n\
    var name = /fail/.test(report.className) ? '' : ' fail';\n\
    report.className = report.className.replace(/fail|pass/g, '') + name;\n\
    if (report.className.trim()) hideSuitesWithout('test fail');\n\
  });\n\
\n\
  root.appendChild(stat);\n\
  root.appendChild(report);\n\
\n\
  if (progress) progress.size(40);\n\
\n\
  runner.on('suite', function(suite){\n\
    if (suite.root) return;\n\
\n\
    // suite\n\
    var url = self.suiteURL(suite);\n\
    var el = fragment('<li class=\"suite\"><h1><a href=\"%s\">%s</a></h1></li>', url, escape(suite.title));\n\
\n\
    // container\n\
    stack[0].appendChild(el);\n\
    stack.unshift(document.createElement('ul'));\n\
    el.appendChild(stack[0]);\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    if (suite.root) return;\n\
    stack.shift();\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    if ('hook' == test.type) runner.emit('test end', test);\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    // TODO: add to stats\n\
    var percent = stats.tests / this.total * 100 | 0;\n\
    if (progress) progress.update(percent).draw(ctx);\n\
\n\
    // update stats\n\
    var ms = new Date - stats.start;\n\
    text(passes, stats.passes);\n\
    text(failures, stats.failures);\n\
    text(duration, (ms / 1000).toFixed(2));\n\
\n\
    // test\n\
    if ('passed' == test.state) {\n\
      var url = self.testURL(test);\n\
      var el = fragment('<li class=\"test pass %e\"><h2>%e<span class=\"duration\">%ems</span> <a href=\"%s\" class=\"replay\">‣</a></h2></li>', test.speed, test.title, test.duration, url);\n\
    } else if (test.pending) {\n\
      var el = fragment('<li class=\"test pass pending\"><h2>%e</h2></li>', test.title);\n\
    } else {\n\
      var el = fragment('<li class=\"test fail\"><h2>%e <a href=\"?grep=%e\" class=\"replay\">‣</a></h2></li>', test.title, encodeURIComponent(test.fullTitle()));\n\
      var str = test.err.stack || test.err.toString();\n\
\n\
      // FF / Opera do not add the message\n\
      if (!~str.indexOf(test.err.message)) {\n\
        str = test.err.message + '\\n\
' + str;\n\
      }\n\
\n\
      // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we\n\
      // check for the result of the stringifying.\n\
      if ('[object Error]' == str) str = test.err.message;\n\
\n\
      // Safari doesn't give you a stack. Let's at least provide a source line.\n\
      if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {\n\
        str += \"\\n\
(\" + test.err.sourceURL + \":\" + test.err.line + \")\";\n\
      }\n\
\n\
      el.appendChild(fragment('<pre class=\"error\">%e</pre>', str));\n\
    }\n\
\n\
    // toggle code\n\
    // TODO: defer\n\
    if (!test.pending) {\n\
      var h2 = el.getElementsByTagName('h2')[0];\n\
\n\
      on(h2, 'click', function(){\n\
        pre.style.display = 'none' == pre.style.display\n\
          ? 'block'\n\
          : 'none';\n\
      });\n\
\n\
      var pre = fragment('<pre><code>%e</code></pre>', utils.clean(test.fn.toString()));\n\
      el.appendChild(pre);\n\
      pre.style.display = 'none';\n\
    }\n\
\n\
    // Don't call .appendChild if #mocha-report was already .shift()'ed off the stack.\n\
    if (stack[0]) stack[0].appendChild(el);\n\
  });\n\
}\n\
\n\
/**\n\
 * Provide suite URL\n\
 *\n\
 * @param {Object} [suite]\n\
 */\n\
\n\
HTML.prototype.suiteURL = function(suite){\n\
  return '?grep=' + encodeURIComponent(suite.fullTitle());\n\
};\n\
\n\
/**\n\
 * Provide test URL\n\
 *\n\
 * @param {Object} [test]\n\
 */\n\
\n\
HTML.prototype.testURL = function(test){\n\
  return '?grep=' + encodeURIComponent(test.fullTitle());\n\
};\n\
\n\
/**\n\
 * Display error `msg`.\n\
 */\n\
\n\
function error(msg) {\n\
  document.body.appendChild(fragment('<div id=\"mocha-error\">%s</div>', msg));\n\
}\n\
\n\
/**\n\
 * Return a DOM fragment from `html`.\n\
 */\n\
\n\
function fragment(html) {\n\
  var args = arguments\n\
    , div = document.createElement('div')\n\
    , i = 1;\n\
\n\
  div.innerHTML = html.replace(/%([se])/g, function(_, type){\n\
    switch (type) {\n\
      case 's': return String(args[i++]);\n\
      case 'e': return escape(args[i++]);\n\
    }\n\
  });\n\
\n\
  return div.firstChild;\n\
}\n\
\n\
/**\n\
 * Check for suites that do not have elements\n\
 * with `classname`, and hide them.\n\
 */\n\
\n\
function hideSuitesWithout(classname) {\n\
  var suites = document.getElementsByClassName('suite');\n\
  for (var i = 0; i < suites.length; i++) {\n\
    var els = suites[i].getElementsByClassName(classname);\n\
    if (0 == els.length) suites[i].className += ' hidden';\n\
  }\n\
}\n\
\n\
/**\n\
 * Unhide .hidden suites.\n\
 */\n\
\n\
function unhide() {\n\
  var els = document.getElementsByClassName('suite hidden');\n\
  for (var i = 0; i < els.length; ++i) {\n\
    els[i].className = els[i].className.replace('suite hidden', 'suite');\n\
  }\n\
}\n\
\n\
/**\n\
 * Set `el` text to `str`.\n\
 */\n\
\n\
function text(el, str) {\n\
  if (el.textContent) {\n\
    el.textContent = str;\n\
  } else {\n\
    el.innerText = str;\n\
  }\n\
}\n\
\n\
/**\n\
 * Listen on `event` with callback `fn`.\n\
 */\n\
\n\
function on(el, event, fn) {\n\
  if (el.addEventListener) {\n\
    el.addEventListener(event, fn, false);\n\
  } else {\n\
    el.attachEvent('on' + event, fn);\n\
  }\n\
}\n\
\n\
}); // module: reporters/html.js\n\
\n\
require.register(\"reporters/index.js\", function(module, exports, require){\n\
\n\
exports.Base = require('./base');\n\
exports.Dot = require('./dot');\n\
exports.Doc = require('./doc');\n\
exports.TAP = require('./tap');\n\
exports.JSON = require('./json');\n\
exports.HTML = require('./html');\n\
exports.List = require('./list');\n\
exports.Min = require('./min');\n\
exports.Spec = require('./spec');\n\
exports.Nyan = require('./nyan');\n\
exports.XUnit = require('./xunit');\n\
exports.Markdown = require('./markdown');\n\
exports.Progress = require('./progress');\n\
exports.Landing = require('./landing');\n\
exports.JSONCov = require('./json-cov');\n\
exports.HTMLCov = require('./html-cov');\n\
exports.JSONStream = require('./json-stream');\n\
\n\
}); // module: reporters/index.js\n\
\n\
require.register(\"reporters/json-cov.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base');\n\
\n\
/**\n\
 * Expose `JSONCov`.\n\
 */\n\
\n\
exports = module.exports = JSONCov;\n\
\n\
/**\n\
 * Initialize a new `JsCoverage` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @param {Boolean} output\n\
 * @api public\n\
 */\n\
\n\
function JSONCov(runner, output) {\n\
  var self = this\n\
    , output = 1 == arguments.length ? true : output;\n\
\n\
  Base.call(this, runner);\n\
\n\
  var tests = []\n\
    , failures = []\n\
    , passes = [];\n\
\n\
  runner.on('test end', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    var cov = global._$jscoverage || {};\n\
    var result = self.cov = map(cov);\n\
    result.stats = self.stats;\n\
    result.tests = tests.map(clean);\n\
    result.failures = failures.map(clean);\n\
    result.passes = passes.map(clean);\n\
    if (!output) return;\n\
    process.stdout.write(JSON.stringify(result, null, 2 ));\n\
  });\n\
}\n\
\n\
/**\n\
 * Map jscoverage data to a JSON structure\n\
 * suitable for reporting.\n\
 *\n\
 * @param {Object} cov\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function map(cov) {\n\
  var ret = {\n\
      instrumentation: 'node-jscoverage'\n\
    , sloc: 0\n\
    , hits: 0\n\
    , misses: 0\n\
    , coverage: 0\n\
    , files: []\n\
  };\n\
\n\
  for (var filename in cov) {\n\
    var data = coverage(filename, cov[filename]);\n\
    ret.files.push(data);\n\
    ret.hits += data.hits;\n\
    ret.misses += data.misses;\n\
    ret.sloc += data.sloc;\n\
  }\n\
\n\
  ret.files.sort(function(a, b) {\n\
    return a.filename.localeCompare(b.filename);\n\
  });\n\
\n\
  if (ret.sloc > 0) {\n\
    ret.coverage = (ret.hits / ret.sloc) * 100;\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Map jscoverage data for a single source file\n\
 * to a JSON structure suitable for reporting.\n\
 *\n\
 * @param {String} filename name of the source file\n\
 * @param {Object} data jscoverage coverage data\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function coverage(filename, data) {\n\
  var ret = {\n\
    filename: filename,\n\
    coverage: 0,\n\
    hits: 0,\n\
    misses: 0,\n\
    sloc: 0,\n\
    source: {}\n\
  };\n\
\n\
  data.source.forEach(function(line, num){\n\
    num++;\n\
\n\
    if (data[num] === 0) {\n\
      ret.misses++;\n\
      ret.sloc++;\n\
    } else if (data[num] !== undefined) {\n\
      ret.hits++;\n\
      ret.sloc++;\n\
    }\n\
\n\
    ret.source[num] = {\n\
        source: line\n\
      , coverage: data[num] === undefined\n\
        ? ''\n\
        : data[num]\n\
    };\n\
  });\n\
\n\
  ret.coverage = ret.hits / ret.sloc * 100;\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
\n\
}); // module: reporters/json-cov.js\n\
\n\
require.register(\"reporters/json-stream.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `List`.\n\
 */\n\
\n\
exports = module.exports = List;\n\
\n\
/**\n\
 * Initialize a new `List` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function List(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total;\n\
\n\
  runner.on('start', function(){\n\
    console.log(JSON.stringify(['start', { total: total }]));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    console.log(JSON.stringify(['pass', clean(test)]));\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    console.log(JSON.stringify(['fail', clean(test)]));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write(JSON.stringify(['end', self.stats]));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
}); // module: reporters/json-stream.js\n\
\n\
require.register(\"reporters/json.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `JSON`.\n\
 */\n\
\n\
exports = module.exports = JSONReporter;\n\
\n\
/**\n\
 * Initialize a new `JSON` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function JSONReporter(runner) {\n\
  var self = this;\n\
  Base.call(this, runner);\n\
\n\
  var tests = []\n\
    , failures = []\n\
    , passes = [];\n\
\n\
  runner.on('test end', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    var obj = {\n\
        stats: self.stats\n\
      , tests: tests.map(clean)\n\
      , failures: failures.map(clean)\n\
      , passes: passes.map(clean)\n\
    };\n\
\n\
    process.stdout.write(JSON.stringify(obj, null, 2));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
}); // module: reporters/json.js\n\
\n\
require.register(\"reporters/landing.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Landing`.\n\
 */\n\
\n\
exports = module.exports = Landing;\n\
\n\
/**\n\
 * Airplane color.\n\
 */\n\
\n\
Base.colors.plane = 0;\n\
\n\
/**\n\
 * Airplane crash color.\n\
 */\n\
\n\
Base.colors['plane crash'] = 31;\n\
\n\
/**\n\
 * Runway color.\n\
 */\n\
\n\
Base.colors.runway = 90;\n\
\n\
/**\n\
 * Initialize a new `Landing` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Landing(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , total = runner.total\n\
    , stream = process.stdout\n\
    , plane = color('plane', '✈')\n\
    , crashed = -1\n\
    , n = 0;\n\
\n\
  function runway() {\n\
    var buf = Array(width).join('-');\n\
    return '  ' + color('runway', buf);\n\
  }\n\
\n\
  runner.on('start', function(){\n\
    stream.write('\\n\
  ');\n\
    cursor.hide();\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    // check if the plane crashed\n\
    var col = -1 == crashed\n\
      ? width * ++n / total | 0\n\
      : crashed;\n\
\n\
    // show the crash\n\
    if ('failed' == test.state) {\n\
      plane = color('plane crash', '✈');\n\
      crashed = col;\n\
    }\n\
\n\
    // render landing strip\n\
    stream.write('\\u001b[4F\\n\
\\n\
');\n\
    stream.write(runway());\n\
    stream.write('\\n\
  ');\n\
    stream.write(color('runway', Array(col).join('⋅')));\n\
    stream.write(plane)\n\
    stream.write(color('runway', Array(width - col).join('⋅') + '\\n\
'));\n\
    stream.write(runway());\n\
    stream.write('\\u001b[0m');\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    cursor.show();\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Landing.prototype = new F;\n\
Landing.prototype.constructor = Landing;\n\
\n\
}); // module: reporters/landing.js\n\
\n\
require.register(\"reporters/list.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `List`.\n\
 */\n\
\n\
exports = module.exports = List;\n\
\n\
/**\n\
 * Initialize a new `List` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function List(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    console.log();\n\
  });\n\
\n\
  runner.on('test', function(test){\n\
    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    var fmt = color('checkmark', '  -')\n\
      + color('pending', ' %s');\n\
    console.log(fmt, test.fullTitle());\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    var fmt = color('checkmark', '  '+Base.symbols.dot)\n\
      + color('pass', ' %s: ')\n\
      + color(test.speed, '%dms');\n\
    cursor.CR();\n\
    console.log(fmt, test.fullTitle(), test.duration);\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    cursor.CR();\n\
    console.log(color('fail', '  %d) %s'), ++n, test.fullTitle());\n\
  });\n\
\n\
  runner.on('end', self.epilogue.bind(self));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
List.prototype = new F;\n\
List.prototype.constructor = List;\n\
\n\
\n\
}); // module: reporters/list.js\n\
\n\
require.register(\"reporters/markdown.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * Expose `Markdown`.\n\
 */\n\
\n\
exports = module.exports = Markdown;\n\
\n\
/**\n\
 * Initialize a new `Markdown` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Markdown(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , level = 0\n\
    , buf = '';\n\
\n\
  function title(str) {\n\
    return Array(level).join('#') + ' ' + str;\n\
  }\n\
\n\
  function indent() {\n\
    return Array(level).join('  ');\n\
  }\n\
\n\
  function mapTOC(suite, obj) {\n\
    var ret = obj;\n\
    obj = obj[suite.title] = obj[suite.title] || { suite: suite };\n\
    suite.suites.forEach(function(suite){\n\
      mapTOC(suite, obj);\n\
    });\n\
    return ret;\n\
  }\n\
\n\
  function stringifyTOC(obj, level) {\n\
    ++level;\n\
    var buf = '';\n\
    var link;\n\
    for (var key in obj) {\n\
      if ('suite' == key) continue;\n\
      if (key) link = ' - [' + key + '](#' + utils.slug(obj[key].suite.fullTitle()) + ')\\n\
';\n\
      if (key) buf += Array(level).join('  ') + link;\n\
      buf += stringifyTOC(obj[key], level);\n\
    }\n\
    --level;\n\
    return buf;\n\
  }\n\
\n\
  function generateTOC(suite) {\n\
    var obj = mapTOC(suite, {});\n\
    return stringifyTOC(obj, 0);\n\
  }\n\
\n\
  generateTOC(runner.suite);\n\
\n\
  runner.on('suite', function(suite){\n\
    ++level;\n\
    var slug = utils.slug(suite.fullTitle());\n\
    buf += '<a name=\"' + slug + '\"></a>' + '\\n\
';\n\
    buf += title(suite.title) + '\\n\
';\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    --level;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    var code = utils.clean(test.fn.toString());\n\
    buf += test.title + '.\\n\
';\n\
    buf += '\\n\
```js\\n\
';\n\
    buf += code + '\\n\
';\n\
    buf += '```\\n\
\\n\
';\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write('# TOC\\n\
');\n\
    process.stdout.write(generateTOC(runner.suite));\n\
    process.stdout.write(buf);\n\
  });\n\
}\n\
}); // module: reporters/markdown.js\n\
\n\
require.register(\"reporters/min.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base');\n\
\n\
/**\n\
 * Expose `Min`.\n\
 */\n\
\n\
exports = module.exports = Min;\n\
\n\
/**\n\
 * Initialize a new `Min` minimal test reporter (best used with --watch).\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Min(runner) {\n\
  Base.call(this, runner);\n\
\n\
  runner.on('start', function(){\n\
    // clear screen\n\
    process.stdout.write('\\u001b[2J');\n\
    // set cursor position\n\
    process.stdout.write('\\u001b[1;3H');\n\
  });\n\
\n\
  runner.on('end', this.epilogue.bind(this));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Min.prototype = new F;\n\
Min.prototype.constructor = Min;\n\
\n\
\n\
}); // module: reporters/min.js\n\
\n\
require.register(\"reporters/nyan.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Dot`.\n\
 */\n\
\n\
exports = module.exports = NyanCat;\n\
\n\
/**\n\
 * Initialize a new `Dot` matrix test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function NyanCat(runner) {\n\
  Base.call(this, runner);\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , rainbowColors = this.rainbowColors = self.generateColors()\n\
    , colorIndex = this.colorIndex = 0\n\
    , numerOfLines = this.numberOfLines = 4\n\
    , trajectories = this.trajectories = [[], [], [], []]\n\
    , nyanCatWidth = this.nyanCatWidth = 11\n\
    , trajectoryWidthMax = this.trajectoryWidthMax = (width - nyanCatWidth)\n\
    , scoreboardWidth = this.scoreboardWidth = 5\n\
    , tick = this.tick = 0\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    Base.cursor.hide();\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    Base.cursor.show();\n\
    for (var i = 0; i < self.numberOfLines; i++) write('\\n\
');\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Draw the nyan cat\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.draw = function(){\n\
  this.appendRainbow();\n\
  this.drawScoreboard();\n\
  this.drawRainbow();\n\
  this.drawNyanCat();\n\
  this.tick = !this.tick;\n\
};\n\
\n\
/**\n\
 * Draw the \"scoreboard\" showing the number\n\
 * of passes, failures and pending tests.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawScoreboard = function(){\n\
  var stats = this.stats;\n\
  var colors = Base.colors;\n\
\n\
  function draw(color, n) {\n\
    write(' ');\n\
    write('\\u001b[' + color + 'm' + n + '\\u001b[0m');\n\
    write('\\n\
');\n\
  }\n\
\n\
  draw(colors.green, stats.passes);\n\
  draw(colors.fail, stats.failures);\n\
  draw(colors.pending, stats.pending);\n\
  write('\\n\
');\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Append the rainbow.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.appendRainbow = function(){\n\
  var segment = this.tick ? '_' : '-';\n\
  var rainbowified = this.rainbowify(segment);\n\
\n\
  for (var index = 0; index < this.numberOfLines; index++) {\n\
    var trajectory = this.trajectories[index];\n\
    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();\n\
    trajectory.push(rainbowified);\n\
  }\n\
};\n\
\n\
/**\n\
 * Draw the rainbow.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawRainbow = function(){\n\
  var self = this;\n\
\n\
  this.trajectories.forEach(function(line, index) {\n\
    write('\\u001b[' + self.scoreboardWidth + 'C');\n\
    write(line.join(''));\n\
    write('\\n\
');\n\
  });\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Draw the nyan cat\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawNyanCat = function() {\n\
  var self = this;\n\
  var startWidth = this.scoreboardWidth + this.trajectories[0].length;\n\
  var color = '\\u001b[' + startWidth + 'C';\n\
  var padding = '';\n\
\n\
  write(color);\n\
  write('_,------,');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? '  ' : '   ';\n\
  write('_|' + padding + '/\\\\_/\\\\ ');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? '_' : '__';\n\
  var tail = self.tick ? '~' : '^';\n\
  var face;\n\
  write(tail + '|' + padding + this.face() + ' ');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? ' ' : '  ';\n\
  write(padding + '\"\"  \"\" ');\n\
  write('\\n\
');\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Draw nyan cat face.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.face = function() {\n\
  var stats = this.stats;\n\
  if (stats.failures) {\n\
    return '( x .x)';\n\
  } else if (stats.pending) {\n\
    return '( o .o)';\n\
  } else if(stats.passes) {\n\
    return '( ^ .^)';\n\
  } else {\n\
    return '( - .-)';\n\
  }\n\
}\n\
\n\
/**\n\
 * Move cursor up `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.cursorUp = function(n) {\n\
  write('\\u001b[' + n + 'A');\n\
};\n\
\n\
/**\n\
 * Move cursor down `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.cursorDown = function(n) {\n\
  write('\\u001b[' + n + 'B');\n\
};\n\
\n\
/**\n\
 * Generate rainbow colors.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.generateColors = function(){\n\
  var colors = [];\n\
\n\
  for (var i = 0; i < (6 * 7); i++) {\n\
    var pi3 = Math.floor(Math.PI / 3);\n\
    var n = (i * (1.0 / 6));\n\
    var r = Math.floor(3 * Math.sin(n) + 3);\n\
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);\n\
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);\n\
    colors.push(36 * r + 6 * g + b + 16);\n\
  }\n\
\n\
  return colors;\n\
};\n\
\n\
/**\n\
 * Apply rainbow to the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.rainbowify = function(str){\n\
  var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];\n\
  this.colorIndex += 1;\n\
  return '\\u001b[38;5;' + color + 'm' + str + '\\u001b[0m';\n\
};\n\
\n\
/**\n\
 * Stdout helper.\n\
 */\n\
\n\
function write(string) {\n\
  process.stdout.write(string);\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
NyanCat.prototype = new F;\n\
NyanCat.prototype.constructor = NyanCat;\n\
\n\
\n\
}); // module: reporters/nyan.js\n\
\n\
require.register(\"reporters/progress.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
exports = module.exports = Progress;\n\
\n\
/**\n\
 * General progress bar color.\n\
 */\n\
\n\
Base.colors.progress = 90;\n\
\n\
/**\n\
 * Initialize a new `Progress` bar test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Progress(runner, options) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , options = options || {}\n\
    , stats = this.stats\n\
    , width = Base.window.width * .50 | 0\n\
    , total = runner.total\n\
    , complete = 0\n\
    , max = Math.max;\n\
\n\
  // default chars\n\
  options.open = options.open || '[';\n\
  options.complete = options.complete || '▬';\n\
  options.incomplete = options.incomplete || Base.symbols.dot;\n\
  options.close = options.close || ']';\n\
  options.verbose = false;\n\
\n\
  // tests started\n\
  runner.on('start', function(){\n\
    console.log();\n\
    cursor.hide();\n\
  });\n\
\n\
  // tests complete\n\
  runner.on('test end', function(){\n\
    complete++;\n\
    var incomplete = total - complete\n\
      , percent = complete / total\n\
      , n = width * percent | 0\n\
      , i = width - n;\n\
\n\
    cursor.CR();\n\
    process.stdout.write('\\u001b[J');\n\
    process.stdout.write(color('progress', '  ' + options.open));\n\
    process.stdout.write(Array(n).join(options.complete));\n\
    process.stdout.write(Array(i).join(options.incomplete));\n\
    process.stdout.write(color('progress', options.close));\n\
    if (options.verbose) {\n\
      process.stdout.write(color('progress', ' ' + complete + ' of ' + total));\n\
    }\n\
  });\n\
\n\
  // tests are complete, output some stats\n\
  // and the failures if any\n\
  runner.on('end', function(){\n\
    cursor.show();\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Progress.prototype = new F;\n\
Progress.prototype.constructor = Progress;\n\
\n\
\n\
}); // module: reporters/progress.js\n\
\n\
require.register(\"reporters/spec.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Spec`.\n\
 */\n\
\n\
exports = module.exports = Spec;\n\
\n\
/**\n\
 * Initialize a new `Spec` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Spec(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , indents = 0\n\
    , n = 0;\n\
\n\
  function indent() {\n\
    return Array(indents).join('  ')\n\
  }\n\
\n\
  runner.on('start', function(){\n\
    console.log();\n\
  });\n\
\n\
  runner.on('suite', function(suite){\n\
    ++indents;\n\
    console.log(color('suite', '%s%s'), indent(), suite.title);\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    --indents;\n\
    if (1 == indents) console.log();\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    var fmt = indent() + color('pending', '  - %s');\n\
    console.log(fmt, test.title);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    if ('fast' == test.speed) {\n\
      var fmt = indent()\n\
        + color('checkmark', '  ' + Base.symbols.ok)\n\
        + color('pass', ' %s ');\n\
      cursor.CR();\n\
      console.log(fmt, test.title);\n\
    } else {\n\
      var fmt = indent()\n\
        + color('checkmark', '  ' + Base.symbols.ok)\n\
        + color('pass', ' %s ')\n\
        + color(test.speed, '(%dms)');\n\
      cursor.CR();\n\
      console.log(fmt, test.title, test.duration);\n\
    }\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    cursor.CR();\n\
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);\n\
  });\n\
\n\
  runner.on('end', self.epilogue.bind(self));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Spec.prototype = new F;\n\
Spec.prototype.constructor = Spec;\n\
\n\
\n\
}); // module: reporters/spec.js\n\
\n\
require.register(\"reporters/tap.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `TAP`.\n\
 */\n\
\n\
exports = module.exports = TAP;\n\
\n\
/**\n\
 * Initialize a new `TAP` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function TAP(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , n = 1\n\
    , passes = 0\n\
    , failures = 0;\n\
\n\
  runner.on('start', function(){\n\
    var total = runner.grepTotal(runner.suite);\n\
    console.log('%d..%d', 1, total);\n\
  });\n\
\n\
  runner.on('test end', function(){\n\
    ++n;\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    console.log('ok %d %s # SKIP -', n, title(test));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes++;\n\
    console.log('ok %d %s', n, title(test));\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    failures++;\n\
    console.log('not ok %d %s', n, title(test));\n\
    if (err.stack) console.log(err.stack.replace(/^/gm, '  '));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log('# tests ' + (passes + failures));\n\
    console.log('# pass ' + passes);\n\
    console.log('# fail ' + failures);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a TAP-safe title of `test`\n\
 *\n\
 * @param {Object} test\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function title(test) {\n\
  return test.fullTitle().replace(/#/g, '');\n\
}\n\
\n\
}); // module: reporters/tap.js\n\
\n\
require.register(\"reporters/xunit.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils')\n\
  , escape = utils.escape;\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Expose `XUnit`.\n\
 */\n\
\n\
exports = module.exports = XUnit;\n\
\n\
/**\n\
 * Initialize a new `XUnit` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function XUnit(runner) {\n\
  Base.call(this, runner);\n\
  var stats = this.stats\n\
    , tests = []\n\
    , self = this;\n\
\n\
  runner.on('pending', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log(tag('testsuite', {\n\
        name: 'Mocha Tests'\n\
      , tests: stats.tests\n\
      , failures: stats.failures\n\
      , errors: stats.failures\n\
      , skipped: stats.tests - stats.failures - stats.passes\n\
      , timestamp: (new Date).toUTCString()\n\
      , time: (stats.duration / 1000) || 0\n\
    }, false));\n\
\n\
    tests.forEach(test);\n\
    console.log('</testsuite>');\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
XUnit.prototype = new F;\n\
XUnit.prototype.constructor = XUnit;\n\
\n\
\n\
/**\n\
 * Output tag for the given `test.`\n\
 */\n\
\n\
function test(test) {\n\
  var attrs = {\n\
      classname: test.parent.fullTitle()\n\
    , name: test.title\n\
    , time: (test.duration / 1000) || 0\n\
  };\n\
\n\
  if ('failed' == test.state) {\n\
    var err = test.err;\n\
    attrs.message = escape(err.message);\n\
    console.log(tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack))));\n\
  } else if (test.pending) {\n\
    console.log(tag('testcase', attrs, false, tag('skipped', {}, true)));\n\
  } else {\n\
    console.log(tag('testcase', attrs, true) );\n\
  }\n\
}\n\
\n\
/**\n\
 * HTML tag helper.\n\
 */\n\
\n\
function tag(name, attrs, close, content) {\n\
  var end = close ? '/>' : '>'\n\
    , pairs = []\n\
    , tag;\n\
\n\
  for (var key in attrs) {\n\
    pairs.push(key + '=\"' + escape(attrs[key]) + '\"');\n\
  }\n\
\n\
  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;\n\
  if (content) tag += content + '</' + name + end;\n\
  return tag;\n\
}\n\
\n\
/**\n\
 * Return cdata escaped CDATA `str`.\n\
 */\n\
\n\
function cdata(str) {\n\
  return '<![CDATA[' + escape(str) + ']]>';\n\
}\n\
\n\
}); // module: reporters/xunit.js\n\
\n\
require.register(\"runnable.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:runnable')\n\
  , milliseconds = require('./ms');\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Object#toString().\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Expose `Runnable`.\n\
 */\n\
\n\
module.exports = Runnable;\n\
\n\
/**\n\
 * Initialize a new `Runnable` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Runnable(title, fn) {\n\
  this.title = title;\n\
  this.fn = fn;\n\
  this.async = fn && fn.length;\n\
  this.sync = ! this.async;\n\
  this._timeout = 2000;\n\
  this._slow = 75;\n\
  this.timedOut = false;\n\
}\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Runnable.prototype = new F;\n\
Runnable.prototype.constructor = Runnable;\n\
\n\
\n\
/**\n\
 * Set & get timeout `ms`.\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Runnable|Number} ms or self\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.timeout = function(ms){\n\
  if (0 == arguments.length) return this._timeout;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._timeout = ms;\n\
  if (this.timer) this.resetTimeout();\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set & get slow `ms`.\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Runnable|Number} ms or self\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.slow = function(ms){\n\
  if (0 === arguments.length) return this._slow;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._slow = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Runnable.prototype.fullTitle = function(){\n\
  return this.parent.fullTitle() + ' ' + this.title;\n\
};\n\
\n\
/**\n\
 * Clear the timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.clearTimeout = function(){\n\
  clearTimeout(this.timer);\n\
};\n\
\n\
/**\n\
 * Inspect the runnable void of private properties.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.inspect = function(){\n\
  return JSON.stringify(this, function(key, val){\n\
    if ('_' == key[0]) return;\n\
    if ('parent' == key) return '#<Suite>';\n\
    if ('ctx' == key) return '#<Context>';\n\
    return val;\n\
  }, 2);\n\
};\n\
\n\
/**\n\
 * Reset the timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.resetTimeout = function(){\n\
  var self = this;\n\
  var ms = this.timeout() || 1e9;\n\
\n\
  this.clearTimeout();\n\
  this.timer = setTimeout(function(){\n\
    self.callback(new Error('timeout of ' + ms + 'ms exceeded'));\n\
    self.timedOut = true;\n\
  }, ms);\n\
};\n\
\n\
/**\n\
 * Whitelist these globals for this test run\n\
 *\n\
 * @api private\n\
 */\n\
Runnable.prototype.globals = function(arr){\n\
  var self = this;\n\
  this._allowedGlobals = arr;\n\
};\n\
\n\
/**\n\
 * Run the test and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.run = function(fn){\n\
  var self = this\n\
    , ms = this.timeout()\n\
    , start = new Date\n\
    , ctx = this.ctx\n\
    , finished\n\
    , emitted;\n\
\n\
  if (ctx) ctx.runnable(this);\n\
\n\
  // timeout\n\
  if (this.async) {\n\
    if (ms) {\n\
      this.timer = setTimeout(function(){\n\
        done(new Error('timeout of ' + ms + 'ms exceeded'));\n\
        self.timedOut = true;\n\
      }, ms);\n\
    }\n\
  }\n\
\n\
  // called multiple times\n\
  function multiple(err) {\n\
    if (emitted) return;\n\
    emitted = true;\n\
    self.emit('error', err || new Error('done() called multiple times'));\n\
  }\n\
\n\
  // finished\n\
  function done(err) {\n\
    if (self.timedOut) return;\n\
    if (finished) return multiple(err);\n\
    self.clearTimeout();\n\
    self.duration = new Date - start;\n\
    finished = true;\n\
    fn(err);\n\
  }\n\
\n\
  // for .resetTimeout()\n\
  this.callback = done;\n\
\n\
  // async\n\
  if (this.async) {\n\
    try {\n\
      this.fn.call(ctx, function(err){\n\
        if (err instanceof Error || toString.call(err) === \"[object Error]\") return done(err);\n\
        if (null != err) return done(new Error('done() invoked with non-Error: ' + err));\n\
        done();\n\
      });\n\
    } catch (err) {\n\
      done(err);\n\
    }\n\
    return;\n\
  }\n\
\n\
  if (this.asyncOnly) {\n\
    return done(new Error('--async-only option in use without declaring `done()`'));\n\
  }\n\
\n\
  // sync\n\
  try {\n\
    if (!this.pending) this.fn.call(ctx);\n\
    this.duration = new Date - start;\n\
    fn();\n\
  } catch (err) {\n\
    fn(err);\n\
  }\n\
};\n\
\n\
}); // module: runnable.js\n\
\n\
require.register(\"runner.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:runner')\n\
  , Test = require('./test')\n\
  , utils = require('./utils')\n\
  , filter = utils.filter\n\
  , keys = utils.keys;\n\
\n\
/**\n\
 * Non-enumerable globals.\n\
 */\n\
\n\
var globals = [\n\
  'setTimeout',\n\
  'clearTimeout',\n\
  'setInterval',\n\
  'clearInterval',\n\
  'XMLHttpRequest',\n\
  'Date'\n\
];\n\
\n\
/**\n\
 * Expose `Runner`.\n\
 */\n\
\n\
module.exports = Runner;\n\
\n\
/**\n\
 * Initialize a `Runner` for the given `suite`.\n\
 *\n\
 * Events:\n\
 *\n\
 *   - `start`  execution started\n\
 *   - `end`  execution complete\n\
 *   - `suite`  (suite) test suite execution started\n\
 *   - `suite end`  (suite) all tests (and sub-suites) have finished\n\
 *   - `test`  (test) test execution started\n\
 *   - `test end`  (test) test completed\n\
 *   - `hook`  (hook) hook execution started\n\
 *   - `hook end`  (hook) hook complete\n\
 *   - `pass`  (test) test passed\n\
 *   - `fail`  (test, err) test failed\n\
 *   - `pending`  (test) test pending\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Runner(suite) {\n\
  var self = this;\n\
  this._globals = [];\n\
  this._abort = false;\n\
  this.suite = suite;\n\
  this.total = suite.total();\n\
  this.failures = 0;\n\
  this.on('test end', function(test){ self.checkGlobals(test); });\n\
  this.on('hook end', function(hook){ self.checkGlobals(hook); });\n\
  this.grep(/.*/);\n\
  this.globals(this.globalProps().concat(extraGlobals()));\n\
}\n\
\n\
/**\n\
 * Wrapper for setImmediate, process.nextTick, or browser polyfill.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.immediately = global.setImmediate || process.nextTick;\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Runner.prototype = new F;\n\
Runner.prototype.constructor = Runner;\n\
\n\
\n\
/**\n\
 * Run tests with full titles matching `re`. Updates runner.total\n\
 * with number of tests matched.\n\
 *\n\
 * @param {RegExp} re\n\
 * @param {Boolean} invert\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.grep = function(re, invert){\n\
  debug('grep %s', re);\n\
  this._grep = re;\n\
  this._invert = invert;\n\
  this.total = this.grepTotal(this.suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Returns the number of tests matching the grep search for the\n\
 * given suite.\n\
 *\n\
 * @param {Suite} suite\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.grepTotal = function(suite) {\n\
  var self = this;\n\
  var total = 0;\n\
\n\
  suite.eachTest(function(test){\n\
    var match = self._grep.test(test.fullTitle());\n\
    if (self._invert) match = !match;\n\
    if (match) total++;\n\
  });\n\
\n\
  return total;\n\
};\n\
\n\
/**\n\
 * Return a list of global properties.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.globalProps = function() {\n\
  var props = utils.keys(global);\n\
\n\
  // non-enumerables\n\
  for (var i = 0; i < globals.length; ++i) {\n\
    if (~utils.indexOf(props, globals[i])) continue;\n\
    props.push(globals[i]);\n\
  }\n\
\n\
  return props;\n\
};\n\
\n\
/**\n\
 * Allow the given `arr` of globals.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.globals = function(arr){\n\
  if (0 == arguments.length) return this._globals;\n\
  debug('globals %j', arr);\n\
  this._globals = this._globals.concat(arr);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check for global variable leaks.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.checkGlobals = function(test){\n\
  if (this.ignoreLeaks) return;\n\
  var ok = this._globals;\n\
\n\
  var globals = this.globalProps();\n\
  var isNode = process.kill;\n\
  var leaks;\n\
\n\
  if (test) {\n\
    ok = ok.concat(test._allowedGlobals || []);\n\
  }\n\
\n\
  if(this.prevGlobalsLength == globals.length) return;\n\
  this.prevGlobalsLength = globals.length;\n\
\n\
  leaks = filterLeaks(ok, globals);\n\
  this._globals = this._globals.concat(leaks);\n\
\n\
  if (leaks.length > 1) {\n\
    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));\n\
  } else if (leaks.length) {\n\
    this.fail(test, new Error('global leak detected: ' + leaks[0]));\n\
  }\n\
};\n\
\n\
/**\n\
 * Fail the given `test`.\n\
 *\n\
 * @param {Test} test\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.fail = function(test, err){\n\
  ++this.failures;\n\
  test.state = 'failed';\n\
\n\
  if ('string' == typeof err) {\n\
    err = new Error('the string \"' + err + '\" was thrown, throw an Error :)');\n\
  }\n\
\n\
  this.emit('fail', test, err);\n\
};\n\
\n\
/**\n\
 * Fail the given `hook` with `err`.\n\
 *\n\
 * Hook failures work in the following pattern:\n\
 * - If bail, then exit\n\
 * - Failed `before` hook skips all tests in a suite and subsuites,\n\
 *   but jumps to corresponding `after` hook\n\
 * - Failed `before each` hook skips remaining tests in a\n\
 *   suite and jumps to corresponding `after each` hook,\n\
 *   which is run only once\n\
 * - Failed `after` hook does not alter\n\
 *   execution order\n\
 * - Failed `after each` hook skips remaining tests in a\n\
 *   suite and subsuites, but executes other `after each`\n\
 *   hooks\n\
 *\n\
 * @param {Hook} hook\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.failHook = function(hook, err){\n\
  this.fail(hook, err);\n\
  if (this.suite.bail()) {\n\
    this.emit('end');\n\
  }\n\
};\n\
\n\
/**\n\
 * Run hook `name` callbacks and then invoke `fn()`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} function\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hook = function(name, fn){\n\
  var suite = this.suite\n\
    , hooks = suite['_' + name]\n\
    , self = this\n\
    , timer;\n\
\n\
  function next(i) {\n\
    var hook = hooks[i];\n\
    if (!hook) return fn();\n\
    if (self.failures && suite.bail()) return fn();\n\
    self.currentRunnable = hook;\n\
\n\
    hook.ctx.currentTest = self.test;\n\
\n\
    self.emit('hook', hook);\n\
\n\
    hook.on('error', function(err){\n\
      self.failHook(hook, err);\n\
    });\n\
\n\
    hook.run(function(err){\n\
      hook.removeAllListeners('error');\n\
      var testError = hook.error();\n\
      if (testError) self.fail(self.test, testError);\n\
      if (err) {\n\
        self.failHook(hook, err);\n\
\n\
        // stop executing hooks, notify callee of hook err\n\
        return fn(err);\n\
      }\n\
      self.emit('hook end', hook);\n\
      delete hook.ctx.currentTest;\n\
      next(++i);\n\
    });\n\
  }\n\
\n\
  Runner.immediately(function(){\n\
    next(0);\n\
  });\n\
};\n\
\n\
/**\n\
 * Run hook `name` for the given array of `suites`\n\
 * in order, and callback `fn(err, errSuite)`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Array} suites\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hooks = function(name, suites, fn){\n\
  var self = this\n\
    , orig = this.suite;\n\
\n\
  function next(suite) {\n\
    self.suite = suite;\n\
\n\
    if (!suite) {\n\
      self.suite = orig;\n\
      return fn();\n\
    }\n\
\n\
    self.hook(name, function(err){\n\
      if (err) {\n\
        var errSuite = self.suite;\n\
        self.suite = orig;\n\
        return fn(err, errSuite);\n\
      }\n\
\n\
      next(suites.pop());\n\
    });\n\
  }\n\
\n\
  next(suites.pop());\n\
};\n\
\n\
/**\n\
 * Run hooks from the top level down.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hookUp = function(name, fn){\n\
  var suites = [this.suite].concat(this.parents()).reverse();\n\
  this.hooks(name, suites, fn);\n\
};\n\
\n\
/**\n\
 * Run hooks from the bottom up.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hookDown = function(name, fn){\n\
  var suites = [this.suite].concat(this.parents());\n\
  this.hooks(name, suites, fn);\n\
};\n\
\n\
/**\n\
 * Return an array of parent Suites from\n\
 * closest to furthest.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.parents = function(){\n\
  var suite = this.suite\n\
    , suites = [];\n\
  while (suite = suite.parent) suites.push(suite);\n\
  return suites;\n\
};\n\
\n\
/**\n\
 * Run the current test and callback `fn(err)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runTest = function(fn){\n\
  var test = this.test\n\
    , self = this;\n\
\n\
  if (this.asyncOnly) test.asyncOnly = true;\n\
\n\
  try {\n\
    test.on('error', function(err){\n\
      self.fail(test, err);\n\
    });\n\
    test.run(fn);\n\
  } catch (err) {\n\
    fn(err);\n\
  }\n\
};\n\
\n\
/**\n\
 * Run tests in the given `suite` and invoke\n\
 * the callback `fn()` when complete.\n\
 *\n\
 * @param {Suite} suite\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runTests = function(suite, fn){\n\
  var self = this\n\
    , tests = suite.tests.slice()\n\
    , test;\n\
\n\
\n\
  function hookErr(err, errSuite, after) {\n\
    // before/after Each hook for errSuite failed:\n\
    var orig = self.suite;\n\
\n\
    // for failed 'after each' hook start from errSuite parent,\n\
    // otherwise start from errSuite itself\n\
    self.suite = after ? errSuite.parent : errSuite;\n\
\n\
    if (self.suite) {\n\
      // call hookUp afterEach\n\
      self.hookUp('afterEach', function(err2, errSuite2) {\n\
        self.suite = orig;\n\
        // some hooks may fail even now\n\
        if (err2) return hookErr(err2, errSuite2, true);\n\
        // report error suite\n\
        fn(errSuite);\n\
      });\n\
    } else {\n\
      // there is no need calling other 'after each' hooks\n\
      self.suite = orig;\n\
      fn(errSuite);\n\
    }\n\
  }\n\
\n\
  function next(err, errSuite) {\n\
    // if we bail after first err\n\
    if (self.failures && suite._bail) return fn();\n\
\n\
    if (self._abort) return fn();\n\
\n\
    if (err) return hookErr(err, errSuite, true);\n\
\n\
    // next test\n\
    test = tests.shift();\n\
\n\
    // all done\n\
    if (!test) return fn();\n\
\n\
    // grep\n\
    var match = self._grep.test(test.fullTitle());\n\
    if (self._invert) match = !match;\n\
    if (!match) return next();\n\
\n\
    // pending\n\
    if (test.pending) {\n\
      self.emit('pending', test);\n\
      self.emit('test end', test);\n\
      return next();\n\
    }\n\
\n\
    // execute test and hook(s)\n\
    self.emit('test', self.test = test);\n\
    self.hookDown('beforeEach', function(err, errSuite){\n\
\n\
      if (err) return hookErr(err, errSuite, false);\n\
\n\
      self.currentRunnable = self.test;\n\
      self.runTest(function(err){\n\
        test = self.test;\n\
\n\
        if (err) {\n\
          self.fail(test, err);\n\
          self.emit('test end', test);\n\
          return self.hookUp('afterEach', next);\n\
        }\n\
\n\
        test.state = 'passed';\n\
        self.emit('pass', test);\n\
        self.emit('test end', test);\n\
        self.hookUp('afterEach', next);\n\
      });\n\
    });\n\
  }\n\
\n\
  this.next = next;\n\
  next();\n\
};\n\
\n\
/**\n\
 * Run the given `suite` and invoke the\n\
 * callback `fn()` when complete.\n\
 *\n\
 * @param {Suite} suite\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runSuite = function(suite, fn){\n\
  var total = this.grepTotal(suite)\n\
    , self = this\n\
    , i = 0;\n\
\n\
  debug('run suite %s', suite.fullTitle());\n\
\n\
  if (!total) return fn();\n\
\n\
  this.emit('suite', this.suite = suite);\n\
\n\
  function next(errSuite) {\n\
    if (errSuite) {\n\
      // current suite failed on a hook from errSuite\n\
      if (errSuite == suite) {\n\
        // if errSuite is current suite\n\
        // continue to the next sibling suite\n\
        return done();\n\
      } else {\n\
        // errSuite is among the parents of current suite\n\
        // stop execution of errSuite and all sub-suites\n\
        return done(errSuite);\n\
      }\n\
    }\n\
\n\
    if (self._abort) return done();\n\
\n\
    var curr = suite.suites[i++];\n\
    if (!curr) return done();\n\
    self.runSuite(curr, next);\n\
  }\n\
\n\
  function done(errSuite) {\n\
    self.suite = suite;\n\
    self.hook('afterAll', function(){\n\
      self.emit('suite end', suite);\n\
      fn(errSuite);\n\
    });\n\
  }\n\
\n\
  this.hook('beforeAll', function(err){\n\
    if (err) return done();\n\
    self.runTests(suite, next);\n\
  });\n\
};\n\
\n\
/**\n\
 * Handle uncaught exceptions.\n\
 *\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.uncaught = function(err){\n\
  debug('uncaught exception %s', err.message);\n\
  var runnable = this.currentRunnable;\n\
  if (!runnable || 'failed' == runnable.state) return;\n\
  runnable.clearTimeout();\n\
  err.uncaught = true;\n\
  this.fail(runnable, err);\n\
\n\
  // recover from test\n\
  if ('test' == runnable.type) {\n\
    this.emit('test end', runnable);\n\
    this.hookUp('afterEach', this.next);\n\
    return;\n\
  }\n\
\n\
  // bail on hooks\n\
  this.emit('end');\n\
};\n\
\n\
/**\n\
 * Run the root suite and invoke `fn(failures)`\n\
 * on completion.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.run = function(fn){\n\
  var self = this\n\
    , fn = fn || function(){};\n\
\n\
  function uncaught(err){\n\
    self.uncaught(err);\n\
  }\n\
\n\
  debug('start');\n\
\n\
  // callback\n\
  this.on('end', function(){\n\
    debug('end');\n\
    process.removeListener('uncaughtException', uncaught);\n\
    fn(self.failures);\n\
  });\n\
\n\
  // run suites\n\
  this.emit('start');\n\
  this.runSuite(this.suite, function(){\n\
    debug('finished running');\n\
    self.emit('end');\n\
  });\n\
\n\
  // uncaught exception\n\
  process.on('uncaughtException', uncaught);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Cleanly abort execution\n\
 *\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
Runner.prototype.abort = function(){\n\
  debug('aborting');\n\
  this._abort = true;\n\
}\n\
\n\
/**\n\
 * Filter leaks with the given globals flagged as `ok`.\n\
 *\n\
 * @param {Array} ok\n\
 * @param {Array} globals\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function filterLeaks(ok, globals) {\n\
  return filter(globals, function(key){\n\
    // Firefox and Chrome exposes iframes as index inside the window object\n\
    if (/^d+/.test(key)) return false;\n\
\n\
    // in firefox\n\
    // if runner runs in an iframe, this iframe's window.getInterface method not init at first\n\
    // it is assigned in some seconds\n\
    if (global.navigator && /^getInterface/.test(key)) return false;\n\
\n\
    // an iframe could be approached by window[iframeIndex]\n\
    // in ie6,7,8 and opera, iframeIndex is enumerable, this could cause leak\n\
    if (global.navigator && /^\\d+/.test(key)) return false;\n\
\n\
    // Opera and IE expose global variables for HTML element IDs (issue #243)\n\
    if (/^mocha-/.test(key)) return false;\n\
\n\
    var matched = filter(ok, function(ok){\n\
      if (~ok.indexOf('*')) return 0 == key.indexOf(ok.split('*')[0]);\n\
      return key == ok;\n\
    });\n\
    return matched.length == 0 && (!global.navigator || 'onerror' !== key);\n\
  });\n\
}\n\
\n\
/**\n\
 * Array of globals dependent on the environment.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
 function extraGlobals() {\n\
  if (typeof(process) === 'object' &&\n\
      typeof(process.version) === 'string') {\n\
\n\
    var nodeVersion = process.version.split('.').reduce(function(a, v) {\n\
      return a << 8 | v;\n\
    });\n\
\n\
    // 'errno' was renamed to process._errno in v0.9.11.\n\
\n\
    if (nodeVersion < 0x00090B) {\n\
      return ['errno'];\n\
    }\n\
  }\n\
\n\
  return [];\n\
 }\n\
\n\
}); // module: runner.js\n\
\n\
require.register(\"suite.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:suite')\n\
  , milliseconds = require('./ms')\n\
  , utils = require('./utils')\n\
  , Hook = require('./hook');\n\
\n\
/**\n\
 * Expose `Suite`.\n\
 */\n\
\n\
exports = module.exports = Suite;\n\
\n\
/**\n\
 * Create a new `Suite` with the given `title`\n\
 * and parent `Suite`. When a suite with the\n\
 * same title is already present, that suite\n\
 * is returned to provide nicer reporter\n\
 * and more flexible meta-testing.\n\
 *\n\
 * @param {Suite} parent\n\
 * @param {String} title\n\
 * @return {Suite}\n\
 * @api public\n\
 */\n\
\n\
exports.create = function(parent, title){\n\
  var suite = new Suite(title, parent.ctx);\n\
  suite.parent = parent;\n\
  if (parent.pending) suite.pending = true;\n\
  title = suite.fullTitle();\n\
  parent.addSuite(suite);\n\
  return suite;\n\
};\n\
\n\
/**\n\
 * Initialize a new `Suite` with the given\n\
 * `title` and `ctx`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Context} ctx\n\
 * @api private\n\
 */\n\
\n\
function Suite(title, ctx) {\n\
  this.title = title;\n\
  this.ctx = ctx;\n\
  this.suites = [];\n\
  this.tests = [];\n\
  this.pending = false;\n\
  this._beforeEach = [];\n\
  this._beforeAll = [];\n\
  this._afterEach = [];\n\
  this._afterAll = [];\n\
  this.root = !title;\n\
  this._timeout = 2000;\n\
  this._slow = 75;\n\
  this._bail = false;\n\
}\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Suite.prototype = new F;\n\
Suite.prototype.constructor = Suite;\n\
\n\
\n\
/**\n\
 * Return a clone of this `Suite`.\n\
 *\n\
 * @return {Suite}\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.clone = function(){\n\
  var suite = new Suite(this.title);\n\
  debug('clone');\n\
  suite.ctx = this.ctx;\n\
  suite.timeout(this.timeout());\n\
  suite.slow(this.slow());\n\
  suite.bail(this.bail());\n\
  return suite;\n\
};\n\
\n\
/**\n\
 * Set timeout `ms` or short-hand such as \"2s\".\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.timeout = function(ms){\n\
  if (0 == arguments.length) return this._timeout;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._timeout = parseInt(ms, 10);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set slow `ms` or short-hand such as \"2s\".\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.slow = function(ms){\n\
  if (0 === arguments.length) return this._slow;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('slow %d', ms);\n\
  this._slow = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Sets whether to bail after first error.\n\
 *\n\
 * @parma {Boolean} bail\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.bail = function(bail){\n\
  if (0 == arguments.length) return this._bail;\n\
  debug('bail %s', bail);\n\
  this._bail = bail;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` before running tests.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.beforeAll = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"before all\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._beforeAll.push(hook);\n\
  this.emit('beforeAll', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` after running tests.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.afterAll = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"after all\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._afterAll.push(hook);\n\
  this.emit('afterAll', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` before each test case.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.beforeEach = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"before each\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._beforeEach.push(hook);\n\
  this.emit('beforeEach', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` after each test case.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.afterEach = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"after each\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._afterEach.push(hook);\n\
  this.emit('afterEach', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add a test `suite`.\n\
 *\n\
 * @param {Suite} suite\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.addSuite = function(suite){\n\
  suite.parent = this;\n\
  suite.timeout(this.timeout());\n\
  suite.slow(this.slow());\n\
  suite.bail(this.bail());\n\
  this.suites.push(suite);\n\
  this.emit('suite', suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add a `test` to this suite.\n\
 *\n\
 * @param {Test} test\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.addTest = function(test){\n\
  test.parent = this;\n\
  test.timeout(this.timeout());\n\
  test.slow(this.slow());\n\
  test.ctx = this.ctx;\n\
  this.tests.push(test);\n\
  this.emit('test', test);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.fullTitle = function(){\n\
  if (this.parent) {\n\
    var full = this.parent.fullTitle();\n\
    if (full) return full + ' ' + this.title;\n\
  }\n\
  return this.title;\n\
};\n\
\n\
/**\n\
 * Return the total number of tests.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.total = function(){\n\
  return utils.reduce(this.suites, function(sum, suite){\n\
    return sum + suite.total();\n\
  }, 0) + this.tests.length;\n\
};\n\
\n\
/**\n\
 * Iterates through each suite recursively to find\n\
 * all tests. Applies a function in the format\n\
 * `fn(test)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite}\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.eachTest = function(fn){\n\
  utils.forEach(this.tests, fn);\n\
  utils.forEach(this.suites, function(suite){\n\
    suite.eachTest(fn);\n\
  });\n\
  return this;\n\
};\n\
\n\
}); // module: suite.js\n\
\n\
require.register(\"test.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Runnable = require('./runnable');\n\
\n\
/**\n\
 * Expose `Test`.\n\
 */\n\
\n\
module.exports = Test;\n\
\n\
/**\n\
 * Initialize a new `Test` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Test(title, fn) {\n\
  Runnable.call(this, title, fn);\n\
  this.pending = !fn;\n\
  this.type = 'test';\n\
}\n\
\n\
/**\n\
 * Inherit from `Runnable.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Runnable.prototype;\n\
Test.prototype = new F;\n\
Test.prototype.constructor = Test;\n\
\n\
\n\
}); // module: test.js\n\
\n\
require.register(\"utils.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var fs = require('browser/fs')\n\
  , path = require('browser/path')\n\
  , join = path.join\n\
  , debug = require('browser/debug')('mocha:watch');\n\
\n\
/**\n\
 * Ignored directories.\n\
 */\n\
\n\
var ignore = ['node_modules', '.git'];\n\
\n\
/**\n\
 * Escape special characters in the given string of html.\n\
 *\n\
 * @param  {String} html\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escape = function(html){\n\
  return String(html)\n\
    .replace(/&/g, '&amp;')\n\
    .replace(/\"/g, '&quot;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;');\n\
};\n\
\n\
/**\n\
 * Array#forEach (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @param {Object} scope\n\
 * @api private\n\
 */\n\
\n\
exports.forEach = function(arr, fn, scope){\n\
  for (var i = 0, l = arr.length; i < l; i++)\n\
    fn.call(scope, arr[i], i);\n\
};\n\
\n\
/**\n\
 * Array#map (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @param {Object} scope\n\
 * @api private\n\
 */\n\
\n\
exports.map = function(arr, fn, scope){\n\
  var result = [];\n\
  for (var i = 0, l = arr.length; i < l; i++)\n\
    result.push(fn.call(scope, arr[i], i));\n\
  return result;\n\
};\n\
\n\
/**\n\
 * Array#indexOf (<=IE8)\n\
 *\n\
 * @parma {Array} arr\n\
 * @param {Object} obj to find index of\n\
 * @param {Number} start\n\
 * @api private\n\
 */\n\
\n\
exports.indexOf = function(arr, obj, start){\n\
  for (var i = start || 0, l = arr.length; i < l; i++) {\n\
    if (arr[i] === obj)\n\
      return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Array#reduce (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @param {Object} initial value\n\
 * @api private\n\
 */\n\
\n\
exports.reduce = function(arr, fn, val){\n\
  var rval = val;\n\
\n\
  for (var i = 0, l = arr.length; i < l; i++) {\n\
    rval = fn(rval, arr[i], i, arr);\n\
  }\n\
\n\
  return rval;\n\
};\n\
\n\
/**\n\
 * Array#filter (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
exports.filter = function(arr, fn){\n\
  var ret = [];\n\
\n\
  for (var i = 0, l = arr.length; i < l; i++) {\n\
    var val = arr[i];\n\
    if (fn(val, i, arr)) ret.push(val);\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Object.keys (<=IE8)\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Array} keys\n\
 * @api private\n\
 */\n\
\n\
exports.keys = Object.keys || function(obj) {\n\
  var keys = []\n\
    , has = Object.prototype.hasOwnProperty // for `window` on <=IE8\n\
\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      keys.push(key);\n\
    }\n\
  }\n\
\n\
  return keys;\n\
};\n\
\n\
/**\n\
 * Watch the given `files` for changes\n\
 * and invoke `fn(file)` on modification.\n\
 *\n\
 * @param {Array} files\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
exports.watch = function(files, fn){\n\
  var options = { interval: 100 };\n\
  files.forEach(function(file){\n\
    debug('file %s', file);\n\
    fs.watchFile(file, options, function(curr, prev){\n\
      if (prev.mtime < curr.mtime) fn(file);\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Ignored files.\n\
 */\n\
\n\
function ignored(path){\n\
  return !~ignore.indexOf(path);\n\
}\n\
\n\
/**\n\
 * Lookup files in the given `dir`.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.files = function(dir, ret){\n\
  ret = ret || [];\n\
\n\
  fs.readdirSync(dir)\n\
  .filter(ignored)\n\
  .forEach(function(path){\n\
    path = join(dir, path);\n\
    if (fs.statSync(path).isDirectory()) {\n\
      exports.files(path, ret);\n\
    } else if (path.match(/\\.(js|coffee|litcoffee|coffee.md)$/)) {\n\
      ret.push(path);\n\
    }\n\
  });\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Compute a slug from the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.slug = function(str){\n\
  return str\n\
    .toLowerCase()\n\
    .replace(/ +/g, '-')\n\
    .replace(/[^-\\w]/g, '');\n\
};\n\
\n\
/**\n\
 * Strip the function definition from `str`,\n\
 * and re-indent for pre whitespace.\n\
 */\n\
\n\
exports.clean = function(str) {\n\
  str = str\n\
    .replace(/\\r\\n\
?|[\\n\
\\u2028\\u2029]/g, \"\\n\
\").replace(/^\\uFEFF/, '')\n\
    .replace(/^function *\\(.*\\) *{/, '')\n\
    .replace(/\\s+\\}$/, '');\n\
\n\
  var spaces = str.match(/^\\n\
?( *)/)[1].length\n\
    , tabs = str.match(/^\\n\
?(\\t*)/)[1].length\n\
    , re = new RegExp('^\\n\
?' + (tabs ? '\\t' : ' ') + '{' + (tabs ? tabs : spaces) + '}', 'gm');\n\
\n\
  str = str.replace(re, '');\n\
\n\
  return exports.trim(str);\n\
};\n\
\n\
/**\n\
 * Escape regular expression characters in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escapeRegexp = function(str){\n\
  return str.replace(/[-\\\\^$*+?.()|[\\]{}]/g, \"\\\\$&\");\n\
};\n\
\n\
/**\n\
 * Trim the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.trim = function(str){\n\
  return str.replace(/^\\s+|\\s+$/g, '');\n\
};\n\
\n\
/**\n\
 * Parse the given `qs`.\n\
 *\n\
 * @param {String} qs\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
exports.parseQuery = function(qs){\n\
  return exports.reduce(qs.replace('?', '').split('&'), function(obj, pair){\n\
    var i = pair.indexOf('=')\n\
      , key = pair.slice(0, i)\n\
      , val = pair.slice(++i);\n\
\n\
    obj[key] = decodeURIComponent(val);\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Highlight the given string of `js`.\n\
 *\n\
 * @param {String} js\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function highlight(js) {\n\
  return js\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\\/\\/(.*)/gm, '<span class=\"comment\">//$1</span>')\n\
    .replace(/('.*?')/gm, '<span class=\"string\">$1</span>')\n\
    .replace(/(\\d+\\.\\d+)/gm, '<span class=\"number\">$1</span>')\n\
    .replace(/(\\d+)/gm, '<span class=\"number\">$1</span>')\n\
    .replace(/\\bnew *(\\w+)/gm, '<span class=\"keyword\">new</span> <span class=\"init\">$1</span>')\n\
    .replace(/\\b(function|new|throw|return|var|if|else)\\b/gm, '<span class=\"keyword\">$1</span>')\n\
}\n\
\n\
/**\n\
 * Highlight the contents of tag `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
exports.highlightTags = function(name) {\n\
  var code = document.getElementsByTagName(name);\n\
  for (var i = 0, len = code.length; i < len; ++i) {\n\
    code[i].innerHTML = highlight(code[i].innerHTML);\n\
  }\n\
};\n\
\n\
}); // module: utils.js\n\
// The global object is \"self\" in Web Workers.\n\
global = (function() { return this; })();\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date;\n\
var setTimeout = global.setTimeout;\n\
var setInterval = global.setInterval;\n\
var clearTimeout = global.clearTimeout;\n\
var clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Node shims.\n\
 *\n\
 * These are meant only to allow\n\
 * mocha.js to run untouched, not\n\
 * to allow running node code in\n\
 * the browser.\n\
 */\n\
\n\
var process = {};\n\
process.exit = function(status){};\n\
process.stdout = {};\n\
\n\
var uncaughtExceptionHandlers = [];\n\
\n\
/**\n\
 * Remove uncaughtException listener.\n\
 */\n\
\n\
process.removeListener = function(e, fn){\n\
  if ('uncaughtException' == e) {\n\
    global.onerror = function() {};\n\
    var i = Mocha.utils.indexOf(uncaughtExceptionHandlers, fn);\n\
    if (i != -1) { uncaughtExceptionHandlers.splice(i, 1); }\n\
  }\n\
};\n\
\n\
/**\n\
 * Implements uncaughtException listener.\n\
 */\n\
\n\
process.on = function(e, fn){\n\
  if ('uncaughtException' == e) {\n\
    global.onerror = function(err, url, line){\n\
      fn(new Error(err + ' (' + url + ':' + line + ')'));\n\
      return true;\n\
    };\n\
    uncaughtExceptionHandlers.push(fn);\n\
  }\n\
};\n\
\n\
/**\n\
 * Expose mocha.\n\
 */\n\
\n\
var Mocha = global.Mocha = require('mocha'),\n\
    mocha = global.mocha = new Mocha({ reporter: 'html' });\n\
\n\
// The BDD UI is registered by default, but no UI will be functional in the\n\
// browser without an explicit call to the overridden `mocha.ui` (see below).\n\
// Ensure that this default UI does not expose its methods to the global scope.\n\
mocha.suite.removeAllListeners('pre-require');\n\
\n\
var immediateQueue = []\n\
  , immediateTimeout;\n\
\n\
function timeslice() {\n\
  var immediateStart = new Date().getTime();\n\
  while (immediateQueue.length && (new Date().getTime() - immediateStart) < 100) {\n\
    immediateQueue.shift()();\n\
  }\n\
  if (immediateQueue.length) {\n\
    immediateTimeout = setTimeout(timeslice, 0);\n\
  } else {\n\
    immediateTimeout = null;\n\
  }\n\
}\n\
\n\
/**\n\
 * High-performance override of Runner.immediately.\n\
 */\n\
\n\
Mocha.Runner.immediately = function(callback) {\n\
  immediateQueue.push(callback);\n\
  if (!immediateTimeout) {\n\
    immediateTimeout = setTimeout(timeslice, 0);\n\
  }\n\
};\n\
\n\
/**\n\
 * Function to allow assertion libraries to throw errors directly into mocha.\n\
 * This is useful when running tests in a browser because window.onerror will\n\
 * only receive the 'message' attribute of the Error.\n\
 */\n\
mocha.throwError = function(err) {\n\
  Mocha.utils.forEach(uncaughtExceptionHandlers, function (fn) {\n\
    fn(err);\n\
  });\n\
  throw err;\n\
};\n\
\n\
/**\n\
 * Override ui to ensure that the ui functions are initialized.\n\
 * Normally this would happen in Mocha.prototype.loadFiles.\n\
 */\n\
\n\
mocha.ui = function(ui){\n\
  Mocha.prototype.ui.call(this, ui);\n\
  this.suite.emit('pre-require', global, null, this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Setup mocha with the given setting options.\n\
 */\n\
\n\
mocha.setup = function(opts){\n\
  if ('string' == typeof opts) opts = { ui: opts };\n\
  for (var opt in opts) this[opt](opts[opt]);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run mocha, returning the Runner.\n\
 */\n\
\n\
mocha.run = function(fn){\n\
  var options = mocha.options;\n\
  mocha.globals('location');\n\
\n\
  var query = Mocha.utils.parseQuery(global.location.search || '');\n\
  if (query.grep) mocha.grep(query.grep);\n\
  if (query.invert) mocha.invert();\n\
\n\
  return Mocha.prototype.run.call(mocha, function(){\n\
    // The DOM Document is not available in Web Workers.\n\
    if (global.document) {\n\
      Mocha.utils.highlightTags('code');\n\
    }\n\
    if (fn) fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Expose the process shim.\n\
 */\n\
\n\
Mocha.process = process;\n\
})();//@ sourceURL=visionmedia-mocha/mocha.js"
));
require.register("techjacker-expect.js/expect.js", Function("exports, require, module",
"(function (global, module) {\n\
\n\
  var exports = module.exports;\n\
\n\
  /**\n\
   * Exports.\n\
   */\n\
\n\
  module.exports = expect;\n\
  expect.Assertion = Assertion;\n\
\n\
  /**\n\
   * Exports version.\n\
   */\n\
\n\
  expect.version = '0.1.2';\n\
\n\
  /**\n\
   * Possible assertion flags.\n\
   */\n\
\n\
  var flags = {\n\
      not: ['to', 'be', 'have', 'include', 'only']\n\
    , to: ['be', 'have', 'include', 'only', 'not']\n\
    , only: ['have']\n\
    , have: ['own']\n\
    , be: ['an']\n\
  };\n\
\n\
  function expect (obj) {\n\
    return new Assertion(obj);\n\
  }\n\
\n\
  /**\n\
   * Constructor\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  function Assertion (obj, flag, parent) {\n\
    this.obj = obj;\n\
    this.flags = {};\n\
\n\
    if (undefined != parent) {\n\
      this.flags[flag] = true;\n\
\n\
      for (var i in parent.flags) {\n\
        if (parent.flags.hasOwnProperty(i)) {\n\
          this.flags[i] = true;\n\
        }\n\
      }\n\
    }\n\
\n\
    var $flags = flag ? flags[flag] : keys(flags)\n\
      , self = this;\n\
\n\
    if ($flags) {\n\
      for (var i = 0, l = $flags.length; i < l; i++) {\n\
        // avoid recursion\n\
        if (this.flags[$flags[i]]) continue;\n\
\n\
        var name = $flags[i]\n\
          , assertion = new Assertion(this.obj, name, this)\n\
\n\
        if ('function' == typeof Assertion.prototype[name]) {\n\
          // clone the function, make sure we dont touch the prot reference\n\
          var old = this[name];\n\
          this[name] = function () {\n\
            return old.apply(self, arguments);\n\
          };\n\
\n\
          for (var fn in Assertion.prototype) {\n\
            if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {\n\
              this[name][fn] = bind(assertion[fn], assertion);\n\
            }\n\
          }\n\
        } else {\n\
          this[name] = assertion;\n\
        }\n\
      }\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Performs an assertion\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Assertion.prototype.assert = function (truth, msg, error, expected) {\n\
    var msg = this.flags.not ? error : msg\n\
      , ok = this.flags.not ? !truth : truth\n\
      , err;\n\
\n\
    if (!ok) {\n\
      err = new Error(msg.call(this));\n\
      if (arguments.length > 3) {\n\
        err.actual = this.obj;\n\
        err.expected = expected;\n\
        err.showDiff = true;\n\
      }\n\
      throw err;\n\
    }\n\
\n\
    this.and = new Assertion(this.obj);\n\
  };\n\
\n\
  /**\n\
   * Check if the value is truthy\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.ok = function () {\n\
    this.assert(\n\
        !!this.obj\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be truthy' }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be falsy' });\n\
  };\n\
\n\
  /**\n\
   * Creates an anonymous function which calls fn with arguments.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.withArgs = function() {\n\
    expect(this.obj).to.be.a('function');\n\
    var fn = this.obj;\n\
    var args = Array.prototype.slice.call(arguments);\n\
    return expect(function() { fn.apply(null, args); });\n\
  };\n\
\n\
  /**\n\
   * Assert that the function throws.\n\
   *\n\
   * @param {Function|RegExp} callback, or regexp to match error string against\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.throwError =\n\
  Assertion.prototype.throwException = function (fn) {\n\
    expect(this.obj).to.be.a('function');\n\
\n\
    var thrown = false\n\
      , not = this.flags.not;\n\
\n\
    try {\n\
      this.obj();\n\
    } catch (e) {\n\
      if (isRegExp(fn)) {\n\
        var subject = 'string' == typeof e ? e : e.message;\n\
        if (not) {\n\
          expect(subject).to.not.match(fn);\n\
        } else {\n\
          expect(subject).to.match(fn);\n\
        }\n\
      } else if ('function' == typeof fn) {\n\
        fn(e);\n\
      }\n\
      thrown = true;\n\
    }\n\
\n\
    if (isRegExp(fn) && not) {\n\
      // in the presence of a matcher, ensure the `not` only applies to\n\
      // the matching.\n\
      this.flags.not = false;\n\
    }\n\
\n\
    var name = this.obj.name || 'fn';\n\
    this.assert(\n\
        thrown\n\
      , function(){ return 'expected ' + name + ' to throw an exception' }\n\
      , function(){ return 'expected ' + name + ' not to throw an exception' });\n\
  };\n\
\n\
  /**\n\
   * Checks if the array is empty.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.empty = function () {\n\
    var expectation;\n\
\n\
    if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {\n\
      if ('number' == typeof this.obj.length) {\n\
        expectation = !this.obj.length;\n\
      } else {\n\
        expectation = !keys(this.obj).length;\n\
      }\n\
    } else {\n\
      if ('string' != typeof this.obj) {\n\
        expect(this.obj).to.be.an('object');\n\
      }\n\
\n\
      expect(this.obj).to.have.property('length');\n\
      expectation = !this.obj.length;\n\
    }\n\
\n\
    this.assert(\n\
        expectation\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be empty' }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to not be empty' });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Checks if the obj exactly equals another.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.be =\n\
  Assertion.prototype.equal = function (obj) {\n\
    this.assert(\n\
        obj === this.obj\n\
      , function(){ return 'expected ' + i(this.obj) + ' to equal ' + i(obj) }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to not equal ' + i(obj) });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Checks if the obj sortof equals another.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.eql = function (obj) {\n\
    this.assert(\n\
        expect.eql(this.obj, obj)\n\
      , function(){ return 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj) }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj) }\n\
      , obj);\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert within start to finish (inclusive).\n\
   *\n\
   * @param {Number} start\n\
   * @param {Number} finish\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.within = function (start, finish) {\n\
    var range = start + '..' + finish;\n\
    this.assert(\n\
        this.obj >= start && this.obj <= finish\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be within ' + range }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to not be within ' + range });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert typeof / instance of\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.a =\n\
  Assertion.prototype.an = function (type) {\n\
    if ('string' == typeof type) {\n\
      // proper english in error msg\n\
      var n = /^[aeiou]/.test(type) ? 'n' : '';\n\
\n\
      // typeof with support for 'array'\n\
      this.assert(\n\
          'array' == type ? isArray(this.obj) :\n\
            'regexp' == type ? isRegExp(this.obj) :\n\
              'object' == type\n\
                ? 'object' == typeof this.obj && null !== this.obj\n\
                : type == typeof this.obj\n\
        , function(){ return 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type }\n\
        , function(){ return 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type });\n\
    } else {\n\
      // instanceof\n\
      var name = type.name || 'supplied constructor';\n\
      this.assert(\n\
          this.obj instanceof type\n\
        , function(){ return 'expected ' + i(this.obj) + ' to be an instance of ' + name }\n\
        , function(){ return 'expected ' + i(this.obj) + ' not to be an instance of ' + name });\n\
    }\n\
\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert numeric value above _n_.\n\
   *\n\
   * @param {Number} n\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.greaterThan =\n\
  Assertion.prototype.above = function (n) {\n\
    this.assert(\n\
        this.obj > n\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert numeric value below _n_.\n\
   *\n\
   * @param {Number} n\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.lessThan =\n\
  Assertion.prototype.below = function (n) {\n\
    this.assert(\n\
        this.obj < n\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert string value matches _regexp_.\n\
   *\n\
   * @param {RegExp} regexp\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.match = function (regexp) {\n\
    this.assert(\n\
        regexp.exec(this.obj)\n\
      , function(){ return 'expected ' + i(this.obj) + ' to match ' + regexp }\n\
      , function(){ return 'expected ' + i(this.obj) + ' not to match ' + regexp });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert property \"length\" exists and has value of _n_.\n\
   *\n\
   * @param {Number} n\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.length = function (n) {\n\
    expect(this.obj).to.have.property('length');\n\
    var len = this.obj.length;\n\
    this.assert(\n\
        n == len\n\
      , function(){ return 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to not have a length of ' + len });\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert property _name_ exists, with optional _val_.\n\
   *\n\
   * @param {String} name\n\
   * @param {Mixed} val\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.property = function (name, val) {\n\
    if (this.flags.own) {\n\
      this.assert(\n\
          Object.prototype.hasOwnProperty.call(this.obj, name)\n\
        , function(){ return 'expected ' + i(this.obj) + ' to have own property ' + i(name) }\n\
        , function(){ return 'expected ' + i(this.obj) + ' to not have own property ' + i(name) });\n\
      return this;\n\
    }\n\
\n\
    if (this.flags.not && undefined !== val) {\n\
      if (undefined === this.obj[name]) {\n\
        throw new Error(i(this.obj) + ' has no property ' + i(name));\n\
      }\n\
    } else {\n\
      var hasProp;\n\
      try {\n\
        hasProp = name in this.obj\n\
      } catch (e) {\n\
        hasProp = undefined !== this.obj[name]\n\
      }\n\
\n\
      this.assert(\n\
          hasProp\n\
        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name) }\n\
        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name) });\n\
    }\n\
\n\
    if (undefined !== val) {\n\
      this.assert(\n\
          val === this.obj[name]\n\
        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name)\n\
          + ' of ' + i(val) + ', but got ' + i(this.obj[name]) }\n\
        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name)\n\
          + ' of ' + i(val) });\n\
    }\n\
\n\
    this.obj = this.obj[name];\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert that the array contains _obj_ or string contains _obj_.\n\
   *\n\
   * @param {Mixed} obj|string\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.string =\n\
  Assertion.prototype.contain = function (obj) {\n\
    if ('string' == typeof this.obj) {\n\
      this.assert(\n\
          ~this.obj.indexOf(obj)\n\
        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }\n\
        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });\n\
    } else {\n\
      this.assert(\n\
          ~indexOf(this.obj, obj)\n\
        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }\n\
        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });\n\
    }\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert exact keys or inclusion of keys by using\n\
   * the `.own` modifier.\n\
   *\n\
   * @param {Array|String ...} keys\n\
   * @api public\n\
   */\n\
\n\
  Assertion.prototype.key =\n\
  Assertion.prototype.keys = function ($keys) {\n\
    var str\n\
      , ok = true;\n\
\n\
    $keys = isArray($keys)\n\
      ? $keys\n\
      : Array.prototype.slice.call(arguments);\n\
\n\
    if (!$keys.length) throw new Error('keys required');\n\
\n\
    var actual = keys(this.obj)\n\
      , len = $keys.length;\n\
\n\
    // Inclusion\n\
    ok = every($keys, function (key) {\n\
      return ~indexOf(actual, key);\n\
    });\n\
\n\
    // Strict\n\
    if (!this.flags.not && this.flags.only) {\n\
      ok = ok && $keys.length == actual.length;\n\
    }\n\
\n\
    // Key string\n\
    if (len > 1) {\n\
      $keys = map($keys, function (key) {\n\
        return i(key);\n\
      });\n\
      var last = $keys.pop();\n\
      str = $keys.join(', ') + ', and ' + last;\n\
    } else {\n\
      str = i($keys[0]);\n\
    }\n\
\n\
    // Form\n\
    str = (len > 1 ? 'keys ' : 'key ') + str;\n\
\n\
    // Have / include\n\
    str = (!this.flags.only ? 'include ' : 'only have ') + str;\n\
\n\
    // Assertion\n\
    this.assert(\n\
        ok\n\
      , function(){ return 'expected ' + i(this.obj) + ' to ' + str }\n\
      , function(){ return 'expected ' + i(this.obj) + ' to not ' + str });\n\
\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Assert a failure.\n\
   *\n\
   * @param {String ...} custom message\n\
   * @api public\n\
   */\n\
  Assertion.prototype.fail = function (msg) {\n\
    var error = function() { return msg || \"explicit failure\"; }\n\
    this.assert(false, error, error);\n\
    return this;\n\
  };\n\
\n\
  /**\n\
   * Function bind implementation.\n\
   */\n\
\n\
  function bind (fn, scope) {\n\
    return function () {\n\
      return fn.apply(scope, arguments);\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Array every compatibility\n\
   *\n\
   * @see bit.ly/5Fq1N2\n\
   * @api public\n\
   */\n\
\n\
  function every (arr, fn, thisObj) {\n\
    var scope = thisObj || global;\n\
    for (var i = 0, j = arr.length; i < j; ++i) {\n\
      if (!fn.call(scope, arr[i], i, arr)) {\n\
        return false;\n\
      }\n\
    }\n\
    return true;\n\
  }\n\
\n\
  /**\n\
   * Array indexOf compatibility.\n\
   *\n\
   * @see bit.ly/a5Dxa2\n\
   * @api public\n\
   */\n\
\n\
  function indexOf (arr, o, i) {\n\
    if (Array.prototype.indexOf) {\n\
      return Array.prototype.indexOf.call(arr, o, i);\n\
    }\n\
\n\
    if (arr.length === undefined) {\n\
      return -1;\n\
    }\n\
\n\
    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0\n\
        ; i < j && arr[i] !== o; i++);\n\
\n\
    return j <= i ? -1 : i;\n\
  }\n\
\n\
  // https://gist.github.com/1044128/\n\
  var getOuterHTML = function(element) {\n\
    if ('outerHTML' in element) return element.outerHTML;\n\
    var ns = \"http://www.w3.org/1999/xhtml\";\n\
    var container = document.createElementNS(ns, '_');\n\
    var xmlSerializer = new XMLSerializer();\n\
    var html;\n\
    if (document.xmlVersion) {\n\
      return xmlSerializer.serializeToString(element);\n\
    } else {\n\
      container.appendChild(element.cloneNode(false));\n\
      html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');\n\
      container.innerHTML = '';\n\
      return html;\n\
    }\n\
  };\n\
\n\
  // Returns true if object is a DOM element.\n\
  var isDOMElement = function (object) {\n\
    if (typeof HTMLElement === 'object') {\n\
      return object instanceof HTMLElement;\n\
    } else {\n\
      return object &&\n\
        typeof object === 'object' &&\n\
        object.nodeType === 1 &&\n\
        typeof object.nodeName === 'string';\n\
    }\n\
  };\n\
\n\
  /**\n\
   * Inspects an object.\n\
   *\n\
   * @see taken from node.js `util` module (copyright Joyent, MIT license)\n\
   * @api private\n\
   */\n\
\n\
  function i (obj, showHidden, depth) {\n\
    var seen = [];\n\
\n\
    function stylize (str) {\n\
      return str;\n\
    }\n\
\n\
    function format (value, recurseTimes) {\n\
      // Provide a hook for user-specified inspect functions.\n\
      // Check that value is an object with an inspect function on it\n\
      if (value && typeof value.inspect === 'function' &&\n\
          // Filter out the util module, it's inspect function is special\n\
          value !== exports &&\n\
          // Also filter out any prototype objects using the circular check.\n\
          !(value.constructor && value.constructor.prototype === value)) {\n\
        return value.inspect(recurseTimes);\n\
      }\n\
\n\
      // Primitive types cannot have properties\n\
      switch (typeof value) {\n\
        case 'undefined':\n\
          return stylize('undefined', 'undefined');\n\
\n\
        case 'string':\n\
          var simple = '\\'' + json.stringify(value).replace(/^\"|\"$/g, '')\n\
                                                   .replace(/'/g, \"\\\\'\")\n\
                                                   .replace(/\\\\\"/g, '\"') + '\\'';\n\
          return stylize(simple, 'string');\n\
\n\
        case 'number':\n\
          return stylize('' + value, 'number');\n\
\n\
        case 'boolean':\n\
          return stylize('' + value, 'boolean');\n\
      }\n\
      // For some reason typeof null is \"object\", so special case here.\n\
      if (value === null) {\n\
        return stylize('null', 'null');\n\
      }\n\
\n\
      if (isDOMElement(value)) {\n\
        return getOuterHTML(value);\n\
      }\n\
\n\
      // Look up the keys of the object.\n\
      var visible_keys = keys(value);\n\
      var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;\n\
\n\
      // Functions without properties can be shortcutted.\n\
      if (typeof value === 'function' && $keys.length === 0) {\n\
        if (isRegExp(value)) {\n\
          return stylize('' + value, 'regexp');\n\
        } else {\n\
          var name = value.name ? ': ' + value.name : '';\n\
          return stylize('[Function' + name + ']', 'special');\n\
        }\n\
      }\n\
\n\
      // Dates without properties can be shortcutted\n\
      if (isDate(value) && $keys.length === 0) {\n\
        return stylize(value.toUTCString(), 'date');\n\
      }\n\
      \n\
      // Error objects can be shortcutted\n\
      if (value instanceof Error) {\n\
        return stylize(\"[\"+value.toString()+\"]\", 'Error');\n\
      }\n\
\n\
      var base, type, braces;\n\
      // Determine the object type\n\
      if (isArray(value)) {\n\
        type = 'Array';\n\
        braces = ['[', ']'];\n\
      } else {\n\
        type = 'Object';\n\
        braces = ['{', '}'];\n\
      }\n\
\n\
      // Make functions say that they are functions\n\
      if (typeof value === 'function') {\n\
        var n = value.name ? ': ' + value.name : '';\n\
        base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';\n\
      } else {\n\
        base = '';\n\
      }\n\
\n\
      // Make dates with properties first say the date\n\
      if (isDate(value)) {\n\
        base = ' ' + value.toUTCString();\n\
      }\n\
\n\
      if ($keys.length === 0) {\n\
        return braces[0] + base + braces[1];\n\
      }\n\
\n\
      if (recurseTimes < 0) {\n\
        if (isRegExp(value)) {\n\
          return stylize('' + value, 'regexp');\n\
        } else {\n\
          return stylize('[Object]', 'special');\n\
        }\n\
      }\n\
\n\
      seen.push(value);\n\
\n\
      var output = map($keys, function (key) {\n\
        var name, str;\n\
        if (value.__lookupGetter__) {\n\
          if (value.__lookupGetter__(key)) {\n\
            if (value.__lookupSetter__(key)) {\n\
              str = stylize('[Getter/Setter]', 'special');\n\
            } else {\n\
              str = stylize('[Getter]', 'special');\n\
            }\n\
          } else {\n\
            if (value.__lookupSetter__(key)) {\n\
              str = stylize('[Setter]', 'special');\n\
            }\n\
          }\n\
        }\n\
        if (indexOf(visible_keys, key) < 0) {\n\
          name = '[' + key + ']';\n\
        }\n\
        if (!str) {\n\
          if (indexOf(seen, value[key]) < 0) {\n\
            if (recurseTimes === null) {\n\
              str = format(value[key]);\n\
            } else {\n\
              str = format(value[key], recurseTimes - 1);\n\
            }\n\
            if (str.indexOf('\\n\
') > -1) {\n\
              if (isArray(value)) {\n\
                str = map(str.split('\\n\
'), function (line) {\n\
                  return '  ' + line;\n\
                }).join('\\n\
').substr(2);\n\
              } else {\n\
                str = '\\n\
' + map(str.split('\\n\
'), function (line) {\n\
                  return '   ' + line;\n\
                }).join('\\n\
');\n\
              }\n\
            }\n\
          } else {\n\
            str = stylize('[Circular]', 'special');\n\
          }\n\
        }\n\
        if (typeof name === 'undefined') {\n\
          if (type === 'Array' && key.match(/^\\d+$/)) {\n\
            return str;\n\
          }\n\
          name = json.stringify('' + key);\n\
          if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
            name = name.substr(1, name.length - 2);\n\
            name = stylize(name, 'name');\n\
          } else {\n\
            name = name.replace(/'/g, \"\\\\'\")\n\
                       .replace(/\\\\\"/g, '\"')\n\
                       .replace(/(^\"|\"$)/g, \"'\");\n\
            name = stylize(name, 'string');\n\
          }\n\
        }\n\
\n\
        return name + ': ' + str;\n\
      });\n\
\n\
      seen.pop();\n\
\n\
      var numLinesEst = 0;\n\
      var length = reduce(output, function (prev, cur) {\n\
        numLinesEst++;\n\
        if (indexOf(cur, '\\n\
') >= 0) numLinesEst++;\n\
        return prev + cur.length + 1;\n\
      }, 0);\n\
\n\
      if (length > 50) {\n\
        output = braces[0] +\n\
                 (base === '' ? '' : base + '\\n\
 ') +\n\
                 ' ' +\n\
                 output.join(',\\n\
  ') +\n\
                 ' ' +\n\
                 braces[1];\n\
\n\
      } else {\n\
        output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
      }\n\
\n\
      return output;\n\
    }\n\
    return format(obj, (typeof depth === 'undefined' ? 2 : depth));\n\
  }\n\
\n\
  expect.stringify = i;\n\
\n\
  function isArray (ar) {\n\
    return Object.prototype.toString.call(ar) === '[object Array]';\n\
  }\n\
\n\
  function isRegExp(re) {\n\
    var s;\n\
    try {\n\
      s = '' + re;\n\
    } catch (e) {\n\
      return false;\n\
    }\n\
\n\
    return re instanceof RegExp || // easy case\n\
           // duck-type for context-switching evalcx case\n\
           typeof(re) === 'function' &&\n\
           re.constructor.name === 'RegExp' &&\n\
           re.compile &&\n\
           re.test &&\n\
           re.exec &&\n\
           s.match(/^\\/.*\\/[gim]{0,3}$/);\n\
  }\n\
\n\
  function isDate(d) {\n\
    return d instanceof Date;\n\
  }\n\
\n\
  function keys (obj) {\n\
    if (Object.keys) {\n\
      return Object.keys(obj);\n\
    }\n\
\n\
    var keys = [];\n\
\n\
    for (var i in obj) {\n\
      if (Object.prototype.hasOwnProperty.call(obj, i)) {\n\
        keys.push(i);\n\
      }\n\
    }\n\
\n\
    return keys;\n\
  }\n\
\n\
  function map (arr, mapper, that) {\n\
    if (Array.prototype.map) {\n\
      return Array.prototype.map.call(arr, mapper, that);\n\
    }\n\
\n\
    var other= new Array(arr.length);\n\
\n\
    for (var i= 0, n = arr.length; i<n; i++)\n\
      if (i in arr)\n\
        other[i] = mapper.call(that, arr[i], i, arr);\n\
\n\
    return other;\n\
  }\n\
\n\
  function reduce (arr, fun) {\n\
    if (Array.prototype.reduce) {\n\
      return Array.prototype.reduce.apply(\n\
          arr\n\
        , Array.prototype.slice.call(arguments, 1)\n\
      );\n\
    }\n\
\n\
    var len = +this.length;\n\
\n\
    if (typeof fun !== \"function\")\n\
      throw new TypeError();\n\
\n\
    // no value to return if no initial value and an empty array\n\
    if (len === 0 && arguments.length === 1)\n\
      throw new TypeError();\n\
\n\
    var i = 0;\n\
    if (arguments.length >= 2) {\n\
      var rv = arguments[1];\n\
    } else {\n\
      do {\n\
        if (i in this) {\n\
          rv = this[i++];\n\
          break;\n\
        }\n\
\n\
        // if array contains no values, no initial value to return\n\
        if (++i >= len)\n\
          throw new TypeError();\n\
      } while (true);\n\
    }\n\
\n\
    for (; i < len; i++) {\n\
      if (i in this)\n\
        rv = fun.call(null, rv, this[i], i, this);\n\
    }\n\
\n\
    return rv;\n\
  }\n\
\n\
  /**\n\
   * Asserts deep equality\n\
   *\n\
   * @see taken from node.js `assert` module (copyright Joyent, MIT license)\n\
   * @api private\n\
   */\n\
\n\
  expect.eql = function eql(actual, expected) {\n\
    // 7.1. All identical values are equivalent, as determined by ===.\n\
    if (actual === expected) {\n\
      return true;\n\
    } else if ('undefined' != typeof Buffer\n\
      && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {\n\
      if (actual.length != expected.length) return false;\n\
\n\
      for (var i = 0; i < actual.length; i++) {\n\
        if (actual[i] !== expected[i]) return false;\n\
      }\n\
\n\
      return true;\n\
\n\
      // 7.2. If the expected value is a Date object, the actual value is\n\
      // equivalent if it is also a Date object that refers to the same time.\n\
    } else if (actual instanceof Date && expected instanceof Date) {\n\
      return actual.getTime() === expected.getTime();\n\
\n\
      // 7.3. Other pairs that do not both pass typeof value == \"object\",\n\
      // equivalence is determined by ==.\n\
    } else if (typeof actual != 'object' && typeof expected != 'object') {\n\
      return actual == expected;\n\
    // If both are regular expression use the special `regExpEquiv` method\n\
    // to determine equivalence.\n\
    } else if (isRegExp(actual) && isRegExp(expected)) {\n\
      return regExpEquiv(actual, expected);\n\
    // 7.4. For all other Object pairs, including Array objects, equivalence is\n\
    // determined by having the same number of owned properties (as verified\n\
    // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
    // (although not necessarily the same order), equivalent values for every\n\
    // corresponding key, and an identical \"prototype\" property. Note: this\n\
    // accounts for both named and indexed properties on Arrays.\n\
    } else {\n\
      return objEquiv(actual, expected);\n\
    }\n\
  };\n\
\n\
  function isUndefinedOrNull (value) {\n\
    return value === null || value === undefined;\n\
  }\n\
\n\
  function isArguments (object) {\n\
    return Object.prototype.toString.call(object) == '[object Arguments]';\n\
  }\n\
\n\
  function regExpEquiv (a, b) {\n\
    return a.source === b.source && a.global === b.global &&\n\
           a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;\n\
  }\n\
\n\
  function objEquiv (a, b) {\n\
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n\
      return false;\n\
    // an identical \"prototype\" property.\n\
    if (a.prototype !== b.prototype) return false;\n\
    //~~~I've managed to break Object.keys through screwy arguments passing.\n\
    //   Converting to array solves the problem.\n\
    if (isArguments(a)) {\n\
      if (!isArguments(b)) {\n\
        return false;\n\
      }\n\
      a = pSlice.call(a);\n\
      b = pSlice.call(b);\n\
      return expect.eql(a, b);\n\
    }\n\
    try{\n\
      var ka = keys(a),\n\
        kb = keys(b),\n\
        key, i;\n\
    } catch (e) {//happens when one is a string literal and the other isn't\n\
      return false;\n\
    }\n\
    // having the same number of owned properties (keys incorporates hasOwnProperty)\n\
    if (ka.length != kb.length)\n\
      return false;\n\
    //the same set of keys (although not necessarily the same order),\n\
    ka.sort();\n\
    kb.sort();\n\
    //~~~cheap key test\n\
    for (i = ka.length - 1; i >= 0; i--) {\n\
      if (ka[i] != kb[i])\n\
        return false;\n\
    }\n\
    //equivalent values for every corresponding key, and\n\
    //~~~possibly expensive deep test\n\
    for (i = ka.length - 1; i >= 0; i--) {\n\
      key = ka[i];\n\
      if (!expect.eql(a[key], b[key]))\n\
         return false;\n\
    }\n\
    return true;\n\
  }\n\
\n\
  var json = (function () {\n\
    \"use strict\";\n\
\n\
    if ('object' == typeof JSON && JSON.parse && JSON.stringify) {\n\
      return {\n\
          parse: nativeJSON.parse\n\
        , stringify: nativeJSON.stringify\n\
      }\n\
    }\n\
\n\
    var JSON = {};\n\
\n\
    function f(n) {\n\
        // Format integers to have at least two digits.\n\
        return n < 10 ? '0' + n : n;\n\
    }\n\
\n\
    function date(d, key) {\n\
      return isFinite(d.valueOf()) ?\n\
          d.getUTCFullYear()     + '-' +\n\
          f(d.getUTCMonth() + 1) + '-' +\n\
          f(d.getUTCDate())      + 'T' +\n\
          f(d.getUTCHours())     + ':' +\n\
          f(d.getUTCMinutes())   + ':' +\n\
          f(d.getUTCSeconds())   + 'Z' : null;\n\
    }\n\
\n\
    var cx = /[\\u0000\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/g,\n\
        escapable = /[\\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/g,\n\
        gap,\n\
        indent,\n\
        meta = {    // table of character substitutions\n\
            '\\b': '\\\\b',\n\
            '\\t': '\\\\t',\n\
            '\\n\
': '\\\\n\
',\n\
            '\\f': '\\\\f',\n\
            '\\r': '\\\\r',\n\
            '\"' : '\\\\\"',\n\
            '\\\\': '\\\\\\\\'\n\
        },\n\
        rep;\n\
\n\
\n\
    function quote(string) {\n\
\n\
  // If the string contains no control characters, no quote characters, and no\n\
  // backslash characters, then we can safely slap some quotes around it.\n\
  // Otherwise we must also replace the offending characters with safe escape\n\
  // sequences.\n\
\n\
        escapable.lastIndex = 0;\n\
        return escapable.test(string) ? '\"' + string.replace(escapable, function (a) {\n\
            var c = meta[a];\n\
            return typeof c === 'string' ? c :\n\
                '\\\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);\n\
        }) + '\"' : '\"' + string + '\"';\n\
    }\n\
\n\
\n\
    function str(key, holder) {\n\
\n\
  // Produce a string from holder[key].\n\
\n\
        var i,          // The loop counter.\n\
            k,          // The member key.\n\
            v,          // The member value.\n\
            length,\n\
            mind = gap,\n\
            partial,\n\
            value = holder[key];\n\
\n\
  // If the value has a toJSON method, call it to obtain a replacement value.\n\
\n\
        if (value instanceof Date) {\n\
            value = date(key);\n\
        }\n\
\n\
  // If we were called with a replacer function, then call the replacer to\n\
  // obtain a replacement value.\n\
\n\
        if (typeof rep === 'function') {\n\
            value = rep.call(holder, key, value);\n\
        }\n\
\n\
  // What happens next depends on the value's type.\n\
\n\
        switch (typeof value) {\n\
        case 'string':\n\
            return quote(value);\n\
\n\
        case 'number':\n\
\n\
  // JSON numbers must be finite. Encode non-finite numbers as null.\n\
\n\
            return isFinite(value) ? String(value) : 'null';\n\
\n\
        case 'boolean':\n\
        case 'null':\n\
\n\
  // If the value is a boolean or null, convert it to a string. Note:\n\
  // typeof null does not produce 'null'. The case is included here in\n\
  // the remote chance that this gets fixed someday.\n\
\n\
            return String(value);\n\
\n\
  // If the type is 'object', we might be dealing with an object or an array or\n\
  // null.\n\
\n\
        case 'object':\n\
\n\
  // Due to a specification blunder in ECMAScript, typeof null is 'object',\n\
  // so watch out for that case.\n\
\n\
            if (!value) {\n\
                return 'null';\n\
            }\n\
\n\
  // Make an array to hold the partial results of stringifying this object value.\n\
\n\
            gap += indent;\n\
            partial = [];\n\
\n\
  // Is the value an array?\n\
\n\
            if (Object.prototype.toString.apply(value) === '[object Array]') {\n\
\n\
  // The value is an array. Stringify every element. Use null as a placeholder\n\
  // for non-JSON values.\n\
\n\
                length = value.length;\n\
                for (i = 0; i < length; i += 1) {\n\
                    partial[i] = str(i, value) || 'null';\n\
                }\n\
\n\
  // Join all of the elements together, separated with commas, and wrap them in\n\
  // brackets.\n\
\n\
                v = partial.length === 0 ? '[]' : gap ?\n\
                    '[\\n\
' + gap + partial.join(',\\n\
' + gap) + '\\n\
' + mind + ']' :\n\
                    '[' + partial.join(',') + ']';\n\
                gap = mind;\n\
                return v;\n\
            }\n\
\n\
  // If the replacer is an array, use it to select the members to be stringified.\n\
\n\
            if (rep && typeof rep === 'object') {\n\
                length = rep.length;\n\
                for (i = 0; i < length; i += 1) {\n\
                    if (typeof rep[i] === 'string') {\n\
                        k = rep[i];\n\
                        v = str(k, value);\n\
                        if (v) {\n\
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);\n\
                        }\n\
                    }\n\
                }\n\
            } else {\n\
\n\
  // Otherwise, iterate through all of the keys in the object.\n\
\n\
                for (k in value) {\n\
                    if (Object.prototype.hasOwnProperty.call(value, k)) {\n\
                        v = str(k, value);\n\
                        if (v) {\n\
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);\n\
                        }\n\
                    }\n\
                }\n\
            }\n\
\n\
  // Join all of the member texts together, separated with commas,\n\
  // and wrap them in braces.\n\
\n\
            v = partial.length === 0 ? '{}' : gap ?\n\
                '{\\n\
' + gap + partial.join(',\\n\
' + gap) + '\\n\
' + mind + '}' :\n\
                '{' + partial.join(',') + '}';\n\
            gap = mind;\n\
            return v;\n\
        }\n\
    }\n\
\n\
  // If the JSON object does not yet have a stringify method, give it one.\n\
\n\
    JSON.stringify = function (value, replacer, space) {\n\
\n\
  // The stringify method takes a value and an optional replacer, and an optional\n\
  // space parameter, and returns a JSON text. The replacer can be a function\n\
  // that can replace values, or an array of strings that will select the keys.\n\
  // A default replacer method can be provided. Use of the space parameter can\n\
  // produce text that is more easily readable.\n\
\n\
        var i;\n\
        gap = '';\n\
        indent = '';\n\
\n\
  // If the space parameter is a number, make an indent string containing that\n\
  // many spaces.\n\
\n\
        if (typeof space === 'number') {\n\
            for (i = 0; i < space; i += 1) {\n\
                indent += ' ';\n\
            }\n\
\n\
  // If the space parameter is a string, it will be used as the indent string.\n\
\n\
        } else if (typeof space === 'string') {\n\
            indent = space;\n\
        }\n\
\n\
  // If there is a replacer, it must be a function or an array.\n\
  // Otherwise, throw an error.\n\
\n\
        rep = replacer;\n\
        if (replacer && typeof replacer !== 'function' &&\n\
                (typeof replacer !== 'object' ||\n\
                typeof replacer.length !== 'number')) {\n\
            throw new Error('JSON.stringify');\n\
        }\n\
\n\
  // Make a fake root object containing our value under the key of ''.\n\
  // Return the result of stringifying the value.\n\
\n\
        return str('', {'': value});\n\
    };\n\
\n\
  // If the JSON object does not yet have a parse method, give it one.\n\
\n\
    JSON.parse = function (text, reviver) {\n\
    // The parse method takes a text and an optional reviver function, and returns\n\
    // a JavaScript value if the text is a valid JSON text.\n\
\n\
        var j;\n\
\n\
        function walk(holder, key) {\n\
\n\
    // The walk method is used to recursively walk the resulting structure so\n\
    // that modifications can be made.\n\
\n\
            var k, v, value = holder[key];\n\
            if (value && typeof value === 'object') {\n\
                for (k in value) {\n\
                    if (Object.prototype.hasOwnProperty.call(value, k)) {\n\
                        v = walk(value, k);\n\
                        if (v !== undefined) {\n\
                            value[k] = v;\n\
                        } else {\n\
                            delete value[k];\n\
                        }\n\
                    }\n\
                }\n\
            }\n\
            return reviver.call(holder, key, value);\n\
        }\n\
\n\
\n\
    // Parsing happens in four stages. In the first stage, we replace certain\n\
    // Unicode characters with escape sequences. JavaScript handles many characters\n\
    // incorrectly, either silently deleting them, or treating them as line endings.\n\
\n\
        text = String(text);\n\
        cx.lastIndex = 0;\n\
        if (cx.test(text)) {\n\
            text = text.replace(cx, function (a) {\n\
                return '\\\\u' +\n\
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);\n\
            });\n\
        }\n\
\n\
    // In the second stage, we run the text against regular expressions that look\n\
    // for non-JSON patterns. We are especially concerned with '()' and 'new'\n\
    // because they can cause invocation, and '=' because it can cause mutation.\n\
    // But just to be safe, we want to reject all unexpected forms.\n\
\n\
    // We split the second stage into 4 regexp operations in order to work around\n\
    // crippling inefficiencies in IE's and Safari's regexp engines. First we\n\
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we\n\
    // replace all simple value tokens with ']' characters. Third, we delete all\n\
    // open brackets that follow a colon or comma or that begin the text. Finally,\n\
    // we look to see that the remaining characters are only whitespace or ']' or\n\
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.\n\
\n\
        if (/^[\\],:{}\\s]*$/\n\
                .test(text.replace(/\\\\(?:[\"\\\\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')\n\
                    .replace(/\"[^\"\\\\\\n\
\\r]*\"|true|false|null|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?/g, ']')\n\
                    .replace(/(?:^|:|,)(?:\\s*\\[)+/g, ''))) {\n\
\n\
    // In the third stage we use the eval function to compile the text into a\n\
    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity\n\
    // in JavaScript: it can begin a block or an object literal. We wrap the text\n\
    // in parens to eliminate the ambiguity.\n\
\n\
            j = eval('(' + text + ')');\n\
\n\
    // In the optional fourth stage, we recursively walk the new structure, passing\n\
    // each name/value pair to a reviver function for possible transformation.\n\
\n\
            return typeof reviver === 'function' ?\n\
                walk({'': j}, '') : j;\n\
        }\n\
\n\
    // If the text is not JSON parseable, then a SyntaxError is thrown.\n\
\n\
        throw new SyntaxError('JSON.parse');\n\
    };\n\
\n\
    return JSON;\n\
  })();\n\
\n\
  if ('undefined' != typeof window) {\n\
    window.expect = module.exports;\n\
  }\n\
\n\
})(\n\
    this\n\
  , 'undefined' != typeof module ? module : {exports: {}}\n\
);\n\
//@ sourceURL=techjacker-expect.js/expect.js"
));
require.register("ianstormtaylor-sinon/lib/index.js", Function("exports, require, module",
"module.exports = require('./sinon');\n\
module.exports.spy = require(\"./sinon/spy\");\n\
module.exports.spyCall = require(\"./sinon/call\");\n\
module.exports.stub = require(\"./sinon/stub\");\n\
module.exports.mock = require(\"./sinon/mock\");\n\
module.exports.collection = require(\"./sinon/collection\");\n\
module.exports.assert = require(\"./sinon/assert\");\n\
module.exports.sandbox = require(\"./sinon/sandbox\");\n\
module.exports.test = require(\"./sinon/test\");\n\
module.exports.testCase = require(\"./sinon/test_case\");\n\
module.exports.assert = require(\"./sinon/assert\");\n\
module.exports.match = require(\"./sinon/match\");\n\
\n\
// the hacks below are needed for sinon.fakeServer support... this was so\n\
// tough to get working... this library is like a minefield :(\n\
module.exports.extend(module.exports, require(\"./sinon/util/event\"));\n\
\n\
module.exports.extend(module.exports,\n\
    require(\"./sinon/util/fake_xml_http_request\"),\n\
    require(\"./sinon/util/fake_server\"));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/index.js"
));
require.register("ianstormtaylor-sinon/lib/sinon.js", Function("exports, require, module",
"/*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/\n\
/*global module, require, __dirname, document*/\n\
/**\n\
 * Sinon core utilities. For internal use only.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
module.exports = (function (buster) {\n\
    var div = typeof document != \"undefined\" && document.createElement(\"div\");\n\
    var hasOwn = Object.prototype.hasOwnProperty;\n\
\n\
    function isDOMNode(obj) {\n\
        var success = false;\n\
\n\
        try {\n\
            obj.appendChild(div);\n\
            success = div.parentNode == obj;\n\
        } catch (e) {\n\
            return false;\n\
        } finally {\n\
            try {\n\
                obj.removeChild(div);\n\
            } catch (e) {\n\
                // Remove failed, not much we can do about that\n\
            }\n\
        }\n\
\n\
        return success;\n\
    }\n\
\n\
    function isElement(obj) {\n\
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);\n\
    }\n\
\n\
    function isFunction(obj) {\n\
        return typeof obj === \"function\" || !!(obj && obj.constructor && obj.call && obj.apply);\n\
    }\n\
\n\
    function mirrorProperties(target, source) {\n\
        for (var prop in source) {\n\
            if (!hasOwn.call(target, prop)) {\n\
                target[prop] = source[prop];\n\
            }\n\
        }\n\
    }\n\
\n\
    function isRestorable (obj) {\n\
        return typeof obj === \"function\" && typeof obj.restore === \"function\" && obj.restore.sinon;\n\
    }\n\
\n\
    var sinon = {\n\
        wrapMethod: function wrapMethod(object, property, method) {\n\
            if (!object) {\n\
                throw new TypeError(\"Should wrap property of object\");\n\
            }\n\
\n\
            if (typeof method != \"function\") {\n\
                throw new TypeError(\"Method wrapper should be function\");\n\
            }\n\
\n\
            var wrappedMethod = object[property];\n\
\n\
            if (!isFunction(wrappedMethod)) {\n\
                throw new TypeError(\"Attempted to wrap \" + (typeof wrappedMethod) + \" property \" +\n\
                                    property + \" as function\");\n\
            }\n\
\n\
            if (wrappedMethod.restore && wrappedMethod.restore.sinon) {\n\
                throw new TypeError(\"Attempted to wrap \" + property + \" which is already wrapped\");\n\
            }\n\
\n\
            if (wrappedMethod.calledBefore) {\n\
                var verb = !!wrappedMethod.returns ? \"stubbed\" : \"spied on\";\n\
                throw new TypeError(\"Attempted to wrap \" + property + \" which is already \" + verb);\n\
            }\n\
\n\
            // IE 8 does not support hasOwnProperty on the window object.\n\
            var owned = hasOwn.call(object, property);\n\
            object[property] = method;\n\
            method.displayName = property;\n\
\n\
            method.restore = function () {\n\
                // For prototype properties try to reset by delete first.\n\
                // If this fails (ex: localStorage on mobile safari) then force a reset\n\
                // via direct assignment.\n\
                if (!owned) {\n\
                    delete object[property];\n\
                }\n\
                if (object[property] === method) {\n\
                    object[property] = wrappedMethod;\n\
                }\n\
            };\n\
\n\
            method.restore.sinon = true;\n\
            mirrorProperties(method, wrappedMethod);\n\
\n\
            return method;\n\
        },\n\
\n\
        extend: function extend(target) {\n\
            for (var i = 1, l = arguments.length; i < l; i += 1) {\n\
                for (var prop in arguments[i]) {\n\
                    if (arguments[i].hasOwnProperty(prop)) {\n\
                        target[prop] = arguments[i][prop];\n\
                    }\n\
\n\
                    // DONT ENUM bug, only care about toString\n\
                    if (arguments[i].hasOwnProperty(\"toString\") &&\n\
                        arguments[i].toString != target.toString) {\n\
                        target.toString = arguments[i].toString;\n\
                    }\n\
                }\n\
            }\n\
\n\
            return target;\n\
        },\n\
\n\
        create: function create(proto) {\n\
            var F = function () {};\n\
            F.prototype = proto;\n\
            return new F();\n\
        },\n\
\n\
        deepEqual: function deepEqual(a, b) {\n\
            if (sinon.match && sinon.match.isMatcher(a)) {\n\
                return a.test(b);\n\
            }\n\
            if (typeof a != \"object\" || typeof b != \"object\") {\n\
                return a === b;\n\
            }\n\
\n\
            if (isElement(a) || isElement(b)) {\n\
                return a === b;\n\
            }\n\
\n\
            if (a === b) {\n\
                return true;\n\
            }\n\
\n\
            if ((a === null && b !== null) || (a !== null && b === null)) {\n\
                return false;\n\
            }\n\
\n\
            var aString = Object.prototype.toString.call(a);\n\
            if (aString != Object.prototype.toString.call(b)) {\n\
                return false;\n\
            }\n\
\n\
            if (aString == \"[object Date]\") {\n\
                return a.valueOf() === b.valueOf();\n\
            }\n\
\n\
            var prop, aLength = 0, bLength = 0;\n\
\n\
            if (aString == \"[object Array]\" && a.length !== b.length) {\n\
                return false;\n\
            }\n\
\n\
            for (prop in a) {\n\
                aLength += 1;\n\
\n\
                if (!deepEqual(a[prop], b[prop])) {\n\
                    return false;\n\
                }\n\
            }\n\
\n\
            for (prop in b) {\n\
                bLength += 1;\n\
            }\n\
\n\
            return aLength == bLength;\n\
        },\n\
\n\
        functionName: function functionName(func) {\n\
            var name = func.displayName || func.name;\n\
\n\
            // Use function decomposition as a last resort to get function\n\
            // name. Does not rely on function decomposition to work - if it\n\
            // doesn't debugging will be slightly less informative\n\
            // (i.e. toString will say 'spy' rather than 'myFunc').\n\
            if (!name) {\n\
                var matches = func.toString().match(/function ([^\\s\\(]+)/);\n\
                name = matches && matches[1];\n\
            }\n\
\n\
            return name;\n\
        },\n\
\n\
        functionToString: function toString() {\n\
            if (this.getCall && this.callCount) {\n\
                var thisValue, prop, i = this.callCount;\n\
\n\
                while (i--) {\n\
                    thisValue = this.getCall(i).thisValue;\n\
\n\
                    for (prop in thisValue) {\n\
                        if (thisValue[prop] === this) {\n\
                            return prop;\n\
                        }\n\
                    }\n\
                }\n\
            }\n\
\n\
            return this.displayName || \"sinon fake\";\n\
        },\n\
\n\
        getConfig: function (custom) {\n\
            var config = {};\n\
            custom = custom || {};\n\
            var defaults = sinon.defaultConfig;\n\
\n\
            for (var prop in defaults) {\n\
                if (defaults.hasOwnProperty(prop)) {\n\
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];\n\
                }\n\
            }\n\
\n\
            return config;\n\
        },\n\
\n\
        format: function (val) {\n\
            return \"\" + val;\n\
        },\n\
\n\
        defaultConfig: {\n\
            injectIntoThis: true,\n\
            injectInto: null,\n\
            properties: [\"spy\", \"stub\", \"mock\", \"clock\", \"server\", \"requests\"],\n\
            useFakeTimers: true,\n\
            useFakeServer: true\n\
        },\n\
\n\
        timesInWords: function timesInWords(count) {\n\
            return count == 1 && \"once\" ||\n\
                count == 2 && \"twice\" ||\n\
                count == 3 && \"thrice\" ||\n\
                (count || 0) + \" times\";\n\
        },\n\
\n\
        calledInOrder: function (spies) {\n\
            for (var i = 1, l = spies.length; i < l; i++) {\n\
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {\n\
                    return false;\n\
                }\n\
            }\n\
\n\
            return true;\n\
        },\n\
\n\
        orderByFirstCall: function (spies) {\n\
            return spies.sort(function (a, b) {\n\
                // uuid, won't ever be equal\n\
                var aCall = a.getCall(0);\n\
                var bCall = b.getCall(0);\n\
                var aId = aCall && aCall.callId || -1;\n\
                var bId = bCall && bCall.callId || -1;\n\
\n\
                return aId < bId ? -1 : 1;\n\
            });\n\
        },\n\
\n\
        log: function () {},\n\
\n\
        logError: function (label, err) {\n\
            var msg = label + \" threw exception: \"\n\
            sinon.log(msg + \"[\" + err.name + \"] \" + err.message);\n\
            if (err.stack) { sinon.log(err.stack); }\n\
\n\
            setTimeout(function () {\n\
                err.message = msg + err.message;\n\
                throw err;\n\
            }, 0);\n\
        },\n\
\n\
        typeOf: function (value) {\n\
            if (value === null) {\n\
                return \"null\";\n\
            }\n\
            else if (value === undefined) {\n\
                return \"undefined\";\n\
            }\n\
            var string = Object.prototype.toString.call(value);\n\
            return string.substring(8, string.length - 1).toLowerCase();\n\
        },\n\
\n\
        createStubInstance: function (constructor) {\n\
            if (typeof constructor !== \"function\") {\n\
                throw new TypeError(\"The constructor should be a function.\");\n\
            }\n\
            return sinon.stub(sinon.create(constructor.prototype));\n\
        },\n\
\n\
        restore: function (object) {\n\
            if (object !== null && typeof object === \"object\") {\n\
                for (var prop in object) {\n\
                    if (isRestorable(object[prop])) {\n\
                        object[prop].restore();\n\
                    }\n\
                }\n\
            }\n\
            else if (isRestorable(object)) {\n\
                object.restore();\n\
            }\n\
        }\n\
    };\n\
\n\
    var isNode = typeof module !== \"undefined\" && module.exports;\n\
\n\
    if (buster) {\n\
        var formatter = sinon.create(buster.format);\n\
        formatter.quoteStrings = false;\n\
        sinon.format = function () {\n\
            return formatter.ascii.apply(formatter, arguments);\n\
        };\n\
    } else if (isNode) {\n\
        try {\n\
            var util = require(\"util\");\n\
            sinon.format = function (value) {\n\
                return typeof value == \"object\" && value.toString === Object.prototype.toString ? util.inspect(value) : value;\n\
            };\n\
        } catch (e) {\n\
            /* Node, but no util module - would be very old, but better safe than\n\
             sorry */\n\
        }\n\
    }\n\
\n\
    return sinon;\n\
}(typeof buster == \"object\" && buster));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/assert.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend stub.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, nomen: false, plusplus: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Assertions matching the test spy retrieval interface.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon, global) {\n\
    var commonJSModule = typeof module !== \"undefined\" && module.exports;\n\
    var slice = Array.prototype.slice;\n\
    var assert;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function verifyIsStub() {\n\
        var method;\n\
\n\
        for (var i = 0, l = arguments.length; i < l; ++i) {\n\
            method = arguments[i];\n\
\n\
            if (!method) {\n\
                assert.fail(\"fake is not a spy\");\n\
            }\n\
\n\
            if (typeof method != \"function\") {\n\
                assert.fail(method + \" is not a function\");\n\
            }\n\
\n\
            if (typeof method.getCall != \"function\") {\n\
                assert.fail(method + \" is not stubbed\");\n\
            }\n\
        }\n\
    }\n\
\n\
    function failAssertion(object, msg) {\n\
        object = object || global;\n\
        var failMethod = object.fail || assert.fail;\n\
        failMethod.call(object, msg);\n\
    }\n\
\n\
    function mirrorPropAsAssertion(name, method, message) {\n\
        if (arguments.length == 2) {\n\
            message = method;\n\
            method = name;\n\
        }\n\
\n\
        assert[name] = function (fake) {\n\
            verifyIsStub(fake);\n\
\n\
            var args = slice.call(arguments, 1);\n\
            var failed = false;\n\
\n\
            if (typeof method == \"function\") {\n\
                failed = !method(fake);\n\
            } else {\n\
                failed = typeof fake[method] == \"function\" ?\n\
                    !fake[method].apply(fake, args) : !fake[method];\n\
            }\n\
\n\
            if (failed) {\n\
                failAssertion(this, fake.printf.apply(fake, [message].concat(args)));\n\
            } else {\n\
                assert.pass(name);\n\
            }\n\
        };\n\
    }\n\
\n\
    function exposedName(prefix, prop) {\n\
        return !prefix || /^fail/.test(prop) ? prop :\n\
            prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);\n\
    };\n\
\n\
    assert = {\n\
        failException: \"AssertError\",\n\
\n\
        fail: function fail(message) {\n\
            var error = new Error(message);\n\
            error.name = this.failException || assert.failException;\n\
\n\
            throw error;\n\
        },\n\
\n\
        pass: function pass(assertion) {},\n\
\n\
        callOrder: function assertCallOrder() {\n\
            verifyIsStub.apply(null, arguments);\n\
            var expected = \"\", actual = \"\";\n\
\n\
            if (!sinon.calledInOrder(arguments)) {\n\
                try {\n\
                    expected = [].join.call(arguments, \", \");\n\
                    var calls = slice.call(arguments);\n\
                    var i = calls.length;\n\
                    while (i) {\n\
                        if (!calls[--i].called) {\n\
                            calls.splice(i, 1);\n\
                        }\n\
                    }\n\
                    actual = sinon.orderByFirstCall(calls).join(\", \");\n\
                } catch (e) {\n\
                    // If this fails, we'll just fall back to the blank string\n\
                }\n\
\n\
                failAssertion(this, \"expected \" + expected + \" to be \" +\n\
                              \"called in order but were called as \" + actual);\n\
            } else {\n\
                assert.pass(\"callOrder\");\n\
            }\n\
        },\n\
\n\
        callCount: function assertCallCount(method, count) {\n\
            verifyIsStub(method);\n\
\n\
            if (method.callCount != count) {\n\
                var msg = \"expected %n to be called \" + sinon.timesInWords(count) +\n\
                    \" but was called %c%C\";\n\
                failAssertion(this, method.printf(msg));\n\
            } else {\n\
                assert.pass(\"callCount\");\n\
            }\n\
        },\n\
\n\
        expose: function expose(target, options) {\n\
            if (!target) {\n\
                throw new TypeError(\"target is null or undefined\");\n\
            }\n\
\n\
            var o = options || {};\n\
            var prefix = typeof o.prefix == \"undefined\" && \"assert\" || o.prefix;\n\
            var includeFail = typeof o.includeFail == \"undefined\" || !!o.includeFail;\n\
\n\
            for (var method in this) {\n\
                if (method != \"export\" && (includeFail || !/^(fail)/.test(method))) {\n\
                    target[exposedName(prefix, method)] = this[method];\n\
                }\n\
            }\n\
\n\
            return target;\n\
        }\n\
    };\n\
\n\
    mirrorPropAsAssertion(\"called\", \"expected %n to have been called at least once but was never called\");\n\
    mirrorPropAsAssertion(\"notCalled\", function (spy) { return !spy.called; },\n\
                          \"expected %n to not have been called but was called %c%C\");\n\
    mirrorPropAsAssertion(\"calledOnce\", \"expected %n to be called once but was called %c%C\");\n\
    mirrorPropAsAssertion(\"calledTwice\", \"expected %n to be called twice but was called %c%C\");\n\
    mirrorPropAsAssertion(\"calledThrice\", \"expected %n to be called thrice but was called %c%C\");\n\
    mirrorPropAsAssertion(\"calledOn\", \"expected %n to be called with %1 as this but was called with %t\");\n\
    mirrorPropAsAssertion(\"alwaysCalledOn\", \"expected %n to always be called with %1 as this but was called with %t\");\n\
    mirrorPropAsAssertion(\"calledWithNew\", \"expected %n to be called with new\");\n\
    mirrorPropAsAssertion(\"alwaysCalledWithNew\", \"expected %n to always be called with new\");\n\
    mirrorPropAsAssertion(\"calledWith\", \"expected %n to be called with arguments %*%C\");\n\
    mirrorPropAsAssertion(\"calledWithMatch\", \"expected %n to be called with match %*%C\");\n\
    mirrorPropAsAssertion(\"alwaysCalledWith\", \"expected %n to always be called with arguments %*%C\");\n\
    mirrorPropAsAssertion(\"alwaysCalledWithMatch\", \"expected %n to always be called with match %*%C\");\n\
    mirrorPropAsAssertion(\"calledWithExactly\", \"expected %n to be called with exact arguments %*%C\");\n\
    mirrorPropAsAssertion(\"alwaysCalledWithExactly\", \"expected %n to always be called with exact arguments %*%C\");\n\
    mirrorPropAsAssertion(\"neverCalledWith\", \"expected %n to never be called with arguments %*%C\");\n\
    mirrorPropAsAssertion(\"neverCalledWithMatch\", \"expected %n to never be called with match %*%C\");\n\
    mirrorPropAsAssertion(\"threw\", \"%n did not throw exception%C\");\n\
    mirrorPropAsAssertion(\"alwaysThrew\", \"%n did not always throw exception%C\");\n\
\n\
    if (commonJSModule) {\n\
        module.exports = assert;\n\
    } else {\n\
        sinon.assert = assert;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null, typeof window != \"undefined\" ? window : (typeof self != \"undefined\") ? self : global));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/assert.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/call.js", Function("exports, require, module",
"/**\n\
  * @depend ../sinon.js\n\
  * @depend match.js\n\
  */\n\
/*jslint eqeqeq: false, onevar: false, plusplus: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
  * Spy calls\n\
  *\n\
  * @author Christian Johansen (christian@cjohansen.no)\n\
  * @author Maximilian Antoni (mail@maxantoni.de)\n\
  * @license BSD\n\
  *\n\
  * Copyright (c) 2010-2013 Christian Johansen\n\
  * Copyright (c) 2013 Maximilian Antoni\n\
  */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function throwYieldError(proxy, text, args) {\n\
        var msg = sinon.functionName(proxy) + text;\n\
        if (args.length) {\n\
            msg += \" Received [\" + slice.call(args).join(\", \") + \"]\";\n\
        }\n\
        throw new Error(msg);\n\
    }\n\
\n\
    var slice = Array.prototype.slice;\n\
\n\
    var callProto = {\n\
        calledOn: function calledOn(thisValue) {\n\
            if (sinon.match && sinon.match.isMatcher(thisValue)) {\n\
                return thisValue.test(this.thisValue);\n\
            }\n\
            return this.thisValue === thisValue;\n\
        },\n\
\n\
        calledWith: function calledWith() {\n\
            for (var i = 0, l = arguments.length; i < l; i += 1) {\n\
                if (!sinon.deepEqual(arguments[i], this.args[i])) {\n\
                    return false;\n\
                }\n\
            }\n\
\n\
            return true;\n\
        },\n\
\n\
        calledWithMatch: function calledWithMatch() {\n\
            for (var i = 0, l = arguments.length; i < l; i += 1) {\n\
                var actual = this.args[i];\n\
                var expectation = arguments[i];\n\
                if (!sinon.match || !sinon.match(expectation).test(actual)) {\n\
                    return false;\n\
                }\n\
            }\n\
            return true;\n\
        },\n\
\n\
        calledWithExactly: function calledWithExactly() {\n\
            return arguments.length == this.args.length &&\n\
                this.calledWith.apply(this, arguments);\n\
        },\n\
\n\
        notCalledWith: function notCalledWith() {\n\
            return !this.calledWith.apply(this, arguments);\n\
        },\n\
\n\
        notCalledWithMatch: function notCalledWithMatch() {\n\
            return !this.calledWithMatch.apply(this, arguments);\n\
        },\n\
\n\
        returned: function returned(value) {\n\
            return sinon.deepEqual(value, this.returnValue);\n\
        },\n\
\n\
        threw: function threw(error) {\n\
            if (typeof error === \"undefined\" || !this.exception) {\n\
                return !!this.exception;\n\
            }\n\
\n\
            return this.exception === error || this.exception.name === error;\n\
        },\n\
\n\
        calledWithNew: function calledWithNew(thisValue) {\n\
            return this.thisValue instanceof this.proxy;\n\
        },\n\
\n\
        calledBefore: function (other) {\n\
            return this.callId < other.callId;\n\
        },\n\
\n\
        calledAfter: function (other) {\n\
            return this.callId > other.callId;\n\
        },\n\
\n\
        callArg: function (pos) {\n\
            this.args[pos]();\n\
        },\n\
\n\
        callArgOn: function (pos, thisValue) {\n\
            this.args[pos].apply(thisValue);\n\
        },\n\
\n\
        callArgWith: function (pos) {\n\
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));\n\
        },\n\
\n\
        callArgOnWith: function (pos, thisValue) {\n\
            var args = slice.call(arguments, 2);\n\
            this.args[pos].apply(thisValue, args);\n\
        },\n\
\n\
        \"yield\": function () {\n\
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));\n\
        },\n\
\n\
        yieldOn: function (thisValue) {\n\
            var args = this.args;\n\
            for (var i = 0, l = args.length; i < l; ++i) {\n\
                if (typeof args[i] === \"function\") {\n\
                    args[i].apply(thisValue, slice.call(arguments, 1));\n\
                    return;\n\
                }\n\
            }\n\
            throwYieldError(this.proxy, \" cannot yield since no callback was passed.\", args);\n\
        },\n\
\n\
        yieldTo: function (prop) {\n\
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));\n\
        },\n\
\n\
        yieldToOn: function (prop, thisValue) {\n\
            var args = this.args;\n\
            for (var i = 0, l = args.length; i < l; ++i) {\n\
                if (args[i] && typeof args[i][prop] === \"function\") {\n\
                    args[i][prop].apply(thisValue, slice.call(arguments, 2));\n\
                    return;\n\
                }\n\
            }\n\
            throwYieldError(this.proxy, \" cannot yield to '\" + prop +\n\
                \"' since no callback was passed.\", args);\n\
        },\n\
\n\
        toString: function () {\n\
            var callStr = this.proxy.toString() + \"(\";\n\
            var args = [];\n\
\n\
            for (var i = 0, l = this.args.length; i < l; ++i) {\n\
                args.push(sinon.format(this.args[i]));\n\
            }\n\
\n\
            callStr = callStr + args.join(\", \") + \")\";\n\
\n\
            if (typeof this.returnValue != \"undefined\") {\n\
                callStr += \" => \" + sinon.format(this.returnValue);\n\
            }\n\
\n\
            if (this.exception) {\n\
                callStr += \" !\" + this.exception.name;\n\
\n\
                if (this.exception.message) {\n\
                    callStr += \"(\" + this.exception.message + \")\";\n\
                }\n\
            }\n\
\n\
            return callStr;\n\
        }\n\
    };\n\
\n\
    callProto.invokeCallback = callProto.yield;\n\
\n\
    function createSpyCall(spy, thisValue, args, returnValue, exception, id) {\n\
        if (typeof id !== \"number\") {\n\
            throw new TypeError(\"Call id is not a number\");\n\
        }\n\
        var proxyCall = sinon.create(callProto);\n\
        proxyCall.proxy = spy;\n\
        proxyCall.thisValue = thisValue;\n\
        proxyCall.args = args;\n\
        proxyCall.returnValue = returnValue;\n\
        proxyCall.exception = exception;\n\
        proxyCall.callId = id;\n\
\n\
        return proxyCall;\n\
    };\n\
    createSpyCall.toString = callProto.toString; // used by mocks\n\
\n\
    if (commonJSModule) {\n\
        module.exports = createSpyCall;\n\
    } else {\n\
        sinon.spyCall = createSpyCall;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/call.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/collection.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend stub.js\n\
 * @depend mock.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, forin: true*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Collections of stubs, spies and mocks.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
    var push = [].push;\n\
    var hasOwnProperty = Object.prototype.hasOwnProperty;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function getFakes(fakeCollection) {\n\
        if (!fakeCollection.fakes) {\n\
            fakeCollection.fakes = [];\n\
        }\n\
\n\
        return fakeCollection.fakes;\n\
    }\n\
\n\
    function each(fakeCollection, method) {\n\
        var fakes = getFakes(fakeCollection);\n\
\n\
        for (var i = 0, l = fakes.length; i < l; i += 1) {\n\
            if (typeof fakes[i][method] == \"function\") {\n\
                fakes[i][method]();\n\
            }\n\
        }\n\
    }\n\
\n\
    function compact(fakeCollection) {\n\
        var fakes = getFakes(fakeCollection);\n\
        var i = 0;\n\
        while (i < fakes.length) {\n\
          fakes.splice(i, 1);\n\
        }\n\
    }\n\
\n\
    var collection = {\n\
        verify: function resolve() {\n\
            each(this, \"verify\");\n\
        },\n\
\n\
        restore: function restore() {\n\
            each(this, \"restore\");\n\
            compact(this);\n\
        },\n\
\n\
        verifyAndRestore: function verifyAndRestore() {\n\
            var exception;\n\
\n\
            try {\n\
                this.verify();\n\
            } catch (e) {\n\
                exception = e;\n\
            }\n\
\n\
            this.restore();\n\
\n\
            if (exception) {\n\
                throw exception;\n\
            }\n\
        },\n\
\n\
        add: function add(fake) {\n\
            push.call(getFakes(this), fake);\n\
            return fake;\n\
        },\n\
\n\
        spy: function spy() {\n\
            return this.add(sinon.spy.apply(sinon, arguments));\n\
        },\n\
\n\
        stub: function stub(object, property, value) {\n\
            if (property) {\n\
                var original = object[property];\n\
\n\
                if (typeof original != \"function\") {\n\
                    if (!hasOwnProperty.call(object, property)) {\n\
                        throw new TypeError(\"Cannot stub non-existent own property \" + property);\n\
                    }\n\
\n\
                    object[property] = value;\n\
\n\
                    return this.add({\n\
                        restore: function () {\n\
                            object[property] = original;\n\
                        }\n\
                    });\n\
                }\n\
            }\n\
            if (!property && !!object && typeof object == \"object\") {\n\
                var stubbedObj = sinon.stub.apply(sinon, arguments);\n\
\n\
                for (var prop in stubbedObj) {\n\
                    if (typeof stubbedObj[prop] === \"function\") {\n\
                        this.add(stubbedObj[prop]);\n\
                    }\n\
                }\n\
\n\
                return stubbedObj;\n\
            }\n\
\n\
            return this.add(sinon.stub.apply(sinon, arguments));\n\
        },\n\
\n\
        mock: function mock() {\n\
            return this.add(sinon.mock.apply(sinon, arguments));\n\
        },\n\
\n\
        inject: function inject(obj) {\n\
            var col = this;\n\
\n\
            obj.spy = function () {\n\
                return col.spy.apply(col, arguments);\n\
            };\n\
\n\
            obj.stub = function () {\n\
                return col.stub.apply(col, arguments);\n\
            };\n\
\n\
            obj.mock = function () {\n\
                return col.mock.apply(col, arguments);\n\
            };\n\
\n\
            return obj;\n\
        }\n\
    };\n\
\n\
    if (commonJSModule) {\n\
        module.exports = collection;\n\
    } else {\n\
        sinon.collection = collection;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/collection.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/match.js", Function("exports, require, module",
"/* @depend ../sinon.js */\n\
/*jslint eqeqeq: false, onevar: false, plusplus: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Match functions\n\
 *\n\
 * @author Maximilian Antoni (mail@maxantoni.de)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2012 Maximilian Antoni\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function assertType(value, type, name) {\n\
        var actual = sinon.typeOf(value);\n\
        if (actual !== type) {\n\
            throw new TypeError(\"Expected type of \" + name + \" to be \" +\n\
                type + \", but was \" + actual);\n\
        }\n\
    }\n\
\n\
    var matcher = {\n\
        toString: function () {\n\
            return this.message;\n\
        }\n\
    };\n\
\n\
    function isMatcher(object) {\n\
        return matcher.isPrototypeOf(object);\n\
    }\n\
\n\
    function matchObject(expectation, actual) {\n\
        if (actual === null || actual === undefined) {\n\
            return false;\n\
        }\n\
        for (var key in expectation) {\n\
            if (expectation.hasOwnProperty(key)) {\n\
                var exp = expectation[key];\n\
                var act = actual[key];\n\
                if (match.isMatcher(exp)) {\n\
                    if (!exp.test(act)) {\n\
                        return false;\n\
                    }\n\
                } else if (sinon.typeOf(exp) === \"object\") {\n\
                    if (!matchObject(exp, act)) {\n\
                        return false;\n\
                    }\n\
                } else if (!sinon.deepEqual(exp, act)) {\n\
                    return false;\n\
                }\n\
            }\n\
        }\n\
        return true;\n\
    }\n\
\n\
    matcher.or = function (m2) {\n\
        if (!isMatcher(m2)) {\n\
            throw new TypeError(\"Matcher expected\");\n\
        }\n\
        var m1 = this;\n\
        var or = sinon.create(matcher);\n\
        or.test = function (actual) {\n\
            return m1.test(actual) || m2.test(actual);\n\
        };\n\
        or.message = m1.message + \".or(\" + m2.message + \")\";\n\
        return or;\n\
    };\n\
\n\
    matcher.and = function (m2) {\n\
        if (!isMatcher(m2)) {\n\
            throw new TypeError(\"Matcher expected\");\n\
        }\n\
        var m1 = this;\n\
        var and = sinon.create(matcher);\n\
        and.test = function (actual) {\n\
            return m1.test(actual) && m2.test(actual);\n\
        };\n\
        and.message = m1.message + \".and(\" + m2.message + \")\";\n\
        return and;\n\
    };\n\
\n\
    var match = function (expectation, message) {\n\
        var m = sinon.create(matcher);\n\
        var type = sinon.typeOf(expectation);\n\
        switch (type) {\n\
        case \"object\":\n\
            if (typeof expectation.test === \"function\") {\n\
                m.test = function (actual) {\n\
                    return expectation.test(actual) === true;\n\
                };\n\
                m.message = \"match(\" + sinon.functionName(expectation.test) + \")\";\n\
                return m;\n\
            }\n\
            var str = [];\n\
            for (var key in expectation) {\n\
                if (expectation.hasOwnProperty(key)) {\n\
                    str.push(key + \": \" + expectation[key]);\n\
                }\n\
            }\n\
            m.test = function (actual) {\n\
                return matchObject(expectation, actual);\n\
            };\n\
            m.message = \"match(\" + str.join(\", \") + \")\";\n\
            break;\n\
        case \"number\":\n\
            m.test = function (actual) {\n\
                return expectation == actual;\n\
            };\n\
            break;\n\
        case \"string\":\n\
            m.test = function (actual) {\n\
                if (typeof actual !== \"string\") {\n\
                    return false;\n\
                }\n\
                return actual.indexOf(expectation) !== -1;\n\
            };\n\
            m.message = \"match(\\\"\" + expectation + \"\\\")\";\n\
            break;\n\
        case \"regexp\":\n\
            m.test = function (actual) {\n\
                if (typeof actual !== \"string\") {\n\
                    return false;\n\
                }\n\
                return expectation.test(actual);\n\
            };\n\
            break;\n\
        case \"function\":\n\
            m.test = expectation;\n\
            if (message) {\n\
                m.message = message;\n\
            } else {\n\
                m.message = \"match(\" + sinon.functionName(expectation) + \")\";\n\
            }\n\
            break;\n\
        default:\n\
            m.test = function (actual) {\n\
              return sinon.deepEqual(expectation, actual);\n\
            };\n\
        }\n\
        if (!m.message) {\n\
            m.message = \"match(\" + expectation + \")\";\n\
        }\n\
        return m;\n\
    };\n\
\n\
    match.isMatcher = isMatcher;\n\
\n\
    match.any = match(function () {\n\
        return true;\n\
    }, \"any\");\n\
\n\
    match.defined = match(function (actual) {\n\
        return actual !== null && actual !== undefined;\n\
    }, \"defined\");\n\
\n\
    match.truthy = match(function (actual) {\n\
        return !!actual;\n\
    }, \"truthy\");\n\
\n\
    match.falsy = match(function (actual) {\n\
        return !actual;\n\
    }, \"falsy\");\n\
\n\
    match.same = function (expectation) {\n\
        return match(function (actual) {\n\
            return expectation === actual;\n\
        }, \"same(\" + expectation + \")\");\n\
    };\n\
\n\
    match.typeOf = function (type) {\n\
        assertType(type, \"string\", \"type\");\n\
        return match(function (actual) {\n\
            return sinon.typeOf(actual) === type;\n\
        }, \"typeOf(\\\"\" + type + \"\\\")\");\n\
    };\n\
\n\
    match.instanceOf = function (type) {\n\
        assertType(type, \"function\", \"type\");\n\
        return match(function (actual) {\n\
            return actual instanceof type;\n\
        }, \"instanceOf(\" + sinon.functionName(type) + \")\");\n\
    };\n\
\n\
    function createPropertyMatcher(propertyTest, messagePrefix) {\n\
        return function (property, value) {\n\
            assertType(property, \"string\", \"property\");\n\
            var onlyProperty = arguments.length === 1;\n\
            var message = messagePrefix + \"(\\\"\" + property + \"\\\"\";\n\
            if (!onlyProperty) {\n\
                message += \", \" + value;\n\
            }\n\
            message += \")\";\n\
            return match(function (actual) {\n\
                if (actual === undefined || actual === null ||\n\
                        !propertyTest(actual, property)) {\n\
                    return false;\n\
                }\n\
                return onlyProperty || sinon.deepEqual(value, actual[property]);\n\
            }, message);\n\
        };\n\
    }\n\
\n\
    match.has = createPropertyMatcher(function (actual, property) {\n\
        if (typeof actual === \"object\") {\n\
            return property in actual;\n\
        }\n\
        return actual[property] !== undefined;\n\
    }, \"has\");\n\
\n\
    match.hasOwn = createPropertyMatcher(function (actual, property) {\n\
        return actual.hasOwnProperty(property);\n\
    }, \"hasOwn\");\n\
\n\
    match.bool = match.typeOf(\"boolean\");\n\
    match.number = match.typeOf(\"number\");\n\
    match.string = match.typeOf(\"string\");\n\
    match.object = match.typeOf(\"object\");\n\
    match.func = match.typeOf(\"function\");\n\
    match.array = match.typeOf(\"array\");\n\
    match.regexp = match.typeOf(\"regexp\");\n\
    match.date = match.typeOf(\"date\");\n\
\n\
    if (commonJSModule) {\n\
        module.exports = match;\n\
    } else {\n\
        sinon.match = match;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/match.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/mock.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend stub.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, nomen: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Mock functions.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
    var push = [].push;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function mock(object) {\n\
        if (!object) {\n\
            return sinon.expectation.create(\"Anonymous mock\");\n\
        }\n\
\n\
        return mock.create(object);\n\
    }\n\
\n\
    sinon.mock = mock;\n\
\n\
    sinon.extend(mock, (function () {\n\
        function each(collection, callback) {\n\
            if (!collection) {\n\
                return;\n\
            }\n\
\n\
            for (var i = 0, l = collection.length; i < l; i += 1) {\n\
                callback(collection[i]);\n\
            }\n\
        }\n\
\n\
        return {\n\
            create: function create(object) {\n\
                if (!object) {\n\
                    throw new TypeError(\"object is null\");\n\
                }\n\
\n\
                var mockObject = sinon.extend({}, mock);\n\
                mockObject.object = object;\n\
                delete mockObject.create;\n\
\n\
                return mockObject;\n\
            },\n\
\n\
            expects: function expects(method) {\n\
                if (!method) {\n\
                    throw new TypeError(\"method is falsy\");\n\
                }\n\
\n\
                if (!this.expectations) {\n\
                    this.expectations = {};\n\
                    this.proxies = [];\n\
                }\n\
\n\
                if (!this.expectations[method]) {\n\
                    this.expectations[method] = [];\n\
                    var mockObject = this;\n\
\n\
                    sinon.wrapMethod(this.object, method, function () {\n\
                        return mockObject.invokeMethod(method, this, arguments);\n\
                    });\n\
\n\
                    push.call(this.proxies, method);\n\
                }\n\
\n\
                var expectation = sinon.expectation.create(method);\n\
                push.call(this.expectations[method], expectation);\n\
\n\
                return expectation;\n\
            },\n\
\n\
            restore: function restore() {\n\
                var object = this.object;\n\
\n\
                each(this.proxies, function (proxy) {\n\
                    if (typeof object[proxy].restore == \"function\") {\n\
                        object[proxy].restore();\n\
                    }\n\
                });\n\
            },\n\
\n\
            verify: function verify() {\n\
                var expectations = this.expectations || {};\n\
                var messages = [], met = [];\n\
\n\
                each(this.proxies, function (proxy) {\n\
                    each(expectations[proxy], function (expectation) {\n\
                        if (!expectation.met()) {\n\
                            push.call(messages, expectation.toString());\n\
                        } else {\n\
                            push.call(met, expectation.toString());\n\
                        }\n\
                    });\n\
                });\n\
\n\
                this.restore();\n\
\n\
                if (messages.length > 0) {\n\
                    sinon.expectation.fail(messages.concat(met).join(\"\\n\
\"));\n\
                } else {\n\
                    sinon.expectation.pass(messages.concat(met).join(\"\\n\
\"));\n\
                }\n\
\n\
                return true;\n\
            },\n\
\n\
            invokeMethod: function invokeMethod(method, thisValue, args) {\n\
                var expectations = this.expectations && this.expectations[method];\n\
                var length = expectations && expectations.length || 0, i;\n\
\n\
                for (i = 0; i < length; i += 1) {\n\
                    if (!expectations[i].met() &&\n\
                        expectations[i].allowsCall(thisValue, args)) {\n\
                        return expectations[i].apply(thisValue, args);\n\
                    }\n\
                }\n\
\n\
                var messages = [], available, exhausted = 0;\n\
\n\
                for (i = 0; i < length; i += 1) {\n\
                    if (expectations[i].allowsCall(thisValue, args)) {\n\
                        available = available || expectations[i];\n\
                    } else {\n\
                        exhausted += 1;\n\
                    }\n\
                    push.call(messages, \"    \" + expectations[i].toString());\n\
                }\n\
\n\
                if (exhausted === 0) {\n\
                    return available.apply(thisValue, args);\n\
                }\n\
\n\
                messages.unshift(\"Unexpected call: \" + sinon.spyCall.toString.call({\n\
                    proxy: method,\n\
                    args: args\n\
                }));\n\
\n\
                sinon.expectation.fail(messages.join(\"\\n\
\"));\n\
            }\n\
        };\n\
    }()));\n\
\n\
    var times = sinon.timesInWords;\n\
\n\
    sinon.expectation = (function () {\n\
        var slice = Array.prototype.slice;\n\
        var _invoke = sinon.spy.invoke;\n\
\n\
        function callCountInWords(callCount) {\n\
            if (callCount == 0) {\n\
                return \"never called\";\n\
            } else {\n\
                return \"called \" + times(callCount);\n\
            }\n\
        }\n\
\n\
        function expectedCallCountInWords(expectation) {\n\
            var min = expectation.minCalls;\n\
            var max = expectation.maxCalls;\n\
\n\
            if (typeof min == \"number\" && typeof max == \"number\") {\n\
                var str = times(min);\n\
\n\
                if (min != max) {\n\
                    str = \"at least \" + str + \" and at most \" + times(max);\n\
                }\n\
\n\
                return str;\n\
            }\n\
\n\
            if (typeof min == \"number\") {\n\
                return \"at least \" + times(min);\n\
            }\n\
\n\
            return \"at most \" + times(max);\n\
        }\n\
\n\
        function receivedMinCalls(expectation) {\n\
            var hasMinLimit = typeof expectation.minCalls == \"number\";\n\
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;\n\
        }\n\
\n\
        function receivedMaxCalls(expectation) {\n\
            if (typeof expectation.maxCalls != \"number\") {\n\
                return false;\n\
            }\n\
\n\
            return expectation.callCount == expectation.maxCalls;\n\
        }\n\
\n\
        return {\n\
            minCalls: 1,\n\
            maxCalls: 1,\n\
\n\
            create: function create(methodName) {\n\
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);\n\
                delete expectation.create;\n\
                expectation.method = methodName;\n\
\n\
                return expectation;\n\
            },\n\
\n\
            invoke: function invoke(func, thisValue, args) {\n\
                this.verifyCallAllowed(thisValue, args);\n\
\n\
                return _invoke.apply(this, arguments);\n\
            },\n\
\n\
            atLeast: function atLeast(num) {\n\
                if (typeof num != \"number\") {\n\
                    throw new TypeError(\"'\" + num + \"' is not number\");\n\
                }\n\
\n\
                if (!this.limitsSet) {\n\
                    this.maxCalls = null;\n\
                    this.limitsSet = true;\n\
                }\n\
\n\
                this.minCalls = num;\n\
\n\
                return this;\n\
            },\n\
\n\
            atMost: function atMost(num) {\n\
                if (typeof num != \"number\") {\n\
                    throw new TypeError(\"'\" + num + \"' is not number\");\n\
                }\n\
\n\
                if (!this.limitsSet) {\n\
                    this.minCalls = null;\n\
                    this.limitsSet = true;\n\
                }\n\
\n\
                this.maxCalls = num;\n\
\n\
                return this;\n\
            },\n\
\n\
            never: function never() {\n\
                return this.exactly(0);\n\
            },\n\
\n\
            once: function once() {\n\
                return this.exactly(1);\n\
            },\n\
\n\
            twice: function twice() {\n\
                return this.exactly(2);\n\
            },\n\
\n\
            thrice: function thrice() {\n\
                return this.exactly(3);\n\
            },\n\
\n\
            exactly: function exactly(num) {\n\
                if (typeof num != \"number\") {\n\
                    throw new TypeError(\"'\" + num + \"' is not a number\");\n\
                }\n\
\n\
                this.atLeast(num);\n\
                return this.atMost(num);\n\
            },\n\
\n\
            met: function met() {\n\
                return !this.failed && receivedMinCalls(this);\n\
            },\n\
\n\
            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {\n\
                if (receivedMaxCalls(this)) {\n\
                    this.failed = true;\n\
                    sinon.expectation.fail(this.method + \" already called \" + times(this.maxCalls));\n\
                }\n\
\n\
                if (\"expectedThis\" in this && this.expectedThis !== thisValue) {\n\
                    sinon.expectation.fail(this.method + \" called with \" + thisValue + \" as thisValue, expected \" +\n\
                        this.expectedThis);\n\
                }\n\
\n\
                if (!(\"expectedArguments\" in this)) {\n\
                    return;\n\
                }\n\
\n\
                if (!args) {\n\
                    sinon.expectation.fail(this.method + \" received no arguments, expected \" +\n\
                        sinon.format(this.expectedArguments));\n\
                }\n\
\n\
                if (args.length < this.expectedArguments.length) {\n\
                    sinon.expectation.fail(this.method + \" received too few arguments (\" + sinon.format(args) +\n\
                        \"), expected \" + sinon.format(this.expectedArguments));\n\
                }\n\
\n\
                if (this.expectsExactArgCount &&\n\
                    args.length != this.expectedArguments.length) {\n\
                    sinon.expectation.fail(this.method + \" received too many arguments (\" + sinon.format(args) +\n\
                        \"), expected \" + sinon.format(this.expectedArguments));\n\
                }\n\
\n\
                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {\n\
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {\n\
                        sinon.expectation.fail(this.method + \" received wrong arguments \" + sinon.format(args) +\n\
                            \", expected \" + sinon.format(this.expectedArguments));\n\
                    }\n\
                }\n\
            },\n\
\n\
            allowsCall: function allowsCall(thisValue, args) {\n\
                if (this.met() && receivedMaxCalls(this)) {\n\
                    return false;\n\
                }\n\
\n\
                if (\"expectedThis\" in this && this.expectedThis !== thisValue) {\n\
                    return false;\n\
                }\n\
\n\
                if (!(\"expectedArguments\" in this)) {\n\
                    return true;\n\
                }\n\
\n\
                args = args || [];\n\
\n\
                if (args.length < this.expectedArguments.length) {\n\
                    return false;\n\
                }\n\
\n\
                if (this.expectsExactArgCount &&\n\
                    args.length != this.expectedArguments.length) {\n\
                    return false;\n\
                }\n\
\n\
                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {\n\
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {\n\
                        return false;\n\
                    }\n\
                }\n\
\n\
                return true;\n\
            },\n\
\n\
            withArgs: function withArgs() {\n\
                this.expectedArguments = slice.call(arguments);\n\
                return this;\n\
            },\n\
\n\
            withExactArgs: function withExactArgs() {\n\
                this.withArgs.apply(this, arguments);\n\
                this.expectsExactArgCount = true;\n\
                return this;\n\
            },\n\
\n\
            on: function on(thisValue) {\n\
                this.expectedThis = thisValue;\n\
                return this;\n\
            },\n\
\n\
            toString: function () {\n\
                var args = (this.expectedArguments || []).slice();\n\
\n\
                if (!this.expectsExactArgCount) {\n\
                    push.call(args, \"[...]\");\n\
                }\n\
\n\
                var callStr = sinon.spyCall.toString.call({\n\
                    proxy: this.method || \"anonymous mock expectation\",\n\
                    args: args\n\
                });\n\
\n\
                var message = callStr.replace(\", [...\", \"[, ...\") + \" \" +\n\
                    expectedCallCountInWords(this);\n\
\n\
                if (this.met()) {\n\
                    return \"Expectation met: \" + message;\n\
                }\n\
\n\
                return \"Expected \" + message + \" (\" +\n\
                    callCountInWords(this.callCount) + \")\";\n\
            },\n\
\n\
            verify: function verify() {\n\
                if (!this.met()) {\n\
                    sinon.expectation.fail(this.toString());\n\
                } else {\n\
                    sinon.expectation.pass(this.toString());\n\
                }\n\
\n\
                return true;\n\
            },\n\
\n\
            pass: function(message) {\n\
              sinon.assert.pass(message);\n\
            },\n\
            fail: function (message) {\n\
                var exception = new Error(message);\n\
                exception.name = \"ExpectationError\";\n\
\n\
                throw exception;\n\
            }\n\
        };\n\
    }());\n\
\n\
    if (commonJSModule) {\n\
        module.exports = mock;\n\
    } else {\n\
        sinon.mock = mock;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/mock.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/sandbox.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend collection.js\n\
 * @depend util/fake_timers.js\n\
 * @depend util/fake_server_with_clock.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, plusplus: false*/\n\
/*global require, module*/\n\
/**\n\
 * Manages fake collections as well as fake utilities such as Sinon's\n\
 * timers and fake XHR implementation in one convenient object.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
if (typeof module !== 'undefined' && module.exports) {\n\
    var sinon = require(\"../sinon\");\n\
    sinon.extend(sinon, require(\"./util/fake_timers\"));\n\
}\n\
\n\
(function () {\n\
    var push = [].push;\n\
\n\
    function exposeValue(sandbox, config, key, value) {\n\
        if (!value) {\n\
            return;\n\
        }\n\
\n\
        if (config.injectInto) {\n\
            config.injectInto[key] = value;\n\
        } else {\n\
            push.call(sandbox.args, value);\n\
        }\n\
    }\n\
\n\
    function prepareSandboxFromConfig(config) {\n\
        var sandbox = sinon.create(sinon.sandbox);\n\
\n\
        if (config.useFakeServer) {\n\
            if (typeof config.useFakeServer == \"object\") {\n\
                sandbox.serverPrototype = config.useFakeServer;\n\
            }\n\
\n\
            sandbox.useFakeServer();\n\
        }\n\
\n\
        if (config.useFakeTimers) {\n\
            if (typeof config.useFakeTimers == \"object\") {\n\
                sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);\n\
            } else {\n\
                sandbox.useFakeTimers();\n\
            }\n\
        }\n\
\n\
        return sandbox;\n\
    }\n\
\n\
    sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {\n\
        useFakeTimers: function useFakeTimers() {\n\
            this.clock = sinon.useFakeTimers.apply(sinon, arguments);\n\
\n\
            return this.add(this.clock);\n\
        },\n\
\n\
        serverPrototype: sinon.fakeServer,\n\
\n\
        useFakeServer: function useFakeServer() {\n\
            var proto = this.serverPrototype || sinon.fakeServer;\n\
\n\
            if (!proto || !proto.create) {\n\
                return null;\n\
            }\n\
\n\
            this.server = proto.create();\n\
            return this.add(this.server);\n\
        },\n\
\n\
        inject: function (obj) {\n\
            sinon.collection.inject.call(this, obj);\n\
\n\
            if (this.clock) {\n\
                obj.clock = this.clock;\n\
            }\n\
\n\
            if (this.server) {\n\
                obj.server = this.server;\n\
                obj.requests = this.server.requests;\n\
            }\n\
\n\
            return obj;\n\
        },\n\
\n\
        create: function (config) {\n\
            if (!config) {\n\
                return sinon.create(sinon.sandbox);\n\
            }\n\
\n\
            var sandbox = prepareSandboxFromConfig(config);\n\
            sandbox.args = sandbox.args || [];\n\
            var prop, value, exposed = sandbox.inject({});\n\
\n\
            if (config.properties) {\n\
                for (var i = 0, l = config.properties.length; i < l; i++) {\n\
                    prop = config.properties[i];\n\
                    value = exposed[prop] || prop == \"sandbox\" && sandbox;\n\
                    exposeValue(sandbox, config, prop, value);\n\
                }\n\
            } else {\n\
                exposeValue(sandbox, config, \"sandbox\", value);\n\
            }\n\
\n\
            return sandbox;\n\
        }\n\
    });\n\
\n\
    sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;\n\
\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
        module.exports = sinon.sandbox;\n\
    }\n\
}());\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/sandbox.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/spy.js", Function("exports, require, module",
"/**\n\
  * @depend ../sinon.js\n\
  * @depend call.js\n\
  */\n\
/*jslint eqeqeq: false, onevar: false, plusplus: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
  * Spy functions\n\
  *\n\
  * @author Christian Johansen (christian@cjohansen.no)\n\
  * @license BSD\n\
  *\n\
  * Copyright (c) 2010-2013 Christian Johansen\n\
  */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
    var push = Array.prototype.push;\n\
    var slice = Array.prototype.slice;\n\
    var callId = 0;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function spy(object, property) {\n\
        if (!property && typeof object == \"function\") {\n\
            return spy.create(object);\n\
        }\n\
\n\
        if (!object && !property) {\n\
            return spy.create(function () { });\n\
        }\n\
\n\
        var method = object[property];\n\
        return sinon.wrapMethod(object, property, spy.create(method));\n\
    }\n\
\n\
    function matchingFake(fakes, args, strict) {\n\
        if (!fakes) {\n\
            return;\n\
        }\n\
\n\
        var alen = args.length;\n\
\n\
        for (var i = 0, l = fakes.length; i < l; i++) {\n\
            if (fakes[i].matches(args, strict)) {\n\
                return fakes[i];\n\
            }\n\
        }\n\
    }\n\
\n\
    function incrementCallCount() {\n\
        this.called = true;\n\
        this.callCount += 1;\n\
        this.notCalled = false;\n\
        this.calledOnce = this.callCount == 1;\n\
        this.calledTwice = this.callCount == 2;\n\
        this.calledThrice = this.callCount == 3;\n\
    }\n\
\n\
    function createCallProperties() {\n\
        this.firstCall = this.getCall(0);\n\
        this.secondCall = this.getCall(1);\n\
        this.thirdCall = this.getCall(2);\n\
        this.lastCall = this.getCall(this.callCount - 1);\n\
    }\n\
\n\
    var vars = \"a,b,c,d,e,f,g,h,i,j,k,l\";\n\
    function createProxy(func) {\n\
        // Retain the function length:\n\
        var p;\n\
        if (func.length) {\n\
            eval(\"p = (function proxy(\" + vars.substring(0, func.length * 2 - 1) +\n\
                \") { return p.invoke(func, this, slice.call(arguments)); });\");\n\
        }\n\
        else {\n\
            p = function proxy() {\n\
                return p.invoke(func, this, slice.call(arguments));\n\
            };\n\
        }\n\
        return p;\n\
    }\n\
\n\
    var uuid = 0;\n\
\n\
    // Public API\n\
    var spyApi = {\n\
        reset: function () {\n\
            this.called = false;\n\
            this.notCalled = true;\n\
            this.calledOnce = false;\n\
            this.calledTwice = false;\n\
            this.calledThrice = false;\n\
            this.callCount = 0;\n\
            this.firstCall = null;\n\
            this.secondCall = null;\n\
            this.thirdCall = null;\n\
            this.lastCall = null;\n\
            this.args = [];\n\
            this.returnValues = [];\n\
            this.thisValues = [];\n\
            this.exceptions = [];\n\
            this.callIds = [];\n\
            if (this.fakes) {\n\
                for (var i = 0; i < this.fakes.length; i++) {\n\
                    this.fakes[i].reset();\n\
                }\n\
            }\n\
        },\n\
\n\
        create: function create(func) {\n\
            var name;\n\
\n\
            if (typeof func != \"function\") {\n\
                func = function () { };\n\
            } else {\n\
                name = sinon.functionName(func);\n\
            }\n\
\n\
            var proxy = createProxy(func);\n\
\n\
            sinon.extend(proxy, spy);\n\
            delete proxy.create;\n\
            sinon.extend(proxy, func);\n\
\n\
            proxy.reset();\n\
            proxy.prototype = func.prototype;\n\
            proxy.displayName = name || \"spy\";\n\
            proxy.toString = sinon.functionToString;\n\
            proxy._create = sinon.spy.create;\n\
            proxy.id = \"spy#\" + uuid++;\n\
\n\
            return proxy;\n\
        },\n\
\n\
        invoke: function invoke(func, thisValue, args) {\n\
            var matching = matchingFake(this.fakes, args);\n\
            var exception, returnValue;\n\
\n\
            incrementCallCount.call(this);\n\
            push.call(this.thisValues, thisValue);\n\
            push.call(this.args, args);\n\
            push.call(this.callIds, callId++);\n\
\n\
            try {\n\
                if (matching) {\n\
                    returnValue = matching.invoke(func, thisValue, args);\n\
                } else {\n\
                    returnValue = (this.func || func).apply(thisValue, args);\n\
                }\n\
            } catch (e) {\n\
                push.call(this.returnValues, undefined);\n\
                exception = e;\n\
                throw e;\n\
            } finally {\n\
                push.call(this.exceptions, exception);\n\
            }\n\
\n\
            push.call(this.returnValues, returnValue);\n\
\n\
            createCallProperties.call(this);\n\
\n\
            return returnValue;\n\
        },\n\
\n\
        getCall: function getCall(i) {\n\
            if (i < 0 || i >= this.callCount) {\n\
                return null;\n\
            }\n\
\n\
            return sinon.spyCall(this, this.thisValues[i], this.args[i],\n\
                                    this.returnValues[i], this.exceptions[i],\n\
                                    this.callIds[i]);\n\
        },\n\
\n\
        calledBefore: function calledBefore(spyFn) {\n\
            if (!this.called) {\n\
                return false;\n\
            }\n\
\n\
            if (!spyFn.called) {\n\
                return true;\n\
            }\n\
\n\
            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];\n\
        },\n\
\n\
        calledAfter: function calledAfter(spyFn) {\n\
            if (!this.called || !spyFn.called) {\n\
                return false;\n\
            }\n\
\n\
            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];\n\
        },\n\
\n\
        withArgs: function () {\n\
            var args = slice.call(arguments);\n\
\n\
            if (this.fakes) {\n\
                var match = matchingFake(this.fakes, args, true);\n\
\n\
                if (match) {\n\
                    return match;\n\
                }\n\
            } else {\n\
                this.fakes = [];\n\
            }\n\
\n\
            var original = this;\n\
            var fake = this._create();\n\
            fake.matchingAguments = args;\n\
            push.call(this.fakes, fake);\n\
\n\
            fake.withArgs = function () {\n\
                return original.withArgs.apply(original, arguments);\n\
            };\n\
\n\
            for (var i = 0; i < this.args.length; i++) {\n\
                if (fake.matches(this.args[i])) {\n\
                    incrementCallCount.call(fake);\n\
                    push.call(fake.thisValues, this.thisValues[i]);\n\
                    push.call(fake.args, this.args[i]);\n\
                    push.call(fake.returnValues, this.returnValues[i]);\n\
                    push.call(fake.exceptions, this.exceptions[i]);\n\
                    push.call(fake.callIds, this.callIds[i]);\n\
                }\n\
            }\n\
            createCallProperties.call(fake);\n\
\n\
            return fake;\n\
        },\n\
\n\
        matches: function (args, strict) {\n\
            var margs = this.matchingAguments;\n\
\n\
            if (margs.length <= args.length &&\n\
                sinon.deepEqual(margs, args.slice(0, margs.length))) {\n\
                return !strict || margs.length == args.length;\n\
            }\n\
        },\n\
\n\
        printf: function (format) {\n\
            var spy = this;\n\
            var args = slice.call(arguments, 1);\n\
            var formatter;\n\
\n\
            return (format || \"\").replace(/%(.)/g, function (match, specifyer) {\n\
                formatter = spyApi.formatters[specifyer];\n\
\n\
                if (typeof formatter == \"function\") {\n\
                    return formatter.call(null, spy, args);\n\
                } else if (!isNaN(parseInt(specifyer), 10)) {\n\
                    return sinon.format(args[specifyer - 1]);\n\
                }\n\
\n\
                return \"%\" + specifyer;\n\
            });\n\
        }\n\
    };\n\
\n\
    function delegateToCalls(method, matchAny, actual, notCalled) {\n\
        spyApi[method] = function () {\n\
            if (!this.called) {\n\
                if (notCalled) {\n\
                    return notCalled.apply(this, arguments);\n\
                }\n\
                return false;\n\
            }\n\
\n\
            var currentCall;\n\
            var matches = 0;\n\
\n\
            for (var i = 0, l = this.callCount; i < l; i += 1) {\n\
                currentCall = this.getCall(i);\n\
\n\
                if (currentCall[actual || method].apply(currentCall, arguments)) {\n\
                    matches += 1;\n\
\n\
                    if (matchAny) {\n\
                        return true;\n\
                    }\n\
                }\n\
            }\n\
\n\
            return matches === this.callCount;\n\
        };\n\
    }\n\
\n\
    delegateToCalls(\"calledOn\", true);\n\
    delegateToCalls(\"alwaysCalledOn\", false, \"calledOn\");\n\
    delegateToCalls(\"calledWith\", true);\n\
    delegateToCalls(\"calledWithMatch\", true);\n\
    delegateToCalls(\"alwaysCalledWith\", false, \"calledWith\");\n\
    delegateToCalls(\"alwaysCalledWithMatch\", false, \"calledWithMatch\");\n\
    delegateToCalls(\"calledWithExactly\", true);\n\
    delegateToCalls(\"alwaysCalledWithExactly\", false, \"calledWithExactly\");\n\
    delegateToCalls(\"neverCalledWith\", false, \"notCalledWith\",\n\
        function () { return true; });\n\
    delegateToCalls(\"neverCalledWithMatch\", false, \"notCalledWithMatch\",\n\
        function () { return true; });\n\
    delegateToCalls(\"threw\", true);\n\
    delegateToCalls(\"alwaysThrew\", false, \"threw\");\n\
    delegateToCalls(\"returned\", true);\n\
    delegateToCalls(\"alwaysReturned\", false, \"returned\");\n\
    delegateToCalls(\"calledWithNew\", true);\n\
    delegateToCalls(\"alwaysCalledWithNew\", false, \"calledWithNew\");\n\
    delegateToCalls(\"callArg\", false, \"callArgWith\", function () {\n\
        throw new Error(this.toString() + \" cannot call arg since it was not yet invoked.\");\n\
    });\n\
    spyApi.callArgWith = spyApi.callArg;\n\
    delegateToCalls(\"callArgOn\", false, \"callArgOnWith\", function () {\n\
        throw new Error(this.toString() + \" cannot call arg since it was not yet invoked.\");\n\
    });\n\
    spyApi.callArgOnWith = spyApi.callArgOn;\n\
    delegateToCalls(\"yield\", false, \"yield\", function () {\n\
        throw new Error(this.toString() + \" cannot yield since it was not yet invoked.\");\n\
    });\n\
    // \"invokeCallback\" is an alias for \"yield\" since \"yield\" is invalid in strict mode.\n\
    spyApi.invokeCallback = spyApi.yield;\n\
    delegateToCalls(\"yieldOn\", false, \"yieldOn\", function () {\n\
        throw new Error(this.toString() + \" cannot yield since it was not yet invoked.\");\n\
    });\n\
    delegateToCalls(\"yieldTo\", false, \"yieldTo\", function (property) {\n\
        throw new Error(this.toString() + \" cannot yield to '\" + property +\n\
            \"' since it was not yet invoked.\");\n\
    });\n\
    delegateToCalls(\"yieldToOn\", false, \"yieldToOn\", function (property) {\n\
        throw new Error(this.toString() + \" cannot yield to '\" + property +\n\
            \"' since it was not yet invoked.\");\n\
    });\n\
\n\
    spyApi.formatters = {\n\
        \"c\": function (spy) {\n\
            return sinon.timesInWords(spy.callCount);\n\
        },\n\
\n\
        \"n\": function (spy) {\n\
            return spy.toString();\n\
        },\n\
\n\
        \"C\": function (spy) {\n\
            var calls = [];\n\
\n\
            for (var i = 0, l = spy.callCount; i < l; ++i) {\n\
                var stringifiedCall = \"    \" + spy.getCall(i).toString();\n\
                if (/\\n\
/.test(calls[i - 1])) {\n\
                    stringifiedCall = \"\\n\
\" + stringifiedCall;\n\
                }\n\
                push.call(calls, stringifiedCall);\n\
            }\n\
\n\
            return calls.length > 0 ? \"\\n\
\" + calls.join(\"\\n\
\") : \"\";\n\
        },\n\
\n\
        \"t\": function (spy) {\n\
            var objects = [];\n\
\n\
            for (var i = 0, l = spy.callCount; i < l; ++i) {\n\
                push.call(objects, sinon.format(spy.thisValues[i]));\n\
            }\n\
\n\
            return objects.join(\", \");\n\
        },\n\
\n\
        \"*\": function (spy, args) {\n\
            var formatted = [];\n\
\n\
            for (var i = 0, l = args.length; i < l; ++i) {\n\
                push.call(formatted, sinon.format(args[i]));\n\
            }\n\
\n\
            return formatted.join(\", \");\n\
        }\n\
    };\n\
\n\
    sinon.extend(spy, spyApi);\n\
\n\
    spy.spyCall = sinon.spyCall;\n\
\n\
    if (commonJSModule) {\n\
        module.exports = spy;\n\
    } else {\n\
        sinon.spy = spy;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/spy.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/stub.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend spy.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Stub functions\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function stub(object, property, func) {\n\
        if (!!func && typeof func != \"function\") {\n\
            throw new TypeError(\"Custom stub should be function\");\n\
        }\n\
\n\
        var wrapper;\n\
\n\
        if (func) {\n\
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;\n\
        } else {\n\
            wrapper = stub.create();\n\
        }\n\
\n\
        if (!object && !property) {\n\
            return sinon.stub.create();\n\
        }\n\
\n\
        if (!property && !!object && typeof object == \"object\") {\n\
            for (var prop in object) {\n\
                if (typeof object[prop] === \"function\") {\n\
                    stub(object, prop);\n\
                }\n\
            }\n\
\n\
            return object;\n\
        }\n\
\n\
        return sinon.wrapMethod(object, property, wrapper);\n\
    }\n\
\n\
    function getChangingValue(stub, property) {\n\
        var index = stub.callCount - 1;\n\
        var values = stub[property];\n\
        var prop = index in values ? values[index] : values[values.length - 1];\n\
        stub[property + \"Last\"] = prop;\n\
\n\
        return prop;\n\
    }\n\
\n\
    function getCallback(stub, args) {\n\
        var callArgAt = getChangingValue(stub, \"callArgAts\");\n\
\n\
        if (callArgAt < 0) {\n\
            var callArgProp = getChangingValue(stub, \"callArgProps\");\n\
\n\
            for (var i = 0, l = args.length; i < l; ++i) {\n\
                if (!callArgProp && typeof args[i] == \"function\") {\n\
                    return args[i];\n\
                }\n\
\n\
                if (callArgProp && args[i] &&\n\
                    typeof args[i][callArgProp] == \"function\") {\n\
                    return args[i][callArgProp];\n\
                }\n\
            }\n\
\n\
            return null;\n\
        }\n\
\n\
        return args[callArgAt];\n\
    }\n\
\n\
    var join = Array.prototype.join;\n\
\n\
    function getCallbackError(stub, func, args) {\n\
        if (stub.callArgAtsLast < 0) {\n\
            var msg;\n\
\n\
            if (stub.callArgPropsLast) {\n\
                msg = sinon.functionName(stub) +\n\
                    \" expected to yield to '\" + stub.callArgPropsLast +\n\
                    \"', but no object with such a property was passed.\"\n\
            } else {\n\
                msg = sinon.functionName(stub) +\n\
                            \" expected to yield, but no callback was passed.\"\n\
            }\n\
\n\
            if (args.length > 0) {\n\
                msg += \" Received [\" + join.call(args, \", \") + \"]\";\n\
            }\n\
\n\
            return msg;\n\
        }\n\
\n\
        return \"argument at index \" + stub.callArgAtsLast + \" is not a function: \" + func;\n\
    }\n\
\n\
    var nextTick = (function () {\n\
        if (typeof process === \"object\" && typeof process.nextTick === \"function\") {\n\
            return process.nextTick;\n\
        } else if (typeof setImmediate === \"function\") {\n\
            return setImmediate;\n\
        } else {\n\
            return function (callback) {\n\
                setTimeout(callback, 0);\n\
            };\n\
        }\n\
    })();\n\
\n\
    function callCallback(stub, args) {\n\
        if (stub.callArgAts.length > 0) {\n\
            var func = getCallback(stub, args);\n\
\n\
            if (typeof func != \"function\") {\n\
                throw new TypeError(getCallbackError(stub, func, args));\n\
            }\n\
\n\
            var callbackArguments = getChangingValue(stub, \"callbackArguments\");\n\
            var callbackContext = getChangingValue(stub, \"callbackContexts\");\n\
\n\
            if (stub.callbackAsync) {\n\
                nextTick(function() {\n\
                    func.apply(callbackContext, callbackArguments);\n\
                });\n\
            } else {\n\
                func.apply(callbackContext, callbackArguments);\n\
            }\n\
        }\n\
    }\n\
\n\
    var uuid = 0;\n\
\n\
    sinon.extend(stub, (function () {\n\
        var slice = Array.prototype.slice, proto;\n\
\n\
        function throwsException(error, message) {\n\
            if (typeof error == \"string\") {\n\
                this.exception = new Error(message || \"\");\n\
                this.exception.name = error;\n\
            } else if (!error) {\n\
                this.exception = new Error(\"Error\");\n\
            } else {\n\
                this.exception = error;\n\
            }\n\
\n\
            return this;\n\
        }\n\
\n\
        proto = {\n\
            create: function create() {\n\
                var functionStub = function () {\n\
\n\
                    callCallback(functionStub, arguments);\n\
\n\
                    if (functionStub.exception) {\n\
                        throw functionStub.exception;\n\
                    } else if (typeof functionStub.returnArgAt == 'number') {\n\
                        return arguments[functionStub.returnArgAt];\n\
                    } else if (functionStub.returnThis) {\n\
                        return this;\n\
                    }\n\
                    return functionStub.returnValue;\n\
                };\n\
\n\
                functionStub.id = \"stub#\" + uuid++;\n\
                var orig = functionStub;\n\
                functionStub = sinon.spy.create(functionStub);\n\
                functionStub.func = orig;\n\
\n\
                functionStub.callArgAts = [];\n\
                functionStub.callbackArguments = [];\n\
                functionStub.callbackContexts = [];\n\
                functionStub.callArgProps = [];\n\
\n\
                sinon.extend(functionStub, stub);\n\
                functionStub._create = sinon.stub.create;\n\
                functionStub.displayName = \"stub\";\n\
                functionStub.toString = sinon.functionToString;\n\
\n\
                return functionStub;\n\
            },\n\
\n\
            resetBehavior: function () {\n\
                var i;\n\
\n\
                this.callArgAts = [];\n\
                this.callbackArguments = [];\n\
                this.callbackContexts = [];\n\
                this.callArgProps = [];\n\
\n\
                delete this.returnValue;\n\
                delete this.returnArgAt;\n\
                this.returnThis = false;\n\
\n\
                if (this.fakes) {\n\
                    for (i = 0; i < this.fakes.length; i++) {\n\
                        this.fakes[i].resetBehavior();\n\
                    }\n\
                }\n\
            },\n\
\n\
            returns: function returns(value) {\n\
                this.returnValue = value;\n\
\n\
                return this;\n\
            },\n\
\n\
            returnsArg: function returnsArg(pos) {\n\
                if (typeof pos != \"number\") {\n\
                    throw new TypeError(\"argument index is not number\");\n\
                }\n\
\n\
                this.returnArgAt = pos;\n\
\n\
                return this;\n\
            },\n\
\n\
            returnsThis: function returnsThis() {\n\
                this.returnThis = true;\n\
\n\
                return this;\n\
            },\n\
\n\
            \"throws\": throwsException,\n\
            throwsException: throwsException,\n\
\n\
            callsArg: function callsArg(pos) {\n\
                if (typeof pos != \"number\") {\n\
                    throw new TypeError(\"argument index is not number\");\n\
                }\n\
\n\
                this.callArgAts.push(pos);\n\
                this.callbackArguments.push([]);\n\
                this.callbackContexts.push(undefined);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            callsArgOn: function callsArgOn(pos, context) {\n\
                if (typeof pos != \"number\") {\n\
                    throw new TypeError(\"argument index is not number\");\n\
                }\n\
                if (typeof context != \"object\") {\n\
                    throw new TypeError(\"argument context is not an object\");\n\
                }\n\
\n\
                this.callArgAts.push(pos);\n\
                this.callbackArguments.push([]);\n\
                this.callbackContexts.push(context);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            callsArgWith: function callsArgWith(pos) {\n\
                if (typeof pos != \"number\") {\n\
                    throw new TypeError(\"argument index is not number\");\n\
                }\n\
\n\
                this.callArgAts.push(pos);\n\
                this.callbackArguments.push(slice.call(arguments, 1));\n\
                this.callbackContexts.push(undefined);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            callsArgOnWith: function callsArgWith(pos, context) {\n\
                if (typeof pos != \"number\") {\n\
                    throw new TypeError(\"argument index is not number\");\n\
                }\n\
                if (typeof context != \"object\") {\n\
                    throw new TypeError(\"argument context is not an object\");\n\
                }\n\
\n\
                this.callArgAts.push(pos);\n\
                this.callbackArguments.push(slice.call(arguments, 2));\n\
                this.callbackContexts.push(context);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            yields: function () {\n\
                this.callArgAts.push(-1);\n\
                this.callbackArguments.push(slice.call(arguments, 0));\n\
                this.callbackContexts.push(undefined);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            yieldsOn: function (context) {\n\
                if (typeof context != \"object\") {\n\
                    throw new TypeError(\"argument context is not an object\");\n\
                }\n\
\n\
                this.callArgAts.push(-1);\n\
                this.callbackArguments.push(slice.call(arguments, 1));\n\
                this.callbackContexts.push(context);\n\
                this.callArgProps.push(undefined);\n\
\n\
                return this;\n\
            },\n\
\n\
            yieldsTo: function (prop) {\n\
                this.callArgAts.push(-1);\n\
                this.callbackArguments.push(slice.call(arguments, 1));\n\
                this.callbackContexts.push(undefined);\n\
                this.callArgProps.push(prop);\n\
\n\
                return this;\n\
            },\n\
\n\
            yieldsToOn: function (prop, context) {\n\
                if (typeof context != \"object\") {\n\
                    throw new TypeError(\"argument context is not an object\");\n\
                }\n\
\n\
                this.callArgAts.push(-1);\n\
                this.callbackArguments.push(slice.call(arguments, 2));\n\
                this.callbackContexts.push(context);\n\
                this.callArgProps.push(prop);\n\
\n\
                return this;\n\
            }\n\
        };\n\
\n\
        // create asynchronous versions of callsArg* and yields* methods\n\
        for (var method in proto) {\n\
            // need to avoid creating anotherasync versions of the newly added async methods\n\
            if (proto.hasOwnProperty(method) &&\n\
                method.match(/^(callsArg|yields|thenYields$)/) &&\n\
                !method.match(/Async/)) {\n\
                proto[method + 'Async'] = (function (syncFnName) {\n\
                    return function () {\n\
                        this.callbackAsync = true;\n\
                        return this[syncFnName].apply(this, arguments);\n\
                    };\n\
                })(method);\n\
            }\n\
        }\n\
\n\
        return proto;\n\
\n\
    }()));\n\
\n\
    if (commonJSModule) {\n\
        module.exports = stub;\n\
    } else {\n\
        sinon.stub = stub;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/stub.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/test.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend stub.js\n\
 * @depend mock.js\n\
 * @depend sandbox.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, forin: true, plusplus: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Test function, sandboxes fakes\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon) {\n\
        return;\n\
    }\n\
\n\
    function test(callback) {\n\
        var type = typeof callback;\n\
\n\
        if (type != \"function\") {\n\
            throw new TypeError(\"sinon.test needs to wrap a test function, got \" + type);\n\
        }\n\
\n\
        return function () {\n\
            var config = sinon.getConfig(sinon.config);\n\
            config.injectInto = config.injectIntoThis && this || config.injectInto;\n\
            var sandbox = sinon.sandbox.create(config);\n\
            var exception, result;\n\
            var args = Array.prototype.slice.call(arguments).concat(sandbox.args);\n\
\n\
            try {\n\
                result = callback.apply(this, args);\n\
            } catch (e) {\n\
                exception = e;\n\
            }\n\
\n\
            if (typeof exception !== \"undefined\") {\n\
                sandbox.restore();\n\
                throw exception;\n\
            }\n\
            else {\n\
                sandbox.verifyAndRestore();\n\
            }\n\
\n\
            return result;\n\
        };\n\
    }\n\
\n\
    test.config = {\n\
        injectIntoThis: true,\n\
        injectInto: null,\n\
        properties: [\"spy\", \"stub\", \"mock\", \"clock\", \"server\", \"requests\"],\n\
        useFakeTimers: true,\n\
        useFakeServer: true\n\
    };\n\
\n\
    if (commonJSModule) {\n\
        module.exports = test;\n\
    } else {\n\
        sinon.test = test;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/test.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/test_case.js", Function("exports, require, module",
"/**\n\
 * @depend ../sinon.js\n\
 * @depend test.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, eqeqeq: false*/\n\
/*global module, require, sinon*/\n\
/**\n\
 * Test case, sandboxes all test functions\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function (sinon) {\n\
    var commonJSModule = typeof module !== 'undefined' && module.exports;\n\
\n\
    if (!sinon && commonJSModule) {\n\
        sinon = require(\"../sinon\");\n\
    }\n\
\n\
    if (!sinon || !Object.prototype.hasOwnProperty) {\n\
        return;\n\
    }\n\
\n\
    function createTest(property, setUp, tearDown) {\n\
        return function () {\n\
            if (setUp) {\n\
                setUp.apply(this, arguments);\n\
            }\n\
\n\
            var exception, result;\n\
\n\
            try {\n\
                result = property.apply(this, arguments);\n\
            } catch (e) {\n\
                exception = e;\n\
            }\n\
\n\
            if (tearDown) {\n\
                tearDown.apply(this, arguments);\n\
            }\n\
\n\
            if (exception) {\n\
                throw exception;\n\
            }\n\
\n\
            return result;\n\
        };\n\
    }\n\
\n\
    function testCase(tests, prefix) {\n\
        /*jsl:ignore*/\n\
        if (!tests || typeof tests != \"object\") {\n\
            throw new TypeError(\"sinon.testCase needs an object with test functions\");\n\
        }\n\
        /*jsl:end*/\n\
\n\
        prefix = prefix || \"test\";\n\
        var rPrefix = new RegExp(\"^\" + prefix);\n\
        var methods = {}, testName, property, method;\n\
        var setUp = tests.setUp;\n\
        var tearDown = tests.tearDown;\n\
\n\
        for (testName in tests) {\n\
            if (tests.hasOwnProperty(testName)) {\n\
                property = tests[testName];\n\
\n\
                if (/^(setUp|tearDown)$/.test(testName)) {\n\
                    continue;\n\
                }\n\
\n\
                if (typeof property == \"function\" && rPrefix.test(testName)) {\n\
                    method = property;\n\
\n\
                    if (setUp || tearDown) {\n\
                        method = createTest(property, setUp, tearDown);\n\
                    }\n\
\n\
                    methods[testName] = sinon.test(method);\n\
                } else {\n\
                    methods[testName] = tests[testName];\n\
                }\n\
            }\n\
        }\n\
\n\
        return methods;\n\
    }\n\
\n\
    if (commonJSModule) {\n\
        module.exports = testCase;\n\
    } else {\n\
        sinon.testCase = testCase;\n\
    }\n\
}(typeof sinon == \"object\" && sinon || null));\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/test_case.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/event.js", Function("exports, require, module",
"/*jslint eqeqeq: false, onevar: false*/\n\
/*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/\n\
/**\n\
 * Minimal Event interface implementation\n\
 *\n\
 * Original implementation by Sven Fuchs: https://gist.github.com/995028\n\
 * Modifications and tests by Christian Johansen.\n\
 *\n\
 * @author Sven Fuchs (svenfuchs@artweb-design.de)\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2011 Sven Fuchs, Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
if (typeof sinon == \"undefined\") {\n\
    this.sinon = {};\n\
}\n\
\n\
(function () {\n\
    var push = [].push;\n\
\n\
    sinon.Event = function Event(type, bubbles, cancelable, target) {\n\
        this.initEvent(type, bubbles, cancelable, target);\n\
    };\n\
\n\
    sinon.Event.prototype = {\n\
        initEvent: function(type, bubbles, cancelable, target) {\n\
            this.type = type;\n\
            this.bubbles = bubbles;\n\
            this.cancelable = cancelable;\n\
            this.target = target;\n\
        },\n\
\n\
        stopPropagation: function () {},\n\
\n\
        preventDefault: function () {\n\
            this.defaultPrevented = true;\n\
        }\n\
    };\n\
\n\
    sinon.EventTarget = {\n\
        addEventListener: function addEventListener(event, listener, useCapture) {\n\
            this.eventListeners = this.eventListeners || {};\n\
            this.eventListeners[event] = this.eventListeners[event] || [];\n\
            push.call(this.eventListeners[event], listener);\n\
        },\n\
\n\
        removeEventListener: function removeEventListener(event, listener, useCapture) {\n\
            var listeners = this.eventListeners && this.eventListeners[event] || [];\n\
\n\
            for (var i = 0, l = listeners.length; i < l; ++i) {\n\
                if (listeners[i] == listener) {\n\
                    return listeners.splice(i, 1);\n\
                }\n\
            }\n\
        },\n\
\n\
        dispatchEvent: function dispatchEvent(event) {\n\
            var type = event.type;\n\
            var listeners = this.eventListeners && this.eventListeners[type] || [];\n\
\n\
            for (var i = 0; i < listeners.length; i++) {\n\
                if (typeof listeners[i] == \"function\") {\n\
                    listeners[i].call(this, event);\n\
                } else {\n\
                    listeners[i].handleEvent(event);\n\
                }\n\
            }\n\
\n\
            return !!event.defaultPrevented;\n\
        }\n\
    };\n\
}());\n\
\n\
if (typeof module !== 'undefined' && module.exports) {\n\
    module.exports = sinon;\n\
}\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/event.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/fake_server.js", Function("exports, require, module",
"/**\n\
 * @depend fake_xml_http_request.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false, regexp: false, plusplus: false*/\n\
/*global module, require, window*/\n\
/**\n\
 * The Sinon \"server\" mimics a web server that receives requests from\n\
 * sinon.FakeXMLHttpRequest and provides an API to respond to those requests,\n\
 * both synchronously and asynchronously. To respond synchronuously, canned\n\
 * answers have to be provided upfront.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
if (typeof sinon == \"undefined\") {\n\
    var sinon = require(\"../../sinon\");\n\
}\n\
\n\
sinon.fakeServer = (function () {\n\
    var push = [].push;\n\
    function F() {}\n\
\n\
    function create(proto) {\n\
        F.prototype = proto;\n\
        return new F();\n\
    }\n\
\n\
    function responseArray(handler) {\n\
        var response = handler;\n\
\n\
        if (Object.prototype.toString.call(handler) != \"[object Array]\") {\n\
            response = [200, {}, handler];\n\
        }\n\
\n\
        if (typeof response[2] != \"string\") {\n\
            throw new TypeError(\"Fake server response body should be string, but was \" +\n\
                                typeof response[2]);\n\
        }\n\
\n\
        return response;\n\
    }\n\
\n\
    var wloc = typeof window !== \"undefined\" ? window.location : {};\n\
    var rCurrLoc = new RegExp(\"^\" + wloc.protocol + \"//\" + wloc.host);\n\
\n\
    function matchOne(response, reqMethod, reqUrl) {\n\
        var rmeth = response.method;\n\
        var matchMethod = !rmeth || rmeth.toLowerCase() == reqMethod.toLowerCase();\n\
        var url = response.url;\n\
        var matchUrl = !url || url == reqUrl || (typeof url.test == \"function\" && url.test(reqUrl));\n\
\n\
        return matchMethod && matchUrl;\n\
    }\n\
\n\
    function match(response, request) {\n\
        var requestMethod = this.getHTTPMethod(request);\n\
        var requestUrl = request.url;\n\
\n\
        if (!/^https?:\\/\\//.test(requestUrl) || rCurrLoc.test(requestUrl)) {\n\
            requestUrl = requestUrl.replace(rCurrLoc, \"\");\n\
        }\n\
\n\
        if (matchOne(response, this.getHTTPMethod(request), requestUrl)) {\n\
            if (typeof response.response == \"function\") {\n\
                var ru = response.url;\n\
                var args = [request].concat(ru && typeof ru.exec == \"function\" ? ru.exec(requestUrl).slice(1) : []);\n\
                return response.response.apply(response, args);\n\
            }\n\
\n\
            return true;\n\
        }\n\
\n\
        return false;\n\
    }\n\
\n\
    function log(response, request) {\n\
        var str;\n\
\n\
        str =  \"Request:\\n\
\"  + sinon.format(request)  + \"\\n\
\\n\
\";\n\
        str += \"Response:\\n\
\" + sinon.format(response) + \"\\n\
\\n\
\";\n\
\n\
        sinon.log(str);\n\
    }\n\
\n\
    return {\n\
        create: function () {\n\
            var server = create(this);\n\
            this.xhr = sinon.useFakeXMLHttpRequest();\n\
            server.requests = [];\n\
\n\
            this.xhr.onCreate = function (xhrObj) {\n\
                server.addRequest(xhrObj);\n\
            };\n\
\n\
            return server;\n\
        },\n\
\n\
        addRequest: function addRequest(xhrObj) {\n\
            var server = this;\n\
            push.call(this.requests, xhrObj);\n\
\n\
            xhrObj.onSend = function () {\n\
                server.handleRequest(this);\n\
            };\n\
\n\
            if (this.autoRespond && !this.responding) {\n\
                setTimeout(function () {\n\
                    server.responding = false;\n\
                    server.respond();\n\
                }, this.autoRespondAfter || 10);\n\
\n\
                this.responding = true;\n\
            }\n\
        },\n\
\n\
        getHTTPMethod: function getHTTPMethod(request) {\n\
            if (this.fakeHTTPMethods && /post/i.test(request.method)) {\n\
                var matches = (request.requestBody || \"\").match(/_method=([^\\b;]+)/);\n\
                return !!matches ? matches[1] : request.method;\n\
            }\n\
\n\
            return request.method;\n\
        },\n\
\n\
        handleRequest: function handleRequest(xhr) {\n\
            if (xhr.async) {\n\
                if (!this.queue) {\n\
                    this.queue = [];\n\
                }\n\
\n\
                push.call(this.queue, xhr);\n\
            } else {\n\
                this.processRequest(xhr);\n\
            }\n\
        },\n\
\n\
        respondWith: function respondWith(method, url, body) {\n\
            if (arguments.length == 1 && typeof method != \"function\") {\n\
                this.response = responseArray(method);\n\
                return;\n\
            }\n\
\n\
            if (!this.responses) { this.responses = []; }\n\
\n\
            if (arguments.length == 1) {\n\
                body = method;\n\
                url = method = null;\n\
            }\n\
\n\
            if (arguments.length == 2) {\n\
                body = url;\n\
                url = method;\n\
                method = null;\n\
            }\n\
\n\
            push.call(this.responses, {\n\
                method: method,\n\
                url: url,\n\
                response: typeof body == \"function\" ? body : responseArray(body)\n\
            });\n\
        },\n\
\n\
        respond: function respond() {\n\
            if (arguments.length > 0) this.respondWith.apply(this, arguments);\n\
            var queue = this.queue || [];\n\
            var request;\n\
\n\
            while(request = queue.shift()) {\n\
                this.processRequest(request);\n\
            }\n\
        },\n\
\n\
        processRequest: function processRequest(request) {\n\
            try {\n\
                if (request.aborted) {\n\
                    return;\n\
                }\n\
\n\
                var response = this.response || [404, {}, \"\"];\n\
\n\
                if (this.responses) {\n\
                    for (var i = 0, l = this.responses.length; i < l; i++) {\n\
                        if (match.call(this, this.responses[i], request)) {\n\
                            response = this.responses[i].response;\n\
                            break;\n\
                        }\n\
                    }\n\
                }\n\
\n\
                if (request.readyState != 4) {\n\
                    log(response, request);\n\
\n\
                    request.respond(response[0], response[1], response[2]);\n\
                }\n\
            } catch (e) {\n\
                sinon.logError(\"Fake server request processing\", e);\n\
            }\n\
        },\n\
\n\
        restore: function restore() {\n\
            return this.xhr.restore && this.xhr.restore.apply(this.xhr, arguments);\n\
        }\n\
    };\n\
}());\n\
\n\
if (typeof module !== 'undefined' && module.exports) {\n\
    module.exports = sinon;\n\
}\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/fake_server.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/fake_server_with_clock.js", Function("exports, require, module",
"/**\n\
 * @depend fake_server.js\n\
 * @depend fake_timers.js\n\
 */\n\
/*jslint browser: true, eqeqeq: false, onevar: false*/\n\
/*global sinon*/\n\
/**\n\
 * Add-on for sinon.fakeServer that automatically handles a fake timer along with\n\
 * the FakeXMLHttpRequest. The direct inspiration for this add-on is jQuery\n\
 * 1.3.x, which does not use xhr object's onreadystatehandler at all - instead,\n\
 * it polls the object for completion with setInterval. Dispite the direct\n\
 * motivation, there is nothing jQuery-specific in this file, so it can be used\n\
 * in any environment where the ajax implementation depends on setInterval or\n\
 * setTimeout.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
(function () {\n\
    function Server() {}\n\
    Server.prototype = sinon.fakeServer;\n\
\n\
    sinon.fakeServerWithClock = new Server();\n\
\n\
    sinon.fakeServerWithClock.addRequest = function addRequest(xhr) {\n\
        if (xhr.async) {\n\
            if (typeof setTimeout.clock == \"object\") {\n\
                this.clock = setTimeout.clock;\n\
            } else {\n\
                this.clock = sinon.useFakeTimers();\n\
                this.resetClock = true;\n\
            }\n\
\n\
            if (!this.longestTimeout) {\n\
                var clockSetTimeout = this.clock.setTimeout;\n\
                var clockSetInterval = this.clock.setInterval;\n\
                var server = this;\n\
\n\
                this.clock.setTimeout = function (fn, timeout) {\n\
                    server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);\n\
\n\
                    return clockSetTimeout.apply(this, arguments);\n\
                };\n\
\n\
                this.clock.setInterval = function (fn, timeout) {\n\
                    server.longestTimeout = Math.max(timeout, server.longestTimeout || 0);\n\
\n\
                    return clockSetInterval.apply(this, arguments);\n\
                };\n\
            }\n\
        }\n\
\n\
        return sinon.fakeServer.addRequest.call(this, xhr);\n\
    };\n\
\n\
    sinon.fakeServerWithClock.respond = function respond() {\n\
        var returnVal = sinon.fakeServer.respond.apply(this, arguments);\n\
\n\
        if (this.clock) {\n\
            this.clock.tick(this.longestTimeout || 0);\n\
            this.longestTimeout = 0;\n\
\n\
            if (this.resetClock) {\n\
                this.clock.restore();\n\
                this.resetClock = false;\n\
            }\n\
        }\n\
\n\
        return returnVal;\n\
    };\n\
\n\
    sinon.fakeServerWithClock.restore = function restore() {\n\
        if (this.clock) {\n\
            this.clock.restore();\n\
        }\n\
\n\
        return sinon.fakeServer.restore.apply(this, arguments);\n\
    };\n\
}());\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/fake_server_with_clock.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/fake_timers.js", Function("exports, require, module",
"/*jslint eqeqeq: false, plusplus: false, evil: true, onevar: false, browser: true, forin: false*/\n\
/*global module, require, window*/\n\
/**\n\
 * Fake timer API\n\
 * setTimeout\n\
 * setInterval\n\
 * clearTimeout\n\
 * clearInterval\n\
 * tick\n\
 * reset\n\
 * Date\n\
 *\n\
 * Inspired by jsUnitMockTimeOut from JsUnit\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
if (typeof sinon == \"undefined\") {\n\
    var sinon = {};\n\
}\n\
\n\
(function (global) {\n\
    var id = 1;\n\
\n\
    function addTimer(args, recurring) {\n\
        if (args.length === 0) {\n\
            throw new Error(\"Function requires at least 1 parameter\");\n\
        }\n\
\n\
        var toId = id++;\n\
        var delay = args[1] || 0;\n\
\n\
        if (!this.timeouts) {\n\
            this.timeouts = {};\n\
        }\n\
\n\
        this.timeouts[toId] = {\n\
            id: toId,\n\
            func: args[0],\n\
            callAt: this.now + delay,\n\
            invokeArgs: Array.prototype.slice.call(args, 2)\n\
        };\n\
\n\
        if (recurring === true) {\n\
            this.timeouts[toId].interval = delay;\n\
        }\n\
\n\
        return toId;\n\
    }\n\
\n\
    function parseTime(str) {\n\
        if (!str) {\n\
            return 0;\n\
        }\n\
\n\
        var strings = str.split(\":\");\n\
        var l = strings.length, i = l;\n\
        var ms = 0, parsed;\n\
\n\
        if (l > 3 || !/^(\\d\\d:){0,2}\\d\\d?$/.test(str)) {\n\
            throw new Error(\"tick only understands numbers and 'h:m:s'\");\n\
        }\n\
\n\
        while (i--) {\n\
            parsed = parseInt(strings[i], 10);\n\
\n\
            if (parsed >= 60) {\n\
                throw new Error(\"Invalid time \" + str);\n\
            }\n\
\n\
            ms += parsed * Math.pow(60, (l - i - 1));\n\
        }\n\
\n\
        return ms * 1000;\n\
    }\n\
\n\
    function createObject(object) {\n\
        var newObject;\n\
\n\
        if (Object.create) {\n\
            newObject = Object.create(object);\n\
        } else {\n\
            var F = function () {};\n\
            F.prototype = object;\n\
            newObject = new F();\n\
        }\n\
\n\
        newObject.Date.clock = newObject;\n\
        return newObject;\n\
    }\n\
\n\
    sinon.clock = {\n\
        now: 0,\n\
\n\
        create: function create(now) {\n\
            var clock = createObject(this);\n\
\n\
            if (typeof now == \"number\") {\n\
                clock.now = now;\n\
            }\n\
\n\
            if (!!now && typeof now == \"object\") {\n\
                throw new TypeError(\"now should be milliseconds since UNIX epoch\");\n\
            }\n\
\n\
            return clock;\n\
        },\n\
\n\
        setTimeout: function setTimeout(callback, timeout) {\n\
            return addTimer.call(this, arguments, false);\n\
        },\n\
\n\
        clearTimeout: function clearTimeout(timerId) {\n\
            if (!this.timeouts) {\n\
                this.timeouts = [];\n\
            }\n\
\n\
            if (timerId in this.timeouts) {\n\
                delete this.timeouts[timerId];\n\
            }\n\
        },\n\
\n\
        setInterval: function setInterval(callback, timeout) {\n\
            return addTimer.call(this, arguments, true);\n\
        },\n\
\n\
        clearInterval: function clearInterval(timerId) {\n\
            this.clearTimeout(timerId);\n\
        },\n\
\n\
        tick: function tick(ms) {\n\
            ms = typeof ms == \"number\" ? ms : parseTime(ms);\n\
            var tickFrom = this.now, tickTo = this.now + ms, previous = this.now;\n\
            var timer = this.firstTimerInRange(tickFrom, tickTo);\n\
\n\
            var firstException;\n\
            while (timer && tickFrom <= tickTo) {\n\
                if (this.timeouts[timer.id]) {\n\
                    tickFrom = this.now = timer.callAt;\n\
                    try {\n\
                      this.callTimer(timer);\n\
                    } catch (e) {\n\
                      firstException = firstException || e;\n\
                    }\n\
                }\n\
\n\
                timer = this.firstTimerInRange(previous, tickTo);\n\
                previous = tickFrom;\n\
            }\n\
\n\
            this.now = tickTo;\n\
\n\
            if (firstException) {\n\
              throw firstException;\n\
            }\n\
\n\
            return this.now;\n\
        },\n\
\n\
        firstTimerInRange: function (from, to) {\n\
            var timer, smallest = null, originalTimer;\n\
\n\
            for (var id in this.timeouts) {\n\
                if (this.timeouts.hasOwnProperty(id)) {\n\
                    if (this.timeouts[id].callAt < from || this.timeouts[id].callAt > to) {\n\
                        continue;\n\
                    }\n\
\n\
                    if (smallest === null || this.timeouts[id].callAt < smallest) {\n\
                        originalTimer = this.timeouts[id];\n\
                        smallest = this.timeouts[id].callAt;\n\
\n\
                        timer = {\n\
                            func: this.timeouts[id].func,\n\
                            callAt: this.timeouts[id].callAt,\n\
                            interval: this.timeouts[id].interval,\n\
                            id: this.timeouts[id].id,\n\
                            invokeArgs: this.timeouts[id].invokeArgs\n\
                        };\n\
                    }\n\
                }\n\
            }\n\
\n\
            return timer || null;\n\
        },\n\
\n\
        callTimer: function (timer) {\n\
            if (typeof timer.interval == \"number\") {\n\
                this.timeouts[timer.id].callAt += timer.interval;\n\
            } else {\n\
                delete this.timeouts[timer.id];\n\
            }\n\
\n\
            try {\n\
                if (typeof timer.func == \"function\") {\n\
                    timer.func.apply(null, timer.invokeArgs);\n\
                } else {\n\
                    eval(timer.func);\n\
                }\n\
            } catch (e) {\n\
              var exception = e;\n\
            }\n\
\n\
            if (!this.timeouts[timer.id]) {\n\
                if (exception) {\n\
                  throw exception;\n\
                }\n\
                return;\n\
            }\n\
\n\
            if (exception) {\n\
              throw exception;\n\
            }\n\
        },\n\
\n\
        reset: function reset() {\n\
            this.timeouts = {};\n\
        },\n\
\n\
        Date: (function () {\n\
            var NativeDate = Date;\n\
\n\
            function ClockDate(year, month, date, hour, minute, second, ms) {\n\
                // Defensive and verbose to avoid potential harm in passing\n\
                // explicit undefined when user does not pass argument\n\
                switch (arguments.length) {\n\
                case 0:\n\
                    return new NativeDate(ClockDate.clock.now);\n\
                case 1:\n\
                    return new NativeDate(year);\n\
                case 2:\n\
                    return new NativeDate(year, month);\n\
                case 3:\n\
                    return new NativeDate(year, month, date);\n\
                case 4:\n\
                    return new NativeDate(year, month, date, hour);\n\
                case 5:\n\
                    return new NativeDate(year, month, date, hour, minute);\n\
                case 6:\n\
                    return new NativeDate(year, month, date, hour, minute, second);\n\
                default:\n\
                    return new NativeDate(year, month, date, hour, minute, second, ms);\n\
                }\n\
            }\n\
\n\
            return mirrorDateProperties(ClockDate, NativeDate);\n\
        }())\n\
    };\n\
\n\
    function mirrorDateProperties(target, source) {\n\
        if (source.now) {\n\
            target.now = function now() {\n\
                return target.clock.now;\n\
            };\n\
        } else {\n\
            delete target.now;\n\
        }\n\
\n\
        if (source.toSource) {\n\
            target.toSource = function toSource() {\n\
                return source.toSource();\n\
            };\n\
        } else {\n\
            delete target.toSource;\n\
        }\n\
\n\
        target.toString = function toString() {\n\
            return source.toString();\n\
        };\n\
\n\
        target.prototype = source.prototype;\n\
        target.parse = source.parse;\n\
        target.UTC = source.UTC;\n\
        target.prototype.toUTCString = source.prototype.toUTCString;\n\
        return target;\n\
    }\n\
\n\
    var methods = [\"Date\", \"setTimeout\", \"setInterval\",\n\
                   \"clearTimeout\", \"clearInterval\"];\n\
\n\
    function restore() {\n\
        var method;\n\
\n\
        for (var i = 0, l = this.methods.length; i < l; i++) {\n\
            method = this.methods[i];\n\
            if (global[method].hadOwnProperty) {\n\
                global[method] = this[\"_\" + method];\n\
            } else {\n\
                delete global[method];\n\
            }\n\
        }\n\
\n\
        // Prevent multiple executions which will completely remove these props\n\
        this.methods = [];\n\
    }\n\
\n\
    function stubGlobal(method, clock) {\n\
        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(global, method);\n\
        clock[\"_\" + method] = global[method];\n\
\n\
        if (method == \"Date\") {\n\
            var date = mirrorDateProperties(clock[method], global[method]);\n\
            global[method] = date;\n\
        } else {\n\
            global[method] = function () {\n\
                return clock[method].apply(clock, arguments);\n\
            };\n\
\n\
            for (var prop in clock[method]) {\n\
                if (clock[method].hasOwnProperty(prop)) {\n\
                    global[method][prop] = clock[method][prop];\n\
                }\n\
            }\n\
        }\n\
\n\
        global[method].clock = clock;\n\
    }\n\
\n\
    sinon.useFakeTimers = function useFakeTimers(now) {\n\
        var clock = sinon.clock.create(now);\n\
        clock.restore = restore;\n\
        clock.methods = Array.prototype.slice.call(arguments,\n\
                                                   typeof now == \"number\" ? 1 : 0);\n\
\n\
        if (clock.methods.length === 0) {\n\
            clock.methods = methods;\n\
        }\n\
\n\
        for (var i = 0, l = clock.methods.length; i < l; i++) {\n\
            stubGlobal(clock.methods[i], clock);\n\
        }\n\
\n\
        return clock;\n\
    };\n\
}(typeof global != \"undefined\" && typeof global !== \"function\" ? global : this));\n\
\n\
sinon.timers = {\n\
    setTimeout: setTimeout,\n\
    clearTimeout: clearTimeout,\n\
    setInterval: setInterval,\n\
    clearInterval: clearInterval,\n\
    Date: Date\n\
};\n\
\n\
if (typeof module !== 'undefined' && module.exports) {\n\
    module.exports = sinon;\n\
}\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/fake_timers.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/fake_xml_http_request.js", Function("exports, require, module",
"/**\n\
 * @depend ../../sinon.js\n\
 * @depend event.js\n\
 */\n\
/*jslint eqeqeq: false, onevar: false*/\n\
/*global sinon, module, require, ActiveXObject, XMLHttpRequest, DOMParser*/\n\
/**\n\
 * Fake XMLHttpRequest object\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
\"use strict\";\n\
\n\
// wrapper for global\n\
(function(global) {\n\
    var sinon;\n\
\n\
    if (typeof module !== 'undefined' && module.exports) {\n\
        sinon = require(\"../../sinon\");\n\
    } else if (typeof sinon === \"undefined\") {\n\
        sinon = {};\n\
    }\n\
    sinon.xhr = { XMLHttpRequest: global.XMLHttpRequest };\n\
\n\
    var xhr = sinon.xhr;\n\
    xhr.GlobalXMLHttpRequest = global.XMLHttpRequest;\n\
    xhr.GlobalActiveXObject = global.ActiveXObject;\n\
    xhr.supportsActiveX = typeof xhr.GlobalActiveXObject != \"undefined\";\n\
    xhr.supportsXHR = typeof xhr.GlobalXMLHttpRequest != \"undefined\";\n\
    xhr.workingXHR = xhr.supportsXHR ? xhr.GlobalXMLHttpRequest : xhr.supportsActiveX\n\
                                     ? function() { return new xhr.GlobalActiveXObject(\"MSXML2.XMLHTTP.3.0\") } : false;\n\
\n\
    /*jsl:ignore*/\n\
    var unsafeHeaders = {\n\
        \"Accept-Charset\": true,\n\
        \"Accept-Encoding\": true,\n\
        \"Connection\": true,\n\
        \"Content-Length\": true,\n\
        \"Cookie\": true,\n\
        \"Cookie2\": true,\n\
        \"Content-Transfer-Encoding\": true,\n\
        \"Date\": true,\n\
        \"Expect\": true,\n\
        \"Host\": true,\n\
        \"Keep-Alive\": true,\n\
        \"Referer\": true,\n\
        \"TE\": true,\n\
        \"Trailer\": true,\n\
        \"Transfer-Encoding\": true,\n\
        \"Upgrade\": true,\n\
        \"User-Agent\": true,\n\
        \"Via\": true\n\
    };\n\
    /*jsl:end*/\n\
\n\
    function FakeXMLHttpRequest() {\n\
        this.readyState = FakeXMLHttpRequest.UNSENT;\n\
        this.requestHeaders = {};\n\
        this.requestBody = null;\n\
        this.status = 0;\n\
        this.statusText = \"\";\n\
\n\
        var xhr = this;\n\
        var events = [\"loadstart\", \"load\", \"abort\", \"loadend\"];\n\
\n\
        function addEventListener(eventName) {\n\
            xhr.addEventListener(eventName, function (event) {\n\
                var listener = xhr[\"on\" + eventName];\n\
\n\
                if (listener && typeof listener == \"function\") {\n\
                    listener(event);\n\
                }\n\
            });\n\
        }\n\
\n\
        for (var i = events.length - 1; i >= 0; i--) {\n\
            addEventListener(events[i]);\n\
        }\n\
\n\
        if (typeof FakeXMLHttpRequest.onCreate == \"function\") {\n\
            FakeXMLHttpRequest.onCreate(this);\n\
        }\n\
    }\n\
\n\
    function verifyState(xhr) {\n\
        if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {\n\
            throw new Error(\"INVALID_STATE_ERR\");\n\
        }\n\
\n\
        if (xhr.sendFlag) {\n\
            throw new Error(\"INVALID_STATE_ERR\");\n\
        }\n\
    }\n\
\n\
    // filtering to enable a white-list version of Sinon FakeXhr,\n\
    // where whitelisted requests are passed through to real XHR\n\
    function each(collection, callback) {\n\
        if (!collection) return;\n\
        for (var i = 0, l = collection.length; i < l; i += 1) {\n\
            callback(collection[i]);\n\
        }\n\
    }\n\
    function some(collection, callback) {\n\
        for (var index = 0; index < collection.length; index++) {\n\
            if(callback(collection[index]) === true) return true;\n\
        };\n\
        return false;\n\
    }\n\
    // largest arity in XHR is 5 - XHR#open\n\
    var apply = function(obj,method,args) {\n\
        switch(args.length) {\n\
        case 0: return obj[method]();\n\
        case 1: return obj[method](args[0]);\n\
        case 2: return obj[method](args[0],args[1]);\n\
        case 3: return obj[method](args[0],args[1],args[2]);\n\
        case 4: return obj[method](args[0],args[1],args[2],args[3]);\n\
        case 5: return obj[method](args[0],args[1],args[2],args[3],args[4]);\n\
        };\n\
    };\n\
\n\
    FakeXMLHttpRequest.filters = [];\n\
    FakeXMLHttpRequest.addFilter = function(fn) {\n\
        this.filters.push(fn)\n\
    };\n\
    var IE6Re = /MSIE 6/;\n\
    FakeXMLHttpRequest.defake = function(fakeXhr,xhrArgs) {\n\
        var xhr = new sinon.xhr.workingXHR();\n\
        each([\"open\",\"setRequestHeader\",\"send\",\"abort\",\"getResponseHeader\",\n\
              \"getAllResponseHeaders\",\"addEventListener\",\"overrideMimeType\",\"removeEventListener\"],\n\
             function(method) {\n\
                 fakeXhr[method] = function() {\n\
                   return apply(xhr,method,arguments);\n\
                 };\n\
             });\n\
\n\
        var copyAttrs = function(args) {\n\
            each(args, function(attr) {\n\
              try {\n\
                fakeXhr[attr] = xhr[attr]\n\
              } catch(e) {\n\
                if(!IE6Re.test(navigator.userAgent)) throw e;\n\
              }\n\
            });\n\
        };\n\
\n\
        var stateChange = function() {\n\
            fakeXhr.readyState = xhr.readyState;\n\
            if(xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {\n\
                copyAttrs([\"status\",\"statusText\"]);\n\
            }\n\
            if(xhr.readyState >= FakeXMLHttpRequest.LOADING) {\n\
                copyAttrs([\"responseText\"]);\n\
            }\n\
            if(xhr.readyState === FakeXMLHttpRequest.DONE) {\n\
                copyAttrs([\"responseXML\"]);\n\
            }\n\
            if(fakeXhr.onreadystatechange) fakeXhr.onreadystatechange.call(fakeXhr);\n\
        };\n\
        if(xhr.addEventListener) {\n\
          for(var event in fakeXhr.eventListeners) {\n\
              if(fakeXhr.eventListeners.hasOwnProperty(event)) {\n\
                  each(fakeXhr.eventListeners[event],function(handler) {\n\
                      xhr.addEventListener(event, handler);\n\
                  });\n\
              }\n\
          }\n\
          xhr.addEventListener(\"readystatechange\",stateChange);\n\
        } else {\n\
          xhr.onreadystatechange = stateChange;\n\
        }\n\
        apply(xhr,\"open\",xhrArgs);\n\
    };\n\
    FakeXMLHttpRequest.useFilters = false;\n\
\n\
    function verifyRequestSent(xhr) {\n\
        if (xhr.readyState == FakeXMLHttpRequest.DONE) {\n\
            throw new Error(\"Request done\");\n\
        }\n\
    }\n\
\n\
    function verifyHeadersReceived(xhr) {\n\
        if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {\n\
            throw new Error(\"No headers received\");\n\
        }\n\
    }\n\
\n\
    function verifyResponseBodyType(body) {\n\
        if (typeof body != \"string\") {\n\
            var error = new Error(\"Attempted to respond to fake XMLHttpRequest with \" +\n\
                                 body + \", which is not a string.\");\n\
            error.name = \"InvalidBodyException\";\n\
            throw error;\n\
        }\n\
    }\n\
\n\
    sinon.extend(FakeXMLHttpRequest.prototype, sinon.EventTarget, {\n\
        async: true,\n\
\n\
        open: function open(method, url, async, username, password) {\n\
            this.method = method;\n\
            this.url = url;\n\
            this.async = typeof async == \"boolean\" ? async : true;\n\
            this.username = username;\n\
            this.password = password;\n\
            this.responseText = null;\n\
            this.responseXML = null;\n\
            this.requestHeaders = {};\n\
            this.sendFlag = false;\n\
            if(sinon.FakeXMLHttpRequest.useFilters === true) {\n\
                var xhrArgs = arguments;\n\
                var defake = some(FakeXMLHttpRequest.filters,function(filter) {\n\
                    return filter.apply(this,xhrArgs)\n\
                });\n\
                if (defake) {\n\
                  return sinon.FakeXMLHttpRequest.defake(this,arguments);\n\
                }\n\
            }\n\
            this.readyStateChange(FakeXMLHttpRequest.OPENED);\n\
        },\n\
\n\
        readyStateChange: function readyStateChange(state) {\n\
            this.readyState = state;\n\
\n\
            if (typeof this.onreadystatechange == \"function\") {\n\
                try {\n\
                    this.onreadystatechange();\n\
                } catch (e) {\n\
                    sinon.logError(\"Fake XHR onreadystatechange handler\", e);\n\
                }\n\
            }\n\
\n\
            this.dispatchEvent(new sinon.Event(\"readystatechange\"));\n\
\n\
            switch (this.readyState) {\n\
                case FakeXMLHttpRequest.DONE:\n\
                    this.dispatchEvent(new sinon.Event(\"load\", false, false, this));\n\
                    this.dispatchEvent(new sinon.Event(\"loadend\", false, false, this));\n\
                    break;\n\
            }\n\
        },\n\
\n\
        setRequestHeader: function setRequestHeader(header, value) {\n\
            verifyState(this);\n\
\n\
            if (unsafeHeaders[header] || /^(Sec-|Proxy-)/.test(header)) {\n\
                throw new Error(\"Refused to set unsafe header \\\"\" + header + \"\\\"\");\n\
            }\n\
\n\
            if (this.requestHeaders[header]) {\n\
                this.requestHeaders[header] += \",\" + value;\n\
            } else {\n\
                this.requestHeaders[header] = value;\n\
            }\n\
        },\n\
\n\
        // Helps testing\n\
        setResponseHeaders: function setResponseHeaders(headers) {\n\
            this.responseHeaders = {};\n\
\n\
            for (var header in headers) {\n\
                if (headers.hasOwnProperty(header)) {\n\
                    this.responseHeaders[header] = headers[header];\n\
                }\n\
            }\n\
\n\
            if (this.async) {\n\
                this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);\n\
            } else {\n\
                this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;\n\
            }\n\
        },\n\
\n\
        // Currently treats ALL data as a DOMString (i.e. no Document)\n\
        send: function send(data) {\n\
            verifyState(this);\n\
\n\
            if (!/^(get|head)$/i.test(this.method)) {\n\
                if (this.requestHeaders[\"Content-Type\"]) {\n\
                    var value = this.requestHeaders[\"Content-Type\"].split(\";\");\n\
                    this.requestHeaders[\"Content-Type\"] = value[0] + \";charset=utf-8\";\n\
                } else {\n\
                    this.requestHeaders[\"Content-Type\"] = \"text/plain;charset=utf-8\";\n\
                }\n\
\n\
                this.requestBody = data;\n\
            }\n\
\n\
            this.errorFlag = false;\n\
            this.sendFlag = this.async;\n\
            this.readyStateChange(FakeXMLHttpRequest.OPENED);\n\
\n\
            if (typeof this.onSend == \"function\") {\n\
                this.onSend(this);\n\
            }\n\
\n\
            this.dispatchEvent(new sinon.Event(\"loadstart\", false, false, this));\n\
        },\n\
\n\
        abort: function abort() {\n\
            this.aborted = true;\n\
            this.responseText = null;\n\
            this.errorFlag = true;\n\
            this.requestHeaders = {};\n\
\n\
            if (this.readyState > sinon.FakeXMLHttpRequest.UNSENT && this.sendFlag) {\n\
                this.readyStateChange(sinon.FakeXMLHttpRequest.DONE);\n\
                this.sendFlag = false;\n\
            }\n\
\n\
            this.readyState = sinon.FakeXMLHttpRequest.UNSENT;\n\
\n\
            this.dispatchEvent(new sinon.Event(\"abort\", false, false, this));\n\
            if (typeof this.onerror === \"function\") {\n\
                this.onerror();\n\
            }\n\
        },\n\
\n\
        getResponseHeader: function getResponseHeader(header) {\n\
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {\n\
                return null;\n\
            }\n\
\n\
            if (/^Set-Cookie2?$/i.test(header)) {\n\
                return null;\n\
            }\n\
\n\
            header = header.toLowerCase();\n\
\n\
            for (var h in this.responseHeaders) {\n\
                if (h.toLowerCase() == header) {\n\
                    return this.responseHeaders[h];\n\
                }\n\
            }\n\
\n\
            return null;\n\
        },\n\
\n\
        getAllResponseHeaders: function getAllResponseHeaders() {\n\
            if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {\n\
                return \"\";\n\
            }\n\
\n\
            var headers = \"\";\n\
\n\
            for (var header in this.responseHeaders) {\n\
                if (this.responseHeaders.hasOwnProperty(header) &&\n\
                    !/^Set-Cookie2?$/i.test(header)) {\n\
                    headers += header + \": \" + this.responseHeaders[header] + \"\\r\\n\
\";\n\
                }\n\
            }\n\
\n\
            return headers;\n\
        },\n\
\n\
        setResponseBody: function setResponseBody(body) {\n\
            verifyRequestSent(this);\n\
            verifyHeadersReceived(this);\n\
            verifyResponseBodyType(body);\n\
\n\
            var chunkSize = this.chunkSize || 10;\n\
            var index = 0;\n\
            this.responseText = \"\";\n\
\n\
            do {\n\
                if (this.async) {\n\
                    this.readyStateChange(FakeXMLHttpRequest.LOADING);\n\
                }\n\
\n\
                this.responseText += body.substring(index, index + chunkSize);\n\
                index += chunkSize;\n\
            } while (index < body.length);\n\
\n\
            var type = this.getResponseHeader(\"Content-Type\");\n\
\n\
            if (this.responseText &&\n\
                (!type || /(text\\/xml)|(application\\/xml)|(\\+xml)/.test(type))) {\n\
                try {\n\
                    this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);\n\
                } catch (e) {\n\
                    // Unable to parse XML - no biggie\n\
                }\n\
            }\n\
\n\
            if (this.async) {\n\
                this.readyStateChange(FakeXMLHttpRequest.DONE);\n\
            } else {\n\
                this.readyState = FakeXMLHttpRequest.DONE;\n\
            }\n\
        },\n\
\n\
        respond: function respond(status, headers, body) {\n\
            this.setResponseHeaders(headers || {});\n\
            this.status = typeof status == \"number\" ? status : 200;\n\
            this.statusText = FakeXMLHttpRequest.statusCodes[this.status];\n\
            this.setResponseBody(body || \"\");\n\
        }\n\
    });\n\
\n\
    sinon.extend(FakeXMLHttpRequest, {\n\
        UNSENT: 0,\n\
        OPENED: 1,\n\
        HEADERS_RECEIVED: 2,\n\
        LOADING: 3,\n\
        DONE: 4\n\
    });\n\
\n\
    // Borrowed from JSpec\n\
    FakeXMLHttpRequest.parseXML = function parseXML(text) {\n\
        var xmlDoc;\n\
\n\
        if (typeof DOMParser != \"undefined\") {\n\
            var parser = new DOMParser();\n\
            xmlDoc = parser.parseFromString(text, \"text/xml\");\n\
        } else {\n\
            xmlDoc = new ActiveXObject(\"Microsoft.XMLDOM\");\n\
            xmlDoc.async = \"false\";\n\
            xmlDoc.loadXML(text);\n\
        }\n\
\n\
        return xmlDoc;\n\
    };\n\
\n\
    FakeXMLHttpRequest.statusCodes = {\n\
        100: \"Continue\",\n\
        101: \"Switching Protocols\",\n\
        200: \"OK\",\n\
        201: \"Created\",\n\
        202: \"Accepted\",\n\
        203: \"Non-Authoritative Information\",\n\
        204: \"No Content\",\n\
        205: \"Reset Content\",\n\
        206: \"Partial Content\",\n\
        300: \"Multiple Choice\",\n\
        301: \"Moved Permanently\",\n\
        302: \"Found\",\n\
        303: \"See Other\",\n\
        304: \"Not Modified\",\n\
        305: \"Use Proxy\",\n\
        307: \"Temporary Redirect\",\n\
        400: \"Bad Request\",\n\
        401: \"Unauthorized\",\n\
        402: \"Payment Required\",\n\
        403: \"Forbidden\",\n\
        404: \"Not Found\",\n\
        405: \"Method Not Allowed\",\n\
        406: \"Not Acceptable\",\n\
        407: \"Proxy Authentication Required\",\n\
        408: \"Request Timeout\",\n\
        409: \"Conflict\",\n\
        410: \"Gone\",\n\
        411: \"Length Required\",\n\
        412: \"Precondition Failed\",\n\
        413: \"Request Entity Too Large\",\n\
        414: \"Request-URI Too Long\",\n\
        415: \"Unsupported Media Type\",\n\
        416: \"Requested Range Not Satisfiable\",\n\
        417: \"Expectation Failed\",\n\
        422: \"Unprocessable Entity\",\n\
        500: \"Internal Server Error\",\n\
        501: \"Not Implemented\",\n\
        502: \"Bad Gateway\",\n\
        503: \"Service Unavailable\",\n\
        504: \"Gateway Timeout\",\n\
        505: \"HTTP Version Not Supported\"\n\
    };\n\
\n\
    sinon.useFakeXMLHttpRequest = function () {\n\
        sinon.FakeXMLHttpRequest.restore = function restore(keepOnCreate) {\n\
            if (xhr.supportsXHR) {\n\
                global.XMLHttpRequest = xhr.GlobalXMLHttpRequest;\n\
            }\n\
\n\
            if (xhr.supportsActiveX) {\n\
                global.ActiveXObject = xhr.GlobalActiveXObject;\n\
            }\n\
\n\
            delete sinon.FakeXMLHttpRequest.restore;\n\
\n\
            if (keepOnCreate !== true) {\n\
                delete sinon.FakeXMLHttpRequest.onCreate;\n\
            }\n\
        };\n\
        if (xhr.supportsXHR) {\n\
            global.XMLHttpRequest = sinon.FakeXMLHttpRequest;\n\
        }\n\
\n\
        if (xhr.supportsActiveX) {\n\
            global.ActiveXObject = function ActiveXObject(objId) {\n\
                if (objId == \"Microsoft.XMLHTTP\" || /^Msxml2\\.XMLHTTP/i.test(objId)) {\n\
\n\
                    return new sinon.FakeXMLHttpRequest();\n\
                }\n\
\n\
                return new xhr.GlobalActiveXObject(objId);\n\
            };\n\
        }\n\
\n\
        return sinon.FakeXMLHttpRequest;\n\
    };\n\
\n\
    sinon.FakeXMLHttpRequest = FakeXMLHttpRequest;\n\
\n\
})(typeof global === \"object\" ? global : this);\n\
\n\
if (typeof module !== 'undefined' && module.exports) {\n\
    module.exports = sinon;\n\
}\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/fake_xml_http_request.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/timers_ie.js", Function("exports, require, module",
"/*global sinon, setTimeout, setInterval, clearTimeout, clearInterval, Date*/\n\
/**\n\
 * Helps IE run the fake timers. By defining global functions, IE allows\n\
 * them to be overwritten at a later point. If these are not defined like\n\
 * this, overwriting them will result in anything from an exception to browser\n\
 * crash.\n\
 *\n\
 * If you don't require fake timers to work in IE, don't include this file.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
function setTimeout() {}\n\
function clearTimeout() {}\n\
function setInterval() {}\n\
function clearInterval() {}\n\
function Date() {}\n\
\n\
// Reassign the original functions. Now their writable attribute\n\
// should be true. Hackish, I know, but it works.\n\
setTimeout = sinon.timers.setTimeout;\n\
clearTimeout = sinon.timers.clearTimeout;\n\
setInterval = sinon.timers.setInterval;\n\
clearInterval = sinon.timers.clearInterval;\n\
Date = sinon.timers.Date;\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/timers_ie.js"
));
require.register("ianstormtaylor-sinon/lib/sinon/util/xhr_ie.js", Function("exports, require, module",
"/*global sinon*/\n\
/**\n\
 * Helps IE run the fake XMLHttpRequest. By defining global functions, IE allows\n\
 * them to be overwritten at a later point. If these are not defined like\n\
 * this, overwriting them will result in anything from an exception to browser\n\
 * crash.\n\
 *\n\
 * If you don't require fake XHR to work in IE, don't include this file.\n\
 *\n\
 * @author Christian Johansen (christian@cjohansen.no)\n\
 * @license BSD\n\
 *\n\
 * Copyright (c) 2010-2013 Christian Johansen\n\
 */\n\
function XMLHttpRequest() {}\n\
\n\
// Reassign the original function. Now its writable attribute\n\
// should be true. Hackish, I know, but it works.\n\
XMLHttpRequest = sinon.xhr.XMLHttpRequest || undefined;\n\
//@ sourceURL=ianstormtaylor-sinon/lib/sinon/util/xhr_ie.js"
));
require.register("realtime-bar-graph/index.js", Function("exports, require, module",
"'use strict';\n\
\n\
var raf = require('raf');\n\
var bind = require('bind');\n\
var domify = require('domify');\n\
var template = require('./template.html');\n\
var autoscale = require('autoscale-canvas');\n\
\n\
/**\n\
 * Expose `RealtimeBarGraph`.\n\
 */\n\
\n\
module.exports = RealtimeBarGraph;\n\
\n\
/**\n\
 * Initialize a new `RealtimeBarGraph`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function RealtimeBarGraph() {\n\
  this._barSpacing = 2;\n\
  this._barWidth = 4;\n\
  this._gutter = 40;\n\
  this._width = 780;\n\
  this._height = 280;\n\
  this._backgroundBarColour = '#ddd';\n\
  this._historyBarColour = '#00cccc';\n\
  this._axesFont = '13px sans-serif';\n\
  this._frameRate = 20;\n\
  this.buffer = 0;\n\
  this.el = domify(template);\n\
  this.animate = bind(this, 'animate');\n\
  this.backgroundBarCb = bind(this, 'backgroundBarCb');\n\
  this.historyBarCb = bind(this, 'historyBarCb');\n\
}\n\
\n\
/**\n\
 * Set the bar spacing.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.barSpacing(3)\n\
 * ```\n\
 *\n\
 * @param {Number} barSpacing\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.barSpacing = function(barSpacing){\n\
  this._barSpacing = barSpacing;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the bar width.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.barWidth(5)\n\
 * ```\n\
 *\n\
 * @param {Number} barWidth\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.barWidth = function(barWidth){\n\
  this._barWidth = barWidth;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the gutter.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.gutter(50)\n\
 * ```\n\
 *\n\
 * @param {Number} gutter\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.gutter = function(gutter){\n\
  this._gutter = gutter;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the width.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.width(600)\n\
 * ```\n\
 *\n\
 * @param {Number} width\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.width = function(width){\n\
  this._width = width;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the height.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.height(300)\n\
 * ```\n\
 *\n\
 * @param {Number} height\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.height = function(height){\n\
  this._height = height;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the background bar colour.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.backgroundBarColour('#dedede')\n\
 * ```\n\
 *\n\
 * @param {String} backgroundBarColour\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.backgroundBarColour = function(backgroundBarColour){\n\
  this._backgroundBarColour = backgroundBarColour;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the history bar colour.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.historyBarColour('#ababab')\n\
 * ```\n\
 *\n\
 * @param {String} historyBarColour\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.historyBarColour = function(historyBarColour){\n\
  this._historyBarColour = historyBarColour;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the axes font.\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.axesFont('14px sans-serif')\n\
 * ```\n\
 *\n\
 * @param {String} axesFont\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.axesFont = function(axesFont){\n\
  this._axesFont = axesFont;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the frame rate (fps).\n\
 *\n\
 * ```js\n\
 * realtimeBarGraph.frameRate(30)\n\
 * ```\n\
 *\n\
 * @param {Number} frameRate\n\
 * @return {RealtimeBarGraph} self\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.frameRate = function(frameRate){\n\
  this._frameRate = frameRate;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Create the history array.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
 RealtimeBarGraph.prototype.createHistoryArray = function(){\n\
  this.history = [];\n\
  var i = 0, j = this._width / (this._barSpacing + this._barWidth);\n\
  for (; i < j; i++) this.history[i] = 0;\n\
};\n\
\n\
/**\n\
 * Draw the background bars.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawBackground = function(){\n\
  this.drawBars(this.backgroundBarCb);\n\
};\n\
\n\
/**\n\
 * Draw a single background bar at the required position.\n\
 *\n\
 * @param {Number} xPos\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.backgroundBarCb = function(xPos){\n\
  this.bgCtx.fillRect(xPos, this._gutter, this._barWidth, this._height - this._gutter * 2);\n\
};\n\
\n\
/**\n\
 * Initialise the background canvas properties.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.initialiseBackgroundCanvas = function(){\n\
  var canvas = this.el.querySelector('.rtbg-background');\n\
  canvas.width = this._width;\n\
  canvas.height = this._height;\n\
  autoscale(canvas);\n\
  this.bgCtx = canvas.getContext('2d');\n\
  this.bgCtx.fillStyle = this._backgroundBarColour;\n\
};\n\
\n\
/**\n\
 * Initialise the non-changing history canvas properties.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.initialiseHistoryCanvas = function(){\n\
  var canvas = this.el.querySelector('.rtbg-history');\n\
  canvas.width = this._width;\n\
  canvas.height = this._height;\n\
  autoscale(canvas);\n\
  this.historyCtx = canvas.getContext('2d');\n\
  this.historyCtx.fillStyle = this._historyBarColour;\n\
};\n\
\n\
/**\n\
 * Start the graph animation.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.start = function(){\n\
  this.createHistoryArray();\n\
  this.initialiseBackgroundCanvas();\n\
  this.initialiseHistoryCanvas();\n\
  this.drawBackground();\n\
  this.animateInterval = 1000 / this._frameRate;\n\
  this.rafId = raf(this.animate);\n\
};\n\
\n\
/**\n\
 * Animation loop.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.animate = function(){\n\
  this.rafId = raf(this.animate);\n\
  var now = Date.now();\n\
  this.animateStart = this.animateStart || now;\n\
  var animateDelta = now - this.animateStart;\n\
  \n\
  // Process the history interval at the required framerate.\n\
  if (animateDelta > this.animateInterval) {\n\
\n\
    // See: http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/\n\
    // Basically, we want to eliminate the creep which may be present after\n\
    // animateDelta > interval, in order to keep the framerate as accurate as possible.\n\
    this.animateStart = now - (animateDelta % this.animateInterval);\n\
    this.processHistoryFrame();\n\
  }\n\
};\n\
\n\
/**\n\
 * Process a history frame - draw the bar graph at this point in time.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.processHistoryFrame = function(){\n\
  for (var i = 0, j = this.history.length - 1; i < j; i++) {\n\
    this.history[i] = this.history[i + 1];\n\
  }\n\
  this.history[this.history.length - 1] = this.buffer;\n\
  this.drawHistory();\n\
  this.buffer = 0;\n\
};\n\
\n\
/**\n\
 * Draw the history bars.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawHistory = function(){\n\
  var maxHits = Math.max.apply(null, this.history);\n\
  if (!this.maxAxesPoint || maxHits >= this.maxAxesPoint) this.drawAxes(maxHits);\n\
  this.historyMultiplier = (this._height - this._gutter * 2) / this.maxAxesPoint;\n\
  this.historyCtx.clearRect(0, 0, this._width, this._height);\n\
  this.historyStartIndex = this.history.length - 1;\n\
  this.drawBars(this.historyBarCb);\n\
};\n\
\n\
/**\n\
 * Draw a single history bar scaled to the correct height.\n\
 *\n\
 * @param {Number} xPos\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.historyBarCb = function(xPos){\n\
  var hits = this.history[this.historyStartIndex--] * this.historyMultiplier;\n\
  this.historyCtx.fillRect(xPos, this._height - this._gutter - hits, this._barWidth, hits);\n\
};\n\
\n\
/**\n\
 * Draw graph bars by executing a callback at the required interval.\n\
 *\n\
 * @param {Function} cb\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawBars = function(cb){\n\
  var xPos = this._width - this._gutter - this._barWidth, start = this._gutter;\n\
  for (; xPos >= start; xPos -= (this._barSpacing + this._barWidth)) cb(xPos);\n\
};\n\
\n\
/**\n\
 * Draw the left and right y-axes scaled to `maxHits`.\n\
 *\n\
 * @param {Number} maxHits\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawAxes = function(maxHits){\n\
  maxHits = maxHits || 1;\n\
  var points = [0, maxHits, maxHits * 2, maxHits * 3, maxHits * 4];\n\
  this.maxAxesPoint = points[4];\n\
  this.bgCtx.font = this._axesFont;\n\
  this.drawLeftYAxis(points);\n\
  this.drawRightYAxis(points);\n\
};\n\
\n\
/**\n\
 * Draw the left y-axis using the given points.\n\
 *\n\
 * @param {Array} points\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawLeftYAxis = function(points){\n\
  var xPos = this._gutter - 5;\n\
  var drawingAreaHeight = this._height - this._gutter * 2;\n\
  this.bgCtx.clearRect(0, 0, xPos, this._height);\n\
  this.bgCtx.textAlign = 'right';\n\
  this.bgCtx.textBaseline = 'middle';\n\
  this.bgCtx.fillText(points[4], xPos, this._gutter);\n\
  this.bgCtx.fillText(points[3], xPos, this._gutter + drawingAreaHeight / 4);\n\
  this.bgCtx.fillText(points[2], xPos, this._gutter + drawingAreaHeight / 2);\n\
  this.bgCtx.fillText(points[1], xPos, this._height - this._gutter - drawingAreaHeight / 4);\n\
  this.bgCtx.fillText(points[0], xPos, this._height - this._gutter);\n\
};\n\
\n\
/**\n\
 * Draw the right y-axis using the given points.\n\
 *\n\
 * @param {Array} points\n\
 * @api private\n\
 */\n\
\n\
RealtimeBarGraph.prototype.drawRightYAxis = function(points){\n\
  var xPos = this._width - this._gutter + 5;\n\
  var drawingAreaHeight = this._height - this._gutter * 2;\n\
  this.bgCtx.clearRect(xPos, 0, this._width - xPos, this._height);\n\
  this.bgCtx.textAlign = 'left';\n\
  this.bgCtx.textBaseline = 'middle';\n\
  this.bgCtx.fillText(points[4], xPos, this._gutter);\n\
  this.bgCtx.fillText(points[3], xPos, this._gutter + drawingAreaHeight / 4);\n\
  this.bgCtx.fillText(points[2], xPos, this._gutter + drawingAreaHeight / 2);\n\
  this.bgCtx.fillText(points[1], xPos, this._height - this._gutter - drawingAreaHeight / 4);\n\
  this.bgCtx.fillText(points[0], xPos, this._height - this._gutter);\n\
};\n\
\n\
/**\n\
 * Add a hit to the graph.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
RealtimeBarGraph.prototype.addHit = function(){\n\
  this.buffer++;\n\
};//@ sourceURL=realtime-bar-graph/index.js"
));




















require.register("realtime-bar-graph/template.html", Function("exports, require, module",
"module.exports = '<div class=\"rtbg\">\\n\
  <canvas class=\"rtbg-background\"></canvas>\\n\
  <canvas class=\"rtbg-history\"></canvas>\\n\
</div>';//@ sourceURL=realtime-bar-graph/template.html"
));
require.alias("component-raf/index.js", "realtime-bar-graph/deps/raf/index.js");
require.alias("component-raf/index.js", "raf/index.js");

require.alias("kenany-isinteger/index.js", "realtime-bar-graph/deps/isInteger/index.js");
require.alias("kenany-isinteger/index.js", "isInteger/index.js");

require.alias("component-bind/index.js", "realtime-bar-graph/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");


require.alias("component-domify/index.js", "realtime-bar-graph/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-autoscale-canvas/index.js", "realtime-bar-graph/deps/autoscale-canvas/index.js");
require.alias("component-autoscale-canvas/index.js", "autoscale-canvas/index.js");

require.alias("danzajdband-random/index.js", "realtime-bar-graph/deps/random/index.js");
require.alias("danzajdband-random/index.js", "random/index.js");

require.alias("visionmedia-mocha/mocha.js", "realtime-bar-graph/deps/mocha/mocha.js");
require.alias("visionmedia-mocha/mocha.js", "realtime-bar-graph/deps/mocha/index.js");
require.alias("visionmedia-mocha/mocha.js", "mocha/index.js");
require.alias("visionmedia-mocha/mocha.js", "visionmedia-mocha/index.js");
require.alias("techjacker-expect.js/expect.js", "realtime-bar-graph/deps/expect.js/expect.js");
require.alias("techjacker-expect.js/expect.js", "realtime-bar-graph/deps/expect.js/index.js");
require.alias("techjacker-expect.js/expect.js", "expect.js/index.js");
require.alias("techjacker-expect.js/expect.js", "techjacker-expect.js/index.js");
require.alias("ianstormtaylor-sinon/lib/index.js", "realtime-bar-graph/deps/sinon/lib/index.js");
require.alias("ianstormtaylor-sinon/lib/sinon.js", "realtime-bar-graph/deps/sinon/lib/sinon.js");
require.alias("ianstormtaylor-sinon/lib/sinon/assert.js", "realtime-bar-graph/deps/sinon/lib/sinon/assert.js");
require.alias("ianstormtaylor-sinon/lib/sinon/call.js", "realtime-bar-graph/deps/sinon/lib/sinon/call.js");
require.alias("ianstormtaylor-sinon/lib/sinon/collection.js", "realtime-bar-graph/deps/sinon/lib/sinon/collection.js");
require.alias("ianstormtaylor-sinon/lib/sinon/match.js", "realtime-bar-graph/deps/sinon/lib/sinon/match.js");
require.alias("ianstormtaylor-sinon/lib/sinon/mock.js", "realtime-bar-graph/deps/sinon/lib/sinon/mock.js");
require.alias("ianstormtaylor-sinon/lib/sinon/sandbox.js", "realtime-bar-graph/deps/sinon/lib/sinon/sandbox.js");
require.alias("ianstormtaylor-sinon/lib/sinon/spy.js", "realtime-bar-graph/deps/sinon/lib/sinon/spy.js");
require.alias("ianstormtaylor-sinon/lib/sinon/stub.js", "realtime-bar-graph/deps/sinon/lib/sinon/stub.js");
require.alias("ianstormtaylor-sinon/lib/sinon/test.js", "realtime-bar-graph/deps/sinon/lib/sinon/test.js");
require.alias("ianstormtaylor-sinon/lib/sinon/test_case.js", "realtime-bar-graph/deps/sinon/lib/sinon/test_case.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/event.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/event.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/fake_server.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/fake_server.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/fake_server_with_clock.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/fake_server_with_clock.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/fake_timers.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/fake_timers.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/fake_xml_http_request.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/fake_xml_http_request.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/timers_ie.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/timers_ie.js");
require.alias("ianstormtaylor-sinon/lib/sinon/util/xhr_ie.js", "realtime-bar-graph/deps/sinon/lib/sinon/util/xhr_ie.js");
require.alias("ianstormtaylor-sinon/lib/index.js", "realtime-bar-graph/deps/sinon/index.js");
require.alias("ianstormtaylor-sinon/lib/index.js", "sinon/index.js");
require.alias("ianstormtaylor-sinon/lib/index.js", "ianstormtaylor-sinon/index.js");
require.alias("realtime-bar-graph/index.js", "realtime-bar-graph/index.js");