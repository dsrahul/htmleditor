(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    'use strict'
    
    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray
    
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
    
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }
    
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63
    
    function placeHoldersCount (b64) {
      var len = b64.length
      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }
    
      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
    }
    
    function byteLength (b64) {
      // base64 is 4/3 + up to two characters of the original data
      return (b64.length * 3 / 4) - placeHoldersCount(b64)
    }
    
    function toByteArray (b64) {
      var i, l, tmp, placeHolders, arr
      var len = b64.length
      placeHolders = placeHoldersCount(b64)
    
      arr = new Arr((len * 3 / 4) - placeHolders)
    
      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len
    
      var L = 0
    
      for (i = 0; i < l; i += 4) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
        arr[L++] = (tmp >> 16) & 0xFF
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }
    
      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[L++] = tmp & 0xFF
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }
    
      return arr
    }
    
    function tripletToBase64 (num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }
    
    function encodeChunk (uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }
    
    function fromByteArray (uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var output = ''
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3
    
      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
      }
    
      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        output += lookup[tmp >> 2]
        output += lookup[(tmp << 4) & 0x3F]
        output += '=='
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
        output += lookup[tmp >> 10]
        output += lookup[(tmp >> 4) & 0x3F]
        output += lookup[(tmp << 2) & 0x3F]
        output += '='
      }
    
      parts.push(output)
    
      return parts.join('')
    }
    
    },{}],2:[function(require,module,exports){
    
    },{}],3:[function(require,module,exports){
    /*!
     * Cross-Browser Split 1.1.1
     * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
     * Available under the MIT License
     * ECMAScript compliant, uniform cross-browser split method
     */
    
    /**
     * Splits a string into an array of strings using a regex or string separator. Matches of the
     * separator are not included in the result array. However, if `separator` is a regex that contains
     * capturing groups, backreferences are spliced into the result each time `separator` is matched.
     * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
     * cross-browser.
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating the string.
     * @param {Number} [limit] Maximum number of items to include in the result array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * split('a b c d', ' ');
     * // -> ['a', 'b', 'c', 'd']
     *
     * // With limit
     * split('a b c d', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * split('..word1 word2..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
     */
    module.exports = (function split(undef) {
    
      var nativeSplit = String.prototype.split,
        compliantExecNpcg = /()??/.exec("")[1] === undef,
        // NPCG: nonparticipating capturing group
        self;
    
      self = function(str, separator, limit) {
        // If `separator` is not a regex, use `nativeSplit`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
          return nativeSplit.call(str, separator, limit);
        }
        var output = [],
          flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
          (separator.sticky ? "y" : ""),
          // Firefox 3+
          lastLastIndex = 0,
          // Make `global` and avoid `lastIndex` issues by working with a copy
          separator = new RegExp(separator.source, flags + "g"),
          separator2, match, lastIndex, lastLength;
        str += ""; // Type-convert
        if (!compliantExecNpcg) {
          // Doesn't need flags gy, but they don't hurt
          separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
        limit >>> 0; // ToUint32(limit)
        while (match = separator.exec(str)) {
          // `separator.lastIndex` is not reliable cross-browser
          lastIndex = match.index + match[0].length;
          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            // Fix browsers whose `exec` methods don't consistently return `undefined` for
            // nonparticipating capturing groups
            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function() {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undef) {
                    match[i] = undef;
                  }
                }
              });
            }
            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= limit) {
              break;
            }
          }
          if (separator.lastIndex === match.index) {
            separator.lastIndex++; // Avoid an infinite loop
          }
        }
        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
            output.push("");
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
      };
    
      return self;
    })();
    
    },{}],4:[function(require,module,exports){
    (function (global){
    /*!
     * The buffer module from node.js, for the browser.
     *
     * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * @license  MIT
     */
    /* eslint-disable no-proto */
    
    'use strict'
    
    var base64 = require('base64-js')
    var ieee754 = require('ieee754')
    var isArray = require('isarray')
    
    exports.Buffer = Buffer
    exports.SlowBuffer = SlowBuffer
    exports.INSPECT_MAX_BYTES = 50
    
    /**
     * If `Buffer.TYPED_ARRAY_SUPPORT`:
     *   === true    Use Uint8Array implementation (fastest)
     *   === false   Use Object implementation (most compatible, even IE6)
     *
     * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
     * Opera 11.6+, iOS 4.2+.
     *
     * Due to various browser bugs, sometimes the Object implementation will be used even
     * when the browser supports typed arrays.
     *
     * Note:
     *
     *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
     *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
     *
     *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
     *
     *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
     *     incorrect length in some situations.
    
     * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
     * get the Object implementation, which is slower but behaves correctly.
     */
    Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
      ? global.TYPED_ARRAY_SUPPORT
      : typedArraySupport()
    
    /*
     * Export kMaxLength after typed array support is determined.
     */
    exports.kMaxLength = kMaxLength()
    
    function typedArraySupport () {
      try {
        var arr = new Uint8Array(1)
        arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
        return arr.foo() === 42 && // typed array instances can be augmented
            typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
            arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
      } catch (e) {
        return false
      }
    }
    
    function kMaxLength () {
      return Buffer.TYPED_ARRAY_SUPPORT
        ? 0x7fffffff
        : 0x3fffffff
    }
    
    function createBuffer (that, length) {
      if (kMaxLength() < length) {
        throw new RangeError('Invalid typed array length')
      }
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = new Uint8Array(length)
        that.__proto__ = Buffer.prototype
      } else {
        // Fallback: Return an object instance of the Buffer class
        if (that === null) {
          that = new Buffer(length)
        }
        that.length = length
      }
    
      return that
    }
    
    /**
     * The Buffer constructor returns instances of `Uint8Array` that have their
     * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
     * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
     * and the `Uint8Array` methods. Square bracket notation works as expected -- it
     * returns a single octet.
     *
     * The `Uint8Array` prototype remains unmodified.
     */
    
    function Buffer (arg, encodingOrOffset, length) {
      if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
        return new Buffer(arg, encodingOrOffset, length)
      }
    
      // Common case.
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new Error(
            'If encoding is specified then the first argument must be a string'
          )
        }
        return allocUnsafe(this, arg)
      }
      return from(this, arg, encodingOrOffset, length)
    }
    
    Buffer.poolSize = 8192 // not used by this implementation
    
    // TODO: Legacy, not needed anymore. Remove in next major version.
    Buffer._augment = function (arr) {
      arr.__proto__ = Buffer.prototype
      return arr
    }
    
    function from (that, value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }
    
      if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
        return fromArrayBuffer(that, value, encodingOrOffset, length)
      }
    
      if (typeof value === 'string') {
        return fromString(that, value, encodingOrOffset)
      }
    
      return fromObject(that, value)
    }
    
    /**
     * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
     * if value is a number.
     * Buffer.from(str[, encoding])
     * Buffer.from(array)
     * Buffer.from(buffer)
     * Buffer.from(arrayBuffer[, byteOffset[, length]])
     **/
    Buffer.from = function (value, encodingOrOffset, length) {
      return from(null, value, encodingOrOffset, length)
    }
    
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      Buffer.prototype.__proto__ = Uint8Array.prototype
      Buffer.__proto__ = Uint8Array
      if (typeof Symbol !== 'undefined' && Symbol.species &&
          Buffer[Symbol.species] === Buffer) {
        // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
        Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        })
      }
    }
    
    function assertSize (size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be a number')
      } else if (size < 0) {
        throw new RangeError('"size" argument must not be negative')
      }
    }
    
    function alloc (that, size, fill, encoding) {
      assertSize(size)
      if (size <= 0) {
        return createBuffer(that, size)
      }
      if (fill !== undefined) {
        // Only pay attention to encoding if it's a string. This
        // prevents accidentally sending in a number that would
        // be interpretted as a start offset.
        return typeof encoding === 'string'
          ? createBuffer(that, size).fill(fill, encoding)
          : createBuffer(that, size).fill(fill)
      }
      return createBuffer(that, size)
    }
    
    /**
     * Creates a new filled Buffer instance.
     * alloc(size[, fill[, encoding]])
     **/
    Buffer.alloc = function (size, fill, encoding) {
      return alloc(null, size, fill, encoding)
    }
    
    function allocUnsafe (that, size) {
      assertSize(size)
      that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
      if (!Buffer.TYPED_ARRAY_SUPPORT) {
        for (var i = 0; i < size; ++i) {
          that[i] = 0
        }
      }
      return that
    }
    
    /**
     * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
     * */
    Buffer.allocUnsafe = function (size) {
      return allocUnsafe(null, size)
    }
    /**
     * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
     */
    Buffer.allocUnsafeSlow = function (size) {
      return allocUnsafe(null, size)
    }
    
    function fromString (that, string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8'
      }
    
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }
    
      var length = byteLength(string, encoding) | 0
      that = createBuffer(that, length)
    
      var actual = that.write(string, encoding)
    
      if (actual !== length) {
        // Writing a hex string, for example, that contains invalid characters will
        // cause everything after the first invalid character to be ignored. (e.g.
        // 'abxxcd' will be treated as 'ab')
        that = that.slice(0, actual)
      }
    
      return that
    }
    
    function fromArrayLike (that, array) {
      var length = array.length < 0 ? 0 : checked(array.length) | 0
      that = createBuffer(that, length)
      for (var i = 0; i < length; i += 1) {
        that[i] = array[i] & 255
      }
      return that
    }
    
    function fromArrayBuffer (that, array, byteOffset, length) {
      array.byteLength // this throws if `array` is not a valid ArrayBuffer
    
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('\'offset\' is out of bounds')
      }
    
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('\'length\' is out of bounds')
      }
    
      if (byteOffset === undefined && length === undefined) {
        array = new Uint8Array(array)
      } else if (length === undefined) {
        array = new Uint8Array(array, byteOffset)
      } else {
        array = new Uint8Array(array, byteOffset, length)
      }
    
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        // Return an augmented `Uint8Array` instance, for best performance
        that = array
        that.__proto__ = Buffer.prototype
      } else {
        // Fallback: Return an object instance of the Buffer class
        that = fromArrayLike(that, array)
      }
      return that
    }
    
    function fromObject (that, obj) {
      if (Buffer.isBuffer(obj)) {
        var len = checked(obj.length) | 0
        that = createBuffer(that, len)
    
        if (that.length === 0) {
          return that
        }
    
        obj.copy(that, 0, 0, len)
        return that
      }
    
      if (obj) {
        if ((typeof ArrayBuffer !== 'undefined' &&
            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
          if (typeof obj.length !== 'number' || isnan(obj.length)) {
            return createBuffer(that, 0)
          }
          return fromArrayLike(that, obj)
        }
    
        if (obj.type === 'Buffer' && isArray(obj.data)) {
          return fromArrayLike(that, obj.data)
        }
      }
    
      throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
    }
    
    function checked (length) {
      // Note: cannot use `length < kMaxLength()` here because that fails when
      // length is NaN (which is otherwise coerced to zero.)
      if (length >= kMaxLength()) {
        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                             'size: 0x' + kMaxLength().toString(16) + ' bytes')
      }
      return length | 0
    }
    
    function SlowBuffer (length) {
      if (+length != length) { // eslint-disable-line eqeqeq
        length = 0
      }
      return Buffer.alloc(+length)
    }
    
    Buffer.isBuffer = function isBuffer (b) {
      return !!(b != null && b._isBuffer)
    }
    
    Buffer.compare = function compare (a, b) {
      if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
        throw new TypeError('Arguments must be Buffers')
      }
    
      if (a === b) return 0
    
      var x = a.length
      var y = b.length
    
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i]
          y = b[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
    Buffer.isEncoding = function isEncoding (encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    }
    
    Buffer.concat = function concat (list, length) {
      if (!isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
    
      if (list.length === 0) {
        return Buffer.alloc(0)
      }
    
      var i
      if (length === undefined) {
        length = 0
        for (i = 0; i < list.length; ++i) {
          length += list[i].length
        }
      }
    
      var buffer = Buffer.allocUnsafe(length)
      var pos = 0
      for (i = 0; i < list.length; ++i) {
        var buf = list[i]
        if (!Buffer.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        }
        buf.copy(buffer, pos)
        pos += buf.length
      }
      return buffer
    }
    
    function byteLength (string, encoding) {
      if (Buffer.isBuffer(string)) {
        return string.length
      }
      if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
          (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        string = '' + string
      }
    
      var len = string.length
      if (len === 0) return 0
    
      // Use a for loop to avoid recursion
      var loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
          case undefined:
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) return utf8ToBytes(string).length // assume utf8
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer.byteLength = byteLength
    
    function slowToString (encoding, start, end) {
      var loweredCase = false
    
      // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
      // property of a typed array.
    
      // This behaves neither like String nor Uint8Array in that we set start/end
      // to their upper/lower bounds if the value passed is out of range.
      // undefined is handled specially as per ECMA-262 6th Edition,
      // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
      if (start === undefined || start < 0) {
        start = 0
      }
      // Return early if start > this.length. Done here to prevent potential uint32
      // coercion fail below.
      if (start > this.length) {
        return ''
      }
    
      if (end === undefined || end > this.length) {
        end = this.length
      }
    
      if (end <= 0) {
        return ''
      }
    
      // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
      end >>>= 0
      start >>>= 0
    
      if (end <= start) {
        return ''
      }
    
      if (!encoding) encoding = 'utf8'
    
      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)
    
          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)
    
          case 'ascii':
            return asciiSlice(this, start, end)
    
          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)
    
          case 'base64':
            return base64Slice(this, start, end)
    
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)
    
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase()
            loweredCase = true
        }
      }
    }
    
    // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
    // Buffer instances.
    Buffer.prototype._isBuffer = true
    
    function swap (b, n, m) {
      var i = b[n]
      b[n] = b[m]
      b[m] = i
    }
    
    Buffer.prototype.swap16 = function swap16 () {
      var len = this.length
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (var i = 0; i < len; i += 2) {
        swap(this, i, i + 1)
      }
      return this
    }
    
    Buffer.prototype.swap32 = function swap32 () {
      var len = this.length
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (var i = 0; i < len; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
      return this
    }
    
    Buffer.prototype.swap64 = function swap64 () {
      var len = this.length
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (var i = 0; i < len; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
      return this
    }
    
    Buffer.prototype.toString = function toString () {
      var length = this.length | 0
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    }
    
    Buffer.prototype.equals = function equals (b) {
      if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer.compare(this, b) === 0
    }
    
    Buffer.prototype.inspect = function inspect () {
      var str = ''
      var max = exports.INSPECT_MAX_BYTES
      if (this.length > 0) {
        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
        if (this.length > max) str += ' ... '
      }
      return '<Buffer ' + str + '>'
    }
    
    Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
      if (!Buffer.isBuffer(target)) {
        throw new TypeError('Argument must be a Buffer')
      }
    
      if (start === undefined) {
        start = 0
      }
      if (end === undefined) {
        end = target ? target.length : 0
      }
      if (thisStart === undefined) {
        thisStart = 0
      }
      if (thisEnd === undefined) {
        thisEnd = this.length
      }
    
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }
    
      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }
    
      start >>>= 0
      end >>>= 0
      thisStart >>>= 0
      thisEnd >>>= 0
    
      if (this === target) return 0
    
      var x = thisEnd - thisStart
      var y = end - start
      var len = Math.min(x, y)
    
      var thisCopy = this.slice(thisStart, thisEnd)
      var targetCopy = target.slice(start, end)
    
      for (var i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i]
          y = targetCopy[i]
          break
        }
      }
    
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    
    // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
    // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
    //
    // Arguments:
    // - buffer - a Buffer to search
    // - val - a string, Buffer, or number
    // - byteOffset - an index into `buffer`; will be clamped to an int32
    // - encoding - an optional encoding, relevant is val is a string
    // - dir - true for indexOf, false for lastIndexOf
    function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
      // Empty buffer means no match
      if (buffer.length === 0) return -1
    
      // Normalize byteOffset
      if (typeof byteOffset === 'string') {
        encoding = byteOffset
        byteOffset = 0
      } else if (byteOffset > 0x7fffffff) {
        byteOffset = 0x7fffffff
      } else if (byteOffset < -0x80000000) {
        byteOffset = -0x80000000
      }
      byteOffset = +byteOffset  // Coerce to Number.
      if (isNaN(byteOffset)) {
        // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
        byteOffset = dir ? 0 : (buffer.length - 1)
      }
    
      // Normalize byteOffset: negative offsets start from the end of the buffer
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0
        else return -1
      }
    
      // Normalize val
      if (typeof val === 'string') {
        val = Buffer.from(val, encoding)
      }
    
      // Finally, search either indexOf (if dir is true) or lastIndexOf
      if (Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 0xFF // Search for a byte value [0-255]
        if (Buffer.TYPED_ARRAY_SUPPORT &&
            typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
      }
    
      throw new TypeError('val must be string, number or Buffer')
    }
    
    function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
      var indexSize = 1
      var arrLength = arr.length
      var valLength = val.length
    
      if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase()
        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
            encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2
          arrLength /= 2
          valLength /= 2
          byteOffset /= 2
        }
      }
    
      function read (buf, i) {
        if (indexSize === 1) {
          return buf[i]
        } else {
          return buf.readUInt16BE(i * indexSize)
        }
      }
    
      var i
      if (dir) {
        var foundIndex = -1
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex
            foundIndex = -1
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
        for (i = byteOffset; i >= 0; i--) {
          var found = true
          for (var j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false
              break
            }
          }
          if (found) return i
        }
      }
    
      return -1
    }
    
    Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    }
    
    Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    }
    
    Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    }
    
    function hexWrite (buf, string, offset, length) {
      offset = Number(offset) || 0
      var remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
    
      // must be an even number of digits
      var strLen = string.length
      if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
    
      if (length > strLen / 2) {
        length = strLen / 2
      }
      for (var i = 0; i < length; ++i) {
        var parsed = parseInt(string.substr(i * 2, 2), 16)
        if (isNaN(parsed)) return i
        buf[offset + i] = parsed
      }
      return i
    }
    
    function utf8Write (buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }
    
    function asciiWrite (buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }
    
    function latin1Write (buf, string, offset, length) {
      return asciiWrite(buf, string, offset, length)
    }
    
    function base64Write (buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }
    
    function ucs2Write (buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }
    
    Buffer.prototype.write = function write (string, offset, length, encoding) {
      // Buffer#write(string)
      if (offset === undefined) {
        encoding = 'utf8'
        length = this.length
        offset = 0
      // Buffer#write(string, encoding)
      } else if (length === undefined && typeof offset === 'string') {
        encoding = offset
        length = this.length
        offset = 0
      // Buffer#write(string, offset[, length][, encoding])
      } else if (isFinite(offset)) {
        offset = offset | 0
        if (isFinite(length)) {
          length = length | 0
          if (encoding === undefined) encoding = 'utf8'
        } else {
          encoding = length
          length = undefined
        }
      // legacy write(string, encoding, offset, length) - remove in v0.13
      } else {
        throw new Error(
          'Buffer.write(string, encoding, offset[, length]) is no longer supported'
        )
      }
    
      var remaining = this.length - offset
      if (length === undefined || length > remaining) length = remaining
    
      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }
    
      if (!encoding) encoding = 'utf8'
    
      var loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)
    
          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)
    
          case 'ascii':
            return asciiWrite(this, string, offset, length)
    
          case 'latin1':
          case 'binary':
            return latin1Write(this, string, offset, length)
    
          case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return base64Write(this, string, offset, length)
    
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)
    
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    
    Buffer.prototype.toJSON = function toJSON () {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
      }
    }
    
    function base64Slice (buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }
    
    function utf8Slice (buf, start, end) {
      end = Math.min(buf.length, end)
      var res = []
    
      var i = start
      while (i < end) {
        var firstByte = buf[i]
        var codePoint = null
        var bytesPerSequence = (firstByte > 0xEF) ? 4
          : (firstByte > 0xDF) ? 3
          : (firstByte > 0xBF) ? 2
          : 1
    
        if (i + bytesPerSequence <= end) {
          var secondByte, thirdByte, fourthByte, tempCodePoint
    
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 0x80) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                if (tempCodePoint > 0x7F) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
    
        if (codePoint === null) {
          // we did not generate a valid codePoint so insert a
          // replacement char (U+FFFD) and advance only 1 byte
          codePoint = 0xFFFD
          bytesPerSequence = 1
        } else if (codePoint > 0xFFFF) {
          // encode to utf16 (surrogate pair dance)
          codePoint -= 0x10000
          res.push(codePoint >>> 10 & 0x3FF | 0xD800)
          codePoint = 0xDC00 | codePoint & 0x3FF
        }
    
        res.push(codePoint)
        i += bytesPerSequence
      }
    
      return decodeCodePointsArray(res)
    }
    
    // Based on http://stackoverflow.com/a/22747272/680742, the browser with
    // the lowest limit is Chrome, with 0x10000 args.
    // We go 1 magnitude less, for safety
    var MAX_ARGUMENTS_LENGTH = 0x1000
    
    function decodeCodePointsArray (codePoints) {
      var len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
      }
    
      // Decode in chunks to avoid "call stack size exceeded".
      var res = ''
      var i = 0
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        )
      }
      return res
    }
    
    function asciiSlice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 0x7F)
      }
      return ret
    }
    
    function latin1Slice (buf, start, end) {
      var ret = ''
      end = Math.min(buf.length, end)
    
      for (var i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }
    
    function hexSlice (buf, start, end) {
      var len = buf.length
    
      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len
    
      var out = ''
      for (var i = start; i < end; ++i) {
        out += toHex(buf[i])
      }
      return out
    }
    
    function utf16leSlice (buf, start, end) {
      var bytes = buf.slice(start, end)
      var res = ''
      for (var i = 0; i < bytes.length; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
      }
      return res
    }
    
    Buffer.prototype.slice = function slice (start, end) {
      var len = this.length
      start = ~~start
      end = end === undefined ? len : ~~end
    
      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }
    
      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }
    
      if (end < start) end = start
    
      var newBuf
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        newBuf = this.subarray(start, end)
        newBuf.__proto__ = Buffer.prototype
      } else {
        var sliceLen = end - start
        newBuf = new Buffer(sliceLen, undefined)
        for (var i = 0; i < sliceLen; ++i) {
          newBuf[i] = this[i + start]
        }
      }
    
      return newBuf
    }
    
    /*
     * Need to make sure that buffer isn't trying to write out of bounds.
     */
    function checkOffset (offset, ext, length) {
      if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }
    
    Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) {
        checkOffset(offset, byteLength, this.length)
      }
    
      var val = this[offset + --byteLength]
      var mul = 1
      while (byteLength > 0 && (mul *= 0x100)) {
        val += this[offset + --byteLength] * mul
      }
    
      return val
    }
    
    Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length)
      return this[offset]
    }
    
    Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      return this[offset] | (this[offset + 1] << 8)
    }
    
    Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      return (this[offset] << 8) | this[offset + 1]
    }
    
    Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return ((this[offset]) |
          (this[offset + 1] << 8) |
          (this[offset + 2] << 16)) +
          (this[offset + 3] * 0x1000000)
    }
    
    Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] * 0x1000000) +
        ((this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        this[offset + 3])
    }
    
    Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var val = this[offset]
      var mul = 1
      var i = 0
      while (++i < byteLength && (mul *= 0x100)) {
        val += this[offset + i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) checkOffset(offset, byteLength, this.length)
    
      var i = byteLength
      var mul = 1
      var val = this[offset + --i]
      while (i > 0 && (mul *= 0x100)) {
        val += this[offset + --i] * mul
      }
      mul *= 0x80
    
      if (val >= mul) val -= Math.pow(2, 8 * byteLength)
    
      return val
    }
    
    Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 0x80)) return (this[offset])
      return ((0xff - this[offset] + 1) * -1)
    }
    
    Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset] | (this[offset + 1] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 2, this.length)
      var val = this[offset + 1] | (this[offset] << 8)
      return (val & 0x8000) ? val | 0xFFFF0000 : val
    }
    
    Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16) |
        (this[offset + 3] << 24)
    }
    
    Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
    
      return (this[offset] << 24) |
        (this[offset + 1] << 16) |
        (this[offset + 2] << 8) |
        (this[offset + 3])
    }
    
    Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }
    
    Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }
    
    Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }
    
    Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }
    
    function checkInt (buf, value, offset, ext, max, min) {
      if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }
    
    Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var mul = 1
      var i = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset | 0
      byteLength = byteLength | 0
      if (!noAssert) {
        var maxBytes = Math.pow(2, 8 * byteLength) - 1
        checkInt(this, value, offset, byteLength, maxBytes, 0)
      }
    
      var i = byteLength - 1
      var mul = 1
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        this[offset + i] = (value / mul) & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    function objectWriteUInt16 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffff + value + 1
      for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
          (littleEndian ? i : 1 - i) * 8
      }
    }
    
    Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
      } else {
        objectWriteUInt16(this, value, offset, true)
      }
      return offset + 2
    }
    
    Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8)
        this[offset + 1] = (value & 0xff)
      } else {
        objectWriteUInt16(this, value, offset, false)
      }
      return offset + 2
    }
    
    function objectWriteUInt32 (buf, value, offset, littleEndian) {
      if (value < 0) value = 0xffffffff + value + 1
      for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
      }
    }
    
    Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset + 3] = (value >>> 24)
        this[offset + 2] = (value >>> 16)
        this[offset + 1] = (value >>> 8)
        this[offset] = (value & 0xff)
      } else {
        objectWriteUInt32(this, value, offset, true)
      }
      return offset + 4
    }
    
    Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = (value & 0xff)
      } else {
        objectWriteUInt32(this, value, offset, false)
      }
      return offset + 4
    }
    
    Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = 0
      var mul = 1
      var sub = 0
      this[offset] = value & 0xFF
      while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) {
        var limit = Math.pow(2, 8 * byteLength - 1)
    
        checkInt(this, value, offset, byteLength, limit - 1, -limit)
      }
    
      var i = byteLength - 1
      var mul = 1
      var sub = 0
      this[offset + i] = value & 0xFF
      while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1
        }
        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
      }
    
      return offset + byteLength
    }
    
    Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
      if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
      if (value < 0) value = 0xff + value + 1
      this[offset] = (value & 0xff)
      return offset + 1
    }
    
    Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
      } else {
        objectWriteUInt16(this, value, offset, true)
      }
      return offset + 2
    }
    
    Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 8)
        this[offset + 1] = (value & 0xff)
      } else {
        objectWriteUInt16(this, value, offset, false)
      }
      return offset + 2
    }
    
    Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value & 0xff)
        this[offset + 1] = (value >>> 8)
        this[offset + 2] = (value >>> 16)
        this[offset + 3] = (value >>> 24)
      } else {
        objectWriteUInt32(this, value, offset, true)
      }
      return offset + 4
    }
    
    Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
      value = +value
      offset = offset | 0
      if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
      if (value < 0) value = 0xffffffff + value + 1
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        this[offset] = (value >>> 24)
        this[offset + 1] = (value >>> 16)
        this[offset + 2] = (value >>> 8)
        this[offset + 3] = (value & 0xff)
      } else {
        objectWriteUInt32(this, value, offset, false)
      }
      return offset + 4
    }
    
    function checkIEEE754 (buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }
    
    function writeFloat (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }
    
    Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }
    
    function writeDouble (buf, value, offset, littleEndian, noAssert) {
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }
    
    Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }
    
    Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }
    
    // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
    Buffer.prototype.copy = function copy (target, targetStart, start, end) {
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (targetStart >= target.length) targetStart = target.length
      if (!targetStart) targetStart = 0
      if (end > 0 && end < start) end = start
    
      // Copy 0 bytes; we're done
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0
    
      // Fatal error conditions
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')
    
      // Are we oob?
      if (end > this.length) end = this.length
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
      }
    
      var len = end - start
      var i
    
      if (this === target && start < targetStart && targetStart < end) {
        // descending copy from end
        for (i = len - 1; i >= 0; --i) {
          target[i + targetStart] = this[i + start]
        }
      } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
        // ascending copy from start
        for (i = 0; i < len; ++i) {
          target[i + targetStart] = this[i + start]
        }
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, start + len),
          targetStart
        )
      }
    
      return len
    }
    
    // Usage:
    //    buffer.fill(number[, offset[, end]])
    //    buffer.fill(buffer[, offset[, end]])
    //    buffer.fill(string[, offset[, end]][, encoding])
    Buffer.prototype.fill = function fill (val, start, end, encoding) {
      // Handle string cases:
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start
          start = 0
          end = this.length
        } else if (typeof end === 'string') {
          encoding = end
          end = this.length
        }
        if (val.length === 1) {
          var code = val.charCodeAt(0)
          if (code < 256) {
            val = code
          }
        }
        if (encoding !== undefined && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
      } else if (typeof val === 'number') {
        val = val & 255
      }
    
      // Invalid ranges are not set to a default, so can range check early.
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }
    
      if (end <= start) {
        return this
      }
    
      start = start >>> 0
      end = end === undefined ? this.length : end >>> 0
    
      if (!val) val = 0
    
      var i
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val
        }
      } else {
        var bytes = Buffer.isBuffer(val)
          ? val
          : utf8ToBytes(new Buffer(val, encoding).toString())
        var len = bytes.length
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len]
        }
      }
    
      return this
    }
    
    // HELPER FUNCTIONS
    // ================
    
    var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
    
    function base64clean (str) {
      // Node strips out invalid characters like \n and \t from the string, base64-js does not
      str = stringtrim(str).replace(INVALID_BASE64_RE, '')
      // Node converts strings with length < 2 to ''
      if (str.length < 2) return ''
      // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }
    
    function stringtrim (str) {
      if (str.trim) return str.trim()
      return str.replace(/^\s+|\s+$/g, '')
    }
    
    function toHex (n) {
      if (n < 16) return '0' + n.toString(16)
      return n.toString(16)
    }
    
    function utf8ToBytes (string, units) {
      units = units || Infinity
      var codePoint
      var length = string.length
      var leadSurrogate = null
      var bytes = []
    
      for (var i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i)
    
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
          // last char was a lead
          if (!leadSurrogate) {
            // no lead yet
            if (codePoint > 0xDBFF) {
              // unexpected trail
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            } else if (i + 1 === length) {
              // unpaired lead
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              continue
            }
    
            // valid lead
            leadSurrogate = codePoint
    
            continue
          }
    
          // 2 leads in a row
          if (codePoint < 0xDC00) {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
            leadSurrogate = codePoint
            continue
          }
    
          // valid surrogate pair
          codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
        } else if (leadSurrogate) {
          // valid bmp char, but last char was a lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        }
    
        leadSurrogate = null
    
        // encode utf8
        if (codePoint < 0x80) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 0x800) {
          if ((units -= 2) < 0) break
          bytes.push(
            codePoint >> 0x6 | 0xC0,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x10000) {
          if ((units -= 3) < 0) break
          bytes.push(
            codePoint >> 0xC | 0xE0,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else if (codePoint < 0x110000) {
          if ((units -= 4) < 0) break
          bytes.push(
            codePoint >> 0x12 | 0xF0,
            codePoint >> 0xC & 0x3F | 0x80,
            codePoint >> 0x6 & 0x3F | 0x80,
            codePoint & 0x3F | 0x80
          )
        } else {
          throw new Error('Invalid code point')
        }
      }
    
      return bytes
    }
    
    function asciiToBytes (str) {
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        // Node's code seems to be doing this and not & 0x7F..
        byteArray.push(str.charCodeAt(i) & 0xFF)
      }
      return byteArray
    }
    
    function utf16leToBytes (str, units) {
      var c, hi, lo
      var byteArray = []
      for (var i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break
    
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }
    
      return byteArray
    }
    
    function base64ToBytes (str) {
      return base64.toByteArray(base64clean(str))
    }
    
    function blitBuffer (src, dst, offset, length) {
      for (var i = 0; i < length; ++i) {
        if ((i + offset >= dst.length) || (i >= src.length)) break
        dst[i + offset] = src[i]
      }
      return i
    }
    
    function isnan (val) {
      return val !== val // eslint-disable-line no-self-compare
    }
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{"base64-js":1,"ieee754":53,"isarray":56}],5:[function(require,module,exports){
    (function (global){
    var topLevel = typeof global !== 'undefined' ? global :
        typeof window !== 'undefined' ? window : {}
    var minDoc = require('min-document');
    
    var doccy;
    
    if (typeof document !== 'undefined') {
        doccy = document;
    } else {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];
    
        if (!doccy) {
            doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
        }
    }
    
    module.exports = doccy;
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{"min-document":2}],6:[function(require,module,exports){
    var client = require('./client')
    var xhr = require('./middleware/xhr')
    
    module.exports = client([
      require('./middleware/jsonp'),
      require('./middleware/exception'),
      require('./middleware/formBrowser'),
      require('./middleware/jsonBrowser'),
      require('./middleware/textBrowser'),
      require('./middleware/params'),
      require('./middleware/querystring'),
      require('./middleware/basicAuth'),
      xhr
    ])
    
    module.exports.raw = client(xhr)
    
    },{"./client":7,"./middleware/basicAuth":12,"./middleware/exception":13,"./middleware/formBrowser":14,"./middleware/jsonBrowser":15,"./middleware/jsonp":16,"./middleware/params":18,"./middleware/querystring":19,"./middleware/textBrowser":20,"./middleware/xhr":21}],7:[function(require,module,exports){
    var merge = require('./merge')
    var resolveUrl = require('./resolveUrl')
    
    function client (url, options, middleware) {
      var args = parseClientArguments(url, options, middleware)
      return new Httpism(args.url, args.options || {}, args.middleware)
    }
    
    function Httpism (url, options, middleware) {
      this.url = url
      this._options = options
      this.middleware = middleware
    }
    
    Httpism.prototype.send = function (method, url, body, _options) {
      console.warn('httpism.send() is deprecated please use httpism.request()')
      return this.request.apply(this, arguments)
    }
    
    Httpism.prototype.request = function (method, url, body, _options) {
      var request
    
      if (method instanceof Object) {
        request = method
      } else {
        var options = mergeClientOptions(_options, this._options)
        request = {
          method: method,
          url: resolveUrl(this.url, url),
          headers: lowerCaseHeaders(options.headers || {}),
          body: body,
          options: options
        }
      }
    
      var self = this
    
      function sendToMiddleware (index, req) {
        if (index < self.middleware.length) {
          var middleware = self.middleware[index]
          return middleware(req, function (nextRequest) { return sendToMiddleware(index + 1, nextRequest || req) }, self)
        }
      }
    
      return sendToMiddleware(0, request).then(function (response) {
        if (request.options.response === true) {
          return response
        } else {
          responseCompatibility(response)
          return response.body
        }
      }, function (e) {
        if (e.redirectResponse) {
          return e.redirectResponse
        } else {
          throw e
        }
      })
    }
    
    function responseCompatibility (response) {
      function responseWarning () {
        console.warn('httpism >= 3.0.0 returns the response body by default, please pass the {response: true} option if you want the whole response')
      }
    
      if (response.body instanceof Object) {
        if (response.body && !response.body.hasOwnProperty('body')) {
          Object.defineProperty(response.body, 'body', {
            get: function () {
              responseWarning()
              return this
            }
          })
        }
    
        if (response.body && !response.body.hasOwnProperty('url')) {
          Object.defineProperty(response.body, 'url', {
            get: function () {
              responseWarning()
              return response.url
            }
          })
        }
    
        if (response.body && !response.body.hasOwnProperty('statusCode')) {
          Object.defineProperty(response.body, 'statusCode', {
            get: function () {
              responseWarning()
              return response.statusCode
            }
          })
        }
    
        if (response.body && !response.body.hasOwnProperty('headers')) {
          Object.defineProperty(response.body, 'headers', {
            get: function () {
              responseWarning()
              return response.headers
            }
          })
        }
      }
    }
    
    function lowerCaseHeaders (headers) {
      Object.keys(headers).forEach(function (key) {
        var lower = key.toLowerCase()
        if (key.toLowerCase() !== key) {
          headers[lower] = headers[key]
          delete headers[key]
        }
      })
    
      return headers
    }
    
    function findMiddlewareIndexes (names, middleware) {
      return names.map(function (name) {
        for (var n = 0; n < middleware.length; n++) {
          var m = middleware[n]
          if (m.httpismMiddleware && m.httpismMiddleware.name === name) {
            return n
          }
        }
    
        return -1
      }).filter(function (i) {
        return i >= 0
      })
    }
    
    function insertMiddlewareIntoIndex (middleware, m, index) {
      middleware.splice(index, 0, m)
    }
    
    Httpism.prototype.client = function (url, options, middleware) {
      var args = parseClientArguments(url, options, middleware)
    
      var client = new Httpism(
        resolveUrl(this.url, args.url),
        mergeClientOptions(args.options, this._options),
        this.middleware.slice()
      )
    
      if (args.middleware) {
        args.middleware.forEach(function (m) {
          client.use(m)
        })
      }
    
      return client
    }
    
    Httpism.prototype.api = function (url, options, middleware) {
      console.warn('httpism >= 3.0.0 renamed httpism.api() to httpism.client(), please update your usage')
      return this.client(url, options, middleware)
    }
    
    Httpism.prototype.insertMiddleware = function (m) {
      console.warn('httpism >= 3.0.0 renamed httpism.insertMiddleware() to httpism.use(), please update your usage')
      return this.use(m)
    }
    
    Httpism.prototype.use = function (m) {
      var meta = m.httpismMiddleware
    
      if (meta && (meta.before || meta.after)) {
        var position = meta.before || meta.after
        var names = typeof position === 'string' ? [position] : position
        var indexes = findMiddlewareIndexes(names, this.middleware)
        if (indexes.length) {
          var index = meta.before ? Math.min.apply(Math, indexes) : Math.max.apply(Math, indexes) + 1
    
          if (index >= 0) {
            insertMiddlewareIntoIndex(this.middleware, m, index)
            return
          }
        }
    
        throw new Error('no such middleware: ' + (meta.before || meta.after))
      } else {
        this.middleware.unshift(m)
      }
    }
    
    Httpism.prototype.removeMiddleware = function (name) {
      console.warn('httpism.removeMiddleware() is deprecated please use httpism.remove()')
      this.remove(name)
    }
    
    Httpism.prototype.remove = function (name) {
      var indexes = findMiddlewareIndexes([name], this.middleware)
      for (var i = indexes.length - 1; i >= 0; i--) {
        this.middleware.splice(indexes[i], 1)
      }
    }
    
    function addMethod (method) {
      Httpism.prototype[method] = function (url, options) {
        return this.request(method, url, undefined, options)
      }
    }
    
    function addMethodWithBody (method) {
      Httpism.prototype[method] = function (url, body, options) {
        return this.request(method, url, body, options)
      }
    }
    
    addMethod('get')
    addMethod('delete')
    addMethod('head')
    addMethodWithBody('post')
    addMethodWithBody('put')
    addMethodWithBody('patch')
    addMethodWithBody('options')
    
    function parseClientArguments () {
      var url, options, middleware
    
      for (var n = 0; n < arguments.length; n++) {
        var arg = arguments[n]
    
        if (typeof arg === 'string') {
          url = arg
        } else if (typeof arg === 'function') {
          middleware = [arg]
        } else if (arg instanceof Array) {
          middleware = arg
        } else if (arg instanceof Object) {
          options = arg
        }
      }
    
      return {
        url: url,
        options: options,
        middleware: middleware
      }
    }
    
    function mergeClientOptions (x, y) {
      var z = merge(x, y)
      if (z && z.headers) { z.headers = merge(x && x.headers, y && y.headers) }
      return z
    }
    
    module.exports = client
    
    },{"./merge":10,"./resolveUrl":25}],8:[function(require,module,exports){
    var extend = require('./extend')
    var parseUri = require('./parseUri')
    var querystringLite = require('./querystring-lite')
    
    module.exports = function expandUrl (pattern, _params, _qs) {
      var qs = _qs || querystringLite
      var params = _params || {}
      var onlyQueryParams = extend({}, params)
    
      var uri = parseUri(pattern)
      var pathPattern = uri.pathname
      var path = pathPattern.replace(/:([a-z_][a-z0-9_]*)\*/gi, function (_, id) {
        var param = params[id]
        delete onlyQueryParams[id]
        return encodeURI(paramToString(param))
      })
    
      path = path.replace(/:([a-z_][a-z0-9_]*)/gi, function (_, id) {
        var param = params[id]
        delete onlyQueryParams[id]
        return encodeURIComponent(paramToString(param))
      })
    
      var query = qs.stringify(extend(qs.parse(uri.search.replace(/^\?/, '')), onlyQueryParams))
    
      var fullpath = query ? path + '?' + query : path
    
      return uri.protocol + uri.authority + fullpath + uri.hash
    }
    
    function paramToString (p) {
      if (p === undefined || p === null) {
        return ''
      } else {
        return p
      }
    }
    
    },{"./extend":9,"./parseUri":23,"./querystring-lite":24}],9:[function(require,module,exports){
    module.exports = function (object, extension) {
      var keys = Object.keys(extension)
    
      for (var n = 0; n < keys.length; n++) {
        var key = keys[n]
        object[key] = extension[key]
      }
    
      return object
    }
    
    },{}],10:[function(require,module,exports){
    var extend = require('./extend')
    
    module.exports = function (x, y) {
      if (x && y) {
        var r = {}
    
        extend(r, y)
        extend(r, x)
    
        return r
      } else if (y) {
        return y
      } else {
        return x
      }
    }
    
    },{"./extend":9}],11:[function(require,module,exports){
    var merge = require('./merge')
    var querystringLite = require('./querystring-lite')
    
    module.exports = function (request) {
      var qs = request.options.qs || querystringLite
    
      var split = request.url.split('?')
      var path = split[0]
      var querystring = qs.parse(split[1] || '')
      var mergedQueryString = merge(request.options.querystring, querystring)
    
      request.url = path + '?' + qs.stringify(mergedQueryString)
    }
    
    },{"./merge":10,"./querystring-lite":24}],12:[function(require,module,exports){
    (function (Buffer){
    var middleware = require('./middleware')
    var urlUtils = require('url')
    
    function encodeBasicAuthorizationHeader (s) {
      return 'Basic ' + Buffer.from(s).toString('base64')
    }
    
    module.exports = middleware('basicAuth', function (request, next) {
      function basicAuthorizationHeader () {
        if (request.options.basicAuth) {
          var username = request.options.basicAuth.username || ''
          var password = request.options.basicAuth.password || ''
    
          return encodeBasicAuthorizationHeader(username.replace(/:/g, '') + ':' + password)
        } else {
          var url = urlUtils.parse(request.url)
          if (url.auth) {
            return encodeBasicAuthorizationHeader(url.auth)
          }
        }
      }
    
      var header = basicAuthorizationHeader()
      if (header) {
        request.headers.authorization = header
      }
    
      return next()
    })
    
    }).call(this,require("buffer").Buffer)
    
    },{"./middleware":17,"buffer":4,"url":66}],13:[function(require,module,exports){
    var middleware = require('./middleware')
    var extend = require('../extend')
    var obfuscateUrlPassword = require('../obfuscateUrlPassword')
    
    module.exports = middleware('exception', function (request, next) {
      return next().then(function (response) {
        var exceptions = request.options.exceptions
        var isException = exceptions === false ? false : typeof exceptions === 'function' ? exceptions(response) : response.statusCode >= 400
    
        if (isException) {
          var msg = request.method.toUpperCase() + ' ' + obfuscateUrlPassword(request.url) + ' => ' + response.statusCode + ' ' + response.statusText
          var error = extend(new Error(msg), response)
          throw error
        } else {
          return response
        }
      })
    })
    
    },{"../extend":9,"../obfuscateUrlPassword":22,"./middleware":17}],14:[function(require,module,exports){
    var middleware = require('./middleware')
    
    var setHeaderTo = require('../setHeaderTo')
    var shouldParseAs = require('../shouldParseAs')
    var querystringLite = require('../querystring-lite')
    
    module.exports = middleware('form', function (request, next) {
      if (request.options.form && request.body instanceof Object) {
        var querystring = request.options.qs || querystringLite
        request.body = querystring.stringify(request.body)
        setHeaderTo(request, 'content-type', 'application/x-www-form-urlencoded')
      }
    
      return next().then(function (response) {
        var querystring = request.options.qs || querystringLite
        if (shouldParseAs(response, 'form', request)) {
          response.body = querystring.parse(response.body)
        }
        return response
      })
    })
    
    },{"../querystring-lite":24,"../setHeaderTo":26,"../shouldParseAs":27,"./middleware":17}],15:[function(require,module,exports){
    /* global FormData */
    
    var middleware = require('./middleware')
    
    var setHeaderTo = require('../setHeaderTo')
    var shouldParseAs = require('../shouldParseAs')
    
    module.exports = middleware('json', function (request, next) {
      if (!(request.body instanceof FormData) && request.body instanceof Object) {
        request.body = JSON.stringify(request.body)
        setHeaderTo(request, 'content-type', 'application/json')
      }
    
      setHeaderTo(request, 'accept', 'application/json')
    
      return next().then(function (response) {
        if (shouldParseAs(response, 'json', request)) {
          response.body = JSON.parse(response.body, request.options.jsonReviver)
        }
        return response
      })
    })
    
    },{"../setHeaderTo":26,"../shouldParseAs":27,"./middleware":17}],16:[function(require,module,exports){
    var middleware = require('./middleware')
    var randomString = require('random-string')
    var mergeQueryString = require('../mergeQueryString')
    
    function randomGlobal (value) {
      var name
    
      do {
        name = '_' + randomString({length: 20})
      } while (typeof window[name] !== 'undefined')
    
      window[name] = value
    
      return name
    }
    
    module.exports = middleware('jsonp', function (request, next) {
      var jsonp = request.options.jsonp
    
      if (jsonp) {
        request.options.querystring = request.options.querystring || {}
    
        return new Promise(function (resolve, reject) {
          var callbackName = randomGlobal(function (v) {
            delete window[callbackName]
            document.head.removeChild(script)
            resolve({
              statusCode: 200,
              headers: {},
              body: v
            })
          })
    
          request.options.querystring[jsonp] = callbackName
    
          mergeQueryString(request)
    
          var script = document.createElement('script')
          script.type = 'text/javascript'
          script.src = request.url
          script.onerror = function () {
            reject(new Error('could not load script tag for JSONP request: ' + request.url))
          }
          document.head.appendChild(script)
        })
      }
    
      return next()
    })
    
    },{"../mergeQueryString":11,"./middleware":17,"random-string":65}],17:[function(require,module,exports){
    module.exports = function (name, fn) {
      fn.httpismMiddleware = {
        name: name
      }
      return fn
    }
    
    },{}],18:[function(require,module,exports){
    var middleware = require('./middleware')
    var expandUrl = require('../expandUrl')
    
    module.exports = middleware('params', function (request, next) {
      if (request.options.params instanceof Object) {
        var render = request.options.expandUrl || expandUrl
        request.url = render(request.url, request.options.params, request.options.qs)
      }
    
      return next()
    })
    
    },{"../expandUrl":8,"./middleware":17}],19:[function(require,module,exports){
    var middleware = require('./middleware')
    var mergeQueryString = require('../mergeQueryString')
    
    module.exports = middleware('querystring', function (request, next) {
      if (request.options.querystring instanceof Object) {
        console.warn('options.querystring is deprecated, please see https://github.com/featurist/httpism#params')
        mergeQueryString(request)
      }
    
      return next()
    })
    
    },{"../mergeQueryString":11,"./middleware":17}],20:[function(require,module,exports){
    var middleware = require('./middleware')
    var setHeaderTo = require('../setHeaderTo')
    
    module.exports = middleware('text', function (request, next) {
      if (typeof request.body === 'string') {
        setHeaderTo(request, 'content-type', 'text/plain;charset=UTF-8')
      }
    
      return next()
    })
    
    },{"../setHeaderTo":26,"./middleware":17}],21:[function(require,module,exports){
    var middleware = require('./middleware')
    
    function toUpperCase (x) {
      return x.toUpperCase()
    }
    
    function formatHeaderName (name) {
      return name.replace(/^([a-z])/, toUpperCase).replace(/-([a-z])/g, toUpperCase)
    }
    
    function setHeaders (headers, xhr) {
      var headerNames = Object.keys(headers)
    
      for (var n = 0; n < headerNames.length; n++) {
        var key = headerNames[n]
        var headerName = formatHeaderName(key)
        xhr.setRequestHeader(headerName, headers[key])
      }
    }
    
    function isCrossDomain (url) {
      return /^https?:\/\//.test(url)
    }
    
    function responseUrl (xhr, requestUrl) {
      var origin = window.location.origin
      var responseUrl = xhr.responseURL
    
      if (responseUrl) {
        if (responseUrl.substring(0, origin.length) === origin) {
          return responseUrl.substring(origin.length)
        } else {
          return responseUrl
        }
      } else {
        return requestUrl
      }
    }
    
    function parseHeaders (headers) {
      var object = {}
      var lines = headers.split('\n')
    
      for (var n = 0; n < lines.length; n++) {
        var line = lines[n]
        var match = /^(.*?):(.*)/.exec(line)
    
        if (match) {
          object[match[1].toLowerCase()] = match[2].trim()
        }
      }
    
      return object
    }
    
    function addAbortToPromise (promise, abort) {
      var then = promise.then
      promise.then = function () {
        var p = then.apply(this, arguments)
        p.abort = abort
        addAbortToPromise(p, abort)
        return p
      }
    }
    
    module.exports = middleware('xhr', function (request) {
      var Xhr = request.options.xhr || window.XMLHttpRequest
      var xhr = new Xhr()
      var rejectPromise
    
      var promise = new Promise(function (resolve, reject) {
        rejectPromise = reject
        xhr.open(request.method, request.url, true)
        xhr.onload = function () {
          var statusCode = xhr.status
    
          var response = {
            body: statusCode === 204 ? undefined : xhr.responseText,
            headers: parseHeaders(xhr.getAllResponseHeaders()),
            statusCode: statusCode,
            url: responseUrl(xhr, request.url),
            xhr: xhr,
            statusText: xhr.statusText
          }
    
          resolve(response)
        }
    
        xhr.onerror = function () {
          rejectPromise(new Error('failed to connect to ' + request.method + ' ' + request.url))
        }
    
        if (!isCrossDomain(request.url) && !request.headers['x-requested-with']) {
          request.headers['x-requested-with'] = 'XMLHttpRequest'
        }
    
        setHeaders(request.headers, xhr)
        xhr.withCredentials = !!request.options.withCredentials
    
        xhr.send(request.body)
      })
    
      function abort () {
        xhr.abort()
        var error = new Error('aborted connection to ' + request.method + ' ' + request.url)
        error.aborted = true
        rejectPromise(error)
      }
      addAbortToPromise(promise, abort)
    
      return promise
    })
    
    },{"./middleware":17}],22:[function(require,module,exports){
    module.exports = function (url) {
      return url.replace(/^([-a-z]*:\/\/[^:]*:)[^@]*@/, function (_, first) { return first + '********@' })
    }
    
    },{}],23:[function(require,module,exports){
    // from https://gist.github.com/Yaffle/1088850
    
    module.exports = function parseURI (url) {
      var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/)
      // authority = '//' + user + ':' + pass '@' + hostname + ':' port
      return (m ? {
        href: m[0] || '',
        protocol: m[1] || '',
        authority: m[2] || '',
        host: m[3] || '',
        hostname: m[4] || '',
        port: m[5] || '',
        pathname: m[6] || '',
        search: m[7] || '',
        hash: m[8] || ''
      } : null)
    }
    
    },{}],24:[function(require,module,exports){
    module.exports = {
      parse: function (string) {
        var params = {}
    
        string.split('&').forEach(function (component) {
          var split = component.split('=')
          if (split[1]) {
            params[decodeURIComponent(split[0])] = decodeURIComponent(split[1])
          }
        })
    
        return params
      },
    
      stringify: function (params) {
        return Object.keys(params)
          .filter(function (key) {
            return typeof (params[key]) !== 'undefined'
          })
          .map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
          })
          .join('&')
      }
    }
    
    },{}],25:[function(require,module,exports){
    // from https://gist.github.com/Yaffle/1088850
    
    var parseUri = require('./parseUri')
    
    module.exports = function (base, href) { // RFC 3986
      function removeDotSegments (input) {
        var output = []
        input.replace(/^(\.\.?(\/|$))+/, '')
             .replace(/\/(\.(\/|$))+/g, '/')
             .replace(/\/\.\.$/, '/../')
             .replace(/\/?[^/]*/g, function (p) {
               if (p === '/..') {
                 output.pop()
               } else {
                 output.push(p)
               }
             })
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '')
      }
    
      href = parseUri(href || '')
      base = parseUri(base || '')
    
      return !href || !base ? null : (href.protocol || base.protocol) +
             (href.protocol || href.authority ? href.authority : base.authority) +
             removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
             (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
             href.hash
    }
    
    },{"./parseUri":23}],26:[function(require,module,exports){
    module.exports = function (request, header, value) {
      if (!request.headers[header]) {
        return (request.headers[header] = value)
      }
    }
    
    },{}],27:[function(require,module,exports){
    var responseBodyTypes = {
      json: function (response) {
        return contentTypeIs(response, 'application/json')
      },
      text: function (response) {
        return contentTypeIsText(response) || contentTypeIs(response, 'application/javascript')
      },
      form: function (response) {
        return contentTypeIs(response, 'application/x-www-form-urlencoded')
      },
      stream: function () {
        return false
      }
    }
    
    function contentTypeIsText (response) {
      return contentTypeIs(response, 'text/.*')
    }
    
    function contentTypeIs (response, expectedContentType) {
      var re = new RegExp('^\\s*' + expectedContentType + '\\s*($|;)')
      return re.test(response.headers['content-type'])
    }
    
    module.exports = function (response, type, request) {
      if (request.options.responseBody) {
        return type === request.options.responseBody
      } else {
        var bodyType = responseBodyTypes[type]
        if (bodyType) {
          return bodyType(response)
        }
      }
    }
    
    },{}],28:[function(require,module,exports){
    var listener = require('./listener')
    var binding = require('./binding')
    var RefreshHook = require('./render').RefreshHook
    
    module.exports = function (tag, attributes, children) {
      var type = inputType(tag, attributes)
      var bind = inputTypeBindings[type] || bindTextInput
    
      bind(attributes, children, binding(attributes.binding))
    }
    
    var inputTypeBindings = {
      text: bindTextInput,
    
      textarea: bindTextInput,
    
      checkbox: function (attributes, children, binding) {
        attributes.checked = binding.get()
    
        attachEventHandler(attributes, 'onclick', function (ev) {
          attributes.checked = ev.target.checked
          return binding.set(ev.target.checked)
        }, binding)
      },
    
      radio: function (attributes, children, binding) {
        var value = attributes.value
        attributes.checked = binding.get() === attributes.value
        attributes.on_hyperdomsyncchecked = listener(function (event) {
          attributes.checked = event.target.checked
        })
    
        attachEventHandler(attributes, 'onclick', function (event) {
          var name = event.target.name
          if (name) {
            var inputs = document.getElementsByName(name)
            for (var i = 0, l = inputs.length; i < l; i++) {
              inputs[i].dispatchEvent(customEvent('_hyperdomsyncchecked'))
            }
          }
          return binding.set(value)
        }, binding)
      },
    
      select: function (attributes, children, binding) {
        var currentValue = binding.get()
    
        var options = children.filter(function (child) {
          return child.tagName && child.tagName.toLowerCase() === 'option'
        })
    
        var values = []
        var selectedIndex
    
        for (var n = 0; n < options.length; n++) {
          var option = options[n]
          var hasValue = option.properties.hasOwnProperty('value')
          var value = option.properties.value
          var text = option.children.map(function (x) { return x.text }).join('')
    
          values.push(hasValue ? value : text)
    
          var selected = value === currentValue || text === currentValue
    
          if (selected) {
            selectedIndex = n
          }
    
          option.properties.selected = selected
          option.properties.value = n
        }
    
        if (selectedIndex !== undefined) {
          attributes.selectedIndex = selectedIndex
        }
    
        attachEventHandler(attributes, 'onchange', function (ev) {
          attributes.selectedIndex = ev.target.selectedIndex
          return binding.set(values[ev.target.value])
        }, binding)
      },
    
      file: function (attributes, children, binding) {
        var multiple = attributes.multiple
    
        attachEventHandler(attributes, 'onchange', function (ev) {
          if (multiple) {
            return binding.set(ev.target.files)
          } else {
            return binding.set(ev.target.files[0])
          }
        }, binding)
      }
    }
    
    function inputType (selector, attributes) {
      if (/^textarea\b/i.test(selector)) {
        return 'textarea'
      } else if (/^select\b/i.test(selector)) {
        return 'select'
      } else {
        return attributes.type || 'text'
      }
    }
    
    function bindTextInput (attributes, children, binding) {
      var textEventNames = ['onkeyup', 'oninput', 'onpaste', 'textInput']
    
      var bindingValue = binding.get()
      if (!(bindingValue instanceof Error)) {
        attributes.value = bindingValue !== undefined ? bindingValue : ''
      }
    
      attachEventHandler(attributes, textEventNames, function (ev) {
        if (binding.get() !== ev.target.value) {
          return binding.set(ev.target.value)
        }
      }, binding)
    }
    
    function attachEventHandler (attributes, eventNames, handler, binding) {
      if (eventNames instanceof Array) {
        for (var n = 0; n < eventNames.length; n++) {
          insertEventHandler(attributes, eventNames[n], handler)
        }
      } else {
        insertEventHandler(attributes, eventNames, handler)
      }
    }
    
    function insertEventHandler (attributes, eventName, handler) {
      var previousHandler = attributes[eventName]
      if (previousHandler) {
        attributes[eventName] = sequenceFunctions(handler, previousHandler)
      } else {
        attributes[eventName] = handler
      }
    }
    
    function sequenceFunctions (handler1, handler2) {
      return function (ev) {
        handler1(ev)
        if (handler2 instanceof RefreshHook) {
          return handler2.handler(ev)
        } else {
          return handler2(ev)
        }
      }
    }
    
    function customEvent (name) {
      if (typeof Event === 'function') {
        return new window.Event(name)
      } else {
        var event = document.createEvent('Event')
        event.initEvent(name, false, false)
        return event
      }
    }
    
    },{"./binding":29,"./listener":37,"./render":44}],29:[function(require,module,exports){
    var meta = require('./meta')
    
    module.exports = function (b) {
      var binding = b
    
      if (b instanceof Array) {
        binding = bindingObject.apply(undefined, b)
      } else if (b instanceof Object && (typeof b.set === 'function' || typeof b.get === 'function')) {
        binding = b
      } else {
        throw Error('hyperdom bindings must be either an array [object, property, setter] or an object { get(), set(value) }, instead binding was: ' + JSON.stringify(b))
      }
    
      return binding
    }
    
    function bindingObject (model, property, setter) {
      var _meta
    
      return {
        get: function () {
          return model[property]
        },
    
        set: function (value) {
          model[property] = value
          if (setter) {
            return setter(value)
          }
        },
    
        meta: function () {
          return _meta || (_meta = meta(model, property))
        }
      }
    }
    
    },{"./meta":38}],30:[function(require,module,exports){
    var hyperdomMeta = require('./meta')
    var render = require('./render')
    var Vtext = require('virtual-dom/vnode/vtext.js')
    var debuggingProperties = require('./debuggingProperties')
    
    function Component (model, options) {
      this.isViewComponent = options && options.hasOwnProperty('viewComponent') && options.viewComponent
      this.model = model
      this.key = model.renderKey
      this.component = undefined
    }
    
    Component.prototype.type = 'Widget'
    
    Component.prototype.init = function () {
      var self = this
    
      var vdom = this.render()
    
      var meta = hyperdomMeta(this.model)
      meta.components.add(this)
    
      var currentRender = render.currentRender()
      this.component = currentRender.mount.createDomComponent()
      var element = this.component.create(vdom)
    
      if (self.model.detached) {
        return document.createTextNode('')
      } else {
        return element
      }
    }
    
    function beforeUpdate (model, element) {
      if (model.onbeforeupdate) {
        model.onbeforeupdate(element)
      }
    
      if (model.onbeforerender) {
        model.onbeforerender(element)
      }
    }
    
    function afterUpdate (model, element, oldElement) {
      if (model.onupdate) {
        model.onupdate(element, oldElement)
      }
    
      if (model.onrender) {
        model.onrender(element, oldElement)
      }
    }
    
    Component.prototype.update = function (previous) {
      var self = this
    
      if (this.isViewComponent) {
        var keys = Object.keys(this.model)
        for (var n = 0; n < keys.length; n++) {
          var key = keys[n]
          previous.model[key] = self.model[key]
        }
        this.model = previous.model
      }
    
      this.component = previous.component
      var oldElement = this.component.element
    
      var element = this.component.update(this.render(oldElement))
    
      if (self.model.detached) {
        return document.createTextNode('')
      } else {
        return element
      }
    }
    
    Component.prototype.renderModel = function (oldElement) {
      var self = this
      var model = this.model
      var currentRender = render.currentRender()
      currentRender.mount.setupModelComponent(model)
    
      if (!oldElement) {
        if (self.model.onbeforeadd) {
          self.model.onbeforeadd()
        }
        if (self.model.onbeforerender) {
          self.model.onbeforerender()
        }
    
        if (self.model.onadd || self.model.onrender) {
          currentRender.finished.then(function () {
            if (self.model.onadd) {
              self.model.onadd(self.component.element)
            }
            if (self.model.onrender) {
              self.model.onrender(self.component.element)
            }
          })
        }
      } else {
        beforeUpdate(model, oldElement)
    
        if (model.onupdate || model.onrender) {
          currentRender.finished.then(function () {
            afterUpdate(model, self.component.element, oldElement)
          })
        }
      }
    
      var vdom = typeof model.render === 'function' ? model.render() : new Vtext(JSON.stringify(model))
    
      if (vdom instanceof Array) {
        throw new Error('vdom returned from component cannot be an array')
      }
    
      return debuggingProperties(vdom, model)
    }
    
    Component.prototype.render = function (oldElement) {
      var model = this.model
    
      var meta = hyperdomMeta(model)
      meta.lastRenderId = render.currentRender().mount.renderId
    
      if (typeof model.renderCacheKey === 'function') {
        var key = model.renderCacheKey()
        if (key !== undefined && meta.cacheKey === key && meta.cachedVdom) {
          return meta.cachedVdom
        } else {
          meta.cacheKey = key
          return (meta.cachedVdom = this.renderModel(oldElement))
        }
      } else {
        return this.renderModel(oldElement)
      }
    }
    
    Component.prototype.refresh = function () {
      var currentRender = render.currentRender()
      if (currentRender.mount.isComponentInDom(this.model)) {
        var oldElement = this.component.element
        beforeUpdate(this.model, oldElement)
        this.component.update(this.render())
        afterUpdate(this.model, this.component.element, oldElement)
      }
    }
    
    Component.prototype.destroy = function (element) {
      var self = this
    
      var meta = hyperdomMeta(this.model)
      meta.components.delete(this)
    
      if (self.model.onbeforeremove) {
        self.model.onbeforeremove(element)
      }
    
      if (self.model.onremove) {
        var currentRender = render.currentRender()
        currentRender.finished.then(function () {
          self.model.onremove(element)
        })
      }
    
      this.component.destroy()
    }
    
    module.exports = Component
    
    },{"./debuggingProperties":31,"./meta":38,"./render":44,"virtual-dom/vnode/vtext.js":89}],31:[function(require,module,exports){
    (function (process){
    var runRender = require('./render')
    var PropertyHook = require('./propertyHook')
    var VirtualNode = require('virtual-dom/vnode/vnode')
    
    module.exports = function (vdom, model) {
      if (process.env.NODE_ENV !== 'production' && vdom && vdom.constructor === VirtualNode) {
        if (!vdom.properties) {
          vdom.properties = {}
        }
    
        vdom.properties._hyperdomMeta = new PropertyHook({
          component: model,
          render: runRender.currentRender()
        })
      }
    
      return vdom
    }
    
    }).call(this,require('_process'))
    
    },{"./propertyHook":41,"./render":44,"_process":60,"virtual-dom/vnode/vnode":87}],32:[function(require,module,exports){
    (function (process){
    function deprecationWarning () {
      var warningIssued = false
    
      return function (arg) {
        if (process.env.NODE_ENV !== 'production' && !warningIssued) {
          console.warn(arg) // eslint-disable-line no-console
          warningIssued = true
        }
      }
    }
    
    module.exports = {
      refresh: deprecationWarning(),
      currentRender: deprecationWarning(),
      component: deprecationWarning(),
      renderFunction: deprecationWarning(),
      norefresh: deprecationWarning(),
      mapBinding: deprecationWarning(),
      viewComponent: deprecationWarning(),
      htmlRawHtml: deprecationWarning(),
      htmlBinding: deprecationWarning(),
      refreshAfter: deprecationWarning()
    }
    
    }).call(this,require('_process'))
    
    },{"_process":60}],33:[function(require,module,exports){
    var createElement = require('virtual-dom/create-element')
    var diff = require('virtual-dom/diff')
    var patch = require('virtual-dom/patch')
    var toVdom = require('./toVdom')
    var isVdom = require('./isVdom')
    
    function DomComponent (options) {
      this.document = options && options.document
    }
    
    function prepareVdom (object) {
      var vdom = toVdom(object)
      if (!isVdom(vdom)) {
        throw new Error('expected render to return vdom')
      } else {
        return vdom
      }
    }
    
    DomComponent.prototype.create = function (vdom) {
      this.vdom = prepareVdom(vdom)
      return (this.element = createElement(this.vdom, {document: this.document}))
    }
    
    DomComponent.prototype.merge = function (vdom, element) {
      this.vdom = prepareVdom(vdom)
      return (this.element = element)
    }
    
    DomComponent.prototype.update = function (vdom) {
      var oldVdom = this.vdom
      this.vdom = prepareVdom(vdom)
      var patches = diff(oldVdom, this.vdom)
      return (this.element = patch(this.element, patches))
    }
    
    DomComponent.prototype.destroy = function (options) {
      function destroyWidgets (vdom) {
        if (vdom.type === 'Widget') {
          vdom.destroy()
        } else if (vdom.children) {
          vdom.children.forEach(destroyWidgets)
        }
      }
    
      destroyWidgets(this.vdom)
    
      if (options && options.removeElement && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
      }
    }
    
    function domComponent (options) {
      return new DomComponent(options)
    }
    
    exports.create = domComponent
    
    },{"./isVdom":35,"./toVdom":49,"virtual-dom/create-element":68,"virtual-dom/diff":69,"virtual-dom/patch":70}],34:[function(require,module,exports){
    var rendering = require('./rendering')
    var render = require('./render')
    var viewComponent = require('./viewComponent')
    var deprecations = require('./deprecations')
    
    exports.html = rendering.html
    exports.html.refreshify = render.refreshify
    exports.rawHtml = rendering.rawHtml
    exports.jsx = rendering.jsx
    exports.attach = rendering.attach
    exports.replace = rendering.replace
    exports.append = rendering.append
    exports.appendVDom = rendering.appendVDom
    exports.binding = require('./binding')
    exports.meta = require('./meta')
    exports.refreshify = render.refreshify
    exports.norefresh = require('./refreshEventResult').norefresh
    exports.join = require('./join')
    exports.viewComponent = viewComponent
    exports.component = function (model) {
      deprecations.viewComponent('hyperdom.component is deprecated, use hyperdom.viewComponent instead')
      return viewComponent(model)
    }
    
    exports.currentRender = render.currentRender
    
    },{"./binding":29,"./deprecations":32,"./join":36,"./meta":38,"./refreshEventResult":43,"./render":44,"./rendering":45,"./viewComponent":51}],35:[function(require,module,exports){
    var virtualDomVersion = require('virtual-dom/vnode/version')
    
    module.exports = function (x) {
      var type = x.type
      if (type === 'VirtualNode' || type === 'VirtualText') {
        return x.version === virtualDomVersion
      } else {
        return type === 'Widget' || type === 'Thunk'
      }
    }
    
    },{"virtual-dom/vnode/version":86}],36:[function(require,module,exports){
    module.exports = function join (array, separator) {
      var output = []
      for (var i = 0, l = array.length; i < l; i++) {
        var item = array[i]
        if (i > 0) {
          output.push(separator)
        }
        output.push(item)
      }
      return output
    }
    
    },{}],37:[function(require,module,exports){
    var refreshify = require('./render').refreshify
    
    function ListenerHook (listener) {
      this.listener = refreshify(listener)
    }
    
    ListenerHook.prototype.hook = function (element, propertyName) {
      element.addEventListener(propertyName.substring(2), this.listener, false)
    }
    
    ListenerHook.prototype.unhook = function (element, propertyName) {
      element.removeEventListener(propertyName.substring(2), this.listener)
    }
    
    module.exports = function (listener) {
      return new ListenerHook(listener)
    }
    
    },{"./render":44}],38:[function(require,module,exports){
    module.exports = function (model, property) {
      var hyperdomMeta = model._hyperdomMeta
    
      if (!hyperdomMeta) {
        hyperdomMeta = {}
        Object.defineProperty(model, '_hyperdomMeta', {value: hyperdomMeta})
      }
    
      if (property) {
        var meta = hyperdomMeta[property]
    
        if (!meta) {
          meta = hyperdomMeta[property] = {}
        }
    
        return meta
      } else {
        return hyperdomMeta
      }
    }
    
    },{}],39:[function(require,module,exports){
    var hyperdomMeta = require('./meta')
    var runRender = require('./render')
    var domComponent = require('./domComponent')
    var Set = require('./set')
    var refreshEventResult = require('./refreshEventResult')
    
    var lastId = 0
    
    function Mount (model, options) {
      var win = (options && options.window) || window
      var router = typeof options === 'object' && options.hasOwnProperty('router') ? options.router : undefined
      this.requestRender = (options && options.requestRender) || win.requestAnimationFrame || win.setTimeout
    
      this.document = (options && options.document) || document
      this.model = model
    
      this.renderQueued = false
      this.mountRenderRequested = false
      this.componentRendersRequested = undefined
      this.id = ++lastId
      this.renderId = 0
      this.mounted = true
      this.router = router
    }
    
    Mount.prototype.refreshify = function (fn, options) {
      if (!fn) {
        return fn
      }
    
      if (options && (options.norefresh === true || options.refresh === false)) {
        return fn
      }
    
      var self = this
    
      return function () {
        var result = fn.apply(this, arguments)
        return refreshEventResult(result, self, options)
      }
    }
    
    Mount.prototype.transformFunctionAttribute = function (key, value) {
      return this.refreshify(value)
    }
    
    Mount.prototype.queueRender = function () {
      if (!this.renderQueued) {
        var self = this
    
        var requestRender = this.requestRender
        this.renderQueued = true
    
        requestRender(function () {
          self.renderQueued = false
    
          if (self.mounted) {
            if (self.mountRenderRequested) {
              self.refreshImmediately()
            } else if (self.componentRendersRequested) {
              self.refreshComponentsImmediately()
            }
          }
        })
      }
    }
    
    Mount.prototype.createDomComponent = function () {
      return domComponent.create({ document: this.document })
    }
    
    Mount.prototype.render = function () {
      if (this.router) {
        return this.router.render(this.model)
      } else {
        return this.model
      }
    }
    
    Mount.prototype.refresh = function () {
      this.mountRenderRequested = true
      this.queueRender()
    }
    
    Mount.prototype.refreshImmediately = function () {
      var self = this
    
      runRender(self, function () {
        self.renderId++
        var vdom = self.render()
        self.component.update(vdom)
        self.mountRenderRequested = false
      })
    }
    
    Mount.prototype.refreshComponentsImmediately = function () {
      var self = this
    
      runRender(self, function () {
        for (var i = 0, l = self.componentRendersRequested.length; i < l; i++) {
          var w = self.componentRendersRequested[i]
          w.refresh()
        }
        self.componentRendersRequested = undefined
      })
    }
    
    Mount.prototype.refreshComponent = function (component) {
      if (!this.componentRendersRequested) {
        this.componentRendersRequested = []
      }
    
      this.componentRendersRequested.push(component)
      this.queueRender()
    }
    
    Mount.prototype.isComponentInDom = function (component) {
      var meta = hyperdomMeta(component)
      return meta.lastRenderId === this.renderId
    }
    
    Mount.prototype.setupModelComponent = function (model) {
      var self = this
    
      var meta = hyperdomMeta(model)
    
      if (!meta.mount) {
        meta.mount = this
        meta.components = new Set()
    
        model.refresh = function () {
          self.refresh()
        }
    
        model.refreshImmediately = function () {
          self.refreshImmediately()
        }
    
        model.refreshComponent = function () {
          var meta = hyperdomMeta(this)
          meta.components.forEach(function (w) {
            self.refreshComponent(w)
          })
        }
    
        if (typeof model.onload === 'function') {
          this.refreshify(function () { return model.onload() }, {refresh: 'promise'})()
        }
      }
    }
    
    Mount.prototype.detach = function () {
      this.mounted = false
    }
    
    Mount.prototype.remove = function () {
      if (this.router) {
        this.router.reset()
      }
      this.component.destroy({removeElement: true})
      this.mounted = false
    }
    
    module.exports = Mount
    
    },{"./domComponent":33,"./meta":38,"./refreshEventResult":43,"./render":44,"./set":47}],40:[function(require,module,exports){
    (function (process){
    var render = require('./render')
    var bindModel = require('./bindModel')
    
    module.exports = function (tag, attributes, childElements) {
      var dataset
      var currentRender = render.currentRender()
    
      if (attributes.binding) {
        bindModel(tag, attributes, childElements)
        delete attributes.binding
      }
    
      var keys = Object.keys(attributes)
      for (var k = 0; k < keys.length; k++) {
        var key = keys[k]
        var attribute = attributes[key]
    
        if (typeof (attribute) === 'function' && currentRender) {
          attributes[key] = currentRender.transformFunctionAttribute(key, attribute)
        }
    
        var rename = renames[key]
        if (rename) {
          attributes[rename] = attribute
          delete attributes[key]
          continue
        }
    
        if (dataAttributeRegex.test(key)) {
          if (!dataset) {
            dataset = attributes.dataset
    
            if (!dataset) {
              dataset = attributes.dataset = {}
            }
          }
    
          var datakey = key
            .replace(dataAttributeRegex, '')
            .replace(/-([a-z])/ig, function (_, x) { return x.toUpperCase() })
    
          dataset[datakey] = attribute
          delete attributes[key]
          continue
        }
      }
    
      if (process.env.NODE_ENV !== 'production' && attributes.__source) {
        if (!dataset) {
          dataset = attributes.dataset
    
          if (!dataset) {
            dataset = attributes.dataset = {}
          }
        }
    
        dataset.fileName = attributes.__source.fileName
        dataset.lineNumber = attributes.__source.lineNumber
      }
    
      if (attributes.className) {
        attributes.className = generateClassName(attributes.className)
      }
    
      return attributes
    }
    
    var renames = {
      for: 'htmlFor',
      class: 'className',
      contenteditable: 'contentEditable',
      tabindex: 'tabIndex',
      colspan: 'colSpan'
    }
    
    var dataAttributeRegex = /^data-/
    
    function generateClassName (obj) {
      if (typeof (obj) === 'object') {
        if (obj instanceof Array) {
          var names = obj.map(function (item) {
            return generateClassName(item)
          })
          return names.join(' ') || undefined
        } else {
          return generateConditionalClassNames(obj)
        }
      } else {
        return obj
      }
    }
    
    function generateConditionalClassNames (obj) {
      return Object.keys(obj).filter(function (key) {
        return obj[key]
      }).join(' ') || undefined
    }
    
    }).call(this,require('_process'))
    
    },{"./bindModel":28,"./render":44,"_process":60}],41:[function(require,module,exports){
    function PropertyHook (value) {
      this.value = value
    }
    
    PropertyHook.prototype.hook = function (element, property) {
      element[property] = this.value
    }
    
    PropertyHook.prototype.unhook = function (element, property) {
      delete element[property]
    }
    
    module.exports = PropertyHook
    
    },{}],42:[function(require,module,exports){
    var render = require('./render')
    var refreshEventResult = require('./refreshEventResult')
    
    module.exports = function (promise) {
      refreshEventResult(promise, render.currentRender().mount, {refresh: 'promise'})
    }
    
    },{"./refreshEventResult":43,"./render":44}],43:[function(require,module,exports){
    var deprecations = require('./deprecations')
    
    module.exports = refreshEventResult
    
    var norefresh = {}
    
    function norefreshFunction () {
      return norefresh
    }
    
    module.exports.norefresh = norefreshFunction
    
    function refreshEventResult (result, mount, options) {
      var onlyRefreshAfterPromise = options && options.refresh === 'promise'
      var componentToRefresh = options && options.component
    
      if (result && typeof (result.then) === 'function') {
        result.then(function (result) {
          var opts = cloneOptions(options)
          opts.refresh = undefined
          refreshEventResult(result, mount, opts)
        })
      }
    
      if (onlyRefreshAfterPromise) {
        return
      }
    
      if (isComponent(result)) {
        mount.refreshComponent(result)
      } else if (result instanceof Array) {
        for (var i = 0; i < result.length; i++) {
          refreshEventResult(result[i], mount, options)
        }
      } else if (componentToRefresh) {
        if (componentToRefresh.refreshComponent) {
          componentToRefresh.refreshComponent()
        } else {
          componentToRefresh.refresh()
        }
      } else if (result === norefresh) {
        // don't refresh;
      } else if (result === norefreshFunction) {
        deprecations.norefresh('hyperdom.norefresh is deprecated, please use hyperdom.norefresh()')
        // don't refresh;
      } else {
        mount.refresh()
        return result
      }
    }
    
    function isComponent (component) {
      return component &&
        ((typeof component.init === 'function' &&
           typeof component.update === 'function' &&
           typeof component.destroy === 'function') || (typeof component.refreshComponent === 'function'))
    }
    
    function cloneOptions (options) {
      if (options) {
        return {
          norefresh: options.norefresh,
          refresh: options.refresh,
          component: options.component
        }
      } else {
        return {}
      }
    }
    
    },{"./deprecations":32}],44:[function(require,module,exports){
    var simplePromise = require('./simplePromise')
    
    function runRender (mount, fn) {
      var render = new Render(mount)
    
      try {
        runRender._currentRender = render
    
        return fn()
      } finally {
        render.finished.fulfill()
        runRender._currentRender = undefined
      }
    }
    
    function Render (mount) {
      this.finished = simplePromise()
      this.mount = mount
      this.attachment = mount
    }
    
    Render.prototype.transformFunctionAttribute = function () {
      return this.mount.transformFunctionAttribute.apply(this.mount, arguments)
    }
    
    module.exports = runRender
    module.exports.currentRender = currentRender
    module.exports.refreshify = refreshify
    module.exports.RefreshHook = RefreshHook
    
    function currentRender () {
      return runRender._currentRender || defaultRender
    }
    
    var defaultRender = {
      mount: {
        setupModelComponent: function () { },
        refreshify: function (fn) { return fn }
      },
    
      transformFunctionAttribute: function (key, value) {
        return new RefreshHook(value)
      },
    
      finished: {
        then: function (fn) {
          fn()
        }
      }
    }
    
    function refreshify (fn, options) {
      return runRender.currentRender().mount.refreshify(fn, options)
    }
    
    function RefreshHook (handler) {
      this.handler = handler
    }
    
    RefreshHook.prototype.hook = function (node, property) {
      node[property] = refreshify(this.handler)
    }
    
    RefreshHook.prototype.unhook = function (node, property) {
      node[property] = null
    }
    
    },{"./simplePromise":48}],45:[function(require,module,exports){
    var vhtml = require('./vhtml')
    var domComponent = require('./domComponent')
    var bindingMeta = require('./meta')
    var toVdom = require('./toVdom')
    var parseTag = require('virtual-dom/virtual-hyperscript/parse-tag')
    var Mount = require('./mount')
    var Component = require('./component')
    var render = require('./render')
    var deprecations = require('./deprecations')
    var prepareAttributes = require('./prepareAttributes')
    var binding = require('./binding')
    var refreshAfter = require('./refreshAfter')
    var refreshEventResult = require('./refreshEventResult')
    
    exports.append = function (element, render, model, options) {
      return startAttachment(render, model, options, function (mount, domComponentOptions) {
        var component = domComponent.create(domComponentOptions)
        var vdom = mount.render()
        element.appendChild(component.create(vdom))
        return component
      })
    }
    
    exports.replace = function (element, render, model, options) {
      return startAttachment(render, model, options, function (mount, domComponentOptions) {
        var component = domComponent.create(domComponentOptions)
        var vdom = mount.render()
        element.parentNode.replaceChild(component.create(vdom), element)
        return component
      })
    }
    
    exports.appendVDom = function (vdom, render, model, options) {
      return startAttachment(render, model, options, function (mount) {
        var component = {
          create: function (newVDom) {
            vdom.children = []
            if (newVDom) {
              vdom.children.push(toVdom(newVDom))
            }
          },
          update: function (newVDom) {
            vdom.children = []
            if (newVDom) {
              vdom.children.push(toVdom(newVDom))
            }
          }
        }
        component.create(mount.render())
        return component
      })
    }
    
    function startAttachment (render, model, options, attachToDom) {
      if (typeof render === 'object') {
        return start(render, attachToDom, model)
      } else {
        deprecations.renderFunction('hyperdom.append and hyperdom.replace with render functions are deprecated, please pass a component')
        return start({render: function () { return render(model) }}, attachToDom, options)
      }
    }
    
    function start (model, attachToDom, options) {
      var mount = new Mount(model, options)
      render(mount, function () {
        if (options) {
          var domComponentOptions = {document: options.document}
        }
        try {
          mount.component = attachToDom(mount, domComponentOptions)
        } catch (e) {
          mount.component = {
            update: function () {},
            destroy: function () {}
          }
          throw e
        }
      })
      return mount
    }
    
    /**
     * this function is quite ugly and you may be very tempted
     * to refactor it into smaller functions, I certainly am.
     * however, it was written like this for performance
     * so think of that before refactoring! :)
     */
    exports.html = function (hierarchySelector) {
      var hasHierarchy = hierarchySelector.indexOf(' ') >= 0
      var selector, selectorElements
    
      if (hasHierarchy) {
        selectorElements = hierarchySelector.match(/\S+/g)
        selector = selectorElements[selectorElements.length - 1]
      } else {
        selector = hierarchySelector
      }
    
      var childElements
      var vdom
      var tag
      var attributes = arguments[1]
    
      if (attributes && attributes.constructor === Object && typeof attributes.render !== 'function') {
        childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 2))
        prepareAttributes(selector, attributes, childElements)
        tag = parseTag(selector, attributes)
        vdom = vhtml(tag, attributes, childElements)
      } else {
        attributes = {}
        childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 1))
        tag = parseTag(selector, attributes)
        vdom = vhtml(tag, attributes, childElements)
      }
    
      if (hasHierarchy) {
        for (var n = selectorElements.length - 2; n >= 0; n--) {
          vdom = vhtml(selectorElements[n], {}, [vdom])
        }
      }
    
      return vdom
    }
    
    exports.jsx = function (tag, attributes) {
      var childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 2))
      if (typeof tag === 'string') {
        if (attributes) {
          prepareAttributes(tag, attributes, childElements)
        }
        return vhtml(tag, attributes || {}, childElements)
      } else {
        return new Component(new tag(attributes || {}, childElements), {viewComponent: true}) // eslint-disable-line new-cap
      }
    }
    
    Object.defineProperty(exports.html, 'currentRender', {get: function () {
      deprecations.currentRender('hyperdom.html.currentRender is deprecated, please use hyperdom.currentRender() instead')
      return render._currentRender
    }})
    
    Object.defineProperty(exports.html, 'refresh', {get: function () {
      deprecations.refresh('hyperdom.html.refresh is deprecated, please use component.refresh() instead')
      if (render._currentRender) {
        var currentRender = render._currentRender
        return function (result) {
          refreshEventResult(result, currentRender.mount)
        }
      } else {
        throw new Error('Please assign hyperdom.html.refresh during a render cycle if you want to use it in event handlers. See https://github.com/featurist/hyperdom#refresh-outside-render-cycle')
      }
    }})
    
    Object.defineProperty(exports.html, 'norefresh', {get: function () {
      deprecations.norefresh('hyperdom.html.norefresh is deprecated, please use hyperdom.norefresh() instead')
      return refreshEventResult.norefresh
    }})
    
    Object.defineProperty(exports.html, 'binding', {get: function () {
      deprecations.htmlBinding('hyperdom.html.binding() is deprecated, please use hyperdom.binding() instead')
      return binding
    }})
    
    Object.defineProperty(exports.html, 'refreshAfter', {get: function () {
      deprecations.refreshAfter("hyperdom.html.refreshAfter() is deprecated, please use require('hyperdom/refreshAfter')() instead")
      return refreshAfter
    }})
    
    exports.html.meta = bindingMeta
    
    function rawHtml () {
      var selector
      var html
      var options
    
      if (arguments.length === 2) {
        selector = arguments[0]
        html = arguments[1]
        options = {innerHTML: html}
        return exports.html(selector, options)
      } else {
        selector = arguments[0]
        options = arguments[1]
        html = arguments[2]
        options.innerHTML = html
        return exports.html(selector, options)
      }
    }
    
    exports.html.rawHtml = function () {
      deprecations.htmlRawHtml('hyperdom.html.rawHtml() is deprecated, please use hyperdom.rawHtml() instead')
      return rawHtml.apply(undefined, arguments)
    }
    
    exports.rawHtml = rawHtml
    
    },{"./binding":29,"./component":30,"./deprecations":32,"./domComponent":33,"./meta":38,"./mount":39,"./prepareAttributes":40,"./refreshAfter":42,"./refreshEventResult":43,"./render":44,"./toVdom":49,"./vhtml":50,"virtual-dom/virtual-hyperscript/parse-tag":79}],46:[function(require,module,exports){
    var makeBinding = require('./binding')
    var refreshify = require('./render').refreshify
    var runRender = require('./render')
    var refreshAfter = require('./refreshAfter')
    var h = require('./rendering').html
    var debuggingProperties = require('./debuggingProperties')
    
    function Router (options) {
      this._querystring = typeof options === 'object' && options.hasOwnProperty('querystring') ? options.querystring : new QueryString()
      this.history = typeof options === 'object' && options.hasOwnProperty('history') ? options.history : new PushState()
      this.baseUrl = typeof options === 'object' && options.hasOwnProperty('baseUrl') ? options.baseUrl : undefined
    }
    
    Router.prototype.reset = function () {
      this.lastUrl = undefined
      this.history.stop()
    }
    
    function walkRoutes (url, model, visit) {
      function walk (model) {
        var action
    
        if (typeof model.routes === 'function') {
          runRender.currentRender().mount.setupModelComponent(model)
    
          var routes = model.routes()
    
          for (var r = 0, l = routes.length; r < l; r++) {
            var route = routes[r]
    
            if (route && (typeof route.matchUrl === 'function' || route.notFound)) {
              action = visit(route)
            } else {
              action = walk(route)
            }
    
            if (action) {
              return layoutAction(model, action)
            }
          }
        } else {
          throw new Error('expected model to have routes method')
        }
      }
    
      return walk(model)
    }
    
    function matchRoute (url, model, isNewUrl) {
      var routesTried = []
      var notFound
    
      var action = walkRoutes(url, model, function (route) {
        var match
    
        if (route.notFound) {
          notFound = route
        } else {
          routesTried.push(route)
          if ((match = route.matchUrl(url))) {
            return isNewUrl
              ? route.set(url, match)
              : route.get(url, match)
          }
        }
      })
    
      return action || {
        render: function () {
          return (notFound ? notFound.render : renderNotFound)(url, routesTried)
        }
      }
    }
    
    function layoutAction (model, action) {
      var actionRender = action.render
    
      action.render = function () {
        if (typeof model.renderLayout === 'function') {
          return debuggingProperties(model.renderLayout(actionRender()), model)
        } else {
          return debuggingProperties(actionRender(), model)
        }
      }
    
      return action
    }
    
    Router.prototype.url = function () {
      var url = this.history.url()
      return removeBaseUrl(this.baseUrl, url)
    }
    
    Router.prototype.render = function (model) {
      var self = this
      this.history.start(model)
    
      function renderUrl (redirects) {
        var url = self.url()
        var isNewUrl = self.lastUrl !== url
        var action = matchRoute(url, model, isNewUrl)
    
        if (action.url) {
          if (self.lastUrl !== action.url) {
            if (action.push) {
              self.push(action.url)
            } else {
              self.replace(action.url)
            }
            self.lastUrl = self.url()
          }
        } else if (action.redirect) {
          if (redirects.length > 10) {
            throw new Error('hyperdom: too many redirects:\n  ' + redirects.join('\n  '))
          }
          self.replace(action.redirect)
          redirects.push(url)
          return renderUrl(redirects)
        } else {
          self.lastUrl = url
        }
    
        return action.render()
      }
    
      return renderUrl([])
    }
    
    function removeBaseUrl (baseUrl, url) {
      if (baseUrl) {
        if (url.indexOf(baseUrl) === 0) {
          var path = url.substring(baseUrl.length)
          return path[0] === '/' ? path : '/' + path
        } else {
          return url
        }
      } else {
        return url
      }
    }
    
    function addBaseUrl (baseUrl, url) {
      if (baseUrl) {
        if (url === '/') {
          return baseUrl
        } else {
          return baseUrl.replace(/\/$/, '') + '/' + url.replace(/^\//, '')
        }
      } else {
        return url
      }
    }
    
    Router.prototype.push = function (url) {
      this.history.push(addBaseUrl(this.baseUrl, url))
    }
    
    Router.prototype.replace = function (url) {
      this.history.replace(addBaseUrl(this.baseUrl, url))
    }
    
    function renderNotFound (url, routes) {
      return h('pre', h('code', 'no route for: ' + url + '\n\navailable routes:\n\n' + routes.map(function (r) { return '  ' + r.definition.pattern }).join('\n')))
    }
    
    Router.prototype.notFound = function (render) {
      return {
        notFound: true,
        render: render
      }
    }
    
    Router.prototype.route = function (pattern) {
      var routeDefinition = new RouteDefinition(pattern, this)
    
      function route (options) {
        return routeDefinition.route(options)
      }
    
      route.isActive = routeDefinition.isActive.bind(routeDefinition)
      route.params = routeDefinition.params.bind(routeDefinition)
      route.push = routeDefinition.push.bind(routeDefinition)
      route.replace = routeDefinition.replace.bind(routeDefinition)
      route.href = routeDefinition.href.bind(routeDefinition)
      route.url = routeDefinition.url.bind(routeDefinition)
    
      return route
    }
    
    function RouteDefinition (pattern, router) {
      var patternVariables = preparePattern(pattern)
    
      this.pattern = patternVariables.pattern
      this.variables = patternVariables.variables
      this.regex = patternVariables.regex
    
      this.router = router
    }
    
    RouteDefinition.prototype.route = function (options) {
      return new Route(options, this)
    }
    
    RouteDefinition.prototype.params = function (_url, _match) {
      var url = _url || this.router.url()
      var match = _match || this.matchUrl(url)
      var query = url.split('?')[1]
      var params = this.router._querystring.parse(query)
    
      if (match) {
        for (var n = 1; n < match.length; n++) {
          params[this.variables[n - 1]] = match[n]
        }
        return params
      }
    }
    
    RouteDefinition.prototype.matchUrl = function (url) {
      return this.regex.exec(url.split('?')[0])
    }
    
    RouteDefinition.prototype.isActive = function (params) {
      if (params) {
        var url = this.router.url()
        var p = {}
        extend(extend(p, this.params(url)), params)
        return this.router.url() === this.url(p)
      } else {
        return !!this.matchUrl(this.router.url())
      }
    }
    
    RouteDefinition.prototype.push = function (params, options) {
      this.router.push(this.url(params))
      if (!(options && options.resetScroll === false)) {
        window.scrollTo(0, 0)
      }
    }
    
    RouteDefinition.prototype.replace = function (params) {
      this.router.replace(this.url(params))
    }
    
    RouteDefinition.prototype.href = function (params, options) {
      return new HrefAttribute(this, params, options)
    }
    
    RouteDefinition.prototype.url = function (_params) {
      var params = _params || {}
      var onlyQueryParams = clone(params)
    
      var url = this.pattern.replace(/:([a-z_][a-z0-9_]*)\*/gi, function (_, id) {
        var param = params[id]
        delete onlyQueryParams[id]
        return encodeURI(paramToString(param))
      })
    
      url = url.replace(/:([a-z_][a-z0-9_]*)/gi, function (_, id) {
        var param = params[id]
        delete onlyQueryParams[id]
        return encodeURIComponent(paramToString(param))
      })
    
      var query = this.router._querystring.stringify(onlyQueryParams)
    
      if (query) {
        return url + '?' + query
      } else {
        return url
      }
    }
    
    function Route (options, definition) {
      this.definition = definition
    
      var bindings = typeof options === 'object' && options.hasOwnProperty('bindings') ? options.bindings : undefined
      this.bindings = bindings ? bindParams(bindings) : undefined
      this.onload = typeof options === 'object' && options.hasOwnProperty('onload') ? options.onload : undefined
      this.render = typeof options === 'object' && options.hasOwnProperty('render') ? options.render : undefined
      this.redirect = typeof options === 'object' && options.hasOwnProperty('redirect') ? options.redirect : undefined
    
      if (!this.render && !this.redirect) {
        throw new Error('expected route options to have either render or redirect function')
      }
    
      var push = typeof options === 'object' && options.hasOwnProperty('push') ? options.push : undefined
    
      if (typeof push === 'function') {
        this.push = push
      } else if (push instanceof Object) {
        this.push = function (oldParams, newParams) {
          return Object.keys(push).some(function (key) {
            return push[key] && (oldParams.hasOwnProperty(key) || newParams.hasOwnProperty(key)) && oldParams[key] !== newParams[key]
          })
        }
      } else {
        this.push = function () { return push }
      }
    }
    
    function bindParams (params) {
      var bindings = {}
    
      Object.keys(params).forEach(function (key) {
        bindings[key] = makeBinding(params[key], {refresh: 'promise'})
      })
    
      return bindings
    }
    
    Router.prototype.hasRoute = function (model, url) {
      var action = walkRoutes(url, model, function (route, match) {
        if (!route.notFound && (match = route.matchUrl(url))) {
          return {}
        }
      })
    
      return !!action
    }
    
    Route.prototype.matchUrl = function (url) {
      return this.definition.matchUrl(url)
    }
    
    Route.prototype.set = function (url, match) {
      var self = this
      var params = this.definition.params(url, match)
    
      if (this.redirect) {
        var redirectUrl = this.redirect(params)
        if (redirectUrl) {
          return {
            redirect: redirectUrl
          }
        }
      }
    
      if (this.bindings) {
        Object.keys(this.bindings).forEach(function (key) {
          var binding = self.bindings[key]
    
          if (binding && binding.set) {
            refreshAfter(binding.set(params[key]))
          }
        })
      }
    
      if (this.onload) {
        refreshAfter(self.onload(params))
      }
    
      return {
        render: this.render.bind(this)
      }
    }
    
    Route.prototype.get = function (url) {
      var self = this
    
      if (this.bindings) {
        var params = {}
        Object.keys(this.bindings).forEach(function (key) {
          var binding = self.bindings[key]
    
          if (binding && binding.get) {
            params[key] = binding.get()
          }
        })
    
        var oldParams = this.definition.params(url)
        var newUrl = this.definition.url(extend(extend({}, oldParams), params))
        var newParams = this.definition.params(newUrl)
        var push = this.push(oldParams, newParams)
      }
    
      return {
        url: newUrl,
        push: push,
        render: this.render.bind(this)
      }
    }
    
    function extend (a, b) {
      if (b) {
        var keys = Object.keys(b)
    
        for (var k = 0, l = keys.length; k < l; k++) {
          var key = keys[k]
          a[key] = b[key]
        }
    
        return a
      }
    }
    
    function clone (thing) {
      return JSON.parse(JSON.stringify(thing))
    }
    
    function paramToString (p) {
      if (p === undefined || p === null) {
        return ''
      } else {
        return p
      }
    }
    
    function escapeRegex (pattern) {
      return pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    }
    
    function compilePattern (pattern) {
      var anyRegex = /\\\*/ig
      var splatVariableRegex = /:[a-z\-_]+\\\*/ig
      var variableRegex = /:[-a-z_]+/ig
    
      return escapeRegex(pattern)
        .replace(splatVariableRegex, '(.+)')
        .replace(anyRegex, '.*')
        .replace(variableRegex, '([^/]+)')
    }
    
    function preparePattern (pattern) {
      var match
      var variableRegex = new RegExp(':([-a-z_]+)', 'ig')
      var variables = []
    
      while ((match = variableRegex.exec(pattern))) {
        variables.push(match[1])
      }
    
      var compiledPattern = compilePattern(pattern)
    
      return {
        pattern: pattern,
        regex: new RegExp('^' + compiledPattern + '$'),
        variables: variables
      }
    }
    
    function QueryString () {
    }
    
    QueryString.prototype.parse = function (search) {
      var params = {}
    
      if (search) {
        search.split('&').map(function (param) {
          var v = param.split('=').map(decodeURIComponent)
          params[v[0]] = v[1]
        })
      }
    
      return params
    }
    
    QueryString.prototype.stringify = function (paramsObject) {
      var query = Object.keys(paramsObject).map(function (key) {
        var param = paramToString(paramsObject[key])
    
        if (param !== '') {
          return encodeURIComponent(key) + '=' + encodeURIComponent(param)
        }
      }).filter(function (param) {
        return param
      }).join('&')
    
      return query
    }
    
    var PushState = function () {
    }
    
    PushState.prototype.start = function (model) {
      if (this.started) {
        return
      }
      this.started = true
    
      window.addEventListener('popstate', this.listener = function () {
        if (model) {
          model.refreshImmediately()
    
          // hack!
          // Chrome 56.0.2924.87 (64-bit)
          // explanation:
          // when you move back and forward in history the browser will remember the scroll
          // positions at each URL and then restore those scroll positions when you come
          // back to that URL, just like in normal navigation
          // However, the trick is to refresh the page so that it has the correct height
          // before that scroll takes place, which is what we do with model.refreshImmediately()
          // also, it seems that its necessary to call document.body.clientHeight to force it
          // to layout the page before attempting set the scroll position
          document.body.clientHeight // eslint-disable-line no-unused-expressions
        }
      })
    }
    
    PushState.prototype.stop = function () {
      this.started = false
      window.removeEventListener('popstate', this.listener)
    }
    
    PushState.prototype.url = function () {
      return window.location.pathname + window.location.search
    }
    
    PushState.prototype.push = function (url) {
      window.history.pushState(undefined, undefined, url)
    }
    
    PushState.prototype.state = function (state) {
      window.history.replaceState(state)
    }
    
    PushState.prototype.replace = function (url) {
      window.history.replaceState(undefined, undefined, url)
    }
    
    function Hash () {
    }
    
    Hash.prototype.start = function (model) {
      var self = this
      if (this.started) {
        return
      }
      this.started = true
    
      this.hashchangeListener = function () {
        if (self.started) {
          if (!self.pushed) {
            if (model) {
              model.refreshImmediately()
            }
          } else {
            self.pushed = false
          }
        }
      }
      window.addEventListener('hashchange', this.hashchangeListener)
    }
    
    Hash.prototype.stop = function () {
      this.started = false
      window.removeEventListener('hashchange', this.hashchangeListener)
    }
    
    Hash.prototype.url = function () {
      var path = window.location.hash || '#'
    
      var m = /^#(.*?)(\?.*)?$/.exec(path)
      var pathname = m[1]
      var search = m[2]
    
      return '/' + pathname + (search || '')
    }
    
    Hash.prototype.push = function (url) {
      this.pushed = true
      window.location.hash = url.replace(/^\//, '')
    }
    
    Hash.prototype.state = function () {
    }
    
    Hash.prototype.replace = function (url) {
      return this.push(url)
    }
    
    function HrefAttribute (routeDefinition, params, options) {
      this.href = routeDefinition.url(params)
      this.onclick = refreshify(function (event) {
        if (!event.metaKey) {
          routeDefinition.push(params, options)
          event.preventDefault()
        }
      })
    }
    
    HrefAttribute.prototype.hook = function (element) {
      element.href = this.href
      element.onclick = this.onclick
    }
    
    HrefAttribute.prototype.unhook = function (element) {
      element.onclick = null
    }
    
    exports = module.exports = new Router()
    
    exports.hash = function () {
      return new Hash()
    }
    
    exports.pushState = function () {
      return new PushState()
    }
    
    exports.querystring = function () {
      return new QueryString()
    }
    
    exports.router = function (options) {
      return new Router(options)
    }
    
    },{"./binding":29,"./debuggingProperties":31,"./refreshAfter":42,"./render":44,"./rendering":45}],47:[function(require,module,exports){
    if (typeof Set === 'function') {
      module.exports = Set
    } else {
      module.exports = function () {
        this.items = []
      }
    
      module.exports.prototype.add = function (widget) {
        if (this.items.indexOf(widget) === -1) {
          this.items.push(widget)
        }
      }
    
      module.exports.prototype.delete = function (widget) {
        var i = this.items.indexOf(widget)
        if (i !== -1) {
          this.items.splice(i, 1)
        }
      }
    
      module.exports.prototype.forEach = function (fn) {
        for (var n = 0; n < this.items.length; n++) {
          fn(this.items[n])
        }
      }
    }
    
    },{}],48:[function(require,module,exports){
    function SimplePromise () {
      this.listeners = []
    }
    
    SimplePromise.prototype.fulfill = function (value) {
      if (!this.isFulfilled) {
        this.isFulfilled = true
        this.value = value
        this.listeners.forEach(function (listener) {
          listener()
        })
      }
    }
    
    SimplePromise.prototype.then = function (success) {
      if (this.isFulfilled) {
        success(this.value)
      } else {
        this.listeners.push(success)
      }
    }
    
    module.exports = function () {
      return new SimplePromise()
    }
    
    },{}],49:[function(require,module,exports){
    var Vtext = require('virtual-dom/vnode/vtext.js')
    var isVdom = require('./isVdom')
    var Component = require('./component')
    
    function toVdom (object) {
      if (object === undefined || object === null) {
        return new Vtext('')
      } else if (typeof (object) !== 'object') {
        return new Vtext(String(object))
      } else if (object instanceof Date) {
        return new Vtext(String(object))
      } else if (object instanceof Error) {
        return new Vtext(object.toString())
      } else if (isVdom(object)) {
        return object
      } else if (typeof object.render === 'function') {
        return new Component(object)
      } else {
        return new Vtext(JSON.stringify(object))
      }
    }
    
    module.exports = toVdom
    
    function addChild (children, child) {
      if (child instanceof Array) {
        for (var n = 0; n < child.length; n++) {
          addChild(children, child[n])
        }
      } else {
        children.push(toVdom(child))
      }
    }
    
    module.exports.recursive = function (child) {
      var children = []
      addChild(children, child)
      return children
    }
    
    },{"./component":30,"./isVdom":35,"virtual-dom/vnode/vtext.js":89}],50:[function(require,module,exports){
    'use strict'
    
    var VNode = require('virtual-dom/vnode/vnode.js')
    var isHook = require('virtual-dom/vnode/is-vhook')
    var xml = require('./xml')
    
    var softSetHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js')
    
    module.exports = h
    
    function h (tagName, props, children) {
      var tag = tagName
    
      // support keys
      if (props.hasOwnProperty('key')) {
        var key = props.key
        props.key = undefined
      }
    
      // support namespace
      if (props.hasOwnProperty('namespace')) {
        var namespace = props.namespace
        props.namespace = undefined
      }
    
      // fix cursor bug
      if (tag.toLowerCase() === 'input' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
      ) {
        props.value = softSetHook(props.value)
      }
    
      var vnode = new VNode(tag, props, children, key, namespace)
    
      if (props.xmlns) {
        xml.transform(vnode)
      }
    
      return vnode
    }
    
    },{"./xml":52,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js":78,"virtual-dom/vnode/is-vhook":82,"virtual-dom/vnode/vnode.js":87}],51:[function(require,module,exports){
    var Component = require('./component')
    
    module.exports = function (model) {
      return new Component(model, {viewComponent: true})
    }
    
    },{"./component":30}],52:[function(require,module,exports){
    var AttributeHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook')
    
    var namespaceRegex = /^([a-z0-9_-]+)(--|:)([a-z0-9_-]+)$/i
    var xmlnsRegex = /^xmlns(--|:)([a-z0-9_-]+)$/i
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
    
    function transformTanName (vnode, namespaces) {
      var tagNamespace = namespaceRegex.exec(vnode.tagName)
      if (tagNamespace) {
        var namespaceKey = tagNamespace[1]
        var namespace = namespaces[namespaceKey]
        if (namespace) {
          vnode.tagName = tagNamespace[1] + ':' + tagNamespace[3]
          vnode.namespace = namespace
        }
      } else if (!vnode.namespace) {
        vnode.namespace = namespaces['']
      }
    }
    
    function transformProperties (vnode, namespaces) {
      var properties = vnode.properties
    
      if (properties) {
        var attributes = properties.attributes || (properties.attributes = {})
    
        var keys = Object.keys(properties)
        for (var k = 0, l = keys.length; k < l; k++) {
          var key = keys[k]
          if (key !== 'style' && key !== 'attributes') {
            var match = namespaceRegex.exec(key)
            if (match) {
              properties[match[1] + ':' + match[3]] = new AttributeHook(namespaces[match[1]], properties[key])
              delete properties[key]
            } else {
              if (vnode.namespace === SVG_NAMESPACE && key === 'className') {
                attributes['class'] = properties.className
                delete properties.className
              } else {
                var property = properties[key]
                var type = typeof property
                if (type === 'string' || type === 'number' || type === 'boolean') {
                  attributes[key] = property
                }
              }
            }
          }
        }
      }
    }
    
    function declaredNamespaces (vnode) {
      var namespaces = {
        '': vnode.properties.xmlns,
        xmlns: 'http://www.w3.org/2000/xmlns/'
      }
    
      var keys = Object.keys(vnode.properties)
    
      for (var k = 0, l = keys.length; k < l; k++) {
        var key = keys[k]
        var value = vnode.properties[key]
    
        if (key === 'xmlns') {
          namespaces[''] = value
        } else {
          var match = xmlnsRegex.exec(key)
    
          if (match) {
            namespaces[match[2]] = value
          }
        }
      }
    
      return namespaces
    }
    
    function transform (vnode) {
      var namespaces = declaredNamespaces(vnode)
    
      function transformChildren (vnode, namespaces) {
        transformTanName(vnode, namespaces)
        transformProperties(vnode, namespaces)
    
        if (vnode.children) {
          for (var c = 0, l = vnode.children.length; c < l; c++) {
            var child = vnode.children[c]
            if (!(child.properties && child.properties.xmlns)) {
              transformChildren(child, namespaces)
            }
          }
        }
      }
    
      transformChildren(vnode, namespaces)
    
      return vnode
    }
    
    module.exports.transform = transform
    
    },{"virtual-dom/virtual-hyperscript/hooks/attribute-hook":77}],53:[function(require,module,exports){
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? (nBytes - 1) : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]
    
      i += d
    
      e = s & ((1 << (-nBits)) - 1)
      s >>= (-nBits)
      nBits += eLen
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    
      m = e & ((1 << (-nBits)) - 1)
      e >>= (-nBits)
      nBits += mLen
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }
    
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
      var i = isLE ? 0 : (nBytes - 1)
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
    
      value = Math.abs(value)
    
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }
    
        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }
    
      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    
      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    
      buffer[offset + i - d] |= s * 128
    }
    
    },{}],54:[function(require,module,exports){
    (function (global){
    'use strict';
    var Mutation = global.MutationObserver || global.WebKitMutationObserver;
    
    var scheduleDrain;
    
    {
      if (Mutation) {
        var called = 0;
        var observer = new Mutation(nextTick);
        var element = global.document.createTextNode('');
        observer.observe(element, {
          characterData: true
        });
        scheduleDrain = function () {
          element.data = (called = ++called % 2);
        };
      } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = nextTick;
        scheduleDrain = function () {
          channel.port2.postMessage(0);
        };
      } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
        scheduleDrain = function () {
    
          // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
          // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
          var scriptEl = global.document.createElement('script');
          scriptEl.onreadystatechange = function () {
            nextTick();
    
            scriptEl.onreadystatechange = null;
            scriptEl.parentNode.removeChild(scriptEl);
            scriptEl = null;
          };
          global.document.documentElement.appendChild(scriptEl);
        };
      } else {
        scheduleDrain = function () {
          setTimeout(nextTick, 0);
        };
      }
    }
    
    var draining;
    var queue = [];
    //named nextTick for less confusing stack traces
    function nextTick() {
      draining = true;
      var i, oldQueue;
      var len = queue.length;
      while (len) {
        oldQueue = queue;
        queue = [];
        i = -1;
        while (++i < len) {
          oldQueue[i]();
        }
        len = queue.length;
      }
      draining = false;
    }
    
    module.exports = immediate;
    function immediate(task) {
      if (queue.push(task) === 1 && !draining) {
        scheduleDrain();
      }
    }
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{}],55:[function(require,module,exports){
    "use strict";
    
    module.exports = function isObject(x) {
        return typeof x === "object" && x !== null;
    };
    
    },{}],56:[function(require,module,exports){
    var toString = {}.toString;
    
    module.exports = Array.isArray || function (arr) {
      return toString.call(arr) == '[object Array]';
    };
    
    },{}],57:[function(require,module,exports){
    'use strict';
    var immediate = require('immediate');
    
    /* istanbul ignore next */
    function INTERNAL() {}
    
    var handlers = {};
    
    var REJECTED = ['REJECTED'];
    var FULFILLED = ['FULFILLED'];
    var PENDING = ['PENDING'];
    
    module.exports = exports = Promise;
    
    function Promise(resolver) {
      if (typeof resolver !== 'function') {
        throw new TypeError('resolver must be a function');
      }
      this.state = PENDING;
      this.queue = [];
      this.outcome = void 0;
      if (resolver !== INTERNAL) {
        safelyResolveThenable(this, resolver);
      }
    }
    
    Promise.prototype["catch"] = function (onRejected) {
      return this.then(null, onRejected);
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
      if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
        typeof onRejected !== 'function' && this.state === REJECTED) {
        return this;
      }
      var promise = new this.constructor(INTERNAL);
      if (this.state !== PENDING) {
        var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
        unwrap(promise, resolver, this.outcome);
      } else {
        this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
      }
    
      return promise;
    };
    function QueueItem(promise, onFulfilled, onRejected) {
      this.promise = promise;
      if (typeof onFulfilled === 'function') {
        this.onFulfilled = onFulfilled;
        this.callFulfilled = this.otherCallFulfilled;
      }
      if (typeof onRejected === 'function') {
        this.onRejected = onRejected;
        this.callRejected = this.otherCallRejected;
      }
    }
    QueueItem.prototype.callFulfilled = function (value) {
      handlers.resolve(this.promise, value);
    };
    QueueItem.prototype.otherCallFulfilled = function (value) {
      unwrap(this.promise, this.onFulfilled, value);
    };
    QueueItem.prototype.callRejected = function (value) {
      handlers.reject(this.promise, value);
    };
    QueueItem.prototype.otherCallRejected = function (value) {
      unwrap(this.promise, this.onRejected, value);
    };
    
    function unwrap(promise, func, value) {
      immediate(function () {
        var returnValue;
        try {
          returnValue = func(value);
        } catch (e) {
          return handlers.reject(promise, e);
        }
        if (returnValue === promise) {
          handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
        } else {
          handlers.resolve(promise, returnValue);
        }
      });
    }
    
    handlers.resolve = function (self, value) {
      var result = tryCatch(getThen, value);
      if (result.status === 'error') {
        return handlers.reject(self, result.value);
      }
      var thenable = result.value;
    
      if (thenable) {
        safelyResolveThenable(self, thenable);
      } else {
        self.state = FULFILLED;
        self.outcome = value;
        var i = -1;
        var len = self.queue.length;
        while (++i < len) {
          self.queue[i].callFulfilled(value);
        }
      }
      return self;
    };
    handlers.reject = function (self, error) {
      self.state = REJECTED;
      self.outcome = error;
      var i = -1;
      var len = self.queue.length;
      while (++i < len) {
        self.queue[i].callRejected(error);
      }
      return self;
    };
    
    function getThen(obj) {
      // Make sure we only access the accessor once as required by the spec
      var then = obj && obj.then;
      if (obj && typeof obj === 'object' && typeof then === 'function') {
        return function appyThen() {
          then.apply(obj, arguments);
        };
      }
    }
    
    function safelyResolveThenable(self, thenable) {
      // Either fulfill, reject or reject with error
      var called = false;
      function onError(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.reject(self, value);
      }
    
      function onSuccess(value) {
        if (called) {
          return;
        }
        called = true;
        handlers.resolve(self, value);
      }
    
      function tryToUnwrap() {
        thenable(onSuccess, onError);
      }
    
      var result = tryCatch(tryToUnwrap);
      if (result.status === 'error') {
        onError(result.value);
      }
    }
    
    function tryCatch(func, value) {
      var out = {};
      try {
        out.value = func(value);
        out.status = 'success';
      } catch (e) {
        out.status = 'error';
        out.value = e;
      }
      return out;
    }
    
    exports.resolve = resolve;
    function resolve(value) {
      if (value instanceof this) {
        return value;
      }
      return handlers.resolve(new this(INTERNAL), value);
    }
    
    exports.reject = reject;
    function reject(reason) {
      var promise = new this(INTERNAL);
      return handlers.reject(promise, reason);
    }
    
    exports.all = all;
    function all(iterable) {
      var self = this;
      if (Object.prototype.toString.call(iterable) !== '[object Array]') {
        return this.reject(new TypeError('must be an array'));
      }
    
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
    
      var values = new Array(len);
      var resolved = 0;
      var i = -1;
      var promise = new this(INTERNAL);
    
      while (++i < len) {
        allResolver(iterable[i], i);
      }
      return promise;
      function allResolver(value, i) {
        self.resolve(value).then(resolveFromAll, function (error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
        function resolveFromAll(outValue) {
          values[i] = outValue;
          if (++resolved === len && !called) {
            called = true;
            handlers.resolve(promise, values);
          }
        }
      }
    }
    
    exports.race = race;
    function race(iterable) {
      var self = this;
      if (Object.prototype.toString.call(iterable) !== '[object Array]') {
        return this.reject(new TypeError('must be an array'));
      }
    
      var len = iterable.length;
      var called = false;
      if (!len) {
        return this.resolve([]);
      }
    
      var i = -1;
      var promise = new this(INTERNAL);
    
      while (++i < len) {
        resolver(iterable[i]);
      }
      return promise;
      function resolver(value) {
        self.resolve(value).then(function (response) {
          if (!called) {
            called = true;
            handlers.resolve(promise, response);
          }
        }, function (error) {
          if (!called) {
            called = true;
            handlers.reject(promise, error);
          }
        });
      }
    }
    
    },{"immediate":54}],58:[function(require,module,exports){
    (function (global){
    'use strict';
    if (typeof global.Promise !== 'function') {
      global.Promise = require('./lib');
    }
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{"./lib":57}],59:[function(require,module,exports){
    module.exports = function(list, iteratee) {
      if (typeof iteratee == 'string') {
        var fieldName = iteratee;
        iteratee = undefined;
      }
    
      var index = {};
    
      for(var n = 0; n < list.length; n++) {
        var item = list[n];
        var key = iteratee? iteratee(item): item[fieldName];
    
        index[key] = item;
      }
    
      return index;
    };
    
    },{}],60:[function(require,module,exports){
    // shim for using process in browser
    var process = module.exports = {};
    
    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.
    
    var cachedSetTimeout;
    var cachedClearTimeout;
    
    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    (function () {
        try {
            if (typeof setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            } else {
                cachedSetTimeout = defaultSetTimout;
            }
        } catch (e) {
            cachedSetTimeout = defaultSetTimout;
        }
        try {
            if (typeof clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            } else {
                cachedClearTimeout = defaultClearTimeout;
            }
        } catch (e) {
            cachedClearTimeout = defaultClearTimeout;
        }
    } ())
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    
    
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }
    
    
    
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    
    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }
    
    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
    
        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    
    process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    };
    
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};
    
    function noop() {}
    
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    
    process.listeners = function (name) { return [] }
    
    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };
    
    process.cwd = function () { return '/' };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function() { return 0; };
    
    },{}],61:[function(require,module,exports){
    (function (global){
    /*! https://mths.be/punycode v1.4.1 by @mathias */
    ;(function(root) {
    
        /** Detect free variables */
        var freeExports = typeof exports == 'object' && exports &&
            !exports.nodeType && exports;
        var freeModule = typeof module == 'object' && module &&
            !module.nodeType && module;
        var freeGlobal = typeof global == 'object' && global;
        if (
            freeGlobal.global === freeGlobal ||
            freeGlobal.window === freeGlobal ||
            freeGlobal.self === freeGlobal
        ) {
            root = freeGlobal;
        }
    
        /**
         * The `punycode` object.
         * @name punycode
         * @type Object
         */
        var punycode,
    
        /** Highest positive signed 32-bit float value */
        maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1
    
        /** Bootstring parameters */
        base = 36,
        tMin = 1,
        tMax = 26,
        skew = 38,
        damp = 700,
        initialBias = 72,
        initialN = 128, // 0x80
        delimiter = '-', // '\x2D'
    
        /** Regular expressions */
        regexPunycode = /^xn--/,
        regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
        regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators
    
        /** Error messages */
        errors = {
            'overflow': 'Overflow: input needs wider integers to process',
            'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
            'invalid-input': 'Invalid input'
        },
    
        /** Convenience shortcuts */
        baseMinusTMin = base - tMin,
        floor = Math.floor,
        stringFromCharCode = String.fromCharCode,
    
        /** Temporary variable */
        key;
    
        /*--------------------------------------------------------------------------*/
    
        /**
         * A generic error utility function.
         * @private
         * @param {String} type The error type.
         * @returns {Error} Throws a `RangeError` with the applicable error message.
         */
        function error(type) {
            throw new RangeError(errors[type]);
        }
    
        /**
         * A generic `Array#map` utility function.
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} callback The function that gets called for every array
         * item.
         * @returns {Array} A new array of values returned by the callback function.
         */
        function map(array, fn) {
            var length = array.length;
            var result = [];
            while (length--) {
                result[length] = fn(array[length]);
            }
            return result;
        }
    
        /**
         * A simple `Array#map`-like wrapper to work with domain name strings or email
         * addresses.
         * @private
         * @param {String} domain The domain name or email address.
         * @param {Function} callback The function that gets called for every
         * character.
         * @returns {Array} A new string of characters returned by the callback
         * function.
         */
        function mapDomain(string, fn) {
            var parts = string.split('@');
            var result = '';
            if (parts.length > 1) {
                // In email addresses, only the domain name should be punycoded. Leave
                // the local part (i.e. everything up to `@`) intact.
                result = parts[0] + '@';
                string = parts[1];
            }
            // Avoid `split(regex)` for IE8 compatibility. See #17.
            string = string.replace(regexSeparators, '\x2E');
            var labels = string.split('.');
            var encoded = map(labels, fn).join('.');
            return result + encoded;
        }
    
        /**
         * Creates an array containing the numeric code points of each Unicode
         * character in the string. While JavaScript uses UCS-2 internally,
         * this function will convert a pair of surrogate halves (each of which
         * UCS-2 exposes as separate characters) into a single code point,
         * matching UTF-16.
         * @see `punycode.ucs2.encode`
         * @see <https://mathiasbynens.be/notes/javascript-encoding>
         * @memberOf punycode.ucs2
         * @name decode
         * @param {String} string The Unicode input string (UCS-2).
         * @returns {Array} The new array of code points.
         */
        function ucs2decode(string) {
            var output = [],
                counter = 0,
                length = string.length,
                value,
                extra;
            while (counter < length) {
                value = string.charCodeAt(counter++);
                if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                    // high surrogate, and there is a next character
                    extra = string.charCodeAt(counter++);
                    if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                    } else {
                        // unmatched surrogate; only append this code unit, in case the next
                        // code unit is the high surrogate of a surrogate pair
                        output.push(value);
                        counter--;
                    }
                } else {
                    output.push(value);
                }
            }
            return output;
        }
    
        /**
         * Creates a string based on an array of numeric code points.
         * @see `punycode.ucs2.decode`
         * @memberOf punycode.ucs2
         * @name encode
         * @param {Array} codePoints The array of numeric code points.
         * @returns {String} The new Unicode string (UCS-2).
         */
        function ucs2encode(array) {
            return map(array, function(value) {
                var output = '';
                if (value > 0xFFFF) {
                    value -= 0x10000;
                    output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                    value = 0xDC00 | value & 0x3FF;
                }
                output += stringFromCharCode(value);
                return output;
            }).join('');
        }
    
        /**
         * Converts a basic code point into a digit/integer.
         * @see `digitToBasic()`
         * @private
         * @param {Number} codePoint The basic numeric code point value.
         * @returns {Number} The numeric value of a basic code point (for use in
         * representing integers) in the range `0` to `base - 1`, or `base` if
         * the code point does not represent a value.
         */
        function basicToDigit(codePoint) {
            if (codePoint - 48 < 10) {
                return codePoint - 22;
            }
            if (codePoint - 65 < 26) {
                return codePoint - 65;
            }
            if (codePoint - 97 < 26) {
                return codePoint - 97;
            }
            return base;
        }
    
        /**
         * Converts a digit/integer into a basic code point.
         * @see `basicToDigit()`
         * @private
         * @param {Number} digit The numeric value of a basic code point.
         * @returns {Number} The basic code point whose value (when used for
         * representing integers) is `digit`, which needs to be in the range
         * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
         * used; else, the lowercase form is used. The behavior is undefined
         * if `flag` is non-zero and `digit` has no uppercase form.
         */
        function digitToBasic(digit, flag) {
            //  0..25 map to ASCII a..z or A..Z
            // 26..35 map to ASCII 0..9
            return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
        }
    
        /**
         * Bias adaptation function as per section 3.4 of RFC 3492.
         * https://tools.ietf.org/html/rfc3492#section-3.4
         * @private
         */
        function adapt(delta, numPoints, firstTime) {
            var k = 0;
            delta = firstTime ? floor(delta / damp) : delta >> 1;
            delta += floor(delta / numPoints);
            for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
                delta = floor(delta / baseMinusTMin);
            }
            return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
        }
    
        /**
         * Converts a Punycode string of ASCII-only symbols to a string of Unicode
         * symbols.
         * @memberOf punycode
         * @param {String} input The Punycode string of ASCII-only symbols.
         * @returns {String} The resulting string of Unicode symbols.
         */
        function decode(input) {
            // Don't use UCS-2
            var output = [],
                inputLength = input.length,
                out,
                i = 0,
                n = initialN,
                bias = initialBias,
                basic,
                j,
                index,
                oldi,
                w,
                k,
                digit,
                t,
                /** Cached calculation results */
                baseMinusT;
    
            // Handle the basic code points: let `basic` be the number of input code
            // points before the last delimiter, or `0` if there is none, then copy
            // the first basic code points to the output.
    
            basic = input.lastIndexOf(delimiter);
            if (basic < 0) {
                basic = 0;
            }
    
            for (j = 0; j < basic; ++j) {
                // if it's not a basic code point
                if (input.charCodeAt(j) >= 0x80) {
                    error('not-basic');
                }
                output.push(input.charCodeAt(j));
            }
    
            // Main decoding loop: start just after the last delimiter if any basic code
            // points were copied; start at the beginning otherwise.
    
            for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {
    
                // `index` is the index of the next character to be consumed.
                // Decode a generalized variable-length integer into `delta`,
                // which gets added to `i`. The overflow checking is easier
                // if we increase `i` as we go, then subtract off its starting
                // value at the end to obtain `delta`.
                for (oldi = i, w = 1, k = base; /* no condition */; k += base) {
    
                    if (index >= inputLength) {
                        error('invalid-input');
                    }
    
                    digit = basicToDigit(input.charCodeAt(index++));
    
                    if (digit >= base || digit > floor((maxInt - i) / w)) {
                        error('overflow');
                    }
    
                    i += digit * w;
                    t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
    
                    if (digit < t) {
                        break;
                    }
    
                    baseMinusT = base - t;
                    if (w > floor(maxInt / baseMinusT)) {
                        error('overflow');
                    }
    
                    w *= baseMinusT;
    
                }
    
                out = output.length + 1;
                bias = adapt(i - oldi, out, oldi == 0);
    
                // `i` was supposed to wrap around from `out` to `0`,
                // incrementing `n` each time, so we'll fix that now:
                if (floor(i / out) > maxInt - n) {
                    error('overflow');
                }
    
                n += floor(i / out);
                i %= out;
    
                // Insert `n` at position `i` of the output
                output.splice(i++, 0, n);
    
            }
    
            return ucs2encode(output);
        }
    
        /**
         * Converts a string of Unicode symbols (e.g. a domain name label) to a
         * Punycode string of ASCII-only symbols.
         * @memberOf punycode
         * @param {String} input The string of Unicode symbols.
         * @returns {String} The resulting Punycode string of ASCII-only symbols.
         */
        function encode(input) {
            var n,
                delta,
                handledCPCount,
                basicLength,
                bias,
                j,
                m,
                q,
                k,
                t,
                currentValue,
                output = [],
                /** `inputLength` will hold the number of code points in `input`. */
                inputLength,
                /** Cached calculation results */
                handledCPCountPlusOne,
                baseMinusT,
                qMinusT;
    
            // Convert the input in UCS-2 to Unicode
            input = ucs2decode(input);
    
            // Cache the length
            inputLength = input.length;
    
            // Initialize the state
            n = initialN;
            delta = 0;
            bias = initialBias;
    
            // Handle the basic code points
            for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue < 0x80) {
                    output.push(stringFromCharCode(currentValue));
                }
            }
    
            handledCPCount = basicLength = output.length;
    
            // `handledCPCount` is the number of code points that have been handled;
            // `basicLength` is the number of basic code points.
    
            // Finish the basic string - if it is not empty - with a delimiter
            if (basicLength) {
                output.push(delimiter);
            }
    
            // Main encoding loop:
            while (handledCPCount < inputLength) {
    
                // All non-basic code points < n have been handled already. Find the next
                // larger one:
                for (m = maxInt, j = 0; j < inputLength; ++j) {
                    currentValue = input[j];
                    if (currentValue >= n && currentValue < m) {
                        m = currentValue;
                    }
                }
    
                // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
                // but guard against overflow
                handledCPCountPlusOne = handledCPCount + 1;
                if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                    error('overflow');
                }
    
                delta += (m - n) * handledCPCountPlusOne;
                n = m;
    
                for (j = 0; j < inputLength; ++j) {
                    currentValue = input[j];
    
                    if (currentValue < n && ++delta > maxInt) {
                        error('overflow');
                    }
    
                    if (currentValue == n) {
                        // Represent delta as a generalized variable-length integer
                        for (q = delta, k = base; /* no condition */; k += base) {
                            t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                            if (q < t) {
                                break;
                            }
                            qMinusT = q - t;
                            baseMinusT = base - t;
                            output.push(
                                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
                            );
                            q = floor(qMinusT / baseMinusT);
                        }
    
                        output.push(stringFromCharCode(digitToBasic(q, 0)));
                        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                        delta = 0;
                        ++handledCPCount;
                    }
                }
    
                ++delta;
                ++n;
    
            }
            return output.join('');
        }
    
        /**
         * Converts a Punycode string representing a domain name or an email address
         * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
         * it doesn't matter if you call it on a string that has already been
         * converted to Unicode.
         * @memberOf punycode
         * @param {String} input The Punycoded domain name or email address to
         * convert to Unicode.
         * @returns {String} The Unicode representation of the given Punycode
         * string.
         */
        function toUnicode(input) {
            return mapDomain(input, function(string) {
                return regexPunycode.test(string)
                    ? decode(string.slice(4).toLowerCase())
                    : string;
            });
        }
    
        /**
         * Converts a Unicode string representing a domain name or an email address to
         * Punycode. Only the non-ASCII parts of the domain name will be converted,
         * i.e. it doesn't matter if you call it with a domain that's already in
         * ASCII.
         * @memberOf punycode
         * @param {String} input The domain name or email address to convert, as a
         * Unicode string.
         * @returns {String} The Punycode representation of the given domain name or
         * email address.
         */
        function toASCII(input) {
            return mapDomain(input, function(string) {
                return regexNonASCII.test(string)
                    ? 'xn--' + encode(string)
                    : string;
            });
        }
    
        /*--------------------------------------------------------------------------*/
    
        /** Define the public API */
        punycode = {
            /**
             * A string representing the current Punycode.js version number.
             * @memberOf punycode
             * @type String
             */
            'version': '1.4.1',
            /**
             * An object of methods to convert from JavaScript's internal character
             * representation (UCS-2) to Unicode code points, and back.
             * @see <https://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode
             * @type Object
             */
            'ucs2': {
                'decode': ucs2decode,
                'encode': ucs2encode
            },
            'decode': decode,
            'encode': encode,
            'toASCII': toASCII,
            'toUnicode': toUnicode
        };
    
        /** Expose `punycode` */
        // Some AMD build optimizers, like r.js, check for specific condition patterns
        // like the following:
        if (
            typeof define == 'function' &&
            typeof define.amd == 'object' &&
            define.amd
        ) {
            define('punycode', function() {
                return punycode;
            });
        } else if (freeExports && freeModule) {
            if (module.exports == freeExports) {
                // in Node.js, io.js, or RingoJS v0.8.0+
                freeModule.exports = punycode;
            } else {
                // in Narwhal or RingoJS v0.7.0-
                for (key in punycode) {
                    punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
                }
            }
        } else {
            // in Rhino or a web browser
            root.punycode = punycode;
        }
    
    }(this));
    
    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    
    },{}],62:[function(require,module,exports){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    'use strict';
    
    // If obj.hasOwnProperty has been overridden, then calling
    // obj.hasOwnProperty(prop) will break.
    // See: https://github.com/joyent/node/issues/1707
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    
    module.exports = function(qs, sep, eq, options) {
      sep = sep || '&';
      eq = eq || '=';
      var obj = {};
    
      if (typeof qs !== 'string' || qs.length === 0) {
        return obj;
      }
    
      var regexp = /\+/g;
      qs = qs.split(sep);
    
      var maxKeys = 1000;
      if (options && typeof options.maxKeys === 'number') {
        maxKeys = options.maxKeys;
      }
    
      var len = qs.length;
      // maxKeys <= 0 means that we should not limit keys count
      if (maxKeys > 0 && len > maxKeys) {
        len = maxKeys;
      }
    
      for (var i = 0; i < len; ++i) {
        var x = qs[i].replace(regexp, '%20'),
            idx = x.indexOf(eq),
            kstr, vstr, k, v;
    
        if (idx >= 0) {
          kstr = x.substr(0, idx);
          vstr = x.substr(idx + 1);
        } else {
          kstr = x;
          vstr = '';
        }
    
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
    
        if (!hasOwnProperty(obj, k)) {
          obj[k] = v;
        } else if (isArray(obj[k])) {
          obj[k].push(v);
        } else {
          obj[k] = [obj[k], v];
        }
      }
    
      return obj;
    };
    
    var isArray = Array.isArray || function (xs) {
      return Object.prototype.toString.call(xs) === '[object Array]';
    };
    
    },{}],63:[function(require,module,exports){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    'use strict';
    
    var stringifyPrimitive = function(v) {
      switch (typeof v) {
        case 'string':
          return v;
    
        case 'boolean':
          return v ? 'true' : 'false';
    
        case 'number':
          return isFinite(v) ? v : '';
    
        default:
          return '';
      }
    };
    
    module.exports = function(obj, sep, eq, name) {
      sep = sep || '&';
      eq = eq || '=';
      if (obj === null) {
        obj = undefined;
      }
    
      if (typeof obj === 'object') {
        return map(objectKeys(obj), function(k) {
          var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
          if (isArray(obj[k])) {
            return map(obj[k], function(v) {
              return ks + encodeURIComponent(stringifyPrimitive(v));
            }).join(sep);
          } else {
            return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
          }
        }).join(sep);
    
      }
    
      if (!name) return '';
      return encodeURIComponent(stringifyPrimitive(name)) + eq +
             encodeURIComponent(stringifyPrimitive(obj));
    };
    
    var isArray = Array.isArray || function (xs) {
      return Object.prototype.toString.call(xs) === '[object Array]';
    };
    
    function map (xs, f) {
      if (xs.map) return xs.map(f);
      var res = [];
      for (var i = 0; i < xs.length; i++) {
        res.push(f(xs[i], i));
      }
      return res;
    }
    
    var objectKeys = Object.keys || function (obj) {
      var res = [];
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
      }
      return res;
    };
    
    },{}],64:[function(require,module,exports){
    'use strict';
    
    exports.decode = exports.parse = require('./decode');
    exports.encode = exports.stringify = require('./encode');
    
    },{"./decode":62,"./encode":63}],65:[function(require,module,exports){
    /*
     * random-string
     * https://github.com/valiton/node-random-string
     *
     * Copyright (c) 2013 Valiton GmbH, Bastian 'hereandnow' Behrens
     * Licensed under the MIT license.
     */
    
    'use strict';
    
    var numbers = '0123456789',
        letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        specials = '!$%^&*()_+|~-=`{}[]:;<>?,./';
    
    
    function _defaults (opts) {
      opts || (opts = {});
      return {
        length: opts.length || 8,
        numeric: typeof opts.numeric === 'boolean' ? opts.numeric : true,
        letters: typeof opts.letters === 'boolean' ? opts.letters : true,
        special: typeof opts.special === 'boolean' ? opts.special : false
      };
    }
    
    function _buildChars (opts) {
      var chars = '';
      if (opts.numeric) { chars += numbers; }
      if (opts.letters) { chars += letters; }
      if (opts.special) { chars += specials; }
      return chars;
    }
    
    module.exports = function randomString(opts) {
      opts = _defaults(opts);
      var i, rn,
          rnd = '',
          len = opts.length,
          randomChars = _buildChars(opts);
      for (i = 1; i <= len; i++) {
        rnd += randomChars.substring(rn = Math.floor(Math.random() * randomChars.length), rn + 1);
      }
      return rnd;
    };
    
    },{}],66:[function(require,module,exports){
    // Copyright Joyent, Inc. and other Node contributors.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a
    // copy of this software and associated documentation files (the
    // "Software"), to deal in the Software without restriction, including
    // without limitation the rights to use, copy, modify, merge, publish,
    // distribute, sublicense, and/or sell copies of the Software, and to permit
    // persons to whom the Software is furnished to do so, subject to the
    // following conditions:
    //
    // The above copyright notice and this permission notice shall be included
    // in all copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
    // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
    // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
    // USE OR OTHER DEALINGS IN THE SOFTWARE.
    
    'use strict';
    
    var punycode = require('punycode');
    var util = require('./util');
    
    exports.parse = urlParse;
    exports.resolve = urlResolve;
    exports.resolveObject = urlResolveObject;
    exports.format = urlFormat;
    
    exports.Url = Url;
    
    function Url() {
      this.protocol = null;
      this.slashes = null;
      this.auth = null;
      this.host = null;
      this.port = null;
      this.hostname = null;
      this.hash = null;
      this.search = null;
      this.query = null;
      this.pathname = null;
      this.path = null;
      this.href = null;
    }
    
    // Reference: RFC 3986, RFC 1808, RFC 2396
    
    // define these here so at least they only have to be
    // compiled once on the first module load.
    var protocolPattern = /^([a-z0-9.+-]+:)/i,
        portPattern = /:[0-9]*$/,
    
        // Special case for a simple path URL
        simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
    
        // RFC 2396: characters reserved for delimiting URLs.
        // We actually just auto-escape these.
        delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    
        // RFC 2396: characters not allowed for various reasons.
        unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
    
        // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
        autoEscape = ['\''].concat(unwise),
        // Characters that are never ever allowed in a hostname.
        // Note that any invalid chars are also handled, but these
        // are the ones that are *expected* to be seen, so we fast-path
        // them.
        nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
        hostEndingChars = ['/', '?', '#'],
        hostnameMaxLen = 255,
        hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
        hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
        // protocols that can allow "unsafe" and "unwise" chars.
        unsafeProtocol = {
          'javascript': true,
          'javascript:': true
        },
        // protocols that never have a hostname.
        hostlessProtocol = {
          'javascript': true,
          'javascript:': true
        },
        // protocols that always contain a // bit.
        slashedProtocol = {
          'http': true,
          'https': true,
          'ftp': true,
          'gopher': true,
          'file': true,
          'http:': true,
          'https:': true,
          'ftp:': true,
          'gopher:': true,
          'file:': true
        },
        querystring = require('querystring');
    
    function urlParse(url, parseQueryString, slashesDenoteHost) {
      if (url && util.isObject(url) && url instanceof Url) return url;
    
      var u = new Url;
      u.parse(url, parseQueryString, slashesDenoteHost);
      return u;
    }
    
    Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
      if (!util.isString(url)) {
        throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
      }
    
      // Copy chrome, IE, opera backslash-handling behavior.
      // Back slashes before the query string get converted to forward slashes
      // See: https://code.google.com/p/chromium/issues/detail?id=25916
      var queryIndex = url.indexOf('?'),
          splitter =
              (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
          uSplit = url.split(splitter),
          slashRegex = /\\/g;
      uSplit[0] = uSplit[0].replace(slashRegex, '/');
      url = uSplit.join(splitter);
    
      var rest = url;
    
      // trim before proceeding.
      // This is to support parse stuff like "  http://foo.com  \n"
      rest = rest.trim();
    
      if (!slashesDenoteHost && url.split('#').length === 1) {
        // Try fast path regexp
        var simplePath = simplePathPattern.exec(rest);
        if (simplePath) {
          this.path = rest;
          this.href = rest;
          this.pathname = simplePath[1];
          if (simplePath[2]) {
            this.search = simplePath[2];
            if (parseQueryString) {
              this.query = querystring.parse(this.search.substr(1));
            } else {
              this.query = this.search.substr(1);
            }
          } else if (parseQueryString) {
            this.search = '';
            this.query = {};
          }
          return this;
        }
      }
    
      var proto = protocolPattern.exec(rest);
      if (proto) {
        proto = proto[0];
        var lowerProto = proto.toLowerCase();
        this.protocol = lowerProto;
        rest = rest.substr(proto.length);
      }
    
      // figure out if it's got a host
      // user@server is *always* interpreted as a hostname, and url
      // resolution will treat //foo/bar as host=foo,path=bar because that's
      // how the browser resolves relative URLs.
      if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
        var slashes = rest.substr(0, 2) === '//';
        if (slashes && !(proto && hostlessProtocol[proto])) {
          rest = rest.substr(2);
          this.slashes = true;
        }
      }
    
      if (!hostlessProtocol[proto] &&
          (slashes || (proto && !slashedProtocol[proto]))) {
    
        // there's a hostname.
        // the first instance of /, ?, ;, or # ends the host.
        //
        // If there is an @ in the hostname, then non-host chars *are* allowed
        // to the left of the last @ sign, unless some host-ending character
        // comes *before* the @-sign.
        // URLs are obnoxious.
        //
        // ex:
        // http://a@b@c/ => user:a@b host:c
        // http://a@b?@c => user:a host:c path:/?@c
    
        // v0.12 TODO(isaacs): This is not quite how Chrome does things.
        // Review our test case against browsers more comprehensively.
    
        // find the first instance of any hostEndingChars
        var hostEnd = -1;
        for (var i = 0; i < hostEndingChars.length; i++) {
          var hec = rest.indexOf(hostEndingChars[i]);
          if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
            hostEnd = hec;
        }
    
        // at this point, either we have an explicit point where the
        // auth portion cannot go past, or the last @ char is the decider.
        var auth, atSign;
        if (hostEnd === -1) {
          // atSign can be anywhere.
          atSign = rest.lastIndexOf('@');
        } else {
          // atSign must be in auth portion.
          // http://a@b/c@d => host:b auth:a path:/c@d
          atSign = rest.lastIndexOf('@', hostEnd);
        }
    
        // Now we have a portion which is definitely the auth.
        // Pull that off.
        if (atSign !== -1) {
          auth = rest.slice(0, atSign);
          rest = rest.slice(atSign + 1);
          this.auth = decodeURIComponent(auth);
        }
    
        // the host is the remaining to the left of the first non-host char
        hostEnd = -1;
        for (var i = 0; i < nonHostChars.length; i++) {
          var hec = rest.indexOf(nonHostChars[i]);
          if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
            hostEnd = hec;
        }
        // if we still have not hit it, then the entire thing is a host.
        if (hostEnd === -1)
          hostEnd = rest.length;
    
        this.host = rest.slice(0, hostEnd);
        rest = rest.slice(hostEnd);
    
        // pull out port.
        this.parseHost();
    
        // we've indicated that there is a hostname,
        // so even if it's empty, it has to be present.
        this.hostname = this.hostname || '';
    
        // if hostname begins with [ and ends with ]
        // assume that it's an IPv6 address.
        var ipv6Hostname = this.hostname[0] === '[' &&
            this.hostname[this.hostname.length - 1] === ']';
    
        // validate a little.
        if (!ipv6Hostname) {
          var hostparts = this.hostname.split(/\./);
          for (var i = 0, l = hostparts.length; i < l; i++) {
            var part = hostparts[i];
            if (!part) continue;
            if (!part.match(hostnamePartPattern)) {
              var newpart = '';
              for (var j = 0, k = part.length; j < k; j++) {
                if (part.charCodeAt(j) > 127) {
                  // we replace non-ASCII char with a temporary placeholder
                  // we need this to make sure size of hostname is not
                  // broken by replacing non-ASCII by nothing
                  newpart += 'x';
                } else {
                  newpart += part[j];
                }
              }
              // we test again with ASCII char only
              if (!newpart.match(hostnamePartPattern)) {
                var validParts = hostparts.slice(0, i);
                var notHost = hostparts.slice(i + 1);
                var bit = part.match(hostnamePartStart);
                if (bit) {
                  validParts.push(bit[1]);
                  notHost.unshift(bit[2]);
                }
                if (notHost.length) {
                  rest = '/' + notHost.join('.') + rest;
                }
                this.hostname = validParts.join('.');
                break;
              }
            }
          }
        }
    
        if (this.hostname.length > hostnameMaxLen) {
          this.hostname = '';
        } else {
          // hostnames are always lower case.
          this.hostname = this.hostname.toLowerCase();
        }
    
        if (!ipv6Hostname) {
          // IDNA Support: Returns a punycoded representation of "domain".
          // It only converts parts of the domain name that
          // have non-ASCII characters, i.e. it doesn't matter if
          // you call it with a domain that already is ASCII-only.
          this.hostname = punycode.toASCII(this.hostname);
        }
    
        var p = this.port ? ':' + this.port : '';
        var h = this.hostname || '';
        this.host = h + p;
        this.href += this.host;
    
        // strip [ and ] from the hostname
        // the host field still retains them, though
        if (ipv6Hostname) {
          this.hostname = this.hostname.substr(1, this.hostname.length - 2);
          if (rest[0] !== '/') {
            rest = '/' + rest;
          }
        }
      }
    
      // now rest is set to the post-host stuff.
      // chop off any delim chars.
      if (!unsafeProtocol[lowerProto]) {
    
        // First, make 100% sure that any "autoEscape" chars get
        // escaped, even if encodeURIComponent doesn't think they
        // need to be.
        for (var i = 0, l = autoEscape.length; i < l; i++) {
          var ae = autoEscape[i];
          if (rest.indexOf(ae) === -1)
            continue;
          var esc = encodeURIComponent(ae);
          if (esc === ae) {
            esc = escape(ae);
          }
          rest = rest.split(ae).join(esc);
        }
      }
    
    
      // chop off from the tail first.
      var hash = rest.indexOf('#');
      if (hash !== -1) {
        // got a fragment string.
        this.hash = rest.substr(hash);
        rest = rest.slice(0, hash);
      }
      var qm = rest.indexOf('?');
      if (qm !== -1) {
        this.search = rest.substr(qm);
        this.query = rest.substr(qm + 1);
        if (parseQueryString) {
          this.query = querystring.parse(this.query);
        }
        rest = rest.slice(0, qm);
      } else if (parseQueryString) {
        // no query string, but parseQueryString still requested
        this.search = '';
        this.query = {};
      }
      if (rest) this.pathname = rest;
      if (slashedProtocol[lowerProto] &&
          this.hostname && !this.pathname) {
        this.pathname = '/';
      }
    
      //to support http.request
      if (this.pathname || this.search) {
        var p = this.pathname || '';
        var s = this.search || '';
        this.path = p + s;
      }
    
      // finally, reconstruct the href based on what has been validated.
      this.href = this.format();
      return this;
    };
    
    // format a parsed object into a url string
    function urlFormat(obj) {
      // ensure it's an object, and not a string url.
      // If it's an obj, this is a no-op.
      // this way, you can call url_format() on strings
      // to clean up potentially wonky urls.
      if (util.isString(obj)) obj = urlParse(obj);
      if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
      return obj.format();
    }
    
    Url.prototype.format = function() {
      var auth = this.auth || '';
      if (auth) {
        auth = encodeURIComponent(auth);
        auth = auth.replace(/%3A/i, ':');
        auth += '@';
      }
    
      var protocol = this.protocol || '',
          pathname = this.pathname || '',
          hash = this.hash || '',
          host = false,
          query = '';
    
      if (this.host) {
        host = auth + this.host;
      } else if (this.hostname) {
        host = auth + (this.hostname.indexOf(':') === -1 ?
            this.hostname :
            '[' + this.hostname + ']');
        if (this.port) {
          host += ':' + this.port;
        }
      }
    
      if (this.query &&
          util.isObject(this.query) &&
          Object.keys(this.query).length) {
        query = querystring.stringify(this.query);
      }
    
      var search = this.search || (query && ('?' + query)) || '';
    
      if (protocol && protocol.substr(-1) !== ':') protocol += ':';
    
      // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
      // unless they had them to begin with.
      if (this.slashes ||
          (!protocol || slashedProtocol[protocol]) && host !== false) {
        host = '//' + (host || '');
        if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
      } else if (!host) {
        host = '';
      }
    
      if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
      if (search && search.charAt(0) !== '?') search = '?' + search;
    
      pathname = pathname.replace(/[?#]/g, function(match) {
        return encodeURIComponent(match);
      });
      search = search.replace('#', '%23');
    
      return protocol + host + pathname + search + hash;
    };
    
    function urlResolve(source, relative) {
      return urlParse(source, false, true).resolve(relative);
    }
    
    Url.prototype.resolve = function(relative) {
      return this.resolveObject(urlParse(relative, false, true)).format();
    };
    
    function urlResolveObject(source, relative) {
      if (!source) return relative;
      return urlParse(source, false, true).resolveObject(relative);
    }
    
    Url.prototype.resolveObject = function(relative) {
      if (util.isString(relative)) {
        var rel = new Url();
        rel.parse(relative, false, true);
        relative = rel;
      }
    
      var result = new Url();
      var tkeys = Object.keys(this);
      for (var tk = 0; tk < tkeys.length; tk++) {
        var tkey = tkeys[tk];
        result[tkey] = this[tkey];
      }
    
      // hash is always overridden, no matter what.
      // even href="" will remove it.
      result.hash = relative.hash;
    
      // if the relative url is empty, then there's nothing left to do here.
      if (relative.href === '') {
        result.href = result.format();
        return result;
      }
    
      // hrefs like //foo/bar always cut to the protocol.
      if (relative.slashes && !relative.protocol) {
        // take everything except the protocol from relative
        var rkeys = Object.keys(relative);
        for (var rk = 0; rk < rkeys.length; rk++) {
          var rkey = rkeys[rk];
          if (rkey !== 'protocol')
            result[rkey] = relative[rkey];
        }
    
        //urlParse appends trailing / to urls like http://www.example.com
        if (slashedProtocol[result.protocol] &&
            result.hostname && !result.pathname) {
          result.path = result.pathname = '/';
        }
    
        result.href = result.format();
        return result;
      }
    
      if (relative.protocol && relative.protocol !== result.protocol) {
        // if it's a known url protocol, then changing
        // the protocol does weird things
        // first, if it's not file:, then we MUST have a host,
        // and if there was a path
        // to begin with, then we MUST have a path.
        // if it is file:, then the host is dropped,
        // because that's known to be hostless.
        // anything else is assumed to be absolute.
        if (!slashedProtocol[relative.protocol]) {
          var keys = Object.keys(relative);
          for (var v = 0; v < keys.length; v++) {
            var k = keys[v];
            result[k] = relative[k];
          }
          result.href = result.format();
          return result;
        }
    
        result.protocol = relative.protocol;
        if (!relative.host && !hostlessProtocol[relative.protocol]) {
          var relPath = (relative.pathname || '').split('/');
          while (relPath.length && !(relative.host = relPath.shift()));
          if (!relative.host) relative.host = '';
          if (!relative.hostname) relative.hostname = '';
          if (relPath[0] !== '') relPath.unshift('');
          if (relPath.length < 2) relPath.unshift('');
          result.pathname = relPath.join('/');
        } else {
          result.pathname = relative.pathname;
        }
        result.search = relative.search;
        result.query = relative.query;
        result.host = relative.host || '';
        result.auth = relative.auth;
        result.hostname = relative.hostname || relative.host;
        result.port = relative.port;
        // to support http.request
        if (result.pathname || result.search) {
          var p = result.pathname || '';
          var s = result.search || '';
          result.path = p + s;
        }
        result.slashes = result.slashes || relative.slashes;
        result.href = result.format();
        return result;
      }
    
      var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
          isRelAbs = (
              relative.host ||
              relative.pathname && relative.pathname.charAt(0) === '/'
          ),
          mustEndAbs = (isRelAbs || isSourceAbs ||
                        (result.host && relative.pathname)),
          removeAllDots = mustEndAbs,
          srcPath = result.pathname && result.pathname.split('/') || [],
          relPath = relative.pathname && relative.pathname.split('/') || [],
          psychotic = result.protocol && !slashedProtocol[result.protocol];
    
      // if the url is a non-slashed url, then relative
      // links like ../.. should be able
      // to crawl up to the hostname, as well.  This is strange.
      // result.protocol has already been set by now.
      // Later on, put the first path part into the host field.
      if (psychotic) {
        result.hostname = '';
        result.port = null;
        if (result.host) {
          if (srcPath[0] === '') srcPath[0] = result.host;
          else srcPath.unshift(result.host);
        }
        result.host = '';
        if (relative.protocol) {
          relative.hostname = null;
          relative.port = null;
          if (relative.host) {
            if (relPath[0] === '') relPath[0] = relative.host;
            else relPath.unshift(relative.host);
          }
          relative.host = null;
        }
        mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
      }
    
      if (isRelAbs) {
        // it's absolute.
        result.host = (relative.host || relative.host === '') ?
                      relative.host : result.host;
        result.hostname = (relative.hostname || relative.hostname === '') ?
                          relative.hostname : result.hostname;
        result.search = relative.search;
        result.query = relative.query;
        srcPath = relPath;
        // fall through to the dot-handling below.
      } else if (relPath.length) {
        // it's relative
        // throw away the existing file, and take the new path instead.
        if (!srcPath) srcPath = [];
        srcPath.pop();
        srcPath = srcPath.concat(relPath);
        result.search = relative.search;
        result.query = relative.query;
      } else if (!util.isNullOrUndefined(relative.search)) {
        // just pull out the search.
        // like href='?foo'.
        // Put this after the other two cases because it simplifies the booleans
        if (psychotic) {
          result.hostname = result.host = srcPath.shift();
          //occationaly the auth can get stuck only in host
          //this especially happens in cases like
          //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
          var authInHost = result.host && result.host.indexOf('@') > 0 ?
                           result.host.split('@') : false;
          if (authInHost) {
            result.auth = authInHost.shift();
            result.host = result.hostname = authInHost.shift();
          }
        }
        result.search = relative.search;
        result.query = relative.query;
        //to support http.request
        if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
          result.path = (result.pathname ? result.pathname : '') +
                        (result.search ? result.search : '');
        }
        result.href = result.format();
        return result;
      }
    
      if (!srcPath.length) {
        // no path at all.  easy.
        // we've already handled the other stuff above.
        result.pathname = null;
        //to support http.request
        if (result.search) {
          result.path = '/' + result.search;
        } else {
          result.path = null;
        }
        result.href = result.format();
        return result;
      }
    
      // if a url ENDs in . or .., then it must get a trailing slash.
      // however, if it ends in anything else non-slashy,
      // then it must NOT get a trailing slash.
      var last = srcPath.slice(-1)[0];
      var hasTrailingSlash = (
          (result.host || relative.host || srcPath.length > 1) &&
          (last === '.' || last === '..') || last === '');
    
      // strip single dots, resolve double dots to parent dir
      // if the path tries to go above the root, `up` ends up > 0
      var up = 0;
      for (var i = srcPath.length; i >= 0; i--) {
        last = srcPath[i];
        if (last === '.') {
          srcPath.splice(i, 1);
        } else if (last === '..') {
          srcPath.splice(i, 1);
          up++;
        } else if (up) {
          srcPath.splice(i, 1);
          up--;
        }
      }
    
      // if the path is allowed to go above the root, restore leading ..s
      if (!mustEndAbs && !removeAllDots) {
        for (; up--; up) {
          srcPath.unshift('..');
        }
      }
    
      if (mustEndAbs && srcPath[0] !== '' &&
          (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
        srcPath.unshift('');
      }
    
      if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
        srcPath.push('');
      }
    
      var isAbsolute = srcPath[0] === '' ||
          (srcPath[0] && srcPath[0].charAt(0) === '/');
    
      // put the host back
      if (psychotic) {
        result.hostname = result.host = isAbsolute ? '' :
                                        srcPath.length ? srcPath.shift() : '';
        //occationaly the auth can get stuck only in host
        //this especially happens in cases like
        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
        var authInHost = result.host && result.host.indexOf('@') > 0 ?
                         result.host.split('@') : false;
        if (authInHost) {
          result.auth = authInHost.shift();
          result.host = result.hostname = authInHost.shift();
        }
      }
    
      mustEndAbs = mustEndAbs || (result.host && srcPath.length);
    
      if (mustEndAbs && !isAbsolute) {
        srcPath.unshift('');
      }
    
      if (!srcPath.length) {
        result.pathname = null;
        result.path = null;
      } else {
        result.pathname = srcPath.join('/');
      }
    
      //to support request.http
      if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
        result.path = (result.pathname ? result.pathname : '') +
                      (result.search ? result.search : '');
      }
      result.auth = relative.auth || result.auth;
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    };
    
    Url.prototype.parseHost = function() {
      var host = this.host;
      var port = portPattern.exec(host);
      if (port) {
        port = port[0];
        if (port !== ':') {
          this.port = port.substr(1);
        }
        host = host.substr(0, host.length - port.length);
      }
      if (host) this.hostname = host;
    };
    
    },{"./util":67,"punycode":61,"querystring":64}],67:[function(require,module,exports){
    'use strict';
    
    module.exports = {
      isString: function(arg) {
        return typeof(arg) === 'string';
      },
      isObject: function(arg) {
        return typeof(arg) === 'object' && arg !== null;
      },
      isNull: function(arg) {
        return arg === null;
      },
      isNullOrUndefined: function(arg) {
        return arg == null;
      }
    };
    
    },{}],68:[function(require,module,exports){
    var createElement = require("./vdom/create-element.js")
    
    module.exports = createElement
    
    },{"./vdom/create-element.js":72}],69:[function(require,module,exports){
    var diff = require("./vtree/diff.js")
    
    module.exports = diff
    
    },{"./vtree/diff.js":91}],70:[function(require,module,exports){
    var patch = require("./vdom/patch.js")
    
    module.exports = patch
    
    },{"./vdom/patch.js":75}],71:[function(require,module,exports){
    var isObject = require("is-object")
    var isHook = require("../vnode/is-vhook.js")
    
    module.exports = applyProperties
    
    function applyProperties(node, props, previous) {
        for (var propName in props) {
            var propValue = props[propName]
    
            if (propValue === undefined) {
                removeProperty(node, propName, propValue, previous);
            } else if (isHook(propValue)) {
                removeProperty(node, propName, propValue, previous)
                if (propValue.hook) {
                    propValue.hook(node,
                        propName,
                        previous ? previous[propName] : undefined)
                }
            } else {
                if (isObject(propValue)) {
                    patchObject(node, props, previous, propName, propValue);
                } else {
                    node[propName] = propValue
                }
            }
        }
    }
    
    function removeProperty(node, propName, propValue, previous) {
        if (previous) {
            var previousValue = previous[propName]
    
            if (!isHook(previousValue)) {
                if (propName === "attributes") {
                    for (var attrName in previousValue) {
                        node.removeAttribute(attrName)
                    }
                } else if (propName === "style") {
                    for (var i in previousValue) {
                        node.style[i] = ""
                    }
                } else if (typeof previousValue === "string") {
                    node[propName] = ""
                } else {
                    node[propName] = null
                }
            } else if (previousValue.unhook) {
                previousValue.unhook(node, propName, propValue)
            }
        }
    }
    
    function patchObject(node, props, previous, propName, propValue) {
        var previousValue = previous ? previous[propName] : undefined
    
        // Set attributes
        if (propName === "attributes") {
            for (var attrName in propValue) {
                var attrValue = propValue[attrName]
    
                if (attrValue === undefined) {
                    node.removeAttribute(attrName)
                } else {
                    node.setAttribute(attrName, attrValue)
                }
            }
    
            return
        }
    
        if(previousValue && isObject(previousValue) &&
            getPrototype(previousValue) !== getPrototype(propValue)) {
            node[propName] = propValue
            return
        }
    
        if (!isObject(node[propName])) {
            node[propName] = {}
        }
    
        var replacer = propName === "style" ? "" : undefined
    
        for (var k in propValue) {
            var value = propValue[k]
            node[propName][k] = (value === undefined) ? replacer : value
        }
    }
    
    function getPrototype(value) {
        if (Object.getPrototypeOf) {
            return Object.getPrototypeOf(value)
        } else if (value.__proto__) {
            return value.__proto__
        } else if (value.constructor) {
            return value.constructor.prototype
        }
    }
    
    },{"../vnode/is-vhook.js":82,"is-object":55}],72:[function(require,module,exports){
    var document = require("global/document")
    
    var applyProperties = require("./apply-properties")
    
    var isVNode = require("../vnode/is-vnode.js")
    var isVText = require("../vnode/is-vtext.js")
    var isWidget = require("../vnode/is-widget.js")
    var handleThunk = require("../vnode/handle-thunk.js")
    
    module.exports = createElement
    
    function createElement(vnode, opts) {
        var doc = opts ? opts.document || document : document
        var warn = opts ? opts.warn : null
    
        vnode = handleThunk(vnode).a
    
        if (isWidget(vnode)) {
            return vnode.init()
        } else if (isVText(vnode)) {
            return doc.createTextNode(vnode.text)
        } else if (!isVNode(vnode)) {
            if (warn) {
                warn("Item is not a valid virtual dom node", vnode)
            }
            return null
        }
    
        var node = (vnode.namespace === null) ?
            doc.createElement(vnode.tagName) :
            doc.createElementNS(vnode.namespace, vnode.tagName)
    
        var props = vnode.properties
        applyProperties(node, props)
    
        var children = vnode.children
    
        for (var i = 0; i < children.length; i++) {
            var childNode = createElement(children[i], opts)
            if (childNode) {
                node.appendChild(childNode)
            }
        }
    
        return node
    }
    
    },{"../vnode/handle-thunk.js":80,"../vnode/is-vnode.js":83,"../vnode/is-vtext.js":84,"../vnode/is-widget.js":85,"./apply-properties":71,"global/document":5}],73:[function(require,module,exports){
    // Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
    // We don't want to read all of the DOM nodes in the tree so we use
    // the in-order tree indexing to eliminate recursion down certain branches.
    // We only recurse into a DOM node if we know that it contains a child of
    // interest.
    
    var noChild = {}
    
    module.exports = domIndex
    
    function domIndex(rootNode, tree, indices, nodes) {
        if (!indices || indices.length === 0) {
            return {}
        } else {
            indices.sort(ascending)
            return recurse(rootNode, tree, indices, nodes, 0)
        }
    }
    
    function recurse(rootNode, tree, indices, nodes, rootIndex) {
        nodes = nodes || {}
    
    
        if (rootNode) {
            if (indexInRange(indices, rootIndex, rootIndex)) {
                nodes[rootIndex] = rootNode
            }
    
            var vChildren = tree.children
    
            if (vChildren) {
    
                var childNodes = rootNode.childNodes
    
                for (var i = 0; i < tree.children.length; i++) {
                    rootIndex += 1
    
                    var vChild = vChildren[i] || noChild
                    var nextIndex = rootIndex + (vChild.count || 0)
    
                    // skip recursion down the tree if there are no nodes down here
                    if (indexInRange(indices, rootIndex, nextIndex)) {
                        recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                    }
    
                    rootIndex = nextIndex
                }
            }
        }
    
        return nodes
    }
    
    // Binary search for an index in the interval [left, right]
    function indexInRange(indices, left, right) {
        if (indices.length === 0) {
            return false
        }
    
        var minIndex = 0
        var maxIndex = indices.length - 1
        var currentIndex
        var currentItem
    
        while (minIndex <= maxIndex) {
            currentIndex = ((maxIndex + minIndex) / 2) >> 0
            currentItem = indices[currentIndex]
    
            if (minIndex === maxIndex) {
                return currentItem >= left && currentItem <= right
            } else if (currentItem < left) {
                minIndex = currentIndex + 1
            } else  if (currentItem > right) {
                maxIndex = currentIndex - 1
            } else {
                return true
            }
        }
    
        return false;
    }
    
    function ascending(a, b) {
        return a > b ? 1 : -1
    }
    
    },{}],74:[function(require,module,exports){
    var applyProperties = require("./apply-properties")
    
    var isWidget = require("../vnode/is-widget.js")
    var VPatch = require("../vnode/vpatch.js")
    
    var updateWidget = require("./update-widget")
    
    module.exports = applyPatch
    
    function applyPatch(vpatch, domNode, renderOptions) {
        var type = vpatch.type
        var vNode = vpatch.vNode
        var patch = vpatch.patch
    
        switch (type) {
            case VPatch.REMOVE:
                return removeNode(domNode, vNode)
            case VPatch.INSERT:
                return insertNode(domNode, patch, renderOptions)
            case VPatch.VTEXT:
                return stringPatch(domNode, vNode, patch, renderOptions)
            case VPatch.WIDGET:
                return widgetPatch(domNode, vNode, patch, renderOptions)
            case VPatch.VNODE:
                return vNodePatch(domNode, vNode, patch, renderOptions)
            case VPatch.ORDER:
                reorderChildren(domNode, patch)
                return domNode
            case VPatch.PROPS:
                applyProperties(domNode, patch, vNode.properties)
                return domNode
            case VPatch.THUNK:
                return replaceRoot(domNode,
                    renderOptions.patch(domNode, patch, renderOptions))
            default:
                return domNode
        }
    }
    
    function removeNode(domNode, vNode) {
        var parentNode = domNode.parentNode
    
        if (parentNode) {
            parentNode.removeChild(domNode)
        }
    
        destroyWidget(domNode, vNode);
    
        return null
    }
    
    function insertNode(parentNode, vNode, renderOptions) {
        var newNode = renderOptions.render(vNode, renderOptions)
    
        if (parentNode) {
            parentNode.appendChild(newNode)
        }
    
        return parentNode
    }
    
    function stringPatch(domNode, leftVNode, vText, renderOptions) {
        var newNode
    
        if (domNode.nodeType === 3) {
            domNode.replaceData(0, domNode.length, vText.text)
            newNode = domNode
        } else {
            var parentNode = domNode.parentNode
            newNode = renderOptions.render(vText, renderOptions)
    
            if (parentNode && newNode !== domNode) {
                parentNode.replaceChild(newNode, domNode)
            }
        }
    
        return newNode
    }
    
    function widgetPatch(domNode, leftVNode, widget, renderOptions) {
        var updating = updateWidget(leftVNode, widget)
        var newNode
    
        if (updating) {
            newNode = widget.update(leftVNode, domNode) || domNode
        } else {
            newNode = renderOptions.render(widget, renderOptions)
        }
    
        var parentNode = domNode.parentNode
    
        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    
        if (!updating) {
            destroyWidget(domNode, leftVNode)
        }
    
        return newNode
    }
    
    function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
        var parentNode = domNode.parentNode
        var newNode = renderOptions.render(vNode, renderOptions)
    
        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    
        return newNode
    }
    
    function destroyWidget(domNode, w) {
        if (typeof w.destroy === "function" && isWidget(w)) {
            w.destroy(domNode)
        }
    }
    
    function reorderChildren(domNode, moves) {
        var childNodes = domNode.childNodes
        var keyMap = {}
        var node
        var remove
        var insert
    
        for (var i = 0; i < moves.removes.length; i++) {
            remove = moves.removes[i]
            node = childNodes[remove.from]
            if (remove.key) {
                keyMap[remove.key] = node
            }
            domNode.removeChild(node)
        }
    
        var length = childNodes.length
        for (var j = 0; j < moves.inserts.length; j++) {
            insert = moves.inserts[j]
            node = keyMap[insert.key]
            // this is the weirdest bug i've ever seen in webkit
            domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
        }
    }
    
    function replaceRoot(oldRoot, newRoot) {
        if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
            oldRoot.parentNode.replaceChild(newRoot, oldRoot)
        }
    
        return newRoot;
    }
    
    },{"../vnode/is-widget.js":85,"../vnode/vpatch.js":88,"./apply-properties":71,"./update-widget":76}],75:[function(require,module,exports){
    var document = require("global/document")
    var isArray = require("x-is-array")
    
    var render = require("./create-element")
    var domIndex = require("./dom-index")
    var patchOp = require("./patch-op")
    module.exports = patch
    
    function patch(rootNode, patches, renderOptions) {
        renderOptions = renderOptions || {}
        renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
            ? renderOptions.patch
            : patchRecursive
        renderOptions.render = renderOptions.render || render
    
        return renderOptions.patch(rootNode, patches, renderOptions)
    }
    
    function patchRecursive(rootNode, patches, renderOptions) {
        var indices = patchIndices(patches)
    
        if (indices.length === 0) {
            return rootNode
        }
    
        var index = domIndex(rootNode, patches.a, indices)
        var ownerDocument = rootNode.ownerDocument
    
        if (!renderOptions.document && ownerDocument !== document) {
            renderOptions.document = ownerDocument
        }
    
        for (var i = 0; i < indices.length; i++) {
            var nodeIndex = indices[i]
            rootNode = applyPatch(rootNode,
                index[nodeIndex],
                patches[nodeIndex],
                renderOptions)
        }
    
        return rootNode
    }
    
    function applyPatch(rootNode, domNode, patchList, renderOptions) {
        if (!domNode) {
            return rootNode
        }
    
        var newNode
    
        if (isArray(patchList)) {
            for (var i = 0; i < patchList.length; i++) {
                newNode = patchOp(patchList[i], domNode, renderOptions)
    
                if (domNode === rootNode) {
                    rootNode = newNode
                }
            }
        } else {
            newNode = patchOp(patchList, domNode, renderOptions)
    
            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    
        return rootNode
    }
    
    function patchIndices(patches) {
        var indices = []
    
        for (var key in patches) {
            if (key !== "a") {
                indices.push(Number(key))
            }
        }
    
        return indices
    }
    
    },{"./create-element":72,"./dom-index":73,"./patch-op":74,"global/document":5,"x-is-array":92}],76:[function(require,module,exports){
    var isWidget = require("../vnode/is-widget.js")
    
    module.exports = updateWidget
    
    function updateWidget(a, b) {
        if (isWidget(a) && isWidget(b)) {
            if ("name" in a && "name" in b) {
                return a.id === b.id
            } else {
                return a.init === b.init
            }
        }
    
        return false
    }
    
    },{"../vnode/is-widget.js":85}],77:[function(require,module,exports){
    'use strict';
    
    module.exports = AttributeHook;
    
    function AttributeHook(namespace, value) {
        if (!(this instanceof AttributeHook)) {
            return new AttributeHook(namespace, value);
        }
    
        this.namespace = namespace;
        this.value = value;
    }
    
    AttributeHook.prototype.hook = function (node, prop, prev) {
        if (prev && prev.type === 'AttributeHook' &&
            prev.value === this.value &&
            prev.namespace === this.namespace) {
            return;
        }
    
        node.setAttributeNS(this.namespace, prop, this.value);
    };
    
    AttributeHook.prototype.unhook = function (node, prop, next) {
        if (next && next.type === 'AttributeHook' &&
            next.namespace === this.namespace) {
            return;
        }
    
        var colonPosition = prop.indexOf(':');
        var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
        node.removeAttributeNS(this.namespace, localName);
    };
    
    AttributeHook.prototype.type = 'AttributeHook';
    
    },{}],78:[function(require,module,exports){
    'use strict';
    
    module.exports = SoftSetHook;
    
    function SoftSetHook(value) {
        if (!(this instanceof SoftSetHook)) {
            return new SoftSetHook(value);
        }
    
        this.value = value;
    }
    
    SoftSetHook.prototype.hook = function (node, propertyName) {
        if (node[propertyName] !== this.value) {
            node[propertyName] = this.value;
        }
    };
    
    },{}],79:[function(require,module,exports){
    'use strict';
    
    var split = require('browser-split');
    
    var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
    var notClassId = /^\.|#/;
    
    module.exports = parseTag;
    
    function parseTag(tag, props) {
        if (!tag) {
            return 'DIV';
        }
    
        var noId = !(props.hasOwnProperty('id'));
    
        var tagParts = split(tag, classIdSplit);
        var tagName = null;
    
        if (notClassId.test(tagParts[1])) {
            tagName = 'DIV';
        }
    
        var classes, part, type, i;
    
        for (i = 0; i < tagParts.length; i++) {
            part = tagParts[i];
    
            if (!part) {
                continue;
            }
    
            type = part.charAt(0);
    
            if (!tagName) {
                tagName = part;
            } else if (type === '.') {
                classes = classes || [];
                classes.push(part.substring(1, part.length));
            } else if (type === '#' && noId) {
                props.id = part.substring(1, part.length);
            }
        }
    
        if (classes) {
            if (props.className) {
                classes.push(props.className);
            }
    
            props.className = classes.join(' ');
        }
    
        return props.namespace ? tagName : tagName.toUpperCase();
    }
    
    },{"browser-split":3}],80:[function(require,module,exports){
    var isVNode = require("./is-vnode")
    var isVText = require("./is-vtext")
    var isWidget = require("./is-widget")
    var isThunk = require("./is-thunk")
    
    module.exports = handleThunk
    
    function handleThunk(a, b) {
        var renderedA = a
        var renderedB = b
    
        if (isThunk(b)) {
            renderedB = renderThunk(b, a)
        }
    
        if (isThunk(a)) {
            renderedA = renderThunk(a, null)
        }
    
        return {
            a: renderedA,
            b: renderedB
        }
    }
    
    function renderThunk(thunk, previous) {
        var renderedThunk = thunk.vnode
    
        if (!renderedThunk) {
            renderedThunk = thunk.vnode = thunk.render(previous)
        }
    
        if (!(isVNode(renderedThunk) ||
                isVText(renderedThunk) ||
                isWidget(renderedThunk))) {
            throw new Error("thunk did not return a valid node");
        }
    
        return renderedThunk
    }
    
    },{"./is-thunk":81,"./is-vnode":83,"./is-vtext":84,"./is-widget":85}],81:[function(require,module,exports){
    module.exports = isThunk
    
    function isThunk(t) {
        return t && t.type === "Thunk"
    }
    
    },{}],82:[function(require,module,exports){
    module.exports = isHook
    
    function isHook(hook) {
        return hook &&
          (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
           typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
    }
    
    },{}],83:[function(require,module,exports){
    var version = require("./version")
    
    module.exports = isVirtualNode
    
    function isVirtualNode(x) {
        return x && x.type === "VirtualNode" && x.version === version
    }
    
    },{"./version":86}],84:[function(require,module,exports){
    var version = require("./version")
    
    module.exports = isVirtualText
    
    function isVirtualText(x) {
        return x && x.type === "VirtualText" && x.version === version
    }
    
    },{"./version":86}],85:[function(require,module,exports){
    module.exports = isWidget
    
    function isWidget(w) {
        return w && w.type === "Widget"
    }
    
    },{}],86:[function(require,module,exports){
    module.exports = "2"
    
    },{}],87:[function(require,module,exports){
    var version = require("./version")
    var isVNode = require("./is-vnode")
    var isWidget = require("./is-widget")
    var isThunk = require("./is-thunk")
    var isVHook = require("./is-vhook")
    
    module.exports = VirtualNode
    
    var noProperties = {}
    var noChildren = []
    
    function VirtualNode(tagName, properties, children, key, namespace) {
        this.tagName = tagName
        this.properties = properties || noProperties
        this.children = children || noChildren
        this.key = key != null ? String(key) : undefined
        this.namespace = (typeof namespace === "string") ? namespace : null
    
        var count = (children && children.length) || 0
        var descendants = 0
        var hasWidgets = false
        var hasThunks = false
        var descendantHooks = false
        var hooks
    
        for (var propName in properties) {
            if (properties.hasOwnProperty(propName)) {
                var property = properties[propName]
                if (isVHook(property) && property.unhook) {
                    if (!hooks) {
                        hooks = {}
                    }
    
                    hooks[propName] = property
                }
            }
        }
    
        for (var i = 0; i < count; i++) {
            var child = children[i]
            if (isVNode(child)) {
                descendants += child.count || 0
    
                if (!hasWidgets && child.hasWidgets) {
                    hasWidgets = true
                }
    
                if (!hasThunks && child.hasThunks) {
                    hasThunks = true
                }
    
                if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                    descendantHooks = true
                }
            } else if (!hasWidgets && isWidget(child)) {
                if (typeof child.destroy === "function") {
                    hasWidgets = true
                }
            } else if (!hasThunks && isThunk(child)) {
                hasThunks = true;
            }
        }
    
        this.count = count + descendants
        this.hasWidgets = hasWidgets
        this.hasThunks = hasThunks
        this.hooks = hooks
        this.descendantHooks = descendantHooks
    }
    
    VirtualNode.prototype.version = version
    VirtualNode.prototype.type = "VirtualNode"
    
    },{"./is-thunk":81,"./is-vhook":82,"./is-vnode":83,"./is-widget":85,"./version":86}],88:[function(require,module,exports){
    var version = require("./version")
    
    VirtualPatch.NONE = 0
    VirtualPatch.VTEXT = 1
    VirtualPatch.VNODE = 2
    VirtualPatch.WIDGET = 3
    VirtualPatch.PROPS = 4
    VirtualPatch.ORDER = 5
    VirtualPatch.INSERT = 6
    VirtualPatch.REMOVE = 7
    VirtualPatch.THUNK = 8
    
    module.exports = VirtualPatch
    
    function VirtualPatch(type, vNode, patch) {
        this.type = Number(type)
        this.vNode = vNode
        this.patch = patch
    }
    
    VirtualPatch.prototype.version = version
    VirtualPatch.prototype.type = "VirtualPatch"
    
    },{"./version":86}],89:[function(require,module,exports){
    var version = require("./version")
    
    module.exports = VirtualText
    
    function VirtualText(text) {
        this.text = String(text)
    }
    
    VirtualText.prototype.version = version
    VirtualText.prototype.type = "VirtualText"
    
    },{"./version":86}],90:[function(require,module,exports){
    var isObject = require("is-object")
    var isHook = require("../vnode/is-vhook")
    
    module.exports = diffProps
    
    function diffProps(a, b) {
        var diff
    
        for (var aKey in a) {
            if (!(aKey in b)) {
                diff = diff || {}
                diff[aKey] = undefined
            }
    
            var aValue = a[aKey]
            var bValue = b[aKey]
    
            if (aValue === bValue) {
                continue
            } else if (isObject(aValue) && isObject(bValue)) {
                if (getPrototype(bValue) !== getPrototype(aValue)) {
                    diff = diff || {}
                    diff[aKey] = bValue
                } else if (isHook(bValue)) {
                     diff = diff || {}
                     diff[aKey] = bValue
                } else {
                    var objectDiff = diffProps(aValue, bValue)
                    if (objectDiff) {
                        diff = diff || {}
                        diff[aKey] = objectDiff
                    }
                }
            } else {
                diff = diff || {}
                diff[aKey] = bValue
            }
        }
    
        for (var bKey in b) {
            if (!(bKey in a)) {
                diff = diff || {}
                diff[bKey] = b[bKey]
            }
        }
    
        return diff
    }
    
    function getPrototype(value) {
      if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
      } else if (value.__proto__) {
        return value.__proto__
      } else if (value.constructor) {
        return value.constructor.prototype
      }
    }
    
    },{"../vnode/is-vhook":82,"is-object":55}],91:[function(require,module,exports){
    var isArray = require("x-is-array")
    
    var VPatch = require("../vnode/vpatch")
    var isVNode = require("../vnode/is-vnode")
    var isVText = require("../vnode/is-vtext")
    var isWidget = require("../vnode/is-widget")
    var isThunk = require("../vnode/is-thunk")
    var handleThunk = require("../vnode/handle-thunk")
    
    var diffProps = require("./diff-props")
    
    module.exports = diff
    
    function diff(a, b) {
        var patch = { a: a }
        walk(a, b, patch, 0)
        return patch
    }
    
    function walk(a, b, patch, index) {
        if (a === b) {
            return
        }
    
        var apply = patch[index]
        var applyClear = false
    
        if (isThunk(a) || isThunk(b)) {
            thunks(a, b, patch, index)
        } else if (b == null) {
    
            // If a is a widget we will add a remove patch for it
            // Otherwise any child widgets/hooks must be destroyed.
            // This prevents adding two remove patches for a widget.
            if (!isWidget(a)) {
                clearState(a, patch, index)
                apply = patch[index]
            }
    
            apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
        } else if (isVNode(b)) {
            if (isVNode(a)) {
                if (a.tagName === b.tagName &&
                    a.namespace === b.namespace &&
                    a.key === b.key) {
                    var propsPatch = diffProps(a.properties, b.properties)
                    if (propsPatch) {
                        apply = appendPatch(apply,
                            new VPatch(VPatch.PROPS, a, propsPatch))
                    }
                    apply = diffChildren(a, b, patch, apply, index)
                } else {
                    apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                    applyClear = true
                }
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else if (isVText(b)) {
            if (!isVText(a)) {
                apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
                applyClear = true
            } else if (a.text !== b.text) {
                apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            }
        } else if (isWidget(b)) {
            if (!isWidget(a)) {
                applyClear = true
            }
    
            apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
        }
    
        if (apply) {
            patch[index] = apply
        }
    
        if (applyClear) {
            clearState(a, patch, index)
        }
    }
    
    function diffChildren(a, b, patch, apply, index) {
        var aChildren = a.children
        var orderedSet = reorder(aChildren, b.children)
        var bChildren = orderedSet.children
    
        var aLen = aChildren.length
        var bLen = bChildren.length
        var len = aLen > bLen ? aLen : bLen
    
        for (var i = 0; i < len; i++) {
            var leftNode = aChildren[i]
            var rightNode = bChildren[i]
            index += 1
    
            if (!leftNode) {
                if (rightNode) {
                    // Excess nodes in b need to be added
                    apply = appendPatch(apply,
                        new VPatch(VPatch.INSERT, null, rightNode))
                }
            } else {
                walk(leftNode, rightNode, patch, index)
            }
    
            if (isVNode(leftNode) && leftNode.count) {
                index += leftNode.count
            }
        }
    
        if (orderedSet.moves) {
            // Reorder nodes last
            apply = appendPatch(apply, new VPatch(
                VPatch.ORDER,
                a,
                orderedSet.moves
            ))
        }
    
        return apply
    }
    
    function clearState(vNode, patch, index) {
        // TODO: Make this a single walk, not two
        unhook(vNode, patch, index)
        destroyWidgets(vNode, patch, index)
    }
    
    // Patch records for all destroyed widgets must be added because we need
    // a DOM node reference for the destroy function
    function destroyWidgets(vNode, patch, index) {
        if (isWidget(vNode)) {
            if (typeof vNode.destroy === "function") {
                patch[index] = appendPatch(
                    patch[index],
                    new VPatch(VPatch.REMOVE, vNode, null)
                )
            }
        } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1
    
                destroyWidgets(child, patch, index)
    
                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        } else if (isThunk(vNode)) {
            thunks(vNode, null, patch, index)
        }
    }
    
    // Create a sub-patch for thunks
    function thunks(a, b, patch, index) {
        var nodes = handleThunk(a, b)
        var thunkPatch = diff(nodes.a, nodes.b)
        if (hasPatches(thunkPatch)) {
            patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
        }
    }
    
    function hasPatches(patch) {
        for (var index in patch) {
            if (index !== "a") {
                return true
            }
        }
    
        return false
    }
    
    // Execute hooks when two nodes are identical
    function unhook(vNode, patch, index) {
        if (isVNode(vNode)) {
            if (vNode.hooks) {
                patch[index] = appendPatch(
                    patch[index],
                    new VPatch(
                        VPatch.PROPS,
                        vNode,
                        undefinedKeys(vNode.hooks)
                    )
                )
            }
    
            if (vNode.descendantHooks || vNode.hasThunks) {
                var children = vNode.children
                var len = children.length
                for (var i = 0; i < len; i++) {
                    var child = children[i]
                    index += 1
    
                    unhook(child, patch, index)
    
                    if (isVNode(child) && child.count) {
                        index += child.count
                    }
                }
            }
        } else if (isThunk(vNode)) {
            thunks(vNode, null, patch, index)
        }
    }
    
    function undefinedKeys(obj) {
        var result = {}
    
        for (var key in obj) {
            result[key] = undefined
        }
    
        return result
    }
    
    // List diff, naive left to right reordering
    function reorder(aChildren, bChildren) {
        // O(M) time, O(M) memory
        var bChildIndex = keyIndex(bChildren)
        var bKeys = bChildIndex.keys
        var bFree = bChildIndex.free
    
        if (bFree.length === bChildren.length) {
            return {
                children: bChildren,
                moves: null
            }
        }
    
        // O(N) time, O(N) memory
        var aChildIndex = keyIndex(aChildren)
        var aKeys = aChildIndex.keys
        var aFree = aChildIndex.free
    
        if (aFree.length === aChildren.length) {
            return {
                children: bChildren,
                moves: null
            }
        }
    
        // O(MAX(N, M)) memory
        var newChildren = []
    
        var freeIndex = 0
        var freeCount = bFree.length
        var deletedItems = 0
    
        // Iterate through a and match a node in b
        // O(N) time,
        for (var i = 0 ; i < aChildren.length; i++) {
            var aItem = aChildren[i]
            var itemIndex
    
            if (aItem.key) {
                if (bKeys.hasOwnProperty(aItem.key)) {
                    // Match up the old keys
                    itemIndex = bKeys[aItem.key]
                    newChildren.push(bChildren[itemIndex])
    
                } else {
                    // Remove old keyed items
                    itemIndex = i - deletedItems++
                    newChildren.push(null)
                }
            } else {
                // Match the item in a with the next free item in b
                if (freeIndex < freeCount) {
                    itemIndex = bFree[freeIndex++]
                    newChildren.push(bChildren[itemIndex])
                } else {
                    // There are no free items in b to match with
                    // the free items in a, so the extra free nodes
                    // are deleted.
                    itemIndex = i - deletedItems++
                    newChildren.push(null)
                }
            }
        }
    
        var lastFreeIndex = freeIndex >= bFree.length ?
            bChildren.length :
            bFree[freeIndex]
    
        // Iterate through b and append any new keys
        // O(M) time
        for (var j = 0; j < bChildren.length; j++) {
            var newItem = bChildren[j]
    
            if (newItem.key) {
                if (!aKeys.hasOwnProperty(newItem.key)) {
                    // Add any new keyed items
                    // We are adding new items to the end and then sorting them
                    // in place. In future we should insert new items in place.
                    newChildren.push(newItem)
                }
            } else if (j >= lastFreeIndex) {
                // Add any leftover non-keyed items
                newChildren.push(newItem)
            }
        }
    
        var simulate = newChildren.slice()
        var simulateIndex = 0
        var removes = []
        var inserts = []
        var simulateItem
    
        for (var k = 0; k < bChildren.length;) {
            var wantedItem = bChildren[k]
            simulateItem = simulate[simulateIndex]
    
            // remove items
            while (simulateItem === null && simulate.length) {
                removes.push(remove(simulate, simulateIndex, null))
                simulateItem = simulate[simulateIndex]
            }
    
            if (!simulateItem || simulateItem.key !== wantedItem.key) {
                // if we need a key in this position...
                if (wantedItem.key) {
                    if (simulateItem && simulateItem.key) {
                        // if an insert doesn't put this key in place, it needs to move
                        if (bKeys[simulateItem.key] !== k + 1) {
                            removes.push(remove(simulate, simulateIndex, simulateItem.key))
                            simulateItem = simulate[simulateIndex]
                            // if the remove didn't put the wanted item in place, we need to insert it
                            if (!simulateItem || simulateItem.key !== wantedItem.key) {
                                inserts.push({key: wantedItem.key, to: k})
                            }
                            // items are matching, so skip ahead
                            else {
                                simulateIndex++
                            }
                        }
                        else {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                    k++
                }
                // a key in simulate has no matching wanted key, remove it
                else if (simulateItem && simulateItem.key) {
                    removes.push(remove(simulate, simulateIndex, simulateItem.key))
                }
            }
            else {
                simulateIndex++
                k++
            }
        }
    
        // remove all the remaining nodes from simulate
        while(simulateIndex < simulate.length) {
            simulateItem = simulate[simulateIndex]
            removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
        }
    
        // If the only moves we have are deletes then we can just
        // let the delete patch remove these items.
        if (removes.length === deletedItems && !inserts.length) {
            return {
                children: newChildren,
                moves: null
            }
        }
    
        return {
            children: newChildren,
            moves: {
                removes: removes,
                inserts: inserts
            }
        }
    }
    
    function remove(arr, index, key) {
        arr.splice(index, 1)
    
        return {
            from: index,
            key: key
        }
    }
    
    function keyIndex(children) {
        var keys = {}
        var free = []
        var length = children.length
    
        for (var i = 0; i < length; i++) {
            var child = children[i]
    
            if (child.key) {
                keys[child.key] = i
            } else {
                free.push(i)
            }
        }
    
        return {
            keys: keys,     // A hash of key name to index
            free: free      // An array of unkeyed item indices
        }
    }
    
    function appendPatch(apply, patch) {
        if (apply) {
            if (isArray(apply)) {
                apply.push(patch)
            } else {
                apply = [apply, patch]
            }
    
            return apply
        } else {
            return patch
        }
    }
    
    },{"../vnode/handle-thunk":80,"../vnode/is-thunk":81,"../vnode/is-vnode":83,"../vnode/is-vtext":84,"../vnode/is-widget":85,"../vnode/vpatch":88,"./diff-props":90,"x-is-array":92}],92:[function(require,module,exports){
    var nativeIsArray = Array.isArray
    var toString = Object.prototype.toString
    
    module.exports = nativeIsArray || isArray
    
    function isArray(obj) {
        return toString.call(obj) === "[object Array]"
    }
    
    },{}],93:[function(require,module,exports){
    require('lie/polyfill');
    var hyperdom = require('hyperdom');
    var router = require('hyperdom/router');
    var http = require('httpism/browser');
    var indexBy = require('lowscore/indexBy');
    
    var routes = {
      emails: router.route(':path*')
    };
    
    class EmailSimulatorApp {
      routes() {
        return [routes.emails({
          onload: () => this.loadEmails(),
          render: () => this.renderEmails()
        })];
      }
    
      loadEmails() {
        return http.get('emails').then(emails => {
          this.emails = emails;
        });
      }
    
      read(email) {
        if (this.reading == email) {
          delete this.reading;
        } else {
          this.reading = email;
        }
      }
    
      test() {
        return http.get('test').then(() => this.loadEmails());
      }
    
      reset() {
        return http.post('reset').then(() => this.loadEmails());
      }
    
      renderEmails() {
        return hyperdom.jsx(
          'div',
          { id: 'emailSimulatorApp' },
          hyperdom.jsx(
            'h1',
            null,
            'Email Server Simulator'
          ),
          hyperdom.jsx(
            'ul',
            { 'class': 'admin' },
            hyperdom.jsx(
              'li',
              null,
              hyperdom.jsx(
                'a',
                { href: '#test', onclick: ev => {
                    ev.preventDefault();return this.test();
                  } },
                'test'
              )
            ),
            hyperdom.jsx(
              'li',
              null,
              hyperdom.jsx(
                'a',
                { href: '#reset', onclick: ev => {
                    ev.preventDefault();return this.reset();
                  } },
                'reset'
              )
            )
          ),
          this.emails ? hyperdom.jsx(
            'table',
            { id: 'emails' },
            hyperdom.jsx(
              'thead',
              null,
              hyperdom.jsx(
                'tr',
                null,
                hyperdom.jsx(
                  'th',
                  null,
                  'From'
                ),
                hyperdom.jsx(
                  'th',
                  null,
                  'To'
                ),
                hyperdom.jsx(
                  'th',
                  null,
                  'BCC'
                ),
                hyperdom.jsx('th', null),
                hyperdom.jsx(
                  'th',
                  null,
                  'Sent'
                )
              )
            ),
            hyperdom.jsx(
              'tbody',
              null,
              this.emails.sort((a, b) => {
                new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime();
              }).map(email => this.renderEmail(email))
            )
          ) : undefined
        );
      }
    
      renderAddresses(addresses) {
        return addresses.map(a => {
          if (a.name) {
            return `${a.name} <${a.address}>`;
          } else {
            return a.address;
          }
        }).join(', ');
      }
    
      emailBcc(email) {
        var emails = (email.to || []).concat(email.cc || []);
        var addresses = indexBy(emails, e => e.address);
        return email.envelope.rcptTo.filter(a => !addresses[a.address]);
      }
    
      renderEmail(email) {
        let bodyRow = this.reading == email ? hyperdom.jsx(
          'tr',
          { 'class': 'email' },
          hyperdom.jsx(
            'td',
            { colspan: '4' },
            hyperdom.rawHtml("div", email.html)
          )
        ) : undefined;
    
        let bodyTextElement = document.createElement('p');
        bodyTextElement.innerHTML = email.html.replace(/</g, ' <').replace(/>/g, '> ');
        let bodyText = bodyTextElement.innerText.replace(/\n/g, ' ');
    
        return [hyperdom.jsx(
          'tr',
          { 'class': 'summary', onclick: () => this.read(email) },
          hyperdom.jsx(
            'td',
            { 'class': 'from' },
            this.renderAddresses(email.from)
          ),
          hyperdom.jsx(
            'td',
            { 'class': 'to' },
            this.renderAddresses(email.to)
          ),
          hyperdom.jsx(
            'td',
            { 'class': 'bcc' },
            this.renderAddresses(this.emailBcc(email))
          ),
          hyperdom.jsx(
            'td',
            { 'class': 'message' },
            hyperdom.jsx(
              'div',
              { 'class': 'message-wrapper' },
              hyperdom.jsx(
                'span',
                { 'class': 'subject' },
                email.subject
              ),
              ' - ',
              bodyText
            )
          ),
          hyperdom.jsx(
            'td',
            { 'class': 'sent' },
            email.date
          ),
          hyperdom.jsx(
            'td',
            { 'class': 'received' },
            email.receivedAt
          )
        ), bodyRow];
      }
    }
    
    module.exports = EmailSimulatorApp;
    
    },{"httpism/browser":6,"hyperdom":34,"hyperdom/router":46,"lie/polyfill":58,"lowscore/indexBy":59}],94:[function(require,module,exports){
    var App = require('./app');
    var hyperdom = require('hyperdom');
    var router = require('hyperdom/router');
    
    hyperdom.append(document.body, new App(), { router: router });
    
    },{"./app":93,"hyperdom":34,"hyperdom/router":46}]},{},[94])
    //# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyLXNwbGl0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvZG9jdW1lbnQuanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vY2xpZW50LmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vZXhwYW5kVXJsLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vZXh0ZW5kLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vbWVyZ2UuanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9tZXJnZVF1ZXJ5U3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vbWlkZGxld2FyZS9iYXNpY0F1dGguanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9taWRkbGV3YXJlL2V4Y2VwdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL21pZGRsZXdhcmUvZm9ybUJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9taWRkbGV3YXJlL2pzb25Ccm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vbWlkZGxld2FyZS9qc29ucC5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL21pZGRsZXdhcmUvbWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL21pZGRsZXdhcmUvcGFyYW1zLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vbWlkZGxld2FyZS9xdWVyeXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL21pZGRsZXdhcmUvdGV4dEJyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9taWRkbGV3YXJlL3hoci5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL29iZnVzY2F0ZVVybFBhc3N3b3JkLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vcGFyc2VVcmkuanMiLCJub2RlX21vZHVsZXMvaHR0cGlzbS9xdWVyeXN0cmluZy1saXRlLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vcmVzb2x2ZVVybC5qcyIsIm5vZGVfbW9kdWxlcy9odHRwaXNtL3NldEhlYWRlclRvLmpzIiwibm9kZV9tb2R1bGVzL2h0dHBpc20vc2hvdWxkUGFyc2VBcy5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9iaW5kTW9kZWwuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vYmluZGluZy5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9jb21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vZGVidWdnaW5nUHJvcGVydGllcy5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9kZXByZWNhdGlvbnMuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vZG9tQ29tcG9uZW50LmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL2lzVmRvbS5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9qb2luLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL2xpc3RlbmVyLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL21ldGEuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vbW91bnQuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vcHJlcGFyZUF0dHJpYnV0ZXMuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vcHJvcGVydHlIb29rLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL3JlZnJlc2hBZnRlci5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9yZWZyZXNoRXZlbnRSZXN1bHQuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vcmVuZGVyLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL3JlbmRlcmluZy5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcmRvbS9yb3V0ZXIuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vc2V0LmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL3NpbXBsZVByb21pc2UuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20vdG9WZG9tLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL3ZodG1sLmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyZG9tL3ZpZXdDb21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvaHlwZXJkb20veG1sLmpzIiwibm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW1tZWRpYXRlL2xpYi9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pc2FycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2xpZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbGllL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2xvd3Njb3JlL2luZGV4QnkuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwibm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcmFuZG9tLXN0cmluZy9saWIvcmFuZG9tLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy91cmwvdXJsLmpzIiwibm9kZV9tb2R1bGVzL3VybC91dGlsLmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL2NyZWF0ZS1lbGVtZW50LmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL2RpZmYuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vcGF0Y2guanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9hcHBseS1wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vY3JlYXRlLWVsZW1lbnQuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9kb20taW5kZXguanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdmRvbS9wYXRjaC1vcC5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92ZG9tL3BhdGNoLmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zkb20vdXBkYXRlLXdpZGdldC5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L2hvb2tzL2F0dHJpYnV0ZS1ob29rLmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaG9va3Mvc29mdC1zZXQtaG9vay5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92aXJ0dWFsLWh5cGVyc2NyaXB0L3BhcnNlLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy92aXJ0dWFsLWRvbS92bm9kZS9oYW5kbGUtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdGh1bmsuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdmhvb2suanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdm5vZGUuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtdnRleHQuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvaXMtd2lkZ2V0LmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3ZlcnNpb24uanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvdm5vZGUuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdm5vZGUvdnBhdGNoLmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Zub2RlL3Z0ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3ZpcnR1YWwtZG9tL3Z0cmVlL2RpZmYtcHJvcHMuanMiLCJub2RlX21vZHVsZXMvdmlydHVhbC1kb20vdnRyZWUvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy94LWlzLWFycmF5L2luZGV4LmpzIiwidGVzdC9wYWNrYWdlcy9zaW11bGF0b3JzL2VtYWlsL2Jyb3dzZXIvYXBwLmpzeCIsInRlc3QvcGFja2FnZXMvc2ltdWxhdG9ycy9lbWFpbC9icm93c2VyL2NsaWVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3dkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3JoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1dEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBLFFBQVEsY0FBUjtBQUNBLElBQUksV0FBVyxRQUFRLFVBQVIsQ0FBZjtBQUNBLElBQUksU0FBUyxRQUFRLGlCQUFSLENBQWI7QUFDQSxJQUFJLE9BQU8sUUFBUSxpQkFBUixDQUFYO0FBQ0EsSUFBSSxVQUFVLFFBQVEsa0JBQVIsQ0FBZDs7QUFFQSxJQUFJLFNBQVM7QUFDWCxVQUFRLE9BQU8sS0FBUCxDQUFhLFFBQWI7QUFERyxDQUFiOztBQUlBLE1BQU0saUJBQU4sQ0FBd0I7QUFDdEIsV0FBVTtBQUNSLFdBQU8sQ0FDTCxPQUFPLE1BQVAsQ0FBYztBQUNaLGNBQVEsTUFBTSxLQUFLLFVBQUwsRUFERjtBQUVaLGNBQVEsTUFBTSxLQUFLLFlBQUw7QUFGRixLQUFkLENBREssQ0FBUDtBQU1EOztBQUVELGVBQWM7QUFDWixXQUFPLEtBQUssR0FBTCxDQUFTLFFBQVQsRUFBbUIsSUFBbkIsQ0FBd0IsVUFBVTtBQUN2QyxXQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0QsS0FGTSxDQUFQO0FBR0Q7O0FBRUQsT0FBTSxLQUFOLEVBQWE7QUFDWCxRQUFJLEtBQUssT0FBTCxJQUFnQixLQUFwQixFQUEyQjtBQUN6QixhQUFPLEtBQUssT0FBWjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUssT0FBTCxHQUFlLEtBQWY7QUFDRDtBQUNGOztBQUVELFNBQVE7QUFDTixXQUFPLEtBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsSUFBakIsQ0FBc0IsTUFBTSxLQUFLLFVBQUwsRUFBNUIsQ0FBUDtBQUNEOztBQUVELFVBQVM7QUFDUCxXQUFPLEtBQUssSUFBTCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FBd0IsTUFBTSxLQUFLLFVBQUwsRUFBOUIsQ0FBUDtBQUNEOztBQUVELGlCQUFnQjtBQUNkLFdBQU87QUFBQTtBQUFBLFFBQUssSUFBRyxtQkFBUjtBQUNMO0FBQUE7QUFBQTtBQUFBO0FBQUEsT0FESztBQUVMO0FBQUE7QUFBQSxVQUFJLFNBQU0sT0FBVjtBQUNFO0FBQUE7QUFBQTtBQUFJO0FBQUE7QUFBQSxjQUFHLE1BQUssT0FBUixFQUFnQixTQUFVLEVBQUQsSUFBUTtBQUFDLG1CQUFHLGNBQUgsR0FBb0IsT0FBTyxLQUFLLElBQUwsRUFBUDtBQUFtQixlQUF6RTtBQUFBO0FBQUE7QUFBSixTQURGO0FBRUU7QUFBQTtBQUFBO0FBQUk7QUFBQTtBQUFBLGNBQUcsTUFBSyxRQUFSLEVBQWlCLFNBQVUsRUFBRCxJQUFRO0FBQUMsbUJBQUcsY0FBSCxHQUFvQixPQUFPLEtBQUssS0FBTCxFQUFQO0FBQW9CLGVBQTNFO0FBQUE7QUFBQTtBQUFKO0FBRkYsT0FGSztBQU9ILFdBQUssTUFBTCxHQUNFO0FBQUE7QUFBQSxVQUFPLElBQUcsUUFBVjtBQUNFO0FBQUE7QUFBQTtBQUNFO0FBQUE7QUFBQTtBQUNFO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFERjtBQUVFO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFGRjtBQUdFO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFIRjtBQUlFLG9DQUpGO0FBS0U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUxGO0FBREYsU0FERjtBQVVFO0FBQUE7QUFBQTtBQUVJLGVBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsQ0FBQyxDQUFELEVBQUcsQ0FBSCxLQUFTO0FBQUMsZ0JBQUksSUFBSixDQUFTLEVBQUUsVUFBWCxFQUF1QixPQUF2QixLQUFtQyxJQUFJLElBQUosQ0FBUyxFQUFFLFVBQVgsRUFBdUIsT0FBdkIsRUFBbkM7QUFBb0UsV0FBL0YsRUFBaUcsR0FBakcsQ0FBcUcsU0FBUyxLQUFLLFdBQUwsQ0FBaUIsS0FBakIsQ0FBOUc7QUFGSjtBQVZGLE9BREYsR0FpQkU7QUF4QkMsS0FBUDtBQTJCRDs7QUFFRCxrQkFBaUIsU0FBakIsRUFBNEI7QUFDMUIsV0FBTyxVQUFVLEdBQVYsQ0FBYyxLQUFLO0FBQ3hCLFVBQUksRUFBRSxJQUFOLEVBQVk7QUFDVixlQUFRLEdBQUUsRUFBRSxJQUFLLEtBQUksRUFBRSxPQUFRLEdBQS9CO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTyxFQUFFLE9BQVQ7QUFDRDtBQUNGLEtBTk0sRUFNSixJQU5JLENBTUMsSUFORCxDQUFQO0FBT0Q7O0FBRUQsV0FBVSxLQUFWLEVBQWlCO0FBQ2YsUUFBSSxTQUFTLENBQUMsTUFBTSxFQUFOLElBQVksRUFBYixFQUFpQixNQUFqQixDQUF3QixNQUFNLEVBQU4sSUFBWSxFQUFwQyxDQUFiO0FBQ0EsUUFBSSxZQUFZLFFBQVEsTUFBUixFQUFnQixLQUFLLEVBQUUsT0FBdkIsQ0FBaEI7QUFDQSxXQUFPLE1BQU0sUUFBTixDQUFlLE1BQWYsQ0FBc0IsTUFBdEIsQ0FBNkIsS0FBSyxDQUFDLFVBQVUsRUFBRSxPQUFaLENBQW5DLENBQVA7QUFDRDs7QUFFRCxjQUFhLEtBQWIsRUFBb0I7QUFDbEIsUUFBSSxVQUFVLEtBQUssT0FBTCxJQUFnQixLQUFoQixHQUNaO0FBQUE7QUFBQSxRQUFJLFNBQU0sT0FBVjtBQUNFO0FBQUE7QUFBQSxVQUFJLFNBQVEsR0FBWjtBQUNFLGlCQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0IsTUFBTSxJQUE5QjtBQURGO0FBREYsS0FEWSxHQU1WLFNBTko7O0FBUUEsUUFBSSxrQkFBa0IsU0FBUyxhQUFULENBQXVCLEdBQXZCLENBQXRCO0FBQ0Esb0JBQWdCLFNBQWhCLEdBQTRCLE1BQU0sSUFBTixDQUFXLE9BQVgsQ0FBbUIsSUFBbkIsRUFBeUIsSUFBekIsRUFBK0IsT0FBL0IsQ0FBdUMsSUFBdkMsRUFBNkMsSUFBN0MsQ0FBNUI7QUFDQSxRQUFJLFdBQVcsZ0JBQWdCLFNBQWhCLENBQTBCLE9BQTFCLENBQWtDLEtBQWxDLEVBQXlDLEdBQXpDLENBQWY7O0FBRUEsV0FBTyxDQUFDO0FBQUE7QUFBQSxRQUFJLFNBQU0sU0FBVixFQUFvQixTQUFTLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBVixDQUFuQztBQUNOO0FBQUE7QUFBQSxVQUFJLFNBQU0sTUFBVjtBQUFrQixhQUFLLGVBQUwsQ0FBcUIsTUFBTSxJQUEzQjtBQUFsQixPQURNO0FBRU47QUFBQTtBQUFBLFVBQUksU0FBTSxJQUFWO0FBQWdCLGFBQUssZUFBTCxDQUFxQixNQUFNLEVBQTNCO0FBQWhCLE9BRk07QUFHTjtBQUFBO0FBQUEsVUFBSSxTQUFNLEtBQVY7QUFBaUIsYUFBSyxlQUFMLENBQXFCLEtBQUssUUFBTCxDQUFjLEtBQWQsQ0FBckI7QUFBakIsT0FITTtBQUlOO0FBQUE7QUFBQSxVQUFJLFNBQU0sU0FBVjtBQUNFO0FBQUE7QUFBQSxZQUFLLFNBQU0saUJBQVg7QUFDRTtBQUFBO0FBQUEsY0FBTSxTQUFNLFNBQVo7QUFBdUIsa0JBQU07QUFBN0IsV0FERjtBQUFBO0FBQ2tEO0FBRGxEO0FBREYsT0FKTTtBQVNOO0FBQUE7QUFBQSxVQUFJLFNBQU0sTUFBVjtBQUFrQixjQUFNO0FBQXhCLE9BVE07QUFVTjtBQUFBO0FBQUEsVUFBSSxTQUFNLFVBQVY7QUFBc0IsY0FBTTtBQUE1QjtBQVZNLEtBQUQsRUFXRCxPQVhDLENBQVA7QUFZRDtBQXZHcUI7O0FBMEd4QixPQUFPLE9BQVAsR0FBaUIsaUJBQWpCOzs7QUNwSEEsSUFBSSxNQUFNLFFBQVEsT0FBUixDQUFWO0FBQ0EsSUFBSSxXQUFXLFFBQVEsVUFBUixDQUFmO0FBQ0EsSUFBSSxTQUFTLFFBQVEsaUJBQVIsQ0FBYjs7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsU0FBUyxJQUF6QixFQUErQixJQUFJLEdBQUosRUFBL0IsRUFBMEMsRUFBQyxRQUFRLE1BQVQsRUFBMUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gcGxhY2VIb2xkZXJzQ291bnQgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcbiAgLy8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuICAvLyByZXByZXNlbnQgb25lIGJ5dGVcbiAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG4gIC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcbiAgcmV0dXJuIGI2NFtsZW4gLSAyXSA9PT0gJz0nID8gMiA6IGI2NFtsZW4gLSAxXSA9PT0gJz0nID8gMSA6IDBcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuICByZXR1cm4gKGI2NC5sZW5ndGggKiAzIC8gNCkgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIoKGxlbiAqIDMgLyA0KSAtIHBsYWNlSG9sZGVycylcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gbGVuIC0gNCA6IGxlblxuXG4gIHZhciBMID0gMFxuXG4gIGZvciAoaSA9IDA7IGkgPCBsOyBpICs9IDQpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIG91dHB1dCA9ICcnXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAyXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9PSdcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgKHVpbnQ4W2xlbiAtIDFdKVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDEwXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz0nXG4gIH1cblxuICBwYXJ0cy5wdXNoKG91dHB1dClcblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsIiIsIi8qIVxuICogQ3Jvc3MtQnJvd3NlciBTcGxpdCAxLjEuMVxuICogQ29weXJpZ2h0IDIwMDctMjAxMiBTdGV2ZW4gTGV2aXRoYW4gPHN0ZXZlbmxldml0aGFuLmNvbT5cbiAqIEF2YWlsYWJsZSB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiAqIEVDTUFTY3JpcHQgY29tcGxpYW50LCB1bmlmb3JtIGNyb3NzLWJyb3dzZXIgc3BsaXQgbWV0aG9kXG4gKi9cblxuLyoqXG4gKiBTcGxpdHMgYSBzdHJpbmcgaW50byBhbiBhcnJheSBvZiBzdHJpbmdzIHVzaW5nIGEgcmVnZXggb3Igc3RyaW5nIHNlcGFyYXRvci4gTWF0Y2hlcyBvZiB0aGVcbiAqIHNlcGFyYXRvciBhcmUgbm90IGluY2x1ZGVkIGluIHRoZSByZXN1bHQgYXJyYXkuIEhvd2V2ZXIsIGlmIGBzZXBhcmF0b3JgIGlzIGEgcmVnZXggdGhhdCBjb250YWluc1xuICogY2FwdHVyaW5nIGdyb3VwcywgYmFja3JlZmVyZW5jZXMgYXJlIHNwbGljZWQgaW50byB0aGUgcmVzdWx0IGVhY2ggdGltZSBgc2VwYXJhdG9yYCBpcyBtYXRjaGVkLlxuICogRml4ZXMgYnJvd3NlciBidWdzIGNvbXBhcmVkIHRvIHRoZSBuYXRpdmUgYFN0cmluZy5wcm90b3R5cGUuc3BsaXRgIGFuZCBjYW4gYmUgdXNlZCByZWxpYWJseVxuICogY3Jvc3MtYnJvd3Nlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgU3RyaW5nIHRvIHNwbGl0LlxuICogQHBhcmFtIHtSZWdFeHB8U3RyaW5nfSBzZXBhcmF0b3IgUmVnZXggb3Igc3RyaW5nIHRvIHVzZSBmb3Igc2VwYXJhdGluZyB0aGUgc3RyaW5nLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtsaW1pdF0gTWF4aW11bSBudW1iZXIgb2YgaXRlbXMgdG8gaW5jbHVkZSBpbiB0aGUgcmVzdWx0IGFycmF5LlxuICogQHJldHVybnMge0FycmF5fSBBcnJheSBvZiBzdWJzdHJpbmdzLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBCYXNpYyB1c2VcbiAqIHNwbGl0KCdhIGIgYyBkJywgJyAnKTtcbiAqIC8vIC0+IFsnYScsICdiJywgJ2MnLCAnZCddXG4gKlxuICogLy8gV2l0aCBsaW1pdFxuICogc3BsaXQoJ2EgYiBjIGQnLCAnICcsIDIpO1xuICogLy8gLT4gWydhJywgJ2InXVxuICpcbiAqIC8vIEJhY2tyZWZlcmVuY2VzIGluIHJlc3VsdCBhcnJheVxuICogc3BsaXQoJy4ud29yZDEgd29yZDIuLicsIC8oW2Etel0rKShcXGQrKS9pKTtcbiAqIC8vIC0+IFsnLi4nLCAnd29yZCcsICcxJywgJyAnLCAnd29yZCcsICcyJywgJy4uJ11cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24gc3BsaXQodW5kZWYpIHtcblxuICB2YXIgbmF0aXZlU3BsaXQgPSBTdHJpbmcucHJvdG90eXBlLnNwbGl0LFxuICAgIGNvbXBsaWFudEV4ZWNOcGNnID0gLygpPz8vLmV4ZWMoXCJcIilbMV0gPT09IHVuZGVmLFxuICAgIC8vIE5QQ0c6IG5vbnBhcnRpY2lwYXRpbmcgY2FwdHVyaW5nIGdyb3VwXG4gICAgc2VsZjtcblxuICBzZWxmID0gZnVuY3Rpb24oc3RyLCBzZXBhcmF0b3IsIGxpbWl0KSB7XG4gICAgLy8gSWYgYHNlcGFyYXRvcmAgaXMgbm90IGEgcmVnZXgsIHVzZSBgbmF0aXZlU3BsaXRgXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZXBhcmF0b3IpICE9PSBcIltvYmplY3QgUmVnRXhwXVwiKSB7XG4gICAgICByZXR1cm4gbmF0aXZlU3BsaXQuY2FsbChzdHIsIHNlcGFyYXRvciwgbGltaXQpO1xuICAgIH1cbiAgICB2YXIgb3V0cHV0ID0gW10sXG4gICAgICBmbGFncyA9IChzZXBhcmF0b3IuaWdub3JlQ2FzZSA/IFwiaVwiIDogXCJcIikgKyAoc2VwYXJhdG9yLm11bHRpbGluZSA/IFwibVwiIDogXCJcIikgKyAoc2VwYXJhdG9yLmV4dGVuZGVkID8gXCJ4XCIgOiBcIlwiKSArIC8vIFByb3Bvc2VkIGZvciBFUzZcbiAgICAgIChzZXBhcmF0b3Iuc3RpY2t5ID8gXCJ5XCIgOiBcIlwiKSxcbiAgICAgIC8vIEZpcmVmb3ggMytcbiAgICAgIGxhc3RMYXN0SW5kZXggPSAwLFxuICAgICAgLy8gTWFrZSBgZ2xvYmFsYCBhbmQgYXZvaWQgYGxhc3RJbmRleGAgaXNzdWVzIGJ5IHdvcmtpbmcgd2l0aCBhIGNvcHlcbiAgICAgIHNlcGFyYXRvciA9IG5ldyBSZWdFeHAoc2VwYXJhdG9yLnNvdXJjZSwgZmxhZ3MgKyBcImdcIiksXG4gICAgICBzZXBhcmF0b3IyLCBtYXRjaCwgbGFzdEluZGV4LCBsYXN0TGVuZ3RoO1xuICAgIHN0ciArPSBcIlwiOyAvLyBUeXBlLWNvbnZlcnRcbiAgICBpZiAoIWNvbXBsaWFudEV4ZWNOcGNnKSB7XG4gICAgICAvLyBEb2Vzbid0IG5lZWQgZmxhZ3MgZ3ksIGJ1dCB0aGV5IGRvbid0IGh1cnRcbiAgICAgIHNlcGFyYXRvcjIgPSBuZXcgUmVnRXhwKFwiXlwiICsgc2VwYXJhdG9yLnNvdXJjZSArIFwiJCg/IVxcXFxzKVwiLCBmbGFncyk7XG4gICAgfVxuICAgIC8qIFZhbHVlcyBmb3IgYGxpbWl0YCwgcGVyIHRoZSBzcGVjOlxuICAgICAqIElmIHVuZGVmaW5lZDogNDI5NDk2NzI5NSAvLyBNYXRoLnBvdygyLCAzMikgLSAxXG4gICAgICogSWYgMCwgSW5maW5pdHksIG9yIE5hTjogMFxuICAgICAqIElmIHBvc2l0aXZlIG51bWJlcjogbGltaXQgPSBNYXRoLmZsb29yKGxpbWl0KTsgaWYgKGxpbWl0ID4gNDI5NDk2NzI5NSkgbGltaXQgLT0gNDI5NDk2NzI5NjtcbiAgICAgKiBJZiBuZWdhdGl2ZSBudW1iZXI6IDQyOTQ5NjcyOTYgLSBNYXRoLmZsb29yKE1hdGguYWJzKGxpbWl0KSlcbiAgICAgKiBJZiBvdGhlcjogVHlwZS1jb252ZXJ0LCB0aGVuIHVzZSB0aGUgYWJvdmUgcnVsZXNcbiAgICAgKi9cbiAgICBsaW1pdCA9IGxpbWl0ID09PSB1bmRlZiA/IC0xID4+PiAwIDogLy8gTWF0aC5wb3coMiwgMzIpIC0gMVxuICAgIGxpbWl0ID4+PiAwOyAvLyBUb1VpbnQzMihsaW1pdClcbiAgICB3aGlsZSAobWF0Y2ggPSBzZXBhcmF0b3IuZXhlYyhzdHIpKSB7XG4gICAgICAvLyBgc2VwYXJhdG9yLmxhc3RJbmRleGAgaXMgbm90IHJlbGlhYmxlIGNyb3NzLWJyb3dzZXJcbiAgICAgIGxhc3RJbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgaWYgKGxhc3RJbmRleCA+IGxhc3RMYXN0SW5kZXgpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goc3RyLnNsaWNlKGxhc3RMYXN0SW5kZXgsIG1hdGNoLmluZGV4KSk7XG4gICAgICAgIC8vIEZpeCBicm93c2VycyB3aG9zZSBgZXhlY2AgbWV0aG9kcyBkb24ndCBjb25zaXN0ZW50bHkgcmV0dXJuIGB1bmRlZmluZWRgIGZvclxuICAgICAgICAvLyBub25wYXJ0aWNpcGF0aW5nIGNhcHR1cmluZyBncm91cHNcbiAgICAgICAgaWYgKCFjb21wbGlhbnRFeGVjTnBjZyAmJiBtYXRjaC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgbWF0Y2hbMF0ucmVwbGFjZShzZXBhcmF0b3IyLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldID09PSB1bmRlZikge1xuICAgICAgICAgICAgICAgIG1hdGNoW2ldID0gdW5kZWY7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gubGVuZ3RoID4gMSAmJiBtYXRjaC5pbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShvdXRwdXQsIG1hdGNoLnNsaWNlKDEpKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0TGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoO1xuICAgICAgICBsYXN0TGFzdEluZGV4ID0gbGFzdEluZGV4O1xuICAgICAgICBpZiAob3V0cHV0Lmxlbmd0aCA+PSBsaW1pdCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc2VwYXJhdG9yLmxhc3RJbmRleCA9PT0gbWF0Y2guaW5kZXgpIHtcbiAgICAgICAgc2VwYXJhdG9yLmxhc3RJbmRleCsrOyAvLyBBdm9pZCBhbiBpbmZpbml0ZSBsb29wXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChsYXN0TGFzdEluZGV4ID09PSBzdHIubGVuZ3RoKSB7XG4gICAgICBpZiAobGFzdExlbmd0aCB8fCAhc2VwYXJhdG9yLnRlc3QoXCJcIikpIHtcbiAgICAgICAgb3V0cHV0LnB1c2goXCJcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKHN0ci5zbGljZShsYXN0TGFzdEluZGV4KSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQubGVuZ3RoID4gbGltaXQgPyBvdXRwdXQuc2xpY2UoMCwgbGltaXQpIDogb3V0cHV0O1xuICB9O1xuXG4gIHJldHVybiBzZWxmO1xufSkoKTtcbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIER1ZSB0byB2YXJpb3VzIGJyb3dzZXIgYnVncywgc29tZXRpbWVzIHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24gd2lsbCBiZSB1c2VkIGV2ZW5cbiAqIHdoZW4gdGhlIGJyb3dzZXIgc3VwcG9ydHMgdHlwZWQgYXJyYXlzLlxuICpcbiAqIE5vdGU6XG4gKlxuICogICAtIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcyxcbiAqICAgICBTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOC5cbiAqXG4gKiAgIC0gQ2hyb21lIDktMTAgaXMgbWlzc2luZyB0aGUgYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbi5cbiAqXG4gKiAgIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgIGluY29ycmVjdCBsZW5ndGggaW4gc29tZSBzaXR1YXRpb25zLlxuXG4gKiBXZSBkZXRlY3QgdGhlc2UgYnVnZ3kgYnJvd3NlcnMgYW5kIHNldCBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgIHRvIGBmYWxzZWAgc28gdGhleVxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgYmVoYXZlcyBjb3JyZWN0bHkuXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlQgIT09IHVuZGVmaW5lZFxuICA/IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gIDogdHlwZWRBcnJheVN1cHBvcnQoKVxuXG4vKlxuICogRXhwb3J0IGtNYXhMZW5ndGggYWZ0ZXIgdHlwZWQgYXJyYXkgc3VwcG9ydCBpcyBkZXRlcm1pbmVkLlxuICovXG5leHBvcnRzLmtNYXhMZW5ndGggPSBrTWF4TGVuZ3RoKClcblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5fX3Byb3RvX18gPSB7X19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9fVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyICYmIC8vIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgJiYgLy8gY2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gICAgICAgIGFyci5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBrTWF4TGVuZ3RoICgpIHtcbiAgcmV0dXJuIEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gICAgPyAweDdmZmZmZmZmXG4gICAgOiAweDNmZmZmZmZmXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAodGhhdCwgbGVuZ3RoKSB7XG4gIGlmIChrTWF4TGVuZ3RoKCkgPCBsZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB0eXBlZCBhcnJheSBsZW5ndGgnKVxuICB9XG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gICAgdGhhdC5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIGlmICh0aGF0ID09PSBudWxsKSB7XG4gICAgICB0aGF0ID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gICAgfVxuICAgIHRoYXQubGVuZ3RoID0gbGVuZ3RoXG4gIH1cblxuICByZXR1cm4gdGhhdFxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiAhKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSWYgZW5jb2RpbmcgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZSh0aGlzLCBhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20odGhpcywgYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG4vLyBUT0RPOiBMZWdhY3ksIG5vdCBuZWVkZWQgYW55bW9yZS4gUmVtb3ZlIGluIG5leHQgbWFqb3IgdmVyc2lvbi5cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiBmcm9tICh0aGF0LCB2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJylcbiAgfVxuXG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHRoYXQsIHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhhdCwgdmFsdWUpXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20obnVsbCwgdmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcbiAgaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgICAvLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jICh0aGF0LCBzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIodGhhdCwgc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhudWxsLCBzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHRoYXQsIHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICB0aGF0ID0gY3JlYXRlQnVmZmVyKHRoYXQsIHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaXplOyArK2kpIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUobnVsbCwgc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAodGhhdCwgc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImVuY29kaW5nXCIgbXVzdCBiZSBhIHZhbGlkIHN0cmluZyBlbmNvZGluZycpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IHRoYXQud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIHRoYXQgPSB0aGF0LnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKHRoYXQsIGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgYXJyYXkuYnl0ZUxlbmd0aCAvLyB0aGlzIHRocm93cyBpZiBgYXJyYXlgIGlzIG5vdCBhIHZhbGlkIEFycmF5QnVmZmVyXG5cbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ29mZnNldFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnbGVuZ3RoXFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBhcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBhcnJheVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbUFycmF5TGlrZSh0aGF0LCBhcnJheSlcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdGhhdCA9IGNyZWF0ZUJ1ZmZlcih0aGF0LCBsZW4pXG5cbiAgICBpZiAodGhhdC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGF0XG4gICAgfVxuXG4gICAgb2JqLmNvcHkodGhhdCwgMCwgMCwgbGVuKVxuICAgIHJldHVybiB0aGF0XG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKCh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICAgIG9iai5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IGlzbmFuKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIodGhhdCwgMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHRoYXQsIG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IGtNYXhMZW5ndGgoKWAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBrTWF4TGVuZ3RoKCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsga01heExlbmd0aCgpLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhlIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgYW5kIGBpcy1idWZmZXJgIChpbiBTYWZhcmkgNS03KSB0byBkZXRlY3Rcbi8vIEJ1ZmZlciBpbnN0YW5jZXMuXG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoIHwgMFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkubWF0Y2goLy57Mn0vZykuam9pbignICcpXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIHZhciB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICB2YXIgeSA9IGVuZCAtIHN0YXJ0XG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIHZhciB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICB2YXIgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgIC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChpc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmXG4gICAgICAgIHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoIHwgMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIC8vIGxlZ2FjeSB3cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aCkgLSByZW1vdmUgaW4gdjAuMTNcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSArIDFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAgIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgKytpKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgMik7IGkgPCBqOyArK2kpIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgKytpKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwIHx8ICFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIGFzY2VuZGluZyBjb3B5IGZyb20gc3RhcnRcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IHV0ZjhUb0J5dGVzKG5ldyBCdWZmZXIodmFsLCBlbmNvZGluZykudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rXFwvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gaXNuYW4gKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSB2YWwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cbiIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbnZhciBkb2NjeTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkb2NjeSA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG4iLCJ2YXIgY2xpZW50ID0gcmVxdWlyZSgnLi9jbGllbnQnKVxudmFyIHhociA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZS94aHInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudChbXG4gIHJlcXVpcmUoJy4vbWlkZGxld2FyZS9qc29ucCcpLFxuICByZXF1aXJlKCcuL21pZGRsZXdhcmUvZXhjZXB0aW9uJyksXG4gIHJlcXVpcmUoJy4vbWlkZGxld2FyZS9mb3JtQnJvd3NlcicpLFxuICByZXF1aXJlKCcuL21pZGRsZXdhcmUvanNvbkJyb3dzZXInKSxcbiAgcmVxdWlyZSgnLi9taWRkbGV3YXJlL3RleHRCcm93c2VyJyksXG4gIHJlcXVpcmUoJy4vbWlkZGxld2FyZS9wYXJhbXMnKSxcbiAgcmVxdWlyZSgnLi9taWRkbGV3YXJlL3F1ZXJ5c3RyaW5nJyksXG4gIHJlcXVpcmUoJy4vbWlkZGxld2FyZS9iYXNpY0F1dGgnKSxcbiAgeGhyXG5dKVxuXG5tb2R1bGUuZXhwb3J0cy5yYXcgPSBjbGllbnQoeGhyKVxuIiwidmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZScpXG52YXIgcmVzb2x2ZVVybCA9IHJlcXVpcmUoJy4vcmVzb2x2ZVVybCcpXG5cbmZ1bmN0aW9uIGNsaWVudCAodXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlKSB7XG4gIHZhciBhcmdzID0gcGFyc2VDbGllbnRBcmd1bWVudHModXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlKVxuICByZXR1cm4gbmV3IEh0dHBpc20oYXJncy51cmwsIGFyZ3Mub3B0aW9ucyB8fCB7fSwgYXJncy5taWRkbGV3YXJlKVxufVxuXG5mdW5jdGlvbiBIdHRwaXNtICh1cmwsIG9wdGlvbnMsIG1pZGRsZXdhcmUpIHtcbiAgdGhpcy51cmwgPSB1cmxcbiAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnNcbiAgdGhpcy5taWRkbGV3YXJlID0gbWlkZGxld2FyZVxufVxuXG5IdHRwaXNtLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24gKG1ldGhvZCwgdXJsLCBib2R5LCBfb3B0aW9ucykge1xuICBjb25zb2xlLndhcm4oJ2h0dHBpc20uc2VuZCgpIGlzIGRlcHJlY2F0ZWQgcGxlYXNlIHVzZSBodHRwaXNtLnJlcXVlc3QoKScpXG4gIHJldHVybiB0aGlzLnJlcXVlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5IdHRwaXNtLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gKG1ldGhvZCwgdXJsLCBib2R5LCBfb3B0aW9ucykge1xuICB2YXIgcmVxdWVzdFxuXG4gIGlmIChtZXRob2QgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICByZXF1ZXN0ID0gbWV0aG9kXG4gIH0gZWxzZSB7XG4gICAgdmFyIG9wdGlvbnMgPSBtZXJnZUNsaWVudE9wdGlvbnMoX29wdGlvbnMsIHRoaXMuX29wdGlvbnMpXG4gICAgcmVxdWVzdCA9IHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiByZXNvbHZlVXJsKHRoaXMudXJsLCB1cmwpLFxuICAgICAgaGVhZGVyczogbG93ZXJDYXNlSGVhZGVycyhvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgYm9keTogYm9keSxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNcbiAgICB9XG4gIH1cblxuICB2YXIgc2VsZiA9IHRoaXNcblxuICBmdW5jdGlvbiBzZW5kVG9NaWRkbGV3YXJlIChpbmRleCwgcmVxKSB7XG4gICAgaWYgKGluZGV4IDwgc2VsZi5taWRkbGV3YXJlLmxlbmd0aCkge1xuICAgICAgdmFyIG1pZGRsZXdhcmUgPSBzZWxmLm1pZGRsZXdhcmVbaW5kZXhdXG4gICAgICByZXR1cm4gbWlkZGxld2FyZShyZXEsIGZ1bmN0aW9uIChuZXh0UmVxdWVzdCkgeyByZXR1cm4gc2VuZFRvTWlkZGxld2FyZShpbmRleCArIDEsIG5leHRSZXF1ZXN0IHx8IHJlcSkgfSwgc2VsZilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2VuZFRvTWlkZGxld2FyZSgwLCByZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgIGlmIChyZXF1ZXN0Lm9wdGlvbnMucmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiByZXNwb25zZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXNwb25zZUNvbXBhdGliaWxpdHkocmVzcG9uc2UpXG4gICAgICByZXR1cm4gcmVzcG9uc2UuYm9keVxuICAgIH1cbiAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5yZWRpcmVjdFJlc3BvbnNlKSB7XG4gICAgICByZXR1cm4gZS5yZWRpcmVjdFJlc3BvbnNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlc3BvbnNlQ29tcGF0aWJpbGl0eSAocmVzcG9uc2UpIHtcbiAgZnVuY3Rpb24gcmVzcG9uc2VXYXJuaW5nICgpIHtcbiAgICBjb25zb2xlLndhcm4oJ2h0dHBpc20gPj0gMy4wLjAgcmV0dXJucyB0aGUgcmVzcG9uc2UgYm9keSBieSBkZWZhdWx0LCBwbGVhc2UgcGFzcyB0aGUge3Jlc3BvbnNlOiB0cnVlfSBvcHRpb24gaWYgeW91IHdhbnQgdGhlIHdob2xlIHJlc3BvbnNlJylcbiAgfVxuXG4gIGlmIChyZXNwb25zZS5ib2R5IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgaWYgKHJlc3BvbnNlLmJvZHkgJiYgIXJlc3BvbnNlLmJvZHkuaGFzT3duUHJvcGVydHkoJ2JvZHknKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3BvbnNlLmJvZHksICdib2R5Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXNwb25zZVdhcm5pbmcoKVxuICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkgJiYgIXJlc3BvbnNlLmJvZHkuaGFzT3duUHJvcGVydHkoJ3VybCcpKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVzcG9uc2UuYm9keSwgJ3VybCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmVzcG9uc2VXYXJuaW5nKClcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UudXJsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkgJiYgIXJlc3BvbnNlLmJvZHkuaGFzT3duUHJvcGVydHkoJ3N0YXR1c0NvZGUnKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3BvbnNlLmJvZHksICdzdGF0dXNDb2RlJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXNwb25zZVdhcm5pbmcoKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5zdGF0dXNDb2RlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHJlc3BvbnNlLmJvZHkgJiYgIXJlc3BvbnNlLmJvZHkuaGFzT3duUHJvcGVydHkoJ2hlYWRlcnMnKSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlc3BvbnNlLmJvZHksICdoZWFkZXJzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXNwb25zZVdhcm5pbmcoKVxuICAgICAgICAgIHJldHVybiByZXNwb25zZS5oZWFkZXJzXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGxvd2VyQ2FzZUhlYWRlcnMgKGhlYWRlcnMpIHtcbiAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIGxvd2VyID0ga2V5LnRvTG93ZXJDYXNlKClcbiAgICBpZiAoa2V5LnRvTG93ZXJDYXNlKCkgIT09IGtleSkge1xuICAgICAgaGVhZGVyc1tsb3dlcl0gPSBoZWFkZXJzW2tleV1cbiAgICAgIGRlbGV0ZSBoZWFkZXJzW2tleV1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGhlYWRlcnNcbn1cblxuZnVuY3Rpb24gZmluZE1pZGRsZXdhcmVJbmRleGVzIChuYW1lcywgbWlkZGxld2FyZSkge1xuICByZXR1cm4gbmFtZXMubWFwKGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCBtaWRkbGV3YXJlLmxlbmd0aDsgbisrKSB7XG4gICAgICB2YXIgbSA9IG1pZGRsZXdhcmVbbl1cbiAgICAgIGlmIChtLmh0dHBpc21NaWRkbGV3YXJlICYmIG0uaHR0cGlzbU1pZGRsZXdhcmUubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gblxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiAtMVxuICB9KS5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcbiAgICByZXR1cm4gaSA+PSAwXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGluc2VydE1pZGRsZXdhcmVJbnRvSW5kZXggKG1pZGRsZXdhcmUsIG0sIGluZGV4KSB7XG4gIG1pZGRsZXdhcmUuc3BsaWNlKGluZGV4LCAwLCBtKVxufVxuXG5IdHRwaXNtLnByb3RvdHlwZS5jbGllbnQgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlKSB7XG4gIHZhciBhcmdzID0gcGFyc2VDbGllbnRBcmd1bWVudHModXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlKVxuXG4gIHZhciBjbGllbnQgPSBuZXcgSHR0cGlzbShcbiAgICByZXNvbHZlVXJsKHRoaXMudXJsLCBhcmdzLnVybCksXG4gICAgbWVyZ2VDbGllbnRPcHRpb25zKGFyZ3Mub3B0aW9ucywgdGhpcy5fb3B0aW9ucyksXG4gICAgdGhpcy5taWRkbGV3YXJlLnNsaWNlKClcbiAgKVxuXG4gIGlmIChhcmdzLm1pZGRsZXdhcmUpIHtcbiAgICBhcmdzLm1pZGRsZXdhcmUuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgY2xpZW50LnVzZShtKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gY2xpZW50XG59XG5cbkh0dHBpc20ucHJvdG90eXBlLmFwaSA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMsIG1pZGRsZXdhcmUpIHtcbiAgY29uc29sZS53YXJuKCdodHRwaXNtID49IDMuMC4wIHJlbmFtZWQgaHR0cGlzbS5hcGkoKSB0byBodHRwaXNtLmNsaWVudCgpLCBwbGVhc2UgdXBkYXRlIHlvdXIgdXNhZ2UnKVxuICByZXR1cm4gdGhpcy5jbGllbnQodXJsLCBvcHRpb25zLCBtaWRkbGV3YXJlKVxufVxuXG5IdHRwaXNtLnByb3RvdHlwZS5pbnNlcnRNaWRkbGV3YXJlID0gZnVuY3Rpb24gKG0pIHtcbiAgY29uc29sZS53YXJuKCdodHRwaXNtID49IDMuMC4wIHJlbmFtZWQgaHR0cGlzbS5pbnNlcnRNaWRkbGV3YXJlKCkgdG8gaHR0cGlzbS51c2UoKSwgcGxlYXNlIHVwZGF0ZSB5b3VyIHVzYWdlJylcbiAgcmV0dXJuIHRoaXMudXNlKG0pXG59XG5cbkh0dHBpc20ucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIChtKSB7XG4gIHZhciBtZXRhID0gbS5odHRwaXNtTWlkZGxld2FyZVxuXG4gIGlmIChtZXRhICYmIChtZXRhLmJlZm9yZSB8fCBtZXRhLmFmdGVyKSkge1xuICAgIHZhciBwb3NpdGlvbiA9IG1ldGEuYmVmb3JlIHx8IG1ldGEuYWZ0ZXJcbiAgICB2YXIgbmFtZXMgPSB0eXBlb2YgcG9zaXRpb24gPT09ICdzdHJpbmcnID8gW3Bvc2l0aW9uXSA6IHBvc2l0aW9uXG4gICAgdmFyIGluZGV4ZXMgPSBmaW5kTWlkZGxld2FyZUluZGV4ZXMobmFtZXMsIHRoaXMubWlkZGxld2FyZSlcbiAgICBpZiAoaW5kZXhlcy5sZW5ndGgpIHtcbiAgICAgIHZhciBpbmRleCA9IG1ldGEuYmVmb3JlID8gTWF0aC5taW4uYXBwbHkoTWF0aCwgaW5kZXhlcykgOiBNYXRoLm1heC5hcHBseShNYXRoLCBpbmRleGVzKSArIDFcblxuICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgaW5zZXJ0TWlkZGxld2FyZUludG9JbmRleCh0aGlzLm1pZGRsZXdhcmUsIG0sIGluZGV4KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ25vIHN1Y2ggbWlkZGxld2FyZTogJyArIChtZXRhLmJlZm9yZSB8fCBtZXRhLmFmdGVyKSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm1pZGRsZXdhcmUudW5zaGlmdChtKVxuICB9XG59XG5cbkh0dHBpc20ucHJvdG90eXBlLnJlbW92ZU1pZGRsZXdhcmUgPSBmdW5jdGlvbiAobmFtZSkge1xuICBjb25zb2xlLndhcm4oJ2h0dHBpc20ucmVtb3ZlTWlkZGxld2FyZSgpIGlzIGRlcHJlY2F0ZWQgcGxlYXNlIHVzZSBodHRwaXNtLnJlbW92ZSgpJylcbiAgdGhpcy5yZW1vdmUobmFtZSlcbn1cblxuSHR0cGlzbS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyIGluZGV4ZXMgPSBmaW5kTWlkZGxld2FyZUluZGV4ZXMoW25hbWVdLCB0aGlzLm1pZGRsZXdhcmUpXG4gIGZvciAodmFyIGkgPSBpbmRleGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdGhpcy5taWRkbGV3YXJlLnNwbGljZShpbmRleGVzW2ldLCAxKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZE1ldGhvZCAobWV0aG9kKSB7XG4gIEh0dHBpc20ucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXRob2QsIHVybCwgdW5kZWZpbmVkLCBvcHRpb25zKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZE1ldGhvZFdpdGhCb2R5IChtZXRob2QpIHtcbiAgSHR0cGlzbS5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uICh1cmwsIGJvZHksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1ldGhvZCwgdXJsLCBib2R5LCBvcHRpb25zKVxuICB9XG59XG5cbmFkZE1ldGhvZCgnZ2V0JylcbmFkZE1ldGhvZCgnZGVsZXRlJylcbmFkZE1ldGhvZCgnaGVhZCcpXG5hZGRNZXRob2RXaXRoQm9keSgncG9zdCcpXG5hZGRNZXRob2RXaXRoQm9keSgncHV0JylcbmFkZE1ldGhvZFdpdGhCb2R5KCdwYXRjaCcpXG5hZGRNZXRob2RXaXRoQm9keSgnb3B0aW9ucycpXG5cbmZ1bmN0aW9uIHBhcnNlQ2xpZW50QXJndW1lbnRzICgpIHtcbiAgdmFyIHVybCwgb3B0aW9ucywgbWlkZGxld2FyZVxuXG4gIGZvciAodmFyIG4gPSAwOyBuIDwgYXJndW1lbnRzLmxlbmd0aDsgbisrKSB7XG4gICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tuXVxuXG4gICAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgICB1cmwgPSBhcmdcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG1pZGRsZXdhcmUgPSBbYXJnXVxuICAgIH0gZWxzZSBpZiAoYXJnIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIG1pZGRsZXdhcmUgPSBhcmdcbiAgICB9IGVsc2UgaWYgKGFyZyBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgb3B0aW9ucyA9IGFyZ1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXJsOiB1cmwsXG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBtaWRkbGV3YXJlOiBtaWRkbGV3YXJlXG4gIH1cbn1cblxuZnVuY3Rpb24gbWVyZ2VDbGllbnRPcHRpb25zICh4LCB5KSB7XG4gIHZhciB6ID0gbWVyZ2UoeCwgeSlcbiAgaWYgKHogJiYgei5oZWFkZXJzKSB7IHouaGVhZGVycyA9IG1lcmdlKHggJiYgeC5oZWFkZXJzLCB5ICYmIHkuaGVhZGVycykgfVxuICByZXR1cm4gelxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsaWVudFxuIiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJy4vZXh0ZW5kJylcbnZhciBwYXJzZVVyaSA9IHJlcXVpcmUoJy4vcGFyc2VVcmknKVxudmFyIHF1ZXJ5c3RyaW5nTGl0ZSA9IHJlcXVpcmUoJy4vcXVlcnlzdHJpbmctbGl0ZScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXhwYW5kVXJsIChwYXR0ZXJuLCBfcGFyYW1zLCBfcXMpIHtcbiAgdmFyIHFzID0gX3FzIHx8IHF1ZXJ5c3RyaW5nTGl0ZVxuICB2YXIgcGFyYW1zID0gX3BhcmFtcyB8fCB7fVxuICB2YXIgb25seVF1ZXJ5UGFyYW1zID0gZXh0ZW5kKHt9LCBwYXJhbXMpXG5cbiAgdmFyIHVyaSA9IHBhcnNlVXJpKHBhdHRlcm4pXG4gIHZhciBwYXRoUGF0dGVybiA9IHVyaS5wYXRobmFtZVxuICB2YXIgcGF0aCA9IHBhdGhQYXR0ZXJuLnJlcGxhY2UoLzooW2Etel9dW2EtejAtOV9dKilcXCovZ2ksIGZ1bmN0aW9uIChfLCBpZCkge1xuICAgIHZhciBwYXJhbSA9IHBhcmFtc1tpZF1cbiAgICBkZWxldGUgb25seVF1ZXJ5UGFyYW1zW2lkXVxuICAgIHJldHVybiBlbmNvZGVVUkkocGFyYW1Ub1N0cmluZyhwYXJhbSkpXG4gIH0pXG5cbiAgcGF0aCA9IHBhdGgucmVwbGFjZSgvOihbYS16X11bYS16MC05X10qKS9naSwgZnVuY3Rpb24gKF8sIGlkKSB7XG4gICAgdmFyIHBhcmFtID0gcGFyYW1zW2lkXVxuICAgIGRlbGV0ZSBvbmx5UXVlcnlQYXJhbXNbaWRdXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChwYXJhbVRvU3RyaW5nKHBhcmFtKSlcbiAgfSlcblxuICB2YXIgcXVlcnkgPSBxcy5zdHJpbmdpZnkoZXh0ZW5kKHFzLnBhcnNlKHVyaS5zZWFyY2gucmVwbGFjZSgvXlxcPy8sICcnKSksIG9ubHlRdWVyeVBhcmFtcykpXG5cbiAgdmFyIGZ1bGxwYXRoID0gcXVlcnkgPyBwYXRoICsgJz8nICsgcXVlcnkgOiBwYXRoXG5cbiAgcmV0dXJuIHVyaS5wcm90b2NvbCArIHVyaS5hdXRob3JpdHkgKyBmdWxscGF0aCArIHVyaS5oYXNoXG59XG5cbmZ1bmN0aW9uIHBhcmFtVG9TdHJpbmcgKHApIHtcbiAgaWYgKHAgPT09IHVuZGVmaW5lZCB8fCBwID09PSBudWxsKSB7XG4gICAgcmV0dXJuICcnXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBleHRlbnNpb24pIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhleHRlbnNpb24pXG5cbiAgZm9yICh2YXIgbiA9IDA7IG4gPCBrZXlzLmxlbmd0aDsgbisrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbbl1cbiAgICBvYmplY3Rba2V5XSA9IGV4dGVuc2lvbltrZXldXG4gIH1cblxuICByZXR1cm4gb2JqZWN0XG59XG4iLCJ2YXIgZXh0ZW5kID0gcmVxdWlyZSgnLi9leHRlbmQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gIGlmICh4ICYmIHkpIHtcbiAgICB2YXIgciA9IHt9XG5cbiAgICBleHRlbmQociwgeSlcbiAgICBleHRlbmQociwgeClcblxuICAgIHJldHVybiByXG4gIH0gZWxzZSBpZiAoeSkge1xuICAgIHJldHVybiB5XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHhcbiAgfVxufVxuIiwidmFyIG1lcmdlID0gcmVxdWlyZSgnLi9tZXJnZScpXG52YXIgcXVlcnlzdHJpbmdMaXRlID0gcmVxdWlyZSgnLi9xdWVyeXN0cmluZy1saXRlJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVxdWVzdCkge1xuICB2YXIgcXMgPSByZXF1ZXN0Lm9wdGlvbnMucXMgfHwgcXVlcnlzdHJpbmdMaXRlXG5cbiAgdmFyIHNwbGl0ID0gcmVxdWVzdC51cmwuc3BsaXQoJz8nKVxuICB2YXIgcGF0aCA9IHNwbGl0WzBdXG4gIHZhciBxdWVyeXN0cmluZyA9IHFzLnBhcnNlKHNwbGl0WzFdIHx8ICcnKVxuICB2YXIgbWVyZ2VkUXVlcnlTdHJpbmcgPSBtZXJnZShyZXF1ZXN0Lm9wdGlvbnMucXVlcnlzdHJpbmcsIHF1ZXJ5c3RyaW5nKVxuXG4gIHJlcXVlc3QudXJsID0gcGF0aCArICc/JyArIHFzLnN0cmluZ2lmeShtZXJnZWRRdWVyeVN0cmluZylcbn1cbiIsInZhciBtaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9taWRkbGV3YXJlJylcbnZhciB1cmxVdGlscyA9IHJlcXVpcmUoJ3VybCcpXG5cbmZ1bmN0aW9uIGVuY29kZUJhc2ljQXV0aG9yaXphdGlvbkhlYWRlciAocykge1xuICByZXR1cm4gJ0Jhc2ljICcgKyBCdWZmZXIuZnJvbShzKS50b1N0cmluZygnYmFzZTY0Jylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtaWRkbGV3YXJlKCdiYXNpY0F1dGgnLCBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuICBmdW5jdGlvbiBiYXNpY0F1dGhvcml6YXRpb25IZWFkZXIgKCkge1xuICAgIGlmIChyZXF1ZXN0Lm9wdGlvbnMuYmFzaWNBdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSByZXF1ZXN0Lm9wdGlvbnMuYmFzaWNBdXRoLnVzZXJuYW1lIHx8ICcnXG4gICAgICB2YXIgcGFzc3dvcmQgPSByZXF1ZXN0Lm9wdGlvbnMuYmFzaWNBdXRoLnBhc3N3b3JkIHx8ICcnXG5cbiAgICAgIHJldHVybiBlbmNvZGVCYXNpY0F1dGhvcml6YXRpb25IZWFkZXIodXNlcm5hbWUucmVwbGFjZSgvOi9nLCAnJykgKyAnOicgKyBwYXNzd29yZClcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVybCA9IHVybFV0aWxzLnBhcnNlKHJlcXVlc3QudXJsKVxuICAgICAgaWYgKHVybC5hdXRoKSB7XG4gICAgICAgIHJldHVybiBlbmNvZGVCYXNpY0F1dGhvcml6YXRpb25IZWFkZXIodXJsLmF1dGgpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGhlYWRlciA9IGJhc2ljQXV0aG9yaXphdGlvbkhlYWRlcigpXG4gIGlmIChoZWFkZXIpIHtcbiAgICByZXF1ZXN0LmhlYWRlcnMuYXV0aG9yaXphdGlvbiA9IGhlYWRlclxuICB9XG5cbiAgcmV0dXJuIG5leHQoKVxufSlcbiIsInZhciBtaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9taWRkbGV3YXJlJylcbnZhciBleHRlbmQgPSByZXF1aXJlKCcuLi9leHRlbmQnKVxudmFyIG9iZnVzY2F0ZVVybFBhc3N3b3JkID0gcmVxdWlyZSgnLi4vb2JmdXNjYXRlVXJsUGFzc3dvcmQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1pZGRsZXdhcmUoJ2V4Y2VwdGlvbicsIGZ1bmN0aW9uIChyZXF1ZXN0LCBuZXh0KSB7XG4gIHJldHVybiBuZXh0KCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICB2YXIgZXhjZXB0aW9ucyA9IHJlcXVlc3Qub3B0aW9ucy5leGNlcHRpb25zXG4gICAgdmFyIGlzRXhjZXB0aW9uID0gZXhjZXB0aW9ucyA9PT0gZmFsc2UgPyBmYWxzZSA6IHR5cGVvZiBleGNlcHRpb25zID09PSAnZnVuY3Rpb24nID8gZXhjZXB0aW9ucyhyZXNwb25zZSkgOiByZXNwb25zZS5zdGF0dXNDb2RlID49IDQwMFxuXG4gICAgaWYgKGlzRXhjZXB0aW9uKSB7XG4gICAgICB2YXIgbXNnID0gcmVxdWVzdC5tZXRob2QudG9VcHBlckNhc2UoKSArICcgJyArIG9iZnVzY2F0ZVVybFBhc3N3b3JkKHJlcXVlc3QudXJsKSArICcgPT4gJyArIHJlc3BvbnNlLnN0YXR1c0NvZGUgKyAnICcgKyByZXNwb25zZS5zdGF0dXNUZXh0XG4gICAgICB2YXIgZXJyb3IgPSBleHRlbmQobmV3IEVycm9yKG1zZyksIHJlc3BvbnNlKVxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlXG4gICAgfVxuICB9KVxufSlcbiIsInZhciBtaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9taWRkbGV3YXJlJylcblxudmFyIHNldEhlYWRlclRvID0gcmVxdWlyZSgnLi4vc2V0SGVhZGVyVG8nKVxudmFyIHNob3VsZFBhcnNlQXMgPSByZXF1aXJlKCcuLi9zaG91bGRQYXJzZUFzJylcbnZhciBxdWVyeXN0cmluZ0xpdGUgPSByZXF1aXJlKCcuLi9xdWVyeXN0cmluZy1saXRlJylcblxubW9kdWxlLmV4cG9ydHMgPSBtaWRkbGV3YXJlKCdmb3JtJywgZnVuY3Rpb24gKHJlcXVlc3QsIG5leHQpIHtcbiAgaWYgKHJlcXVlc3Qub3B0aW9ucy5mb3JtICYmIHJlcXVlc3QuYm9keSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgIHZhciBxdWVyeXN0cmluZyA9IHJlcXVlc3Qub3B0aW9ucy5xcyB8fCBxdWVyeXN0cmluZ0xpdGVcbiAgICByZXF1ZXN0LmJvZHkgPSBxdWVyeXN0cmluZy5zdHJpbmdpZnkocmVxdWVzdC5ib2R5KVxuICAgIHNldEhlYWRlclRvKHJlcXVlc3QsICdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJylcbiAgfVxuXG4gIHJldHVybiBuZXh0KCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICB2YXIgcXVlcnlzdHJpbmcgPSByZXF1ZXN0Lm9wdGlvbnMucXMgfHwgcXVlcnlzdHJpbmdMaXRlXG4gICAgaWYgKHNob3VsZFBhcnNlQXMocmVzcG9uc2UsICdmb3JtJywgcmVxdWVzdCkpIHtcbiAgICAgIHJlc3BvbnNlLmJvZHkgPSBxdWVyeXN0cmluZy5wYXJzZShyZXNwb25zZS5ib2R5KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfSlcbn0pXG4iLCIvKiBnbG9iYWwgRm9ybURhdGEgKi9cblxudmFyIG1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL21pZGRsZXdhcmUnKVxuXG52YXIgc2V0SGVhZGVyVG8gPSByZXF1aXJlKCcuLi9zZXRIZWFkZXJUbycpXG52YXIgc2hvdWxkUGFyc2VBcyA9IHJlcXVpcmUoJy4uL3Nob3VsZFBhcnNlQXMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1pZGRsZXdhcmUoJ2pzb24nLCBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuICBpZiAoIShyZXF1ZXN0LmJvZHkgaW5zdGFuY2VvZiBGb3JtRGF0YSkgJiYgcmVxdWVzdC5ib2R5IGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgcmVxdWVzdC5ib2R5ID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5ib2R5KVxuICAgIHNldEhlYWRlclRvKHJlcXVlc3QsICdjb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpXG4gIH1cblxuICBzZXRIZWFkZXJUbyhyZXF1ZXN0LCAnYWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKVxuXG4gIHJldHVybiBuZXh0KCkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICBpZiAoc2hvdWxkUGFyc2VBcyhyZXNwb25zZSwgJ2pzb24nLCByZXF1ZXN0KSkge1xuICAgICAgcmVzcG9uc2UuYm9keSA9IEpTT04ucGFyc2UocmVzcG9uc2UuYm9keSwgcmVxdWVzdC5vcHRpb25zLmpzb25SZXZpdmVyKVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfSlcbn0pXG4iLCJ2YXIgbWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZScpXG52YXIgcmFuZG9tU3RyaW5nID0gcmVxdWlyZSgncmFuZG9tLXN0cmluZycpXG52YXIgbWVyZ2VRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4uL21lcmdlUXVlcnlTdHJpbmcnKVxuXG5mdW5jdGlvbiByYW5kb21HbG9iYWwgKHZhbHVlKSB7XG4gIHZhciBuYW1lXG5cbiAgZG8ge1xuICAgIG5hbWUgPSAnXycgKyByYW5kb21TdHJpbmcoe2xlbmd0aDogMjB9KVxuICB9IHdoaWxlICh0eXBlb2Ygd2luZG93W25hbWVdICE9PSAndW5kZWZpbmVkJylcblxuICB3aW5kb3dbbmFtZV0gPSB2YWx1ZVxuXG4gIHJldHVybiBuYW1lXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWlkZGxld2FyZSgnanNvbnAnLCBmdW5jdGlvbiAocmVxdWVzdCwgbmV4dCkge1xuICB2YXIganNvbnAgPSByZXF1ZXN0Lm9wdGlvbnMuanNvbnBcblxuICBpZiAoanNvbnApIHtcbiAgICByZXF1ZXN0Lm9wdGlvbnMucXVlcnlzdHJpbmcgPSByZXF1ZXN0Lm9wdGlvbnMucXVlcnlzdHJpbmcgfHwge31cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgY2FsbGJhY2tOYW1lID0gcmFuZG9tR2xvYmFsKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGRlbGV0ZSB3aW5kb3dbY2FsbGJhY2tOYW1lXVxuICAgICAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHNjcmlwdClcbiAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICAgIGJvZHk6IHZcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHJlcXVlc3Qub3B0aW9ucy5xdWVyeXN0cmluZ1tqc29ucF0gPSBjYWxsYmFja05hbWVcblxuICAgICAgbWVyZ2VRdWVyeVN0cmluZyhyZXF1ZXN0KVxuXG4gICAgICB2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICAgIHNjcmlwdC50eXBlID0gJ3RleHQvamF2YXNjcmlwdCdcbiAgICAgIHNjcmlwdC5zcmMgPSByZXF1ZXN0LnVybFxuICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ2NvdWxkIG5vdCBsb2FkIHNjcmlwdCB0YWcgZm9yIEpTT05QIHJlcXVlc3Q6ICcgKyByZXF1ZXN0LnVybCkpXG4gICAgICB9XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5leHQoKVxufSlcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gIGZuLmh0dHBpc21NaWRkbGV3YXJlID0ge1xuICAgIG5hbWU6IG5hbWVcbiAgfVxuICByZXR1cm4gZm5cbn1cbiIsInZhciBtaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9taWRkbGV3YXJlJylcbnZhciBleHBhbmRVcmwgPSByZXF1aXJlKCcuLi9leHBhbmRVcmwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1pZGRsZXdhcmUoJ3BhcmFtcycsIGZ1bmN0aW9uIChyZXF1ZXN0LCBuZXh0KSB7XG4gIGlmIChyZXF1ZXN0Lm9wdGlvbnMucGFyYW1zIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgdmFyIHJlbmRlciA9IHJlcXVlc3Qub3B0aW9ucy5leHBhbmRVcmwgfHwgZXhwYW5kVXJsXG4gICAgcmVxdWVzdC51cmwgPSByZW5kZXIocmVxdWVzdC51cmwsIHJlcXVlc3Qub3B0aW9ucy5wYXJhbXMsIHJlcXVlc3Qub3B0aW9ucy5xcylcbiAgfVxuXG4gIHJldHVybiBuZXh0KClcbn0pXG4iLCJ2YXIgbWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZScpXG52YXIgbWVyZ2VRdWVyeVN0cmluZyA9IHJlcXVpcmUoJy4uL21lcmdlUXVlcnlTdHJpbmcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1pZGRsZXdhcmUoJ3F1ZXJ5c3RyaW5nJywgZnVuY3Rpb24gKHJlcXVlc3QsIG5leHQpIHtcbiAgaWYgKHJlcXVlc3Qub3B0aW9ucy5xdWVyeXN0cmluZyBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgIGNvbnNvbGUud2Fybignb3B0aW9ucy5xdWVyeXN0cmluZyBpcyBkZXByZWNhdGVkLCBwbGVhc2Ugc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mZWF0dXJpc3QvaHR0cGlzbSNwYXJhbXMnKVxuICAgIG1lcmdlUXVlcnlTdHJpbmcocmVxdWVzdClcbiAgfVxuXG4gIHJldHVybiBuZXh0KClcbn0pXG4iLCJ2YXIgbWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZScpXG52YXIgc2V0SGVhZGVyVG8gPSByZXF1aXJlKCcuLi9zZXRIZWFkZXJUbycpXG5cbm1vZHVsZS5leHBvcnRzID0gbWlkZGxld2FyZSgndGV4dCcsIGZ1bmN0aW9uIChyZXF1ZXN0LCBuZXh0KSB7XG4gIGlmICh0eXBlb2YgcmVxdWVzdC5ib2R5ID09PSAnc3RyaW5nJykge1xuICAgIHNldEhlYWRlclRvKHJlcXVlc3QsICdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgfVxuXG4gIHJldHVybiBuZXh0KClcbn0pXG4iLCJ2YXIgbWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vbWlkZGxld2FyZScpXG5cbmZ1bmN0aW9uIHRvVXBwZXJDYXNlICh4KSB7XG4gIHJldHVybiB4LnRvVXBwZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gZm9ybWF0SGVhZGVyTmFtZSAobmFtZSkge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9eKFthLXpdKS8sIHRvVXBwZXJDYXNlKS5yZXBsYWNlKC8tKFthLXpdKS9nLCB0b1VwcGVyQ2FzZSlcbn1cblxuZnVuY3Rpb24gc2V0SGVhZGVycyAoaGVhZGVycywgeGhyKSB7XG4gIHZhciBoZWFkZXJOYW1lcyA9IE9iamVjdC5rZXlzKGhlYWRlcnMpXG5cbiAgZm9yICh2YXIgbiA9IDA7IG4gPCBoZWFkZXJOYW1lcy5sZW5ndGg7IG4rKykge1xuICAgIHZhciBrZXkgPSBoZWFkZXJOYW1lc1tuXVxuICAgIHZhciBoZWFkZXJOYW1lID0gZm9ybWF0SGVhZGVyTmFtZShrZXkpXG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyTmFtZSwgaGVhZGVyc1trZXldKVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzQ3Jvc3NEb21haW4gKHVybCkge1xuICByZXR1cm4gL15odHRwcz86XFwvXFwvLy50ZXN0KHVybClcbn1cblxuZnVuY3Rpb24gcmVzcG9uc2VVcmwgKHhociwgcmVxdWVzdFVybCkge1xuICB2YXIgb3JpZ2luID0gd2luZG93LmxvY2F0aW9uLm9yaWdpblxuICB2YXIgcmVzcG9uc2VVcmwgPSB4aHIucmVzcG9uc2VVUkxcblxuICBpZiAocmVzcG9uc2VVcmwpIHtcbiAgICBpZiAocmVzcG9uc2VVcmwuc3Vic3RyaW5nKDAsIG9yaWdpbi5sZW5ndGgpID09PSBvcmlnaW4pIHtcbiAgICAgIHJldHVybiByZXNwb25zZVVybC5zdWJzdHJpbmcob3JpZ2luLmxlbmd0aClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlVXJsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiByZXF1ZXN0VXJsXG4gIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJzIChoZWFkZXJzKSB7XG4gIHZhciBvYmplY3QgPSB7fVxuICB2YXIgbGluZXMgPSBoZWFkZXJzLnNwbGl0KCdcXG4nKVxuXG4gIGZvciAodmFyIG4gPSAwOyBuIDwgbGluZXMubGVuZ3RoOyBuKyspIHtcbiAgICB2YXIgbGluZSA9IGxpbmVzW25dXG4gICAgdmFyIG1hdGNoID0gL14oLio/KTooLiopLy5leGVjKGxpbmUpXG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIG9iamVjdFttYXRjaFsxXS50b0xvd2VyQ2FzZSgpXSA9IG1hdGNoWzJdLnRyaW0oKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmplY3Rcbn1cblxuZnVuY3Rpb24gYWRkQWJvcnRUb1Byb21pc2UgKHByb21pc2UsIGFib3J0KSB7XG4gIHZhciB0aGVuID0gcHJvbWlzZS50aGVuXG4gIHByb21pc2UudGhlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcCA9IHRoZW4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHAuYWJvcnQgPSBhYm9ydFxuICAgIGFkZEFib3J0VG9Qcm9taXNlKHAsIGFib3J0KVxuICAgIHJldHVybiBwXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtaWRkbGV3YXJlKCd4aHInLCBmdW5jdGlvbiAocmVxdWVzdCkge1xuICB2YXIgWGhyID0gcmVxdWVzdC5vcHRpb25zLnhociB8fCB3aW5kb3cuWE1MSHR0cFJlcXVlc3RcbiAgdmFyIHhociA9IG5ldyBYaHIoKVxuICB2YXIgcmVqZWN0UHJvbWlzZVxuXG4gIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlamVjdFByb21pc2UgPSByZWplY3RcbiAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGF0dXNDb2RlID0geGhyLnN0YXR1c1xuXG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGJvZHk6IHN0YXR1c0NvZGUgPT09IDIwNCA/IHVuZGVmaW5lZCA6IHhoci5yZXNwb25zZVRleHQsXG4gICAgICAgIGhlYWRlcnM6IHBhcnNlSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpLFxuICAgICAgICBzdGF0dXNDb2RlOiBzdGF0dXNDb2RlLFxuICAgICAgICB1cmw6IHJlc3BvbnNlVXJsKHhociwgcmVxdWVzdC51cmwpLFxuICAgICAgICB4aHI6IHhocixcbiAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHRcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZShyZXNwb25zZSlcbiAgICB9XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdFByb21pc2UobmV3IEVycm9yKCdmYWlsZWQgdG8gY29ubmVjdCB0byAnICsgcmVxdWVzdC5tZXRob2QgKyAnICcgKyByZXF1ZXN0LnVybCkpXG4gICAgfVxuXG4gICAgaWYgKCFpc0Nyb3NzRG9tYWluKHJlcXVlc3QudXJsKSAmJiAhcmVxdWVzdC5oZWFkZXJzWyd4LXJlcXVlc3RlZC13aXRoJ10pIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVyc1sneC1yZXF1ZXN0ZWQtd2l0aCddID0gJ1hNTEh0dHBSZXF1ZXN0J1xuICAgIH1cblxuICAgIHNldEhlYWRlcnMocmVxdWVzdC5oZWFkZXJzLCB4aHIpXG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhcmVxdWVzdC5vcHRpb25zLndpdGhDcmVkZW50aWFsc1xuXG4gICAgeGhyLnNlbmQocmVxdWVzdC5ib2R5KVxuICB9KVxuXG4gIGZ1bmN0aW9uIGFib3J0ICgpIHtcbiAgICB4aHIuYWJvcnQoKVxuICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignYWJvcnRlZCBjb25uZWN0aW9uIHRvICcgKyByZXF1ZXN0Lm1ldGhvZCArICcgJyArIHJlcXVlc3QudXJsKVxuICAgIGVycm9yLmFib3J0ZWQgPSB0cnVlXG4gICAgcmVqZWN0UHJvbWlzZShlcnJvcilcbiAgfVxuICBhZGRBYm9ydFRvUHJvbWlzZShwcm9taXNlLCBhYm9ydClcblxuICByZXR1cm4gcHJvbWlzZVxufSlcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHVybCkge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL14oWy1hLXpdKjpcXC9cXC9bXjpdKjopW15AXSpALywgZnVuY3Rpb24gKF8sIGZpcnN0KSB7IHJldHVybiBmaXJzdCArICcqKioqKioqKkAnIH0pXG59XG4iLCIvLyBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1lhZmZsZS8xMDg4ODUwXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VVUkkgKHVybCkge1xuICB2YXIgbSA9IFN0cmluZyh1cmwpLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKS5tYXRjaCgvXihbXjovPyNdKzopPyhcXC9cXC8oPzpbXjpAXSooPzo6W146QF0qKT9AKT8oKFteOi8/I10qKSg/OjooXFxkKikpPykpPyhbXj8jXSopKFxcP1teI10qKT8oI1tcXHNcXFNdKik/LylcbiAgLy8gYXV0aG9yaXR5ID0gJy8vJyArIHVzZXIgKyAnOicgKyBwYXNzICdAJyArIGhvc3RuYW1lICsgJzonIHBvcnRcbiAgcmV0dXJuIChtID8ge1xuICAgIGhyZWY6IG1bMF0gfHwgJycsXG4gICAgcHJvdG9jb2w6IG1bMV0gfHwgJycsXG4gICAgYXV0aG9yaXR5OiBtWzJdIHx8ICcnLFxuICAgIGhvc3Q6IG1bM10gfHwgJycsXG4gICAgaG9zdG5hbWU6IG1bNF0gfHwgJycsXG4gICAgcG9ydDogbVs1XSB8fCAnJyxcbiAgICBwYXRobmFtZTogbVs2XSB8fCAnJyxcbiAgICBzZWFyY2g6IG1bN10gfHwgJycsXG4gICAgaGFzaDogbVs4XSB8fCAnJ1xuICB9IDogbnVsbClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBwYXJzZTogZnVuY3Rpb24gKHN0cmluZykge1xuICAgIHZhciBwYXJhbXMgPSB7fVxuXG4gICAgc3RyaW5nLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbiAoY29tcG9uZW50KSB7XG4gICAgICB2YXIgc3BsaXQgPSBjb21wb25lbnQuc3BsaXQoJz0nKVxuICAgICAgaWYgKHNwbGl0WzFdKSB7XG4gICAgICAgIHBhcmFtc1tkZWNvZGVVUklDb21wb25lbnQoc3BsaXRbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChzcGxpdFsxXSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIHBhcmFtc1xuICB9LFxuXG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhwYXJhbXMpXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiAocGFyYW1zW2tleV0pICE9PSAndW5kZWZpbmVkJ1xuICAgICAgfSlcbiAgICAgIC5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQocGFyYW1zW2tleV0pXG4gICAgICB9KVxuICAgICAgLmpvaW4oJyYnKVxuICB9XG59XG4iLCIvLyBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL1lhZmZsZS8xMDg4ODUwXG5cbnZhciBwYXJzZVVyaSA9IHJlcXVpcmUoJy4vcGFyc2VVcmknKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiYXNlLCBocmVmKSB7IC8vIFJGQyAzOTg2XG4gIGZ1bmN0aW9uIHJlbW92ZURvdFNlZ21lbnRzIChpbnB1dCkge1xuICAgIHZhciBvdXRwdXQgPSBbXVxuICAgIGlucHV0LnJlcGxhY2UoL14oXFwuXFwuPyhcXC98JCkpKy8sICcnKVxuICAgICAgICAgLnJlcGxhY2UoL1xcLyhcXC4oXFwvfCQpKSsvZywgJy8nKVxuICAgICAgICAgLnJlcGxhY2UoL1xcL1xcLlxcLiQvLCAnLy4uLycpXG4gICAgICAgICAucmVwbGFjZSgvXFwvP1teL10qL2csIGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgIGlmIChwID09PSAnLy4uJykge1xuICAgICAgICAgICAgIG91dHB1dC5wb3AoKVxuICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgIG91dHB1dC5wdXNoKHApXG4gICAgICAgICAgIH1cbiAgICAgICAgIH0pXG4gICAgcmV0dXJuIG91dHB1dC5qb2luKCcnKS5yZXBsYWNlKC9eXFwvLywgaW5wdXQuY2hhckF0KDApID09PSAnLycgPyAnLycgOiAnJylcbiAgfVxuXG4gIGhyZWYgPSBwYXJzZVVyaShocmVmIHx8ICcnKVxuICBiYXNlID0gcGFyc2VVcmkoYmFzZSB8fCAnJylcblxuICByZXR1cm4gIWhyZWYgfHwgIWJhc2UgPyBudWxsIDogKGhyZWYucHJvdG9jb2wgfHwgYmFzZS5wcm90b2NvbCkgK1xuICAgICAgICAgKGhyZWYucHJvdG9jb2wgfHwgaHJlZi5hdXRob3JpdHkgPyBocmVmLmF1dGhvcml0eSA6IGJhc2UuYXV0aG9yaXR5KSArXG4gICAgICAgICByZW1vdmVEb3RTZWdtZW50cyhocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycgPyBocmVmLnBhdGhuYW1lIDogKGhyZWYucGF0aG5hbWUgPyAoKGJhc2UuYXV0aG9yaXR5ICYmICFiYXNlLnBhdGhuYW1lID8gJy8nIDogJycpICsgYmFzZS5wYXRobmFtZS5zbGljZSgwLCBiYXNlLnBhdGhuYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKSArIGhyZWYucGF0aG5hbWUpIDogYmFzZS5wYXRobmFtZSkpICtcbiAgICAgICAgIChocmVmLnByb3RvY29sIHx8IGhyZWYuYXV0aG9yaXR5IHx8IGhyZWYucGF0aG5hbWUgPyBocmVmLnNlYXJjaCA6IChocmVmLnNlYXJjaCB8fCBiYXNlLnNlYXJjaCkpICtcbiAgICAgICAgIGhyZWYuaGFzaFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVxdWVzdCwgaGVhZGVyLCB2YWx1ZSkge1xuICBpZiAoIXJlcXVlc3QuaGVhZGVyc1toZWFkZXJdKSB7XG4gICAgcmV0dXJuIChyZXF1ZXN0LmhlYWRlcnNbaGVhZGVyXSA9IHZhbHVlKVxuICB9XG59XG4iLCJ2YXIgcmVzcG9uc2VCb2R5VHlwZXMgPSB7XG4gIGpzb246IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgIHJldHVybiBjb250ZW50VHlwZUlzKHJlc3BvbnNlLCAnYXBwbGljYXRpb24vanNvbicpXG4gIH0sXG4gIHRleHQ6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgIHJldHVybiBjb250ZW50VHlwZUlzVGV4dChyZXNwb25zZSkgfHwgY29udGVudFR5cGVJcyhyZXNwb25zZSwgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnKVxuICB9LFxuICBmb3JtOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICByZXR1cm4gY29udGVudFR5cGVJcyhyZXNwb25zZSwgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpXG4gIH0sXG4gIHN0cmVhbTogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnRlbnRUeXBlSXNUZXh0IChyZXNwb25zZSkge1xuICByZXR1cm4gY29udGVudFR5cGVJcyhyZXNwb25zZSwgJ3RleHQvLionKVxufVxuXG5mdW5jdGlvbiBjb250ZW50VHlwZUlzIChyZXNwb25zZSwgZXhwZWN0ZWRDb250ZW50VHlwZSkge1xuICB2YXIgcmUgPSBuZXcgUmVnRXhwKCdeXFxcXHMqJyArIGV4cGVjdGVkQ29udGVudFR5cGUgKyAnXFxcXHMqKCR8OyknKVxuICByZXR1cm4gcmUudGVzdChyZXNwb25zZS5oZWFkZXJzWydjb250ZW50LXR5cGUnXSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmVzcG9uc2UsIHR5cGUsIHJlcXVlc3QpIHtcbiAgaWYgKHJlcXVlc3Qub3B0aW9ucy5yZXNwb25zZUJvZHkpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gcmVxdWVzdC5vcHRpb25zLnJlc3BvbnNlQm9keVxuICB9IGVsc2Uge1xuICAgIHZhciBib2R5VHlwZSA9IHJlc3BvbnNlQm9keVR5cGVzW3R5cGVdXG4gICAgaWYgKGJvZHlUeXBlKSB7XG4gICAgICByZXR1cm4gYm9keVR5cGUocmVzcG9uc2UpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgbGlzdGVuZXIgPSByZXF1aXJlKCcuL2xpc3RlbmVyJylcbnZhciBiaW5kaW5nID0gcmVxdWlyZSgnLi9iaW5kaW5nJylcbnZhciBSZWZyZXNoSG9vayA9IHJlcXVpcmUoJy4vcmVuZGVyJykuUmVmcmVzaEhvb2tcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFnLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICB2YXIgdHlwZSA9IGlucHV0VHlwZSh0YWcsIGF0dHJpYnV0ZXMpXG4gIHZhciBiaW5kID0gaW5wdXRUeXBlQmluZGluZ3NbdHlwZV0gfHwgYmluZFRleHRJbnB1dFxuXG4gIGJpbmQoYXR0cmlidXRlcywgY2hpbGRyZW4sIGJpbmRpbmcoYXR0cmlidXRlcy5iaW5kaW5nKSlcbn1cblxudmFyIGlucHV0VHlwZUJpbmRpbmdzID0ge1xuICB0ZXh0OiBiaW5kVGV4dElucHV0LFxuXG4gIHRleHRhcmVhOiBiaW5kVGV4dElucHV0LFxuXG4gIGNoZWNrYm94OiBmdW5jdGlvbiAoYXR0cmlidXRlcywgY2hpbGRyZW4sIGJpbmRpbmcpIHtcbiAgICBhdHRyaWJ1dGVzLmNoZWNrZWQgPSBiaW5kaW5nLmdldCgpXG5cbiAgICBhdHRhY2hFdmVudEhhbmRsZXIoYXR0cmlidXRlcywgJ29uY2xpY2snLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIGF0dHJpYnV0ZXMuY2hlY2tlZCA9IGV2LnRhcmdldC5jaGVja2VkXG4gICAgICByZXR1cm4gYmluZGluZy5zZXQoZXYudGFyZ2V0LmNoZWNrZWQpXG4gICAgfSwgYmluZGluZylcbiAgfSxcblxuICByYWRpbzogZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIGNoaWxkcmVuLCBiaW5kaW5nKSB7XG4gICAgdmFyIHZhbHVlID0gYXR0cmlidXRlcy52YWx1ZVxuICAgIGF0dHJpYnV0ZXMuY2hlY2tlZCA9IGJpbmRpbmcuZ2V0KCkgPT09IGF0dHJpYnV0ZXMudmFsdWVcbiAgICBhdHRyaWJ1dGVzLm9uX2h5cGVyZG9tc3luY2NoZWNrZWQgPSBsaXN0ZW5lcihmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGF0dHJpYnV0ZXMuY2hlY2tlZCA9IGV2ZW50LnRhcmdldC5jaGVja2VkXG4gICAgfSlcblxuICAgIGF0dGFjaEV2ZW50SGFuZGxlcihhdHRyaWJ1dGVzLCAnb25jbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgdmFyIG5hbWUgPSBldmVudC50YXJnZXQubmFtZVxuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgdmFyIGlucHV0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKG5hbWUpXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaW5wdXRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlucHV0c1tpXS5kaXNwYXRjaEV2ZW50KGN1c3RvbUV2ZW50KCdfaHlwZXJkb21zeW5jY2hlY2tlZCcpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYmluZGluZy5zZXQodmFsdWUpXG4gICAgfSwgYmluZGluZylcbiAgfSxcblxuICBzZWxlY3Q6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBjaGlsZHJlbiwgYmluZGluZykge1xuICAgIHZhciBjdXJyZW50VmFsdWUgPSBiaW5kaW5nLmdldCgpXG5cbiAgICB2YXIgb3B0aW9ucyA9IGNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIHJldHVybiBjaGlsZC50YWdOYW1lICYmIGNoaWxkLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ29wdGlvbidcbiAgICB9KVxuXG4gICAgdmFyIHZhbHVlcyA9IFtdXG4gICAgdmFyIHNlbGVjdGVkSW5kZXhcblxuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgb3B0aW9ucy5sZW5ndGg7IG4rKykge1xuICAgICAgdmFyIG9wdGlvbiA9IG9wdGlvbnNbbl1cbiAgICAgIHZhciBoYXNWYWx1ZSA9IG9wdGlvbi5wcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KCd2YWx1ZScpXG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb24ucHJvcGVydGllcy52YWx1ZVxuICAgICAgdmFyIHRleHQgPSBvcHRpb24uY2hpbGRyZW4ubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4LnRleHQgfSkuam9pbignJylcblxuICAgICAgdmFsdWVzLnB1c2goaGFzVmFsdWUgPyB2YWx1ZSA6IHRleHQpXG5cbiAgICAgIHZhciBzZWxlY3RlZCA9IHZhbHVlID09PSBjdXJyZW50VmFsdWUgfHwgdGV4dCA9PT0gY3VycmVudFZhbHVlXG5cbiAgICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgICBzZWxlY3RlZEluZGV4ID0gblxuICAgICAgfVxuXG4gICAgICBvcHRpb24ucHJvcGVydGllcy5zZWxlY3RlZCA9IHNlbGVjdGVkXG4gICAgICBvcHRpb24ucHJvcGVydGllcy52YWx1ZSA9IG5cbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0ZWRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhdHRyaWJ1dGVzLnNlbGVjdGVkSW5kZXggPSBzZWxlY3RlZEluZGV4XG4gICAgfVxuXG4gICAgYXR0YWNoRXZlbnRIYW5kbGVyKGF0dHJpYnV0ZXMsICdvbmNoYW5nZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgYXR0cmlidXRlcy5zZWxlY3RlZEluZGV4ID0gZXYudGFyZ2V0LnNlbGVjdGVkSW5kZXhcbiAgICAgIHJldHVybiBiaW5kaW5nLnNldCh2YWx1ZXNbZXYudGFyZ2V0LnZhbHVlXSlcbiAgICB9LCBiaW5kaW5nKVxuICB9LFxuXG4gIGZpbGU6IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBjaGlsZHJlbiwgYmluZGluZykge1xuICAgIHZhciBtdWx0aXBsZSA9IGF0dHJpYnV0ZXMubXVsdGlwbGVcblxuICAgIGF0dGFjaEV2ZW50SGFuZGxlcihhdHRyaWJ1dGVzLCAnb25jaGFuZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgIGlmIChtdWx0aXBsZSkge1xuICAgICAgICByZXR1cm4gYmluZGluZy5zZXQoZXYudGFyZ2V0LmZpbGVzKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGJpbmRpbmcuc2V0KGV2LnRhcmdldC5maWxlc1swXSlcbiAgICAgIH1cbiAgICB9LCBiaW5kaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGlucHV0VHlwZSAoc2VsZWN0b3IsIGF0dHJpYnV0ZXMpIHtcbiAgaWYgKC9edGV4dGFyZWFcXGIvaS50ZXN0KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiAndGV4dGFyZWEnXG4gIH0gZWxzZSBpZiAoL15zZWxlY3RcXGIvaS50ZXN0KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiAnc2VsZWN0J1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhdHRyaWJ1dGVzLnR5cGUgfHwgJ3RleHQnXG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZFRleHRJbnB1dCAoYXR0cmlidXRlcywgY2hpbGRyZW4sIGJpbmRpbmcpIHtcbiAgdmFyIHRleHRFdmVudE5hbWVzID0gWydvbmtleXVwJywgJ29uaW5wdXQnLCAnb25wYXN0ZScsICd0ZXh0SW5wdXQnXVxuXG4gIHZhciBiaW5kaW5nVmFsdWUgPSBiaW5kaW5nLmdldCgpXG4gIGlmICghKGJpbmRpbmdWYWx1ZSBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGF0dHJpYnV0ZXMudmFsdWUgPSBiaW5kaW5nVmFsdWUgIT09IHVuZGVmaW5lZCA/IGJpbmRpbmdWYWx1ZSA6ICcnXG4gIH1cblxuICBhdHRhY2hFdmVudEhhbmRsZXIoYXR0cmlidXRlcywgdGV4dEV2ZW50TmFtZXMsIGZ1bmN0aW9uIChldikge1xuICAgIGlmIChiaW5kaW5nLmdldCgpICE9PSBldi50YXJnZXQudmFsdWUpIHtcbiAgICAgIHJldHVybiBiaW5kaW5nLnNldChldi50YXJnZXQudmFsdWUpXG4gICAgfVxuICB9LCBiaW5kaW5nKVxufVxuXG5mdW5jdGlvbiBhdHRhY2hFdmVudEhhbmRsZXIgKGF0dHJpYnV0ZXMsIGV2ZW50TmFtZXMsIGhhbmRsZXIsIGJpbmRpbmcpIHtcbiAgaWYgKGV2ZW50TmFtZXMgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIGZvciAodmFyIG4gPSAwOyBuIDwgZXZlbnROYW1lcy5sZW5ndGg7IG4rKykge1xuICAgICAgaW5zZXJ0RXZlbnRIYW5kbGVyKGF0dHJpYnV0ZXMsIGV2ZW50TmFtZXNbbl0sIGhhbmRsZXIpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluc2VydEV2ZW50SGFuZGxlcihhdHRyaWJ1dGVzLCBldmVudE5hbWVzLCBoYW5kbGVyKVxuICB9XG59XG5cbmZ1bmN0aW9uIGluc2VydEV2ZW50SGFuZGxlciAoYXR0cmlidXRlcywgZXZlbnROYW1lLCBoYW5kbGVyKSB7XG4gIHZhciBwcmV2aW91c0hhbmRsZXIgPSBhdHRyaWJ1dGVzW2V2ZW50TmFtZV1cbiAgaWYgKHByZXZpb3VzSGFuZGxlcikge1xuICAgIGF0dHJpYnV0ZXNbZXZlbnROYW1lXSA9IHNlcXVlbmNlRnVuY3Rpb25zKGhhbmRsZXIsIHByZXZpb3VzSGFuZGxlcilcbiAgfSBlbHNlIHtcbiAgICBhdHRyaWJ1dGVzW2V2ZW50TmFtZV0gPSBoYW5kbGVyXG4gIH1cbn1cblxuZnVuY3Rpb24gc2VxdWVuY2VGdW5jdGlvbnMgKGhhbmRsZXIxLCBoYW5kbGVyMikge1xuICByZXR1cm4gZnVuY3Rpb24gKGV2KSB7XG4gICAgaGFuZGxlcjEoZXYpXG4gICAgaWYgKGhhbmRsZXIyIGluc3RhbmNlb2YgUmVmcmVzaEhvb2spIHtcbiAgICAgIHJldHVybiBoYW5kbGVyMi5oYW5kbGVyKGV2KVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaGFuZGxlcjIoZXYpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUV2ZW50IChuYW1lKSB7XG4gIGlmICh0eXBlb2YgRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gbmV3IHdpbmRvdy5FdmVudChuYW1lKVxuICB9IGVsc2Uge1xuICAgIHZhciBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gICAgZXZlbnQuaW5pdEV2ZW50KG5hbWUsIGZhbHNlLCBmYWxzZSlcbiAgICByZXR1cm4gZXZlbnRcbiAgfVxufVxuIiwidmFyIG1ldGEgPSByZXF1aXJlKCcuL21ldGEnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiKSB7XG4gIHZhciBiaW5kaW5nID0gYlxuXG4gIGlmIChiIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBiaW5kaW5nID0gYmluZGluZ09iamVjdC5hcHBseSh1bmRlZmluZWQsIGIpXG4gIH0gZWxzZSBpZiAoYiBpbnN0YW5jZW9mIE9iamVjdCAmJiAodHlwZW9mIGIuc2V0ID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBiLmdldCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICBiaW5kaW5nID0gYlxuICB9IGVsc2Uge1xuICAgIHRocm93IEVycm9yKCdoeXBlcmRvbSBiaW5kaW5ncyBtdXN0IGJlIGVpdGhlciBhbiBhcnJheSBbb2JqZWN0LCBwcm9wZXJ0eSwgc2V0dGVyXSBvciBhbiBvYmplY3QgeyBnZXQoKSwgc2V0KHZhbHVlKSB9LCBpbnN0ZWFkIGJpbmRpbmcgd2FzOiAnICsgSlNPTi5zdHJpbmdpZnkoYikpXG4gIH1cblxuICByZXR1cm4gYmluZGluZ1xufVxuXG5mdW5jdGlvbiBiaW5kaW5nT2JqZWN0IChtb2RlbCwgcHJvcGVydHksIHNldHRlcikge1xuICB2YXIgX21ldGFcblxuICByZXR1cm4ge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1vZGVsW3Byb3BlcnR5XVxuICAgIH0sXG5cbiAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgbW9kZWxbcHJvcGVydHldID0gdmFsdWVcbiAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIHNldHRlcih2YWx1ZSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbWV0YTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIF9tZXRhIHx8IChfbWV0YSA9IG1ldGEobW9kZWwsIHByb3BlcnR5KSlcbiAgICB9XG4gIH1cbn1cbiIsInZhciBoeXBlcmRvbU1ldGEgPSByZXF1aXJlKCcuL21ldGEnKVxudmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciBWdGV4dCA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3Zub2RlL3Z0ZXh0LmpzJylcbnZhciBkZWJ1Z2dpbmdQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi9kZWJ1Z2dpbmdQcm9wZXJ0aWVzJylcblxuZnVuY3Rpb24gQ29tcG9uZW50IChtb2RlbCwgb3B0aW9ucykge1xuICB0aGlzLmlzVmlld0NvbXBvbmVudCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgndmlld0NvbXBvbmVudCcpICYmIG9wdGlvbnMudmlld0NvbXBvbmVudFxuICB0aGlzLm1vZGVsID0gbW9kZWxcbiAgdGhpcy5rZXkgPSBtb2RlbC5yZW5kZXJLZXlcbiAgdGhpcy5jb21wb25lbnQgPSB1bmRlZmluZWRcbn1cblxuQ29tcG9uZW50LnByb3RvdHlwZS50eXBlID0gJ1dpZGdldCdcblxuQ29tcG9uZW50LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICB2YXIgdmRvbSA9IHRoaXMucmVuZGVyKClcblxuICB2YXIgbWV0YSA9IGh5cGVyZG9tTWV0YSh0aGlzLm1vZGVsKVxuICBtZXRhLmNvbXBvbmVudHMuYWRkKHRoaXMpXG5cbiAgdmFyIGN1cnJlbnRSZW5kZXIgPSByZW5kZXIuY3VycmVudFJlbmRlcigpXG4gIHRoaXMuY29tcG9uZW50ID0gY3VycmVudFJlbmRlci5tb3VudC5jcmVhdGVEb21Db21wb25lbnQoKVxuICB2YXIgZWxlbWVudCA9IHRoaXMuY29tcG9uZW50LmNyZWF0ZSh2ZG9tKVxuXG4gIGlmIChzZWxmLm1vZGVsLmRldGFjaGVkKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBlbGVtZW50XG4gIH1cbn1cblxuZnVuY3Rpb24gYmVmb3JlVXBkYXRlIChtb2RlbCwgZWxlbWVudCkge1xuICBpZiAobW9kZWwub25iZWZvcmV1cGRhdGUpIHtcbiAgICBtb2RlbC5vbmJlZm9yZXVwZGF0ZShlbGVtZW50KVxuICB9XG5cbiAgaWYgKG1vZGVsLm9uYmVmb3JlcmVuZGVyKSB7XG4gICAgbW9kZWwub25iZWZvcmVyZW5kZXIoZWxlbWVudClcbiAgfVxufVxuXG5mdW5jdGlvbiBhZnRlclVwZGF0ZSAobW9kZWwsIGVsZW1lbnQsIG9sZEVsZW1lbnQpIHtcbiAgaWYgKG1vZGVsLm9udXBkYXRlKSB7XG4gICAgbW9kZWwub251cGRhdGUoZWxlbWVudCwgb2xkRWxlbWVudClcbiAgfVxuXG4gIGlmIChtb2RlbC5vbnJlbmRlcikge1xuICAgIG1vZGVsLm9ucmVuZGVyKGVsZW1lbnQsIG9sZEVsZW1lbnQpXG4gIH1cbn1cblxuQ29tcG9uZW50LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAocHJldmlvdXMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgaWYgKHRoaXMuaXNWaWV3Q29tcG9uZW50KSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLm1vZGVsKVxuICAgIGZvciAodmFyIG4gPSAwOyBuIDwga2V5cy5sZW5ndGg7IG4rKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbbl1cbiAgICAgIHByZXZpb3VzLm1vZGVsW2tleV0gPSBzZWxmLm1vZGVsW2tleV1cbiAgICB9XG4gICAgdGhpcy5tb2RlbCA9IHByZXZpb3VzLm1vZGVsXG4gIH1cblxuICB0aGlzLmNvbXBvbmVudCA9IHByZXZpb3VzLmNvbXBvbmVudFxuICB2YXIgb2xkRWxlbWVudCA9IHRoaXMuY29tcG9uZW50LmVsZW1lbnRcblxuICB2YXIgZWxlbWVudCA9IHRoaXMuY29tcG9uZW50LnVwZGF0ZSh0aGlzLnJlbmRlcihvbGRFbGVtZW50KSlcblxuICBpZiAoc2VsZi5tb2RlbC5kZXRhY2hlZCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG59XG5cbkNvbXBvbmVudC5wcm90b3R5cGUucmVuZGVyTW9kZWwgPSBmdW5jdGlvbiAob2xkRWxlbWVudCkge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbFxuICB2YXIgY3VycmVudFJlbmRlciA9IHJlbmRlci5jdXJyZW50UmVuZGVyKClcbiAgY3VycmVudFJlbmRlci5tb3VudC5zZXR1cE1vZGVsQ29tcG9uZW50KG1vZGVsKVxuXG4gIGlmICghb2xkRWxlbWVudCkge1xuICAgIGlmIChzZWxmLm1vZGVsLm9uYmVmb3JlYWRkKSB7XG4gICAgICBzZWxmLm1vZGVsLm9uYmVmb3JlYWRkKClcbiAgICB9XG4gICAgaWYgKHNlbGYubW9kZWwub25iZWZvcmVyZW5kZXIpIHtcbiAgICAgIHNlbGYubW9kZWwub25iZWZvcmVyZW5kZXIoKVxuICAgIH1cblxuICAgIGlmIChzZWxmLm1vZGVsLm9uYWRkIHx8IHNlbGYubW9kZWwub25yZW5kZXIpIHtcbiAgICAgIGN1cnJlbnRSZW5kZXIuZmluaXNoZWQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLm1vZGVsLm9uYWRkKSB7XG4gICAgICAgICAgc2VsZi5tb2RlbC5vbmFkZChzZWxmLmNvbXBvbmVudC5lbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGlmIChzZWxmLm1vZGVsLm9ucmVuZGVyKSB7XG4gICAgICAgICAgc2VsZi5tb2RlbC5vbnJlbmRlcihzZWxmLmNvbXBvbmVudC5lbGVtZW50KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBiZWZvcmVVcGRhdGUobW9kZWwsIG9sZEVsZW1lbnQpXG5cbiAgICBpZiAobW9kZWwub251cGRhdGUgfHwgbW9kZWwub25yZW5kZXIpIHtcbiAgICAgIGN1cnJlbnRSZW5kZXIuZmluaXNoZWQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFmdGVyVXBkYXRlKG1vZGVsLCBzZWxmLmNvbXBvbmVudC5lbGVtZW50LCBvbGRFbGVtZW50KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICB2YXIgdmRvbSA9IHR5cGVvZiBtb2RlbC5yZW5kZXIgPT09ICdmdW5jdGlvbicgPyBtb2RlbC5yZW5kZXIoKSA6IG5ldyBWdGV4dChKU09OLnN0cmluZ2lmeShtb2RlbCkpXG5cbiAgaWYgKHZkb20gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgIHRocm93IG5ldyBFcnJvcigndmRvbSByZXR1cm5lZCBmcm9tIGNvbXBvbmVudCBjYW5ub3QgYmUgYW4gYXJyYXknKVxuICB9XG5cbiAgcmV0dXJuIGRlYnVnZ2luZ1Byb3BlcnRpZXModmRvbSwgbW9kZWwpXG59XG5cbkNvbXBvbmVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG9sZEVsZW1lbnQpIHtcbiAgdmFyIG1vZGVsID0gdGhpcy5tb2RlbFxuXG4gIHZhciBtZXRhID0gaHlwZXJkb21NZXRhKG1vZGVsKVxuICBtZXRhLmxhc3RSZW5kZXJJZCA9IHJlbmRlci5jdXJyZW50UmVuZGVyKCkubW91bnQucmVuZGVySWRcblxuICBpZiAodHlwZW9mIG1vZGVsLnJlbmRlckNhY2hlS2V5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdmFyIGtleSA9IG1vZGVsLnJlbmRlckNhY2hlS2V5KClcbiAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQgJiYgbWV0YS5jYWNoZUtleSA9PT0ga2V5ICYmIG1ldGEuY2FjaGVkVmRvbSkge1xuICAgICAgcmV0dXJuIG1ldGEuY2FjaGVkVmRvbVxuICAgIH0gZWxzZSB7XG4gICAgICBtZXRhLmNhY2hlS2V5ID0ga2V5XG4gICAgICByZXR1cm4gKG1ldGEuY2FjaGVkVmRvbSA9IHRoaXMucmVuZGVyTW9kZWwob2xkRWxlbWVudCkpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB0aGlzLnJlbmRlck1vZGVsKG9sZEVsZW1lbnQpXG4gIH1cbn1cblxuQ29tcG9uZW50LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3VycmVudFJlbmRlciA9IHJlbmRlci5jdXJyZW50UmVuZGVyKClcbiAgaWYgKGN1cnJlbnRSZW5kZXIubW91bnQuaXNDb21wb25lbnRJbkRvbSh0aGlzLm1vZGVsKSkge1xuICAgIHZhciBvbGRFbGVtZW50ID0gdGhpcy5jb21wb25lbnQuZWxlbWVudFxuICAgIGJlZm9yZVVwZGF0ZSh0aGlzLm1vZGVsLCBvbGRFbGVtZW50KVxuICAgIHRoaXMuY29tcG9uZW50LnVwZGF0ZSh0aGlzLnJlbmRlcigpKVxuICAgIGFmdGVyVXBkYXRlKHRoaXMubW9kZWwsIHRoaXMuY29tcG9uZW50LmVsZW1lbnQsIG9sZEVsZW1lbnQpXG4gIH1cbn1cblxuQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdmFyIG1ldGEgPSBoeXBlcmRvbU1ldGEodGhpcy5tb2RlbClcbiAgbWV0YS5jb21wb25lbnRzLmRlbGV0ZSh0aGlzKVxuXG4gIGlmIChzZWxmLm1vZGVsLm9uYmVmb3JlcmVtb3ZlKSB7XG4gICAgc2VsZi5tb2RlbC5vbmJlZm9yZXJlbW92ZShlbGVtZW50KVxuICB9XG5cbiAgaWYgKHNlbGYubW9kZWwub25yZW1vdmUpIHtcbiAgICB2YXIgY3VycmVudFJlbmRlciA9IHJlbmRlci5jdXJyZW50UmVuZGVyKClcbiAgICBjdXJyZW50UmVuZGVyLmZpbmlzaGVkLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5tb2RlbC5vbnJlbW92ZShlbGVtZW50KVxuICAgIH0pXG4gIH1cblxuICB0aGlzLmNvbXBvbmVudC5kZXN0cm95KClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnRcbiIsInZhciBydW5SZW5kZXIgPSByZXF1aXJlKCcuL3JlbmRlcicpXG52YXIgUHJvcGVydHlIb29rID0gcmVxdWlyZSgnLi9wcm9wZXJ0eUhvb2snKVxudmFyIFZpcnR1YWxOb2RlID0gcmVxdWlyZSgndmlydHVhbC1kb20vdm5vZGUvdm5vZGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2ZG9tLCBtb2RlbCkge1xuICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB2ZG9tICYmIHZkb20uY29uc3RydWN0b3IgPT09IFZpcnR1YWxOb2RlKSB7XG4gICAgaWYgKCF2ZG9tLnByb3BlcnRpZXMpIHtcbiAgICAgIHZkb20ucHJvcGVydGllcyA9IHt9XG4gICAgfVxuXG4gICAgdmRvbS5wcm9wZXJ0aWVzLl9oeXBlcmRvbU1ldGEgPSBuZXcgUHJvcGVydHlIb29rKHtcbiAgICAgIGNvbXBvbmVudDogbW9kZWwsXG4gICAgICByZW5kZXI6IHJ1blJlbmRlci5jdXJyZW50UmVuZGVyKClcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHZkb21cbn1cbiIsImZ1bmN0aW9uIGRlcHJlY2F0aW9uV2FybmluZyAoKSB7XG4gIHZhciB3YXJuaW5nSXNzdWVkID0gZmFsc2VcblxuICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmICF3YXJuaW5nSXNzdWVkKSB7XG4gICAgICBjb25zb2xlLndhcm4oYXJnKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgIHdhcm5pbmdJc3N1ZWQgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZWZyZXNoOiBkZXByZWNhdGlvbldhcm5pbmcoKSxcbiAgY3VycmVudFJlbmRlcjogZGVwcmVjYXRpb25XYXJuaW5nKCksXG4gIGNvbXBvbmVudDogZGVwcmVjYXRpb25XYXJuaW5nKCksXG4gIHJlbmRlckZ1bmN0aW9uOiBkZXByZWNhdGlvbldhcm5pbmcoKSxcbiAgbm9yZWZyZXNoOiBkZXByZWNhdGlvbldhcm5pbmcoKSxcbiAgbWFwQmluZGluZzogZGVwcmVjYXRpb25XYXJuaW5nKCksXG4gIHZpZXdDb21wb25lbnQ6IGRlcHJlY2F0aW9uV2FybmluZygpLFxuICBodG1sUmF3SHRtbDogZGVwcmVjYXRpb25XYXJuaW5nKCksXG4gIGh0bWxCaW5kaW5nOiBkZXByZWNhdGlvbldhcm5pbmcoKSxcbiAgcmVmcmVzaEFmdGVyOiBkZXByZWNhdGlvbldhcm5pbmcoKVxufVxuIiwidmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCd2aXJ0dWFsLWRvbS9jcmVhdGUtZWxlbWVudCcpXG52YXIgZGlmZiA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL2RpZmYnKVxudmFyIHBhdGNoID0gcmVxdWlyZSgndmlydHVhbC1kb20vcGF0Y2gnKVxudmFyIHRvVmRvbSA9IHJlcXVpcmUoJy4vdG9WZG9tJylcbnZhciBpc1Zkb20gPSByZXF1aXJlKCcuL2lzVmRvbScpXG5cbmZ1bmN0aW9uIERvbUNvbXBvbmVudCAob3B0aW9ucykge1xuICB0aGlzLmRvY3VtZW50ID0gb3B0aW9ucyAmJiBvcHRpb25zLmRvY3VtZW50XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVWZG9tIChvYmplY3QpIHtcbiAgdmFyIHZkb20gPSB0b1Zkb20ob2JqZWN0KVxuICBpZiAoIWlzVmRvbSh2ZG9tKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgcmVuZGVyIHRvIHJldHVybiB2ZG9tJylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmRvbVxuICB9XG59XG5cbkRvbUNvbXBvbmVudC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKHZkb20pIHtcbiAgdGhpcy52ZG9tID0gcHJlcGFyZVZkb20odmRvbSlcbiAgcmV0dXJuICh0aGlzLmVsZW1lbnQgPSBjcmVhdGVFbGVtZW50KHRoaXMudmRvbSwge2RvY3VtZW50OiB0aGlzLmRvY3VtZW50fSkpXG59XG5cbkRvbUNvbXBvbmVudC5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbiAodmRvbSwgZWxlbWVudCkge1xuICB0aGlzLnZkb20gPSBwcmVwYXJlVmRvbSh2ZG9tKVxuICByZXR1cm4gKHRoaXMuZWxlbWVudCA9IGVsZW1lbnQpXG59XG5cbkRvbUNvbXBvbmVudC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHZkb20pIHtcbiAgdmFyIG9sZFZkb20gPSB0aGlzLnZkb21cbiAgdGhpcy52ZG9tID0gcHJlcGFyZVZkb20odmRvbSlcbiAgdmFyIHBhdGNoZXMgPSBkaWZmKG9sZFZkb20sIHRoaXMudmRvbSlcbiAgcmV0dXJuICh0aGlzLmVsZW1lbnQgPSBwYXRjaCh0aGlzLmVsZW1lbnQsIHBhdGNoZXMpKVxufVxuXG5Eb21Db21wb25lbnQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICBmdW5jdGlvbiBkZXN0cm95V2lkZ2V0cyAodmRvbSkge1xuICAgIGlmICh2ZG9tLnR5cGUgPT09ICdXaWRnZXQnKSB7XG4gICAgICB2ZG9tLmRlc3Ryb3koKVxuICAgIH0gZWxzZSBpZiAodmRvbS5jaGlsZHJlbikge1xuICAgICAgdmRvbS5jaGlsZHJlbi5mb3JFYWNoKGRlc3Ryb3lXaWRnZXRzKVxuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3lXaWRnZXRzKHRoaXMudmRvbSlcblxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlbW92ZUVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gZG9tQ29tcG9uZW50IChvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgRG9tQ29tcG9uZW50KG9wdGlvbnMpXG59XG5cbmV4cG9ydHMuY3JlYXRlID0gZG9tQ29tcG9uZW50XG4iLCJ2YXIgcmVuZGVyaW5nID0gcmVxdWlyZSgnLi9yZW5kZXJpbmcnKVxudmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciB2aWV3Q29tcG9uZW50ID0gcmVxdWlyZSgnLi92aWV3Q29tcG9uZW50JylcbnZhciBkZXByZWNhdGlvbnMgPSByZXF1aXJlKCcuL2RlcHJlY2F0aW9ucycpXG5cbmV4cG9ydHMuaHRtbCA9IHJlbmRlcmluZy5odG1sXG5leHBvcnRzLmh0bWwucmVmcmVzaGlmeSA9IHJlbmRlci5yZWZyZXNoaWZ5XG5leHBvcnRzLnJhd0h0bWwgPSByZW5kZXJpbmcucmF3SHRtbFxuZXhwb3J0cy5qc3ggPSByZW5kZXJpbmcuanN4XG5leHBvcnRzLmF0dGFjaCA9IHJlbmRlcmluZy5hdHRhY2hcbmV4cG9ydHMucmVwbGFjZSA9IHJlbmRlcmluZy5yZXBsYWNlXG5leHBvcnRzLmFwcGVuZCA9IHJlbmRlcmluZy5hcHBlbmRcbmV4cG9ydHMuYXBwZW5kVkRvbSA9IHJlbmRlcmluZy5hcHBlbmRWRG9tXG5leHBvcnRzLmJpbmRpbmcgPSByZXF1aXJlKCcuL2JpbmRpbmcnKVxuZXhwb3J0cy5tZXRhID0gcmVxdWlyZSgnLi9tZXRhJylcbmV4cG9ydHMucmVmcmVzaGlmeSA9IHJlbmRlci5yZWZyZXNoaWZ5XG5leHBvcnRzLm5vcmVmcmVzaCA9IHJlcXVpcmUoJy4vcmVmcmVzaEV2ZW50UmVzdWx0Jykubm9yZWZyZXNoXG5leHBvcnRzLmpvaW4gPSByZXF1aXJlKCcuL2pvaW4nKVxuZXhwb3J0cy52aWV3Q29tcG9uZW50ID0gdmlld0NvbXBvbmVudFxuZXhwb3J0cy5jb21wb25lbnQgPSBmdW5jdGlvbiAobW9kZWwpIHtcbiAgZGVwcmVjYXRpb25zLnZpZXdDb21wb25lbnQoJ2h5cGVyZG9tLmNvbXBvbmVudCBpcyBkZXByZWNhdGVkLCB1c2UgaHlwZXJkb20udmlld0NvbXBvbmVudCBpbnN0ZWFkJylcbiAgcmV0dXJuIHZpZXdDb21wb25lbnQobW9kZWwpXG59XG5cbmV4cG9ydHMuY3VycmVudFJlbmRlciA9IHJlbmRlci5jdXJyZW50UmVuZGVyXG4iLCJ2YXIgdmlydHVhbERvbVZlcnNpb24gPSByZXF1aXJlKCd2aXJ0dWFsLWRvbS92bm9kZS92ZXJzaW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoeCkge1xuICB2YXIgdHlwZSA9IHgudHlwZVxuICBpZiAodHlwZSA9PT0gJ1ZpcnR1YWxOb2RlJyB8fCB0eXBlID09PSAnVmlydHVhbFRleHQnKSB7XG4gICAgcmV0dXJuIHgudmVyc2lvbiA9PT0gdmlydHVhbERvbVZlcnNpb25cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ1dpZGdldCcgfHwgdHlwZSA9PT0gJ1RodW5rJ1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGpvaW4gKGFycmF5LCBzZXBhcmF0b3IpIHtcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBhcnJheVtpXVxuICAgIGlmIChpID4gMCkge1xuICAgICAgb3V0cHV0LnB1c2goc2VwYXJhdG9yKVxuICAgIH1cbiAgICBvdXRwdXQucHVzaChpdGVtKVxuICB9XG4gIHJldHVybiBvdXRwdXRcbn1cbiIsInZhciByZWZyZXNoaWZ5ID0gcmVxdWlyZSgnLi9yZW5kZXInKS5yZWZyZXNoaWZ5XG5cbmZ1bmN0aW9uIExpc3RlbmVySG9vayAobGlzdGVuZXIpIHtcbiAgdGhpcy5saXN0ZW5lciA9IHJlZnJlc2hpZnkobGlzdGVuZXIpXG59XG5cbkxpc3RlbmVySG9vay5wcm90b3R5cGUuaG9vayA9IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0eU5hbWUpIHtcbiAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKHByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMiksIHRoaXMubGlzdGVuZXIsIGZhbHNlKVxufVxuXG5MaXN0ZW5lckhvb2sucHJvdG90eXBlLnVuaG9vayA9IGZ1bmN0aW9uIChlbGVtZW50LCBwcm9wZXJ0eU5hbWUpIHtcbiAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKHByb3BlcnR5TmFtZS5zdWJzdHJpbmcoMiksIHRoaXMubGlzdGVuZXIpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gIHJldHVybiBuZXcgTGlzdGVuZXJIb29rKGxpc3RlbmVyKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobW9kZWwsIHByb3BlcnR5KSB7XG4gIHZhciBoeXBlcmRvbU1ldGEgPSBtb2RlbC5faHlwZXJkb21NZXRhXG5cbiAgaWYgKCFoeXBlcmRvbU1ldGEpIHtcbiAgICBoeXBlcmRvbU1ldGEgPSB7fVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2RlbCwgJ19oeXBlcmRvbU1ldGEnLCB7dmFsdWU6IGh5cGVyZG9tTWV0YX0pXG4gIH1cblxuICBpZiAocHJvcGVydHkpIHtcbiAgICB2YXIgbWV0YSA9IGh5cGVyZG9tTWV0YVtwcm9wZXJ0eV1cblxuICAgIGlmICghbWV0YSkge1xuICAgICAgbWV0YSA9IGh5cGVyZG9tTWV0YVtwcm9wZXJ0eV0gPSB7fVxuICAgIH1cblxuICAgIHJldHVybiBtZXRhXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGh5cGVyZG9tTWV0YVxuICB9XG59XG4iLCJ2YXIgaHlwZXJkb21NZXRhID0gcmVxdWlyZSgnLi9tZXRhJylcbnZhciBydW5SZW5kZXIgPSByZXF1aXJlKCcuL3JlbmRlcicpXG52YXIgZG9tQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9kb21Db21wb25lbnQnKVxudmFyIFNldCA9IHJlcXVpcmUoJy4vc2V0JylcbnZhciByZWZyZXNoRXZlbnRSZXN1bHQgPSByZXF1aXJlKCcuL3JlZnJlc2hFdmVudFJlc3VsdCcpXG5cbnZhciBsYXN0SWQgPSAwXG5cbmZ1bmN0aW9uIE1vdW50IChtb2RlbCwgb3B0aW9ucykge1xuICB2YXIgd2luID0gKG9wdGlvbnMgJiYgb3B0aW9ucy53aW5kb3cpIHx8IHdpbmRvd1xuICB2YXIgcm91dGVyID0gdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3JvdXRlcicpID8gb3B0aW9ucy5yb3V0ZXIgOiB1bmRlZmluZWRcbiAgdGhpcy5yZXF1ZXN0UmVuZGVyID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXF1ZXN0UmVuZGVyKSB8fCB3aW4ucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbi5zZXRUaW1lb3V0XG5cbiAgdGhpcy5kb2N1bWVudCA9IChvcHRpb25zICYmIG9wdGlvbnMuZG9jdW1lbnQpIHx8IGRvY3VtZW50XG4gIHRoaXMubW9kZWwgPSBtb2RlbFxuXG4gIHRoaXMucmVuZGVyUXVldWVkID0gZmFsc2VcbiAgdGhpcy5tb3VudFJlbmRlclJlcXVlc3RlZCA9IGZhbHNlXG4gIHRoaXMuY29tcG9uZW50UmVuZGVyc1JlcXVlc3RlZCA9IHVuZGVmaW5lZFxuICB0aGlzLmlkID0gKytsYXN0SWRcbiAgdGhpcy5yZW5kZXJJZCA9IDBcbiAgdGhpcy5tb3VudGVkID0gdHJ1ZVxuICB0aGlzLnJvdXRlciA9IHJvdXRlclxufVxuXG5Nb3VudC5wcm90b3R5cGUucmVmcmVzaGlmeSA9IGZ1bmN0aW9uIChmbiwgb3B0aW9ucykge1xuICBpZiAoIWZuKSB7XG4gICAgcmV0dXJuIGZuXG4gIH1cblxuICBpZiAob3B0aW9ucyAmJiAob3B0aW9ucy5ub3JlZnJlc2ggPT09IHRydWUgfHwgb3B0aW9ucy5yZWZyZXNoID09PSBmYWxzZSkpIHtcbiAgICByZXR1cm4gZm5cbiAgfVxuXG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICByZXR1cm4gcmVmcmVzaEV2ZW50UmVzdWx0KHJlc3VsdCwgc2VsZiwgb3B0aW9ucylcbiAgfVxufVxuXG5Nb3VudC5wcm90b3R5cGUudHJhbnNmb3JtRnVuY3Rpb25BdHRyaWJ1dGUgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gdGhpcy5yZWZyZXNoaWZ5KHZhbHVlKVxufVxuXG5Nb3VudC5wcm90b3R5cGUucXVldWVSZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5yZW5kZXJRdWV1ZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcblxuICAgIHZhciByZXF1ZXN0UmVuZGVyID0gdGhpcy5yZXF1ZXN0UmVuZGVyXG4gICAgdGhpcy5yZW5kZXJRdWV1ZWQgPSB0cnVlXG5cbiAgICByZXF1ZXN0UmVuZGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYucmVuZGVyUXVldWVkID0gZmFsc2VcblxuICAgICAgaWYgKHNlbGYubW91bnRlZCkge1xuICAgICAgICBpZiAoc2VsZi5tb3VudFJlbmRlclJlcXVlc3RlZCkge1xuICAgICAgICAgIHNlbGYucmVmcmVzaEltbWVkaWF0ZWx5KClcbiAgICAgICAgfSBlbHNlIGlmIChzZWxmLmNvbXBvbmVudFJlbmRlcnNSZXF1ZXN0ZWQpIHtcbiAgICAgICAgICBzZWxmLnJlZnJlc2hDb21wb25lbnRzSW1tZWRpYXRlbHkoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG5Nb3VudC5wcm90b3R5cGUuY3JlYXRlRG9tQ29tcG9uZW50ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZG9tQ29tcG9uZW50LmNyZWF0ZSh7IGRvY3VtZW50OiB0aGlzLmRvY3VtZW50IH0pXG59XG5cbk1vdW50LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJvdXRlcikge1xuICAgIHJldHVybiB0aGlzLnJvdXRlci5yZW5kZXIodGhpcy5tb2RlbClcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlbFxuICB9XG59XG5cbk1vdW50LnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLm1vdW50UmVuZGVyUmVxdWVzdGVkID0gdHJ1ZVxuICB0aGlzLnF1ZXVlUmVuZGVyKClcbn1cblxuTW91bnQucHJvdG90eXBlLnJlZnJlc2hJbW1lZGlhdGVseSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgcnVuUmVuZGVyKHNlbGYsIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLnJlbmRlcklkKytcbiAgICB2YXIgdmRvbSA9IHNlbGYucmVuZGVyKClcbiAgICBzZWxmLmNvbXBvbmVudC51cGRhdGUodmRvbSlcbiAgICBzZWxmLm1vdW50UmVuZGVyUmVxdWVzdGVkID0gZmFsc2VcbiAgfSlcbn1cblxuTW91bnQucHJvdG90eXBlLnJlZnJlc2hDb21wb25lbnRzSW1tZWRpYXRlbHkgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIHJ1blJlbmRlcihzZWxmLCBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzZWxmLmNvbXBvbmVudFJlbmRlcnNSZXF1ZXN0ZWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdyA9IHNlbGYuY29tcG9uZW50UmVuZGVyc1JlcXVlc3RlZFtpXVxuICAgICAgdy5yZWZyZXNoKClcbiAgICB9XG4gICAgc2VsZi5jb21wb25lbnRSZW5kZXJzUmVxdWVzdGVkID0gdW5kZWZpbmVkXG4gIH0pXG59XG5cbk1vdW50LnByb3RvdHlwZS5yZWZyZXNoQ29tcG9uZW50ID0gZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICBpZiAoIXRoaXMuY29tcG9uZW50UmVuZGVyc1JlcXVlc3RlZCkge1xuICAgIHRoaXMuY29tcG9uZW50UmVuZGVyc1JlcXVlc3RlZCA9IFtdXG4gIH1cblxuICB0aGlzLmNvbXBvbmVudFJlbmRlcnNSZXF1ZXN0ZWQucHVzaChjb21wb25lbnQpXG4gIHRoaXMucXVldWVSZW5kZXIoKVxufVxuXG5Nb3VudC5wcm90b3R5cGUuaXNDb21wb25lbnRJbkRvbSA9IGZ1bmN0aW9uIChjb21wb25lbnQpIHtcbiAgdmFyIG1ldGEgPSBoeXBlcmRvbU1ldGEoY29tcG9uZW50KVxuICByZXR1cm4gbWV0YS5sYXN0UmVuZGVySWQgPT09IHRoaXMucmVuZGVySWRcbn1cblxuTW91bnQucHJvdG90eXBlLnNldHVwTW9kZWxDb21wb25lbnQgPSBmdW5jdGlvbiAobW9kZWwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgdmFyIG1ldGEgPSBoeXBlcmRvbU1ldGEobW9kZWwpXG5cbiAgaWYgKCFtZXRhLm1vdW50KSB7XG4gICAgbWV0YS5tb3VudCA9IHRoaXNcbiAgICBtZXRhLmNvbXBvbmVudHMgPSBuZXcgU2V0KClcblxuICAgIG1vZGVsLnJlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnJlZnJlc2goKVxuICAgIH1cblxuICAgIG1vZGVsLnJlZnJlc2hJbW1lZGlhdGVseSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYucmVmcmVzaEltbWVkaWF0ZWx5KClcbiAgICB9XG5cbiAgICBtb2RlbC5yZWZyZXNoQ29tcG9uZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1ldGEgPSBoeXBlcmRvbU1ldGEodGhpcylcbiAgICAgIG1ldGEuY29tcG9uZW50cy5mb3JFYWNoKGZ1bmN0aW9uICh3KSB7XG4gICAgICAgIHNlbGYucmVmcmVzaENvbXBvbmVudCh3KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1vZGVsLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhpcy5yZWZyZXNoaWZ5KGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1vZGVsLm9ubG9hZCgpIH0sIHtyZWZyZXNoOiAncHJvbWlzZSd9KSgpXG4gICAgfVxuICB9XG59XG5cbk1vdW50LnByb3RvdHlwZS5kZXRhY2ggPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMubW91bnRlZCA9IGZhbHNlXG59XG5cbk1vdW50LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0aGlzLnJvdXRlcikge1xuICAgIHRoaXMucm91dGVyLnJlc2V0KClcbiAgfVxuICB0aGlzLmNvbXBvbmVudC5kZXN0cm95KHtyZW1vdmVFbGVtZW50OiB0cnVlfSlcbiAgdGhpcy5tb3VudGVkID0gZmFsc2Vcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNb3VudFxuIiwidmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciBiaW5kTW9kZWwgPSByZXF1aXJlKCcuL2JpbmRNb2RlbCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhZywgYXR0cmlidXRlcywgY2hpbGRFbGVtZW50cykge1xuICB2YXIgZGF0YXNldFxuICB2YXIgY3VycmVudFJlbmRlciA9IHJlbmRlci5jdXJyZW50UmVuZGVyKClcblxuICBpZiAoYXR0cmlidXRlcy5iaW5kaW5nKSB7XG4gICAgYmluZE1vZGVsKHRhZywgYXR0cmlidXRlcywgY2hpbGRFbGVtZW50cylcbiAgICBkZWxldGUgYXR0cmlidXRlcy5iaW5kaW5nXG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpXG4gIGZvciAodmFyIGsgPSAwOyBrIDwga2V5cy5sZW5ndGg7IGsrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2tdXG4gICAgdmFyIGF0dHJpYnV0ZSA9IGF0dHJpYnV0ZXNba2V5XVxuXG4gICAgaWYgKHR5cGVvZiAoYXR0cmlidXRlKSA9PT0gJ2Z1bmN0aW9uJyAmJiBjdXJyZW50UmVuZGVyKSB7XG4gICAgICBhdHRyaWJ1dGVzW2tleV0gPSBjdXJyZW50UmVuZGVyLnRyYW5zZm9ybUZ1bmN0aW9uQXR0cmlidXRlKGtleSwgYXR0cmlidXRlKVxuICAgIH1cblxuICAgIHZhciByZW5hbWUgPSByZW5hbWVzW2tleV1cbiAgICBpZiAocmVuYW1lKSB7XG4gICAgICBhdHRyaWJ1dGVzW3JlbmFtZV0gPSBhdHRyaWJ1dGVcbiAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzW2tleV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuXG4gICAgaWYgKGRhdGFBdHRyaWJ1dGVSZWdleC50ZXN0KGtleSkpIHtcbiAgICAgIGlmICghZGF0YXNldCkge1xuICAgICAgICBkYXRhc2V0ID0gYXR0cmlidXRlcy5kYXRhc2V0XG5cbiAgICAgICAgaWYgKCFkYXRhc2V0KSB7XG4gICAgICAgICAgZGF0YXNldCA9IGF0dHJpYnV0ZXMuZGF0YXNldCA9IHt9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGRhdGFrZXkgPSBrZXlcbiAgICAgICAgLnJlcGxhY2UoZGF0YUF0dHJpYnV0ZVJlZ2V4LCAnJylcbiAgICAgICAgLnJlcGxhY2UoLy0oW2Etel0pL2lnLCBmdW5jdGlvbiAoXywgeCkgeyByZXR1cm4geC50b1VwcGVyQ2FzZSgpIH0pXG5cbiAgICAgIGRhdGFzZXRbZGF0YWtleV0gPSBhdHRyaWJ1dGVcbiAgICAgIGRlbGV0ZSBhdHRyaWJ1dGVzW2tleV1cbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICB9XG5cbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgYXR0cmlidXRlcy5fX3NvdXJjZSkge1xuICAgIGlmICghZGF0YXNldCkge1xuICAgICAgZGF0YXNldCA9IGF0dHJpYnV0ZXMuZGF0YXNldFxuXG4gICAgICBpZiAoIWRhdGFzZXQpIHtcbiAgICAgICAgZGF0YXNldCA9IGF0dHJpYnV0ZXMuZGF0YXNldCA9IHt9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGF0YXNldC5maWxlTmFtZSA9IGF0dHJpYnV0ZXMuX19zb3VyY2UuZmlsZU5hbWVcbiAgICBkYXRhc2V0LmxpbmVOdW1iZXIgPSBhdHRyaWJ1dGVzLl9fc291cmNlLmxpbmVOdW1iZXJcbiAgfVxuXG4gIGlmIChhdHRyaWJ1dGVzLmNsYXNzTmFtZSkge1xuICAgIGF0dHJpYnV0ZXMuY2xhc3NOYW1lID0gZ2VuZXJhdGVDbGFzc05hbWUoYXR0cmlidXRlcy5jbGFzc05hbWUpXG4gIH1cblxuICByZXR1cm4gYXR0cmlidXRlc1xufVxuXG52YXIgcmVuYW1lcyA9IHtcbiAgZm9yOiAnaHRtbEZvcicsXG4gIGNsYXNzOiAnY2xhc3NOYW1lJyxcbiAgY29udGVudGVkaXRhYmxlOiAnY29udGVudEVkaXRhYmxlJyxcbiAgdGFiaW5kZXg6ICd0YWJJbmRleCcsXG4gIGNvbHNwYW46ICdjb2xTcGFuJ1xufVxuXG52YXIgZGF0YUF0dHJpYnV0ZVJlZ2V4ID0gL15kYXRhLS9cblxuZnVuY3Rpb24gZ2VuZXJhdGVDbGFzc05hbWUgKG9iaikge1xuICBpZiAodHlwZW9mIChvYmopID09PSAnb2JqZWN0Jykge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgdmFyIG5hbWVzID0gb2JqLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVDbGFzc05hbWUoaXRlbSlcbiAgICAgIH0pXG4gICAgICByZXR1cm4gbmFtZXMuam9pbignICcpIHx8IHVuZGVmaW5lZFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2VuZXJhdGVDb25kaXRpb25hbENsYXNzTmFtZXMob2JqKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gb2JqXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVDb25kaXRpb25hbENsYXNzTmFtZXMgKG9iaikge1xuICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiBvYmpba2V5XVxuICB9KS5qb2luKCcgJykgfHwgdW5kZWZpbmVkXG59XG4iLCJmdW5jdGlvbiBQcm9wZXJ0eUhvb2sgKHZhbHVlKSB7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZVxufVxuXG5Qcm9wZXJ0eUhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAoZWxlbWVudCwgcHJvcGVydHkpIHtcbiAgZWxlbWVudFtwcm9wZXJ0eV0gPSB0aGlzLnZhbHVlXG59XG5cblByb3BlcnR5SG9vay5wcm90b3R5cGUudW5ob29rID0gZnVuY3Rpb24gKGVsZW1lbnQsIHByb3BlcnR5KSB7XG4gIGRlbGV0ZSBlbGVtZW50W3Byb3BlcnR5XVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5SG9va1xuIiwidmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciByZWZyZXNoRXZlbnRSZXN1bHQgPSByZXF1aXJlKCcuL3JlZnJlc2hFdmVudFJlc3VsdCcpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgcmVmcmVzaEV2ZW50UmVzdWx0KHByb21pc2UsIHJlbmRlci5jdXJyZW50UmVuZGVyKCkubW91bnQsIHtyZWZyZXNoOiAncHJvbWlzZSd9KVxufVxuIiwidmFyIGRlcHJlY2F0aW9ucyA9IHJlcXVpcmUoJy4vZGVwcmVjYXRpb25zJylcblxubW9kdWxlLmV4cG9ydHMgPSByZWZyZXNoRXZlbnRSZXN1bHRcblxudmFyIG5vcmVmcmVzaCA9IHt9XG5cbmZ1bmN0aW9uIG5vcmVmcmVzaEZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5vcmVmcmVzaFxufVxuXG5tb2R1bGUuZXhwb3J0cy5ub3JlZnJlc2ggPSBub3JlZnJlc2hGdW5jdGlvblxuXG5mdW5jdGlvbiByZWZyZXNoRXZlbnRSZXN1bHQgKHJlc3VsdCwgbW91bnQsIG9wdGlvbnMpIHtcbiAgdmFyIG9ubHlSZWZyZXNoQWZ0ZXJQcm9taXNlID0gb3B0aW9ucyAmJiBvcHRpb25zLnJlZnJlc2ggPT09ICdwcm9taXNlJ1xuICB2YXIgY29tcG9uZW50VG9SZWZyZXNoID0gb3B0aW9ucyAmJiBvcHRpb25zLmNvbXBvbmVudFxuXG4gIGlmIChyZXN1bHQgJiYgdHlwZW9mIChyZXN1bHQudGhlbikgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXN1bHQudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICB2YXIgb3B0cyA9IGNsb25lT3B0aW9ucyhvcHRpb25zKVxuICAgICAgb3B0cy5yZWZyZXNoID0gdW5kZWZpbmVkXG4gICAgICByZWZyZXNoRXZlbnRSZXN1bHQocmVzdWx0LCBtb3VudCwgb3B0cylcbiAgICB9KVxuICB9XG5cbiAgaWYgKG9ubHlSZWZyZXNoQWZ0ZXJQcm9taXNlKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAoaXNDb21wb25lbnQocmVzdWx0KSkge1xuICAgIG1vdW50LnJlZnJlc2hDb21wb25lbnQocmVzdWx0KVxuICB9IGVsc2UgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHQubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlZnJlc2hFdmVudFJlc3VsdChyZXN1bHRbaV0sIG1vdW50LCBvcHRpb25zKVxuICAgIH1cbiAgfSBlbHNlIGlmIChjb21wb25lbnRUb1JlZnJlc2gpIHtcbiAgICBpZiAoY29tcG9uZW50VG9SZWZyZXNoLnJlZnJlc2hDb21wb25lbnQpIHtcbiAgICAgIGNvbXBvbmVudFRvUmVmcmVzaC5yZWZyZXNoQ29tcG9uZW50KClcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50VG9SZWZyZXNoLnJlZnJlc2goKVxuICAgIH1cbiAgfSBlbHNlIGlmIChyZXN1bHQgPT09IG5vcmVmcmVzaCkge1xuICAgIC8vIGRvbid0IHJlZnJlc2g7XG4gIH0gZWxzZSBpZiAocmVzdWx0ID09PSBub3JlZnJlc2hGdW5jdGlvbikge1xuICAgIGRlcHJlY2F0aW9ucy5ub3JlZnJlc2goJ2h5cGVyZG9tLm5vcmVmcmVzaCBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGh5cGVyZG9tLm5vcmVmcmVzaCgpJylcbiAgICAvLyBkb24ndCByZWZyZXNoO1xuICB9IGVsc2Uge1xuICAgIG1vdW50LnJlZnJlc2goKVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0NvbXBvbmVudCAoY29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAoKHR5cGVvZiBjb21wb25lbnQuaW5pdCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgIHR5cGVvZiBjb21wb25lbnQudXBkYXRlID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgdHlwZW9mIGNvbXBvbmVudC5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB8fCAodHlwZW9mIGNvbXBvbmVudC5yZWZyZXNoQ29tcG9uZW50ID09PSAnZnVuY3Rpb24nKSlcbn1cblxuZnVuY3Rpb24gY2xvbmVPcHRpb25zIChvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vcmVmcmVzaDogb3B0aW9ucy5ub3JlZnJlc2gsXG4gICAgICByZWZyZXNoOiBvcHRpb25zLnJlZnJlc2gsXG4gICAgICBjb21wb25lbnQ6IG9wdGlvbnMuY29tcG9uZW50XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7fVxuICB9XG59XG4iLCJ2YXIgc2ltcGxlUHJvbWlzZSA9IHJlcXVpcmUoJy4vc2ltcGxlUHJvbWlzZScpXG5cbmZ1bmN0aW9uIHJ1blJlbmRlciAobW91bnQsIGZuKSB7XG4gIHZhciByZW5kZXIgPSBuZXcgUmVuZGVyKG1vdW50KVxuXG4gIHRyeSB7XG4gICAgcnVuUmVuZGVyLl9jdXJyZW50UmVuZGVyID0gcmVuZGVyXG5cbiAgICByZXR1cm4gZm4oKVxuICB9IGZpbmFsbHkge1xuICAgIHJlbmRlci5maW5pc2hlZC5mdWxmaWxsKClcbiAgICBydW5SZW5kZXIuX2N1cnJlbnRSZW5kZXIgPSB1bmRlZmluZWRcbiAgfVxufVxuXG5mdW5jdGlvbiBSZW5kZXIgKG1vdW50KSB7XG4gIHRoaXMuZmluaXNoZWQgPSBzaW1wbGVQcm9taXNlKClcbiAgdGhpcy5tb3VudCA9IG1vdW50XG4gIHRoaXMuYXR0YWNobWVudCA9IG1vdW50XG59XG5cblJlbmRlci5wcm90b3R5cGUudHJhbnNmb3JtRnVuY3Rpb25BdHRyaWJ1dGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLm1vdW50LnRyYW5zZm9ybUZ1bmN0aW9uQXR0cmlidXRlLmFwcGx5KHRoaXMubW91bnQsIGFyZ3VtZW50cylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBydW5SZW5kZXJcbm1vZHVsZS5leHBvcnRzLmN1cnJlbnRSZW5kZXIgPSBjdXJyZW50UmVuZGVyXG5tb2R1bGUuZXhwb3J0cy5yZWZyZXNoaWZ5ID0gcmVmcmVzaGlmeVxubW9kdWxlLmV4cG9ydHMuUmVmcmVzaEhvb2sgPSBSZWZyZXNoSG9va1xuXG5mdW5jdGlvbiBjdXJyZW50UmVuZGVyICgpIHtcbiAgcmV0dXJuIHJ1blJlbmRlci5fY3VycmVudFJlbmRlciB8fCBkZWZhdWx0UmVuZGVyXG59XG5cbnZhciBkZWZhdWx0UmVuZGVyID0ge1xuICBtb3VudDoge1xuICAgIHNldHVwTW9kZWxDb21wb25lbnQ6IGZ1bmN0aW9uICgpIHsgfSxcbiAgICByZWZyZXNoaWZ5OiBmdW5jdGlvbiAoZm4pIHsgcmV0dXJuIGZuIH1cbiAgfSxcblxuICB0cmFuc2Zvcm1GdW5jdGlvbkF0dHJpYnV0ZTogZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFJlZnJlc2hIb29rKHZhbHVlKVxuICB9LFxuXG4gIGZpbmlzaGVkOiB7XG4gICAgdGhlbjogZnVuY3Rpb24gKGZuKSB7XG4gICAgICBmbigpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hpZnkgKGZuLCBvcHRpb25zKSB7XG4gIHJldHVybiBydW5SZW5kZXIuY3VycmVudFJlbmRlcigpLm1vdW50LnJlZnJlc2hpZnkoZm4sIG9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIFJlZnJlc2hIb29rIChoYW5kbGVyKSB7XG4gIHRoaXMuaGFuZGxlciA9IGhhbmRsZXJcbn1cblxuUmVmcmVzaEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHkpIHtcbiAgbm9kZVtwcm9wZXJ0eV0gPSByZWZyZXNoaWZ5KHRoaXMuaGFuZGxlcilcbn1cblxuUmVmcmVzaEhvb2sucHJvdG90eXBlLnVuaG9vayA9IGZ1bmN0aW9uIChub2RlLCBwcm9wZXJ0eSkge1xuICBub2RlW3Byb3BlcnR5XSA9IG51bGxcbn1cbiIsInZhciB2aHRtbCA9IHJlcXVpcmUoJy4vdmh0bWwnKVxudmFyIGRvbUNvbXBvbmVudCA9IHJlcXVpcmUoJy4vZG9tQ29tcG9uZW50JylcbnZhciBiaW5kaW5nTWV0YSA9IHJlcXVpcmUoJy4vbWV0YScpXG52YXIgdG9WZG9tID0gcmVxdWlyZSgnLi90b1Zkb20nKVxudmFyIHBhcnNlVGFnID0gcmVxdWlyZSgndmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9wYXJzZS10YWcnKVxudmFyIE1vdW50ID0gcmVxdWlyZSgnLi9tb3VudCcpXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi9jb21wb25lbnQnKVxudmFyIHJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciBkZXByZWNhdGlvbnMgPSByZXF1aXJlKCcuL2RlcHJlY2F0aW9ucycpXG52YXIgcHJlcGFyZUF0dHJpYnV0ZXMgPSByZXF1aXJlKCcuL3ByZXBhcmVBdHRyaWJ1dGVzJylcbnZhciBiaW5kaW5nID0gcmVxdWlyZSgnLi9iaW5kaW5nJylcbnZhciByZWZyZXNoQWZ0ZXIgPSByZXF1aXJlKCcuL3JlZnJlc2hBZnRlcicpXG52YXIgcmVmcmVzaEV2ZW50UmVzdWx0ID0gcmVxdWlyZSgnLi9yZWZyZXNoRXZlbnRSZXN1bHQnKVxuXG5leHBvcnRzLmFwcGVuZCA9IGZ1bmN0aW9uIChlbGVtZW50LCByZW5kZXIsIG1vZGVsLCBvcHRpb25zKSB7XG4gIHJldHVybiBzdGFydEF0dGFjaG1lbnQocmVuZGVyLCBtb2RlbCwgb3B0aW9ucywgZnVuY3Rpb24gKG1vdW50LCBkb21Db21wb25lbnRPcHRpb25zKSB7XG4gICAgdmFyIGNvbXBvbmVudCA9IGRvbUNvbXBvbmVudC5jcmVhdGUoZG9tQ29tcG9uZW50T3B0aW9ucylcbiAgICB2YXIgdmRvbSA9IG1vdW50LnJlbmRlcigpXG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChjb21wb25lbnQuY3JlYXRlKHZkb20pKVxuICAgIHJldHVybiBjb21wb25lbnRcbiAgfSlcbn1cblxuZXhwb3J0cy5yZXBsYWNlID0gZnVuY3Rpb24gKGVsZW1lbnQsIHJlbmRlciwgbW9kZWwsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIHN0YXJ0QXR0YWNobWVudChyZW5kZXIsIG1vZGVsLCBvcHRpb25zLCBmdW5jdGlvbiAobW91bnQsIGRvbUNvbXBvbmVudE9wdGlvbnMpIHtcbiAgICB2YXIgY29tcG9uZW50ID0gZG9tQ29tcG9uZW50LmNyZWF0ZShkb21Db21wb25lbnRPcHRpb25zKVxuICAgIHZhciB2ZG9tID0gbW91bnQucmVuZGVyKClcbiAgICBlbGVtZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGNvbXBvbmVudC5jcmVhdGUodmRvbSksIGVsZW1lbnQpXG4gICAgcmV0dXJuIGNvbXBvbmVudFxuICB9KVxufVxuXG5leHBvcnRzLmFwcGVuZFZEb20gPSBmdW5jdGlvbiAodmRvbSwgcmVuZGVyLCBtb2RlbCwgb3B0aW9ucykge1xuICByZXR1cm4gc3RhcnRBdHRhY2htZW50KHJlbmRlciwgbW9kZWwsIG9wdGlvbnMsIGZ1bmN0aW9uIChtb3VudCkge1xuICAgIHZhciBjb21wb25lbnQgPSB7XG4gICAgICBjcmVhdGU6IGZ1bmN0aW9uIChuZXdWRG9tKSB7XG4gICAgICAgIHZkb20uY2hpbGRyZW4gPSBbXVxuICAgICAgICBpZiAobmV3VkRvbSkge1xuICAgICAgICAgIHZkb20uY2hpbGRyZW4ucHVzaCh0b1Zkb20obmV3VkRvbSkpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIChuZXdWRG9tKSB7XG4gICAgICAgIHZkb20uY2hpbGRyZW4gPSBbXVxuICAgICAgICBpZiAobmV3VkRvbSkge1xuICAgICAgICAgIHZkb20uY2hpbGRyZW4ucHVzaCh0b1Zkb20obmV3VkRvbSkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29tcG9uZW50LmNyZWF0ZShtb3VudC5yZW5kZXIoKSlcbiAgICByZXR1cm4gY29tcG9uZW50XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN0YXJ0QXR0YWNobWVudCAocmVuZGVyLCBtb2RlbCwgb3B0aW9ucywgYXR0YWNoVG9Eb20pIHtcbiAgaWYgKHR5cGVvZiByZW5kZXIgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHN0YXJ0KHJlbmRlciwgYXR0YWNoVG9Eb20sIG1vZGVsKVxuICB9IGVsc2Uge1xuICAgIGRlcHJlY2F0aW9ucy5yZW5kZXJGdW5jdGlvbignaHlwZXJkb20uYXBwZW5kIGFuZCBoeXBlcmRvbS5yZXBsYWNlIHdpdGggcmVuZGVyIGZ1bmN0aW9ucyBhcmUgZGVwcmVjYXRlZCwgcGxlYXNlIHBhc3MgYSBjb21wb25lbnQnKVxuICAgIHJldHVybiBzdGFydCh7cmVuZGVyOiBmdW5jdGlvbiAoKSB7IHJldHVybiByZW5kZXIobW9kZWwpIH19LCBhdHRhY2hUb0RvbSwgb3B0aW9ucylcbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydCAobW9kZWwsIGF0dGFjaFRvRG9tLCBvcHRpb25zKSB7XG4gIHZhciBtb3VudCA9IG5ldyBNb3VudChtb2RlbCwgb3B0aW9ucylcbiAgcmVuZGVyKG1vdW50LCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIHZhciBkb21Db21wb25lbnRPcHRpb25zID0ge2RvY3VtZW50OiBvcHRpb25zLmRvY3VtZW50fVxuICAgIH1cbiAgICB0cnkge1xuICAgICAgbW91bnQuY29tcG9uZW50ID0gYXR0YWNoVG9Eb20obW91bnQsIGRvbUNvbXBvbmVudE9wdGlvbnMpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbW91bnQuY29tcG9uZW50ID0ge1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiAoKSB7fVxuICAgICAgfVxuICAgICAgdGhyb3cgZVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1vdW50XG59XG5cbi8qKlxuICogdGhpcyBmdW5jdGlvbiBpcyBxdWl0ZSB1Z2x5IGFuZCB5b3UgbWF5IGJlIHZlcnkgdGVtcHRlZFxuICogdG8gcmVmYWN0b3IgaXQgaW50byBzbWFsbGVyIGZ1bmN0aW9ucywgSSBjZXJ0YWlubHkgYW0uXG4gKiBob3dldmVyLCBpdCB3YXMgd3JpdHRlbiBsaWtlIHRoaXMgZm9yIHBlcmZvcm1hbmNlXG4gKiBzbyB0aGluayBvZiB0aGF0IGJlZm9yZSByZWZhY3RvcmluZyEgOilcbiAqL1xuZXhwb3J0cy5odG1sID0gZnVuY3Rpb24gKGhpZXJhcmNoeVNlbGVjdG9yKSB7XG4gIHZhciBoYXNIaWVyYXJjaHkgPSBoaWVyYXJjaHlTZWxlY3Rvci5pbmRleE9mKCcgJykgPj0gMFxuICB2YXIgc2VsZWN0b3IsIHNlbGVjdG9yRWxlbWVudHNcblxuICBpZiAoaGFzSGllcmFyY2h5KSB7XG4gICAgc2VsZWN0b3JFbGVtZW50cyA9IGhpZXJhcmNoeVNlbGVjdG9yLm1hdGNoKC9cXFMrL2cpXG4gICAgc2VsZWN0b3IgPSBzZWxlY3RvckVsZW1lbnRzW3NlbGVjdG9yRWxlbWVudHMubGVuZ3RoIC0gMV1cbiAgfSBlbHNlIHtcbiAgICBzZWxlY3RvciA9IGhpZXJhcmNoeVNlbGVjdG9yXG4gIH1cblxuICB2YXIgY2hpbGRFbGVtZW50c1xuICB2YXIgdmRvbVxuICB2YXIgdGFnXG4gIHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWzFdXG5cbiAgaWYgKGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlcy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0ICYmIHR5cGVvZiBhdHRyaWJ1dGVzLnJlbmRlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGNoaWxkRWxlbWVudHMgPSB0b1Zkb20ucmVjdXJzaXZlKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMikpXG4gICAgcHJlcGFyZUF0dHJpYnV0ZXMoc2VsZWN0b3IsIGF0dHJpYnV0ZXMsIGNoaWxkRWxlbWVudHMpXG4gICAgdGFnID0gcGFyc2VUYWcoc2VsZWN0b3IsIGF0dHJpYnV0ZXMpXG4gICAgdmRvbSA9IHZodG1sKHRhZywgYXR0cmlidXRlcywgY2hpbGRFbGVtZW50cylcbiAgfSBlbHNlIHtcbiAgICBhdHRyaWJ1dGVzID0ge31cbiAgICBjaGlsZEVsZW1lbnRzID0gdG9WZG9tLnJlY3Vyc2l2ZShBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKVxuICAgIHRhZyA9IHBhcnNlVGFnKHNlbGVjdG9yLCBhdHRyaWJ1dGVzKVxuICAgIHZkb20gPSB2aHRtbCh0YWcsIGF0dHJpYnV0ZXMsIGNoaWxkRWxlbWVudHMpXG4gIH1cblxuICBpZiAoaGFzSGllcmFyY2h5KSB7XG4gICAgZm9yICh2YXIgbiA9IHNlbGVjdG9yRWxlbWVudHMubGVuZ3RoIC0gMjsgbiA+PSAwOyBuLS0pIHtcbiAgICAgIHZkb20gPSB2aHRtbChzZWxlY3RvckVsZW1lbnRzW25dLCB7fSwgW3Zkb21dKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2ZG9tXG59XG5cbmV4cG9ydHMuanN4ID0gZnVuY3Rpb24gKHRhZywgYXR0cmlidXRlcykge1xuICB2YXIgY2hpbGRFbGVtZW50cyA9IHRvVmRvbS5yZWN1cnNpdmUoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSlcbiAgaWYgKHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgIHByZXBhcmVBdHRyaWJ1dGVzKHRhZywgYXR0cmlidXRlcywgY2hpbGRFbGVtZW50cylcbiAgICB9XG4gICAgcmV0dXJuIHZodG1sKHRhZywgYXR0cmlidXRlcyB8fCB7fSwgY2hpbGRFbGVtZW50cylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudChuZXcgdGFnKGF0dHJpYnV0ZXMgfHwge30sIGNoaWxkRWxlbWVudHMpLCB7dmlld0NvbXBvbmVudDogdHJ1ZX0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbmV3LWNhcFxuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLmh0bWwsICdjdXJyZW50UmVuZGVyJywge2dldDogZnVuY3Rpb24gKCkge1xuICBkZXByZWNhdGlvbnMuY3VycmVudFJlbmRlcignaHlwZXJkb20uaHRtbC5jdXJyZW50UmVuZGVyIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgaHlwZXJkb20uY3VycmVudFJlbmRlcigpIGluc3RlYWQnKVxuICByZXR1cm4gcmVuZGVyLl9jdXJyZW50UmVuZGVyXG59fSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMuaHRtbCwgJ3JlZnJlc2gnLCB7Z2V0OiBmdW5jdGlvbiAoKSB7XG4gIGRlcHJlY2F0aW9ucy5yZWZyZXNoKCdoeXBlcmRvbS5odG1sLnJlZnJlc2ggaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBjb21wb25lbnQucmVmcmVzaCgpIGluc3RlYWQnKVxuICBpZiAocmVuZGVyLl9jdXJyZW50UmVuZGVyKSB7XG4gICAgdmFyIGN1cnJlbnRSZW5kZXIgPSByZW5kZXIuX2N1cnJlbnRSZW5kZXJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgcmVmcmVzaEV2ZW50UmVzdWx0KHJlc3VsdCwgY3VycmVudFJlbmRlci5tb3VudClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgYXNzaWduIGh5cGVyZG9tLmh0bWwucmVmcmVzaCBkdXJpbmcgYSByZW5kZXIgY3ljbGUgaWYgeW91IHdhbnQgdG8gdXNlIGl0IGluIGV2ZW50IGhhbmRsZXJzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZlYXR1cmlzdC9oeXBlcmRvbSNyZWZyZXNoLW91dHNpZGUtcmVuZGVyLWN5Y2xlJylcbiAgfVxufX0pXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLmh0bWwsICdub3JlZnJlc2gnLCB7Z2V0OiBmdW5jdGlvbiAoKSB7XG4gIGRlcHJlY2F0aW9ucy5ub3JlZnJlc2goJ2h5cGVyZG9tLmh0bWwubm9yZWZyZXNoIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgaHlwZXJkb20ubm9yZWZyZXNoKCkgaW5zdGVhZCcpXG4gIHJldHVybiByZWZyZXNoRXZlbnRSZXN1bHQubm9yZWZyZXNoXG59fSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMuaHRtbCwgJ2JpbmRpbmcnLCB7Z2V0OiBmdW5jdGlvbiAoKSB7XG4gIGRlcHJlY2F0aW9ucy5odG1sQmluZGluZygnaHlwZXJkb20uaHRtbC5iaW5kaW5nKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBoeXBlcmRvbS5iaW5kaW5nKCkgaW5zdGVhZCcpXG4gIHJldHVybiBiaW5kaW5nXG59fSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMuaHRtbCwgJ3JlZnJlc2hBZnRlcicsIHtnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgZGVwcmVjYXRpb25zLnJlZnJlc2hBZnRlcihcImh5cGVyZG9tLmh0bWwucmVmcmVzaEFmdGVyKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSByZXF1aXJlKCdoeXBlcmRvbS9yZWZyZXNoQWZ0ZXInKSgpIGluc3RlYWRcIilcbiAgcmV0dXJuIHJlZnJlc2hBZnRlclxufX0pXG5cbmV4cG9ydHMuaHRtbC5tZXRhID0gYmluZGluZ01ldGFcblxuZnVuY3Rpb24gcmF3SHRtbCAoKSB7XG4gIHZhciBzZWxlY3RvclxuICB2YXIgaHRtbFxuICB2YXIgb3B0aW9uc1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgc2VsZWN0b3IgPSBhcmd1bWVudHNbMF1cbiAgICBodG1sID0gYXJndW1lbnRzWzFdXG4gICAgb3B0aW9ucyA9IHtpbm5lckhUTUw6IGh0bWx9XG4gICAgcmV0dXJuIGV4cG9ydHMuaHRtbChzZWxlY3Rvciwgb3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICBzZWxlY3RvciA9IGFyZ3VtZW50c1swXVxuICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMV1cbiAgICBodG1sID0gYXJndW1lbnRzWzJdXG4gICAgb3B0aW9ucy5pbm5lckhUTUwgPSBodG1sXG4gICAgcmV0dXJuIGV4cG9ydHMuaHRtbChzZWxlY3Rvciwgb3B0aW9ucylcbiAgfVxufVxuXG5leHBvcnRzLmh0bWwucmF3SHRtbCA9IGZ1bmN0aW9uICgpIHtcbiAgZGVwcmVjYXRpb25zLmh0bWxSYXdIdG1sKCdoeXBlcmRvbS5odG1sLnJhd0h0bWwoKSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIGh5cGVyZG9tLnJhd0h0bWwoKSBpbnN0ZWFkJylcbiAgcmV0dXJuIHJhd0h0bWwuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpXG59XG5cbmV4cG9ydHMucmF3SHRtbCA9IHJhd0h0bWxcbiIsInZhciBtYWtlQmluZGluZyA9IHJlcXVpcmUoJy4vYmluZGluZycpXG52YXIgcmVmcmVzaGlmeSA9IHJlcXVpcmUoJy4vcmVuZGVyJykucmVmcmVzaGlmeVxudmFyIHJ1blJlbmRlciA9IHJlcXVpcmUoJy4vcmVuZGVyJylcbnZhciByZWZyZXNoQWZ0ZXIgPSByZXF1aXJlKCcuL3JlZnJlc2hBZnRlcicpXG52YXIgaCA9IHJlcXVpcmUoJy4vcmVuZGVyaW5nJykuaHRtbFxudmFyIGRlYnVnZ2luZ1Byb3BlcnRpZXMgPSByZXF1aXJlKCcuL2RlYnVnZ2luZ1Byb3BlcnRpZXMnKVxuXG5mdW5jdGlvbiBSb3V0ZXIgKG9wdGlvbnMpIHtcbiAgdGhpcy5fcXVlcnlzdHJpbmcgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgncXVlcnlzdHJpbmcnKSA/IG9wdGlvbnMucXVlcnlzdHJpbmcgOiBuZXcgUXVlcnlTdHJpbmcoKVxuICB0aGlzLmhpc3RvcnkgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgnaGlzdG9yeScpID8gb3B0aW9ucy5oaXN0b3J5IDogbmV3IFB1c2hTdGF0ZSgpXG4gIHRoaXMuYmFzZVVybCA9IHR5cGVvZiBvcHRpb25zID09PSAnb2JqZWN0JyAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCdiYXNlVXJsJykgPyBvcHRpb25zLmJhc2VVcmwgOiB1bmRlZmluZWRcbn1cblxuUm91dGVyLnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5sYXN0VXJsID0gdW5kZWZpbmVkXG4gIHRoaXMuaGlzdG9yeS5zdG9wKClcbn1cblxuZnVuY3Rpb24gd2Fsa1JvdXRlcyAodXJsLCBtb2RlbCwgdmlzaXQpIHtcbiAgZnVuY3Rpb24gd2FsayAobW9kZWwpIHtcbiAgICB2YXIgYWN0aW9uXG5cbiAgICBpZiAodHlwZW9mIG1vZGVsLnJvdXRlcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcnVuUmVuZGVyLmN1cnJlbnRSZW5kZXIoKS5tb3VudC5zZXR1cE1vZGVsQ29tcG9uZW50KG1vZGVsKVxuXG4gICAgICB2YXIgcm91dGVzID0gbW9kZWwucm91dGVzKClcblxuICAgICAgZm9yICh2YXIgciA9IDAsIGwgPSByb3V0ZXMubGVuZ3RoOyByIDwgbDsgcisrKSB7XG4gICAgICAgIHZhciByb3V0ZSA9IHJvdXRlc1tyXVxuXG4gICAgICAgIGlmIChyb3V0ZSAmJiAodHlwZW9mIHJvdXRlLm1hdGNoVXJsID09PSAnZnVuY3Rpb24nIHx8IHJvdXRlLm5vdEZvdW5kKSkge1xuICAgICAgICAgIGFjdGlvbiA9IHZpc2l0KHJvdXRlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFjdGlvbiA9IHdhbGsocm91dGUpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGxheW91dEFjdGlvbihtb2RlbCwgYWN0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgbW9kZWwgdG8gaGF2ZSByb3V0ZXMgbWV0aG9kJylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gd2Fsayhtb2RlbClcbn1cblxuZnVuY3Rpb24gbWF0Y2hSb3V0ZSAodXJsLCBtb2RlbCwgaXNOZXdVcmwpIHtcbiAgdmFyIHJvdXRlc1RyaWVkID0gW11cbiAgdmFyIG5vdEZvdW5kXG5cbiAgdmFyIGFjdGlvbiA9IHdhbGtSb3V0ZXModXJsLCBtb2RlbCwgZnVuY3Rpb24gKHJvdXRlKSB7XG4gICAgdmFyIG1hdGNoXG5cbiAgICBpZiAocm91dGUubm90Rm91bmQpIHtcbiAgICAgIG5vdEZvdW5kID0gcm91dGVcbiAgICB9IGVsc2Uge1xuICAgICAgcm91dGVzVHJpZWQucHVzaChyb3V0ZSlcbiAgICAgIGlmICgobWF0Y2ggPSByb3V0ZS5tYXRjaFVybCh1cmwpKSkge1xuICAgICAgICByZXR1cm4gaXNOZXdVcmxcbiAgICAgICAgICA/IHJvdXRlLnNldCh1cmwsIG1hdGNoKVxuICAgICAgICAgIDogcm91dGUuZ2V0KHVybCwgbWF0Y2gpXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiBhY3Rpb24gfHwge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIChub3RGb3VuZCA/IG5vdEZvdW5kLnJlbmRlciA6IHJlbmRlck5vdEZvdW5kKSh1cmwsIHJvdXRlc1RyaWVkKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBsYXlvdXRBY3Rpb24gKG1vZGVsLCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblJlbmRlciA9IGFjdGlvbi5yZW5kZXJcblxuICBhY3Rpb24ucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0eXBlb2YgbW9kZWwucmVuZGVyTGF5b3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZGVidWdnaW5nUHJvcGVydGllcyhtb2RlbC5yZW5kZXJMYXlvdXQoYWN0aW9uUmVuZGVyKCkpLCBtb2RlbClcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRlYnVnZ2luZ1Byb3BlcnRpZXMoYWN0aW9uUmVuZGVyKCksIG1vZGVsKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhY3Rpb25cbn1cblxuUm91dGVyLnByb3RvdHlwZS51cmwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB1cmwgPSB0aGlzLmhpc3RvcnkudXJsKClcbiAgcmV0dXJuIHJlbW92ZUJhc2VVcmwodGhpcy5iYXNlVXJsLCB1cmwpXG59XG5cblJvdXRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKG1vZGVsKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICB0aGlzLmhpc3Rvcnkuc3RhcnQobW9kZWwpXG5cbiAgZnVuY3Rpb24gcmVuZGVyVXJsIChyZWRpcmVjdHMpIHtcbiAgICB2YXIgdXJsID0gc2VsZi51cmwoKVxuICAgIHZhciBpc05ld1VybCA9IHNlbGYubGFzdFVybCAhPT0gdXJsXG4gICAgdmFyIGFjdGlvbiA9IG1hdGNoUm91dGUodXJsLCBtb2RlbCwgaXNOZXdVcmwpXG5cbiAgICBpZiAoYWN0aW9uLnVybCkge1xuICAgICAgaWYgKHNlbGYubGFzdFVybCAhPT0gYWN0aW9uLnVybCkge1xuICAgICAgICBpZiAoYWN0aW9uLnB1c2gpIHtcbiAgICAgICAgICBzZWxmLnB1c2goYWN0aW9uLnVybClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxmLnJlcGxhY2UoYWN0aW9uLnVybClcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmxhc3RVcmwgPSBzZWxmLnVybCgpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhY3Rpb24ucmVkaXJlY3QpIHtcbiAgICAgIGlmIChyZWRpcmVjdHMubGVuZ3RoID4gMTApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdoeXBlcmRvbTogdG9vIG1hbnkgcmVkaXJlY3RzOlxcbiAgJyArIHJlZGlyZWN0cy5qb2luKCdcXG4gICcpKVxuICAgICAgfVxuICAgICAgc2VsZi5yZXBsYWNlKGFjdGlvbi5yZWRpcmVjdClcbiAgICAgIHJlZGlyZWN0cy5wdXNoKHVybClcbiAgICAgIHJldHVybiByZW5kZXJVcmwocmVkaXJlY3RzKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmxhc3RVcmwgPSB1cmxcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uLnJlbmRlcigpXG4gIH1cblxuICByZXR1cm4gcmVuZGVyVXJsKFtdKVxufVxuXG5mdW5jdGlvbiByZW1vdmVCYXNlVXJsIChiYXNlVXJsLCB1cmwpIHtcbiAgaWYgKGJhc2VVcmwpIHtcbiAgICBpZiAodXJsLmluZGV4T2YoYmFzZVVybCkgPT09IDApIHtcbiAgICAgIHZhciBwYXRoID0gdXJsLnN1YnN0cmluZyhiYXNlVXJsLmxlbmd0aClcbiAgICAgIHJldHVybiBwYXRoWzBdID09PSAnLycgPyBwYXRoIDogJy8nICsgcGF0aFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdXJsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB1cmxcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRCYXNlVXJsIChiYXNlVXJsLCB1cmwpIHtcbiAgaWYgKGJhc2VVcmwpIHtcbiAgICBpZiAodXJsID09PSAnLycpIHtcbiAgICAgIHJldHVybiBiYXNlVXJsXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiYXNlVXJsLnJlcGxhY2UoL1xcLyQvLCAnJykgKyAnLycgKyB1cmwucmVwbGFjZSgvXlxcLy8sICcnKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdXJsXG4gIH1cbn1cblxuUm91dGVyLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKHVybCkge1xuICB0aGlzLmhpc3RvcnkucHVzaChhZGRCYXNlVXJsKHRoaXMuYmFzZVVybCwgdXJsKSlcbn1cblxuUm91dGVyLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gKHVybCkge1xuICB0aGlzLmhpc3RvcnkucmVwbGFjZShhZGRCYXNlVXJsKHRoaXMuYmFzZVVybCwgdXJsKSlcbn1cblxuZnVuY3Rpb24gcmVuZGVyTm90Rm91bmQgKHVybCwgcm91dGVzKSB7XG4gIHJldHVybiBoKCdwcmUnLCBoKCdjb2RlJywgJ25vIHJvdXRlIGZvcjogJyArIHVybCArICdcXG5cXG5hdmFpbGFibGUgcm91dGVzOlxcblxcbicgKyByb3V0ZXMubWFwKGZ1bmN0aW9uIChyKSB7IHJldHVybiAnICAnICsgci5kZWZpbml0aW9uLnBhdHRlcm4gfSkuam9pbignXFxuJykpKVxufVxuXG5Sb3V0ZXIucHJvdG90eXBlLm5vdEZvdW5kID0gZnVuY3Rpb24gKHJlbmRlcikge1xuICByZXR1cm4ge1xuICAgIG5vdEZvdW5kOiB0cnVlLFxuICAgIHJlbmRlcjogcmVuZGVyXG4gIH1cbn1cblxuUm91dGVyLnByb3RvdHlwZS5yb3V0ZSA9IGZ1bmN0aW9uIChwYXR0ZXJuKSB7XG4gIHZhciByb3V0ZURlZmluaXRpb24gPSBuZXcgUm91dGVEZWZpbml0aW9uKHBhdHRlcm4sIHRoaXMpXG5cbiAgZnVuY3Rpb24gcm91dGUgKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gcm91dGVEZWZpbml0aW9uLnJvdXRlKG9wdGlvbnMpXG4gIH1cblxuICByb3V0ZS5pc0FjdGl2ZSA9IHJvdXRlRGVmaW5pdGlvbi5pc0FjdGl2ZS5iaW5kKHJvdXRlRGVmaW5pdGlvbilcbiAgcm91dGUucGFyYW1zID0gcm91dGVEZWZpbml0aW9uLnBhcmFtcy5iaW5kKHJvdXRlRGVmaW5pdGlvbilcbiAgcm91dGUucHVzaCA9IHJvdXRlRGVmaW5pdGlvbi5wdXNoLmJpbmQocm91dGVEZWZpbml0aW9uKVxuICByb3V0ZS5yZXBsYWNlID0gcm91dGVEZWZpbml0aW9uLnJlcGxhY2UuYmluZChyb3V0ZURlZmluaXRpb24pXG4gIHJvdXRlLmhyZWYgPSByb3V0ZURlZmluaXRpb24uaHJlZi5iaW5kKHJvdXRlRGVmaW5pdGlvbilcbiAgcm91dGUudXJsID0gcm91dGVEZWZpbml0aW9uLnVybC5iaW5kKHJvdXRlRGVmaW5pdGlvbilcblxuICByZXR1cm4gcm91dGVcbn1cblxuZnVuY3Rpb24gUm91dGVEZWZpbml0aW9uIChwYXR0ZXJuLCByb3V0ZXIpIHtcbiAgdmFyIHBhdHRlcm5WYXJpYWJsZXMgPSBwcmVwYXJlUGF0dGVybihwYXR0ZXJuKVxuXG4gIHRoaXMucGF0dGVybiA9IHBhdHRlcm5WYXJpYWJsZXMucGF0dGVyblxuICB0aGlzLnZhcmlhYmxlcyA9IHBhdHRlcm5WYXJpYWJsZXMudmFyaWFibGVzXG4gIHRoaXMucmVnZXggPSBwYXR0ZXJuVmFyaWFibGVzLnJlZ2V4XG5cbiAgdGhpcy5yb3V0ZXIgPSByb3V0ZXJcbn1cblxuUm91dGVEZWZpbml0aW9uLnByb3RvdHlwZS5yb3V0ZSA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUm91dGUob3B0aW9ucywgdGhpcylcbn1cblxuUm91dGVEZWZpbml0aW9uLnByb3RvdHlwZS5wYXJhbXMgPSBmdW5jdGlvbiAoX3VybCwgX21hdGNoKSB7XG4gIHZhciB1cmwgPSBfdXJsIHx8IHRoaXMucm91dGVyLnVybCgpXG4gIHZhciBtYXRjaCA9IF9tYXRjaCB8fCB0aGlzLm1hdGNoVXJsKHVybClcbiAgdmFyIHF1ZXJ5ID0gdXJsLnNwbGl0KCc/JylbMV1cbiAgdmFyIHBhcmFtcyA9IHRoaXMucm91dGVyLl9xdWVyeXN0cmluZy5wYXJzZShxdWVyeSlcblxuICBpZiAobWF0Y2gpIHtcbiAgICBmb3IgKHZhciBuID0gMTsgbiA8IG1hdGNoLmxlbmd0aDsgbisrKSB7XG4gICAgICBwYXJhbXNbdGhpcy52YXJpYWJsZXNbbiAtIDFdXSA9IG1hdGNoW25dXG4gICAgfVxuICAgIHJldHVybiBwYXJhbXNcbiAgfVxufVxuXG5Sb3V0ZURlZmluaXRpb24ucHJvdG90eXBlLm1hdGNoVXJsID0gZnVuY3Rpb24gKHVybCkge1xuICByZXR1cm4gdGhpcy5yZWdleC5leGVjKHVybC5zcGxpdCgnPycpWzBdKVxufVxuXG5Sb3V0ZURlZmluaXRpb24ucHJvdG90eXBlLmlzQWN0aXZlID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICBpZiAocGFyYW1zKSB7XG4gICAgdmFyIHVybCA9IHRoaXMucm91dGVyLnVybCgpXG4gICAgdmFyIHAgPSB7fVxuICAgIGV4dGVuZChleHRlbmQocCwgdGhpcy5wYXJhbXModXJsKSksIHBhcmFtcylcbiAgICByZXR1cm4gdGhpcy5yb3V0ZXIudXJsKCkgPT09IHRoaXMudXJsKHApXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICEhdGhpcy5tYXRjaFVybCh0aGlzLnJvdXRlci51cmwoKSlcbiAgfVxufVxuXG5Sb3V0ZURlZmluaXRpb24ucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAocGFyYW1zLCBvcHRpb25zKSB7XG4gIHRoaXMucm91dGVyLnB1c2godGhpcy51cmwocGFyYW1zKSlcbiAgaWYgKCEob3B0aW9ucyAmJiBvcHRpb25zLnJlc2V0U2Nyb2xsID09PSBmYWxzZSkpIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgMClcbiAgfVxufVxuXG5Sb3V0ZURlZmluaXRpb24ucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHRoaXMucm91dGVyLnJlcGxhY2UodGhpcy51cmwocGFyYW1zKSlcbn1cblxuUm91dGVEZWZpbml0aW9uLnByb3RvdHlwZS5ocmVmID0gZnVuY3Rpb24gKHBhcmFtcywgb3B0aW9ucykge1xuICByZXR1cm4gbmV3IEhyZWZBdHRyaWJ1dGUodGhpcywgcGFyYW1zLCBvcHRpb25zKVxufVxuXG5Sb3V0ZURlZmluaXRpb24ucHJvdG90eXBlLnVybCA9IGZ1bmN0aW9uIChfcGFyYW1zKSB7XG4gIHZhciBwYXJhbXMgPSBfcGFyYW1zIHx8IHt9XG4gIHZhciBvbmx5UXVlcnlQYXJhbXMgPSBjbG9uZShwYXJhbXMpXG5cbiAgdmFyIHVybCA9IHRoaXMucGF0dGVybi5yZXBsYWNlKC86KFthLXpfXVthLXowLTlfXSopXFwqL2dpLCBmdW5jdGlvbiAoXywgaWQpIHtcbiAgICB2YXIgcGFyYW0gPSBwYXJhbXNbaWRdXG4gICAgZGVsZXRlIG9ubHlRdWVyeVBhcmFtc1tpZF1cbiAgICByZXR1cm4gZW5jb2RlVVJJKHBhcmFtVG9TdHJpbmcocGFyYW0pKVxuICB9KVxuXG4gIHVybCA9IHVybC5yZXBsYWNlKC86KFthLXpfXVthLXowLTlfXSopL2dpLCBmdW5jdGlvbiAoXywgaWQpIHtcbiAgICB2YXIgcGFyYW0gPSBwYXJhbXNbaWRdXG4gICAgZGVsZXRlIG9ubHlRdWVyeVBhcmFtc1tpZF1cbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtVG9TdHJpbmcocGFyYW0pKVxuICB9KVxuXG4gIHZhciBxdWVyeSA9IHRoaXMucm91dGVyLl9xdWVyeXN0cmluZy5zdHJpbmdpZnkob25seVF1ZXJ5UGFyYW1zKVxuXG4gIGlmIChxdWVyeSkge1xuICAgIHJldHVybiB1cmwgKyAnPycgKyBxdWVyeVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB1cmxcbiAgfVxufVxuXG5mdW5jdGlvbiBSb3V0ZSAob3B0aW9ucywgZGVmaW5pdGlvbikge1xuICB0aGlzLmRlZmluaXRpb24gPSBkZWZpbml0aW9uXG5cbiAgdmFyIGJpbmRpbmdzID0gdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ2JpbmRpbmdzJykgPyBvcHRpb25zLmJpbmRpbmdzIDogdW5kZWZpbmVkXG4gIHRoaXMuYmluZGluZ3MgPSBiaW5kaW5ncyA/IGJpbmRQYXJhbXMoYmluZGluZ3MpIDogdW5kZWZpbmVkXG4gIHRoaXMub25sb2FkID0gdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ29ubG9hZCcpID8gb3B0aW9ucy5vbmxvYWQgOiB1bmRlZmluZWRcbiAgdGhpcy5yZW5kZXIgPSB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgncmVuZGVyJykgPyBvcHRpb25zLnJlbmRlciA6IHVuZGVmaW5lZFxuICB0aGlzLnJlZGlyZWN0ID0gdHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoJ3JlZGlyZWN0JykgPyBvcHRpb25zLnJlZGlyZWN0IDogdW5kZWZpbmVkXG5cbiAgaWYgKCF0aGlzLnJlbmRlciAmJiAhdGhpcy5yZWRpcmVjdCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgcm91dGUgb3B0aW9ucyB0byBoYXZlIGVpdGhlciByZW5kZXIgb3IgcmVkaXJlY3QgZnVuY3Rpb24nKVxuICB9XG5cbiAgdmFyIHB1c2ggPSB0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgncHVzaCcpID8gb3B0aW9ucy5wdXNoIDogdW5kZWZpbmVkXG5cbiAgaWYgKHR5cGVvZiBwdXNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhpcy5wdXNoID0gcHVzaFxuICB9IGVsc2UgaWYgKHB1c2ggaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICB0aGlzLnB1c2ggPSBmdW5jdGlvbiAob2xkUGFyYW1zLCBuZXdQYXJhbXMpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhwdXNoKS5zb21lKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hba2V5XSAmJiAob2xkUGFyYW1zLmhhc093blByb3BlcnR5KGtleSkgfHwgbmV3UGFyYW1zLmhhc093blByb3BlcnR5KGtleSkpICYmIG9sZFBhcmFtc1trZXldICE9PSBuZXdQYXJhbXNba2V5XVxuICAgICAgfSlcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wdXNoID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcHVzaCB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZFBhcmFtcyAocGFyYW1zKSB7XG4gIHZhciBiaW5kaW5ncyA9IHt9XG5cbiAgT2JqZWN0LmtleXMocGFyYW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBiaW5kaW5nc1trZXldID0gbWFrZUJpbmRpbmcocGFyYW1zW2tleV0sIHtyZWZyZXNoOiAncHJvbWlzZSd9KVxuICB9KVxuXG4gIHJldHVybiBiaW5kaW5nc1xufVxuXG5Sb3V0ZXIucHJvdG90eXBlLmhhc1JvdXRlID0gZnVuY3Rpb24gKG1vZGVsLCB1cmwpIHtcbiAgdmFyIGFjdGlvbiA9IHdhbGtSb3V0ZXModXJsLCBtb2RlbCwgZnVuY3Rpb24gKHJvdXRlLCBtYXRjaCkge1xuICAgIGlmICghcm91dGUubm90Rm91bmQgJiYgKG1hdGNoID0gcm91dGUubWF0Y2hVcmwodXJsKSkpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gISFhY3Rpb25cbn1cblxuUm91dGUucHJvdG90eXBlLm1hdGNoVXJsID0gZnVuY3Rpb24gKHVybCkge1xuICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLm1hdGNoVXJsKHVybClcbn1cblxuUm91dGUucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh1cmwsIG1hdGNoKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgcGFyYW1zID0gdGhpcy5kZWZpbml0aW9uLnBhcmFtcyh1cmwsIG1hdGNoKVxuXG4gIGlmICh0aGlzLnJlZGlyZWN0KSB7XG4gICAgdmFyIHJlZGlyZWN0VXJsID0gdGhpcy5yZWRpcmVjdChwYXJhbXMpXG4gICAgaWYgKHJlZGlyZWN0VXJsKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZWRpcmVjdDogcmVkaXJlY3RVcmxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAodGhpcy5iaW5kaW5ncykge1xuICAgIE9iamVjdC5rZXlzKHRoaXMuYmluZGluZ3MpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgdmFyIGJpbmRpbmcgPSBzZWxmLmJpbmRpbmdzW2tleV1cblxuICAgICAgaWYgKGJpbmRpbmcgJiYgYmluZGluZy5zZXQpIHtcbiAgICAgICAgcmVmcmVzaEFmdGVyKGJpbmRpbmcuc2V0KHBhcmFtc1trZXldKSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKHRoaXMub25sb2FkKSB7XG4gICAgcmVmcmVzaEFmdGVyKHNlbGYub25sb2FkKHBhcmFtcykpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlbmRlcjogdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICB9XG59XG5cblJvdXRlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAodXJsKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGlmICh0aGlzLmJpbmRpbmdzKSB7XG4gICAgdmFyIHBhcmFtcyA9IHt9XG4gICAgT2JqZWN0LmtleXModGhpcy5iaW5kaW5ncykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgYmluZGluZyA9IHNlbGYuYmluZGluZ3Nba2V5XVxuXG4gICAgICBpZiAoYmluZGluZyAmJiBiaW5kaW5nLmdldCkge1xuICAgICAgICBwYXJhbXNba2V5XSA9IGJpbmRpbmcuZ2V0KClcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdmFyIG9sZFBhcmFtcyA9IHRoaXMuZGVmaW5pdGlvbi5wYXJhbXModXJsKVxuICAgIHZhciBuZXdVcmwgPSB0aGlzLmRlZmluaXRpb24udXJsKGV4dGVuZChleHRlbmQoe30sIG9sZFBhcmFtcyksIHBhcmFtcykpXG4gICAgdmFyIG5ld1BhcmFtcyA9IHRoaXMuZGVmaW5pdGlvbi5wYXJhbXMobmV3VXJsKVxuICAgIHZhciBwdXNoID0gdGhpcy5wdXNoKG9sZFBhcmFtcywgbmV3UGFyYW1zKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IG5ld1VybCxcbiAgICBwdXNoOiBwdXNoLFxuICAgIHJlbmRlcjogdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICB9XG59XG5cbmZ1bmN0aW9uIGV4dGVuZCAoYSwgYikge1xuICBpZiAoYikge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYilcblxuICAgIGZvciAodmFyIGsgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGsgPCBsOyBrKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2tdXG4gICAgICBhW2tleV0gPSBiW2tleV1cbiAgICB9XG5cbiAgICByZXR1cm4gYVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsb25lICh0aGluZykge1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGluZykpXG59XG5cbmZ1bmN0aW9uIHBhcmFtVG9TdHJpbmcgKHApIHtcbiAgaWYgKHAgPT09IHVuZGVmaW5lZCB8fCBwID09PSBudWxsKSB7XG4gICAgcmV0dXJuICcnXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHBcbiAgfVxufVxuXG5mdW5jdGlvbiBlc2NhcGVSZWdleCAocGF0dGVybikge1xuICByZXR1cm4gcGF0dGVybi5yZXBsYWNlKC9bLS9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCAnXFxcXCQmJylcbn1cblxuZnVuY3Rpb24gY29tcGlsZVBhdHRlcm4gKHBhdHRlcm4pIHtcbiAgdmFyIGFueVJlZ2V4ID0gL1xcXFxcXCovaWdcbiAgdmFyIHNwbGF0VmFyaWFibGVSZWdleCA9IC86W2EtelxcLV9dK1xcXFxcXCovaWdcbiAgdmFyIHZhcmlhYmxlUmVnZXggPSAvOlstYS16X10rL2lnXG5cbiAgcmV0dXJuIGVzY2FwZVJlZ2V4KHBhdHRlcm4pXG4gICAgLnJlcGxhY2Uoc3BsYXRWYXJpYWJsZVJlZ2V4LCAnKC4rKScpXG4gICAgLnJlcGxhY2UoYW55UmVnZXgsICcuKicpXG4gICAgLnJlcGxhY2UodmFyaWFibGVSZWdleCwgJyhbXi9dKyknKVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlUGF0dGVybiAocGF0dGVybikge1xuICB2YXIgbWF0Y2hcbiAgdmFyIHZhcmlhYmxlUmVnZXggPSBuZXcgUmVnRXhwKCc6KFstYS16X10rKScsICdpZycpXG4gIHZhciB2YXJpYWJsZXMgPSBbXVxuXG4gIHdoaWxlICgobWF0Y2ggPSB2YXJpYWJsZVJlZ2V4LmV4ZWMocGF0dGVybikpKSB7XG4gICAgdmFyaWFibGVzLnB1c2gobWF0Y2hbMV0pXG4gIH1cblxuICB2YXIgY29tcGlsZWRQYXR0ZXJuID0gY29tcGlsZVBhdHRlcm4ocGF0dGVybilcblxuICByZXR1cm4ge1xuICAgIHBhdHRlcm46IHBhdHRlcm4sXG4gICAgcmVnZXg6IG5ldyBSZWdFeHAoJ14nICsgY29tcGlsZWRQYXR0ZXJuICsgJyQnKSxcbiAgICB2YXJpYWJsZXM6IHZhcmlhYmxlc1xuICB9XG59XG5cbmZ1bmN0aW9uIFF1ZXJ5U3RyaW5nICgpIHtcbn1cblxuUXVlcnlTdHJpbmcucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHNlYXJjaCkge1xuICB2YXIgcGFyYW1zID0ge31cblxuICBpZiAoc2VhcmNoKSB7XG4gICAgc2VhcmNoLnNwbGl0KCcmJykubWFwKGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgdmFyIHYgPSBwYXJhbS5zcGxpdCgnPScpLm1hcChkZWNvZGVVUklDb21wb25lbnQpXG4gICAgICBwYXJhbXNbdlswXV0gPSB2WzFdXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBwYXJhbXNcbn1cblxuUXVlcnlTdHJpbmcucHJvdG90eXBlLnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChwYXJhbXNPYmplY3QpIHtcbiAgdmFyIHF1ZXJ5ID0gT2JqZWN0LmtleXMocGFyYW1zT2JqZWN0KS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciBwYXJhbSA9IHBhcmFtVG9TdHJpbmcocGFyYW1zT2JqZWN0W2tleV0pXG5cbiAgICBpZiAocGFyYW0gIT09ICcnKSB7XG4gICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQocGFyYW0pXG4gICAgfVxuICB9KS5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgcmV0dXJuIHBhcmFtXG4gIH0pLmpvaW4oJyYnKVxuXG4gIHJldHVybiBxdWVyeVxufVxuXG52YXIgUHVzaFN0YXRlID0gZnVuY3Rpb24gKCkge1xufVxuXG5QdXNoU3RhdGUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKG1vZGVsKSB7XG4gIGlmICh0aGlzLnN0YXJ0ZWQpIHtcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLnN0YXJ0ZWQgPSB0cnVlXG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAobW9kZWwpIHtcbiAgICAgIG1vZGVsLnJlZnJlc2hJbW1lZGlhdGVseSgpXG5cbiAgICAgIC8vIGhhY2shXG4gICAgICAvLyBDaHJvbWUgNTYuMC4yOTI0Ljg3ICg2NC1iaXQpXG4gICAgICAvLyBleHBsYW5hdGlvbjpcbiAgICAgIC8vIHdoZW4geW91IG1vdmUgYmFjayBhbmQgZm9yd2FyZCBpbiBoaXN0b3J5IHRoZSBicm93c2VyIHdpbGwgcmVtZW1iZXIgdGhlIHNjcm9sbFxuICAgICAgLy8gcG9zaXRpb25zIGF0IGVhY2ggVVJMIGFuZCB0aGVuIHJlc3RvcmUgdGhvc2Ugc2Nyb2xsIHBvc2l0aW9ucyB3aGVuIHlvdSBjb21lXG4gICAgICAvLyBiYWNrIHRvIHRoYXQgVVJMLCBqdXN0IGxpa2UgaW4gbm9ybWFsIG5hdmlnYXRpb25cbiAgICAgIC8vIEhvd2V2ZXIsIHRoZSB0cmljayBpcyB0byByZWZyZXNoIHRoZSBwYWdlIHNvIHRoYXQgaXQgaGFzIHRoZSBjb3JyZWN0IGhlaWdodFxuICAgICAgLy8gYmVmb3JlIHRoYXQgc2Nyb2xsIHRha2VzIHBsYWNlLCB3aGljaCBpcyB3aGF0IHdlIGRvIHdpdGggbW9kZWwucmVmcmVzaEltbWVkaWF0ZWx5KClcbiAgICAgIC8vIGFsc28sIGl0IHNlZW1zIHRoYXQgaXRzIG5lY2Vzc2FyeSB0byBjYWxsIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IHRvIGZvcmNlIGl0XG4gICAgICAvLyB0byBsYXlvdXQgdGhlIHBhZ2UgYmVmb3JlIGF0dGVtcHRpbmcgc2V0IHRoZSBzY3JvbGwgcG9zaXRpb25cbiAgICAgIGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLWV4cHJlc3Npb25zXG4gICAgfVxuICB9KVxufVxuXG5QdXNoU3RhdGUucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuc3RhcnRlZCA9IGZhbHNlXG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb3BzdGF0ZScsIHRoaXMubGlzdGVuZXIpXG59XG5cblB1c2hTdGF0ZS5wcm90b3R5cGUudXJsID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaFxufVxuXG5QdXNoU3RhdGUucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAodXJsKSB7XG4gIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdXJsKVxufVxuXG5QdXNoU3RhdGUucHJvdG90eXBlLnN0YXRlID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShzdGF0ZSlcbn1cblxuUHVzaFN0YXRlLnByb3RvdHlwZS5yZXBsYWNlID0gZnVuY3Rpb24gKHVybCkge1xuICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVybClcbn1cblxuZnVuY3Rpb24gSGFzaCAoKSB7XG59XG5cbkhhc2gucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKG1vZGVsKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuICBpZiAodGhpcy5zdGFydGVkKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdGhpcy5zdGFydGVkID0gdHJ1ZVxuXG4gIHRoaXMuaGFzaGNoYW5nZUxpc3RlbmVyID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChzZWxmLnN0YXJ0ZWQpIHtcbiAgICAgIGlmICghc2VsZi5wdXNoZWQpIHtcbiAgICAgICAgaWYgKG1vZGVsKSB7XG4gICAgICAgICAgbW9kZWwucmVmcmVzaEltbWVkaWF0ZWx5KClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZi5wdXNoZWQgPSBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgfVxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRoaXMuaGFzaGNoYW5nZUxpc3RlbmVyKVxufVxuXG5IYXNoLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZVxuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIHRoaXMuaGFzaGNoYW5nZUxpc3RlbmVyKVxufVxuXG5IYXNoLnByb3RvdHlwZS51cmwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLmhhc2ggfHwgJyMnXG5cbiAgdmFyIG0gPSAvXiMoLio/KShcXD8uKik/JC8uZXhlYyhwYXRoKVxuICB2YXIgcGF0aG5hbWUgPSBtWzFdXG4gIHZhciBzZWFyY2ggPSBtWzJdXG5cbiAgcmV0dXJuICcvJyArIHBhdGhuYW1lICsgKHNlYXJjaCB8fCAnJylcbn1cblxuSGFzaC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgdGhpcy5wdXNoZWQgPSB0cnVlXG4gIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gdXJsLnJlcGxhY2UoL15cXC8vLCAnJylcbn1cblxuSGFzaC5wcm90b3R5cGUuc3RhdGUgPSBmdW5jdGlvbiAoKSB7XG59XG5cbkhhc2gucHJvdG90eXBlLnJlcGxhY2UgPSBmdW5jdGlvbiAodXJsKSB7XG4gIHJldHVybiB0aGlzLnB1c2godXJsKVxufVxuXG5mdW5jdGlvbiBIcmVmQXR0cmlidXRlIChyb3V0ZURlZmluaXRpb24sIHBhcmFtcywgb3B0aW9ucykge1xuICB0aGlzLmhyZWYgPSByb3V0ZURlZmluaXRpb24udXJsKHBhcmFtcylcbiAgdGhpcy5vbmNsaWNrID0gcmVmcmVzaGlmeShmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50Lm1ldGFLZXkpIHtcbiAgICAgIHJvdXRlRGVmaW5pdGlvbi5wdXNoKHBhcmFtcywgb3B0aW9ucylcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICB9XG4gIH0pXG59XG5cbkhyZWZBdHRyaWJ1dGUucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICBlbGVtZW50LmhyZWYgPSB0aGlzLmhyZWZcbiAgZWxlbWVudC5vbmNsaWNrID0gdGhpcy5vbmNsaWNrXG59XG5cbkhyZWZBdHRyaWJ1dGUucHJvdG90eXBlLnVuaG9vayA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gIGVsZW1lbnQub25jbGljayA9IG51bGxcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gbmV3IFJvdXRlcigpXG5cbmV4cG9ydHMuaGFzaCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBIYXNoKClcbn1cblxuZXhwb3J0cy5wdXNoU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgUHVzaFN0YXRlKClcbn1cblxuZXhwb3J0cy5xdWVyeXN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIG5ldyBRdWVyeVN0cmluZygpXG59XG5cbmV4cG9ydHMucm91dGVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBSb3V0ZXIob3B0aW9ucylcbn1cbiIsImlmICh0eXBlb2YgU2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gU2V0XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLml0ZW1zID0gW11cbiAgfVxuXG4gIG1vZHVsZS5leHBvcnRzLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAod2lkZ2V0KSB7XG4gICAgaWYgKHRoaXMuaXRlbXMuaW5kZXhPZih3aWRnZXQpID09PSAtMSkge1xuICAgICAgdGhpcy5pdGVtcy5wdXNoKHdpZGdldClcbiAgICB9XG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cy5wcm90b3R5cGUuZGVsZXRlID0gZnVuY3Rpb24gKHdpZGdldCkge1xuICAgIHZhciBpID0gdGhpcy5pdGVtcy5pbmRleE9mKHdpZGdldClcbiAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgIHRoaXMuaXRlbXMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZm4pIHtcbiAgICBmb3IgKHZhciBuID0gMDsgbiA8IHRoaXMuaXRlbXMubGVuZ3RoOyBuKyspIHtcbiAgICAgIGZuKHRoaXMuaXRlbXNbbl0pXG4gICAgfVxuICB9XG59XG4iLCJmdW5jdGlvbiBTaW1wbGVQcm9taXNlICgpIHtcbiAgdGhpcy5saXN0ZW5lcnMgPSBbXVxufVxuXG5TaW1wbGVQcm9taXNlLnByb3RvdHlwZS5mdWxmaWxsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGlmICghdGhpcy5pc0Z1bGZpbGxlZCkge1xuICAgIHRoaXMuaXNGdWxmaWxsZWQgPSB0cnVlXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlXG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgIGxpc3RlbmVyKClcbiAgICB9KVxuICB9XG59XG5cblNpbXBsZVByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAoc3VjY2Vzcykge1xuICBpZiAodGhpcy5pc0Z1bGZpbGxlZCkge1xuICAgIHN1Y2Nlc3ModGhpcy52YWx1ZSlcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHN1Y2Nlc3MpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBuZXcgU2ltcGxlUHJvbWlzZSgpXG59XG4iLCJ2YXIgVnRleHQgPSByZXF1aXJlKCd2aXJ0dWFsLWRvbS92bm9kZS92dGV4dC5qcycpXG52YXIgaXNWZG9tID0gcmVxdWlyZSgnLi9pc1Zkb20nKVxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50JylcblxuZnVuY3Rpb24gdG9WZG9tIChvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PT0gdW5kZWZpbmVkIHx8IG9iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgVnRleHQoJycpXG4gIH0gZWxzZSBpZiAodHlwZW9mIChvYmplY3QpICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBuZXcgVnRleHQoU3RyaW5nKG9iamVjdCkpXG4gIH0gZWxzZSBpZiAob2JqZWN0IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgIHJldHVybiBuZXcgVnRleHQoU3RyaW5nKG9iamVjdCkpXG4gIH0gZWxzZSBpZiAob2JqZWN0IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICByZXR1cm4gbmV3IFZ0ZXh0KG9iamVjdC50b1N0cmluZygpKVxuICB9IGVsc2UgaWYgKGlzVmRvbShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG9iamVjdFxuICB9IGVsc2UgaWYgKHR5cGVvZiBvYmplY3QucmVuZGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wb25lbnQob2JqZWN0KVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVnRleHQoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvVmRvbVxuXG5mdW5jdGlvbiBhZGRDaGlsZCAoY2hpbGRyZW4sIGNoaWxkKSB7XG4gIGlmIChjaGlsZCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgZm9yICh2YXIgbiA9IDA7IG4gPCBjaGlsZC5sZW5ndGg7IG4rKykge1xuICAgICAgYWRkQ2hpbGQoY2hpbGRyZW4sIGNoaWxkW25dKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjaGlsZHJlbi5wdXNoKHRvVmRvbShjaGlsZCkpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMucmVjdXJzaXZlID0gZnVuY3Rpb24gKGNoaWxkKSB7XG4gIHZhciBjaGlsZHJlbiA9IFtdXG4gIGFkZENoaWxkKGNoaWxkcmVuLCBjaGlsZClcbiAgcmV0dXJuIGNoaWxkcmVuXG59XG4iLCIndXNlIHN0cmljdCdcblxudmFyIFZOb2RlID0gcmVxdWlyZSgndmlydHVhbC1kb20vdm5vZGUvdm5vZGUuanMnKVxudmFyIGlzSG9vayA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3Zub2RlL2lzLXZob29rJylcbnZhciB4bWwgPSByZXF1aXJlKCcuL3htbCcpXG5cbnZhciBzb2Z0U2V0SG9vayA9IHJlcXVpcmUoJ3ZpcnR1YWwtZG9tL3ZpcnR1YWwtaHlwZXJzY3JpcHQvaG9va3Mvc29mdC1zZXQtaG9vay5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gaFxuXG5mdW5jdGlvbiBoICh0YWdOYW1lLCBwcm9wcywgY2hpbGRyZW4pIHtcbiAgdmFyIHRhZyA9IHRhZ05hbWVcblxuICAvLyBzdXBwb3J0IGtleXNcbiAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KCdrZXknKSkge1xuICAgIHZhciBrZXkgPSBwcm9wcy5rZXlcbiAgICBwcm9wcy5rZXkgPSB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIHN1cHBvcnQgbmFtZXNwYWNlXG4gIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eSgnbmFtZXNwYWNlJykpIHtcbiAgICB2YXIgbmFtZXNwYWNlID0gcHJvcHMubmFtZXNwYWNlXG4gICAgcHJvcHMubmFtZXNwYWNlID0gdW5kZWZpbmVkXG4gIH1cblxuICAvLyBmaXggY3Vyc29yIGJ1Z1xuICBpZiAodGFnLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcgJiZcbiAgICAhbmFtZXNwYWNlICYmXG4gICAgcHJvcHMuaGFzT3duUHJvcGVydHkoJ3ZhbHVlJykgJiZcbiAgICBwcm9wcy52YWx1ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgIWlzSG9vayhwcm9wcy52YWx1ZSlcbiAgKSB7XG4gICAgcHJvcHMudmFsdWUgPSBzb2Z0U2V0SG9vayhwcm9wcy52YWx1ZSlcbiAgfVxuXG4gIHZhciB2bm9kZSA9IG5ldyBWTm9kZSh0YWcsIHByb3BzLCBjaGlsZHJlbiwga2V5LCBuYW1lc3BhY2UpXG5cbiAgaWYgKHByb3BzLnhtbG5zKSB7XG4gICAgeG1sLnRyYW5zZm9ybSh2bm9kZSlcbiAgfVxuXG4gIHJldHVybiB2bm9kZVxufVxuIiwidmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4vY29tcG9uZW50JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobW9kZWwpIHtcbiAgcmV0dXJuIG5ldyBDb21wb25lbnQobW9kZWwsIHt2aWV3Q29tcG9uZW50OiB0cnVlfSlcbn1cbiIsInZhciBBdHRyaWJ1dGVIb29rID0gcmVxdWlyZSgndmlydHVhbC1kb20vdmlydHVhbC1oeXBlcnNjcmlwdC9ob29rcy9hdHRyaWJ1dGUtaG9vaycpXG5cbnZhciBuYW1lc3BhY2VSZWdleCA9IC9eKFthLXowLTlfLV0rKSgtLXw6KShbYS16MC05Xy1dKykkL2lcbnZhciB4bWxuc1JlZ2V4ID0gL154bWxucygtLXw6KShbYS16MC05Xy1dKykkL2lcbnZhciBTVkdfTkFNRVNQQUNFID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ1xuXG5mdW5jdGlvbiB0cmFuc2Zvcm1UYW5OYW1lICh2bm9kZSwgbmFtZXNwYWNlcykge1xuICB2YXIgdGFnTmFtZXNwYWNlID0gbmFtZXNwYWNlUmVnZXguZXhlYyh2bm9kZS50YWdOYW1lKVxuICBpZiAodGFnTmFtZXNwYWNlKSB7XG4gICAgdmFyIG5hbWVzcGFjZUtleSA9IHRhZ05hbWVzcGFjZVsxXVxuICAgIHZhciBuYW1lc3BhY2UgPSBuYW1lc3BhY2VzW25hbWVzcGFjZUtleV1cbiAgICBpZiAobmFtZXNwYWNlKSB7XG4gICAgICB2bm9kZS50YWdOYW1lID0gdGFnTmFtZXNwYWNlWzFdICsgJzonICsgdGFnTmFtZXNwYWNlWzNdXG4gICAgICB2bm9kZS5uYW1lc3BhY2UgPSBuYW1lc3BhY2VcbiAgICB9XG4gIH0gZWxzZSBpZiAoIXZub2RlLm5hbWVzcGFjZSkge1xuICAgIHZub2RlLm5hbWVzcGFjZSA9IG5hbWVzcGFjZXNbJyddXG4gIH1cbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtUHJvcGVydGllcyAodm5vZGUsIG5hbWVzcGFjZXMpIHtcbiAgdmFyIHByb3BlcnRpZXMgPSB2bm9kZS5wcm9wZXJ0aWVzXG5cbiAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHByb3BlcnRpZXMuYXR0cmlidXRlcyB8fCAocHJvcGVydGllcy5hdHRyaWJ1dGVzID0ge30pXG5cbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnRpZXMpXG4gICAgZm9yICh2YXIgayA9IDAsIGwgPSBrZXlzLmxlbmd0aDsgayA8IGw7IGsrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNba11cbiAgICAgIGlmIChrZXkgIT09ICdzdHlsZScgJiYga2V5ICE9PSAnYXR0cmlidXRlcycpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gbmFtZXNwYWNlUmVnZXguZXhlYyhrZXkpXG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHByb3BlcnRpZXNbbWF0Y2hbMV0gKyAnOicgKyBtYXRjaFszXV0gPSBuZXcgQXR0cmlidXRlSG9vayhuYW1lc3BhY2VzW21hdGNoWzFdXSwgcHJvcGVydGllc1trZXldKVxuICAgICAgICAgIGRlbGV0ZSBwcm9wZXJ0aWVzW2tleV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodm5vZGUubmFtZXNwYWNlID09PSBTVkdfTkFNRVNQQUNFICYmIGtleSA9PT0gJ2NsYXNzTmFtZScpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXNbJ2NsYXNzJ10gPSBwcm9wZXJ0aWVzLmNsYXNzTmFtZVxuICAgICAgICAgICAgZGVsZXRlIHByb3BlcnRpZXMuY2xhc3NOYW1lXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwcm9wZXJ0eSA9IHByb3BlcnRpZXNba2V5XVxuICAgICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcHJvcGVydHlcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyB8fCB0eXBlID09PSAnbnVtYmVyJyB8fCB0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgYXR0cmlidXRlc1trZXldID0gcHJvcGVydHlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVjbGFyZWROYW1lc3BhY2VzICh2bm9kZSkge1xuICB2YXIgbmFtZXNwYWNlcyA9IHtcbiAgICAnJzogdm5vZGUucHJvcGVydGllcy54bWxucyxcbiAgICB4bWxuczogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvJ1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2bm9kZS5wcm9wZXJ0aWVzKVxuXG4gIGZvciAodmFyIGsgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGsgPCBsOyBrKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1trXVxuICAgIHZhciB2YWx1ZSA9IHZub2RlLnByb3BlcnRpZXNba2V5XVxuXG4gICAgaWYgKGtleSA9PT0gJ3htbG5zJykge1xuICAgICAgbmFtZXNwYWNlc1snJ10gPSB2YWx1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbWF0Y2ggPSB4bWxuc1JlZ2V4LmV4ZWMoa2V5KVxuXG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgbmFtZXNwYWNlc1ttYXRjaFsyXV0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lc3BhY2VzXG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybSAodm5vZGUpIHtcbiAgdmFyIG5hbWVzcGFjZXMgPSBkZWNsYXJlZE5hbWVzcGFjZXModm5vZGUpXG5cbiAgZnVuY3Rpb24gdHJhbnNmb3JtQ2hpbGRyZW4gKHZub2RlLCBuYW1lc3BhY2VzKSB7XG4gICAgdHJhbnNmb3JtVGFuTmFtZSh2bm9kZSwgbmFtZXNwYWNlcylcbiAgICB0cmFuc2Zvcm1Qcm9wZXJ0aWVzKHZub2RlLCBuYW1lc3BhY2VzKVxuXG4gICAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKHZhciBjID0gMCwgbCA9IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSB2bm9kZS5jaGlsZHJlbltjXVxuICAgICAgICBpZiAoIShjaGlsZC5wcm9wZXJ0aWVzICYmIGNoaWxkLnByb3BlcnRpZXMueG1sbnMpKSB7XG4gICAgICAgICAgdHJhbnNmb3JtQ2hpbGRyZW4oY2hpbGQsIG5hbWVzcGFjZXMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0cmFuc2Zvcm1DaGlsZHJlbih2bm9kZSwgbmFtZXNwYWNlcylcblxuICByZXR1cm4gdm5vZGVcbn1cblxubW9kdWxlLmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsIid1c2Ugc3RyaWN0JztcbnZhciBNdXRhdGlvbiA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xuXG52YXIgc2NoZWR1bGVEcmFpbjtcblxue1xuICBpZiAoTXV0YXRpb24pIHtcbiAgICB2YXIgY2FsbGVkID0gMDtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb24obmV4dFRpY2spO1xuICAgIHZhciBlbGVtZW50ID0gZ2xvYmFsLmRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQsIHtcbiAgICAgIGNoYXJhY3RlckRhdGE6IHRydWVcbiAgICB9KTtcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuICAgICAgZWxlbWVudC5kYXRhID0gKGNhbGxlZCA9ICsrY2FsbGVkICUgMik7XG4gICAgfTtcbiAgfSBlbHNlIGlmICghZ2xvYmFsLnNldEltbWVkaWF0ZSAmJiB0eXBlb2YgZ2xvYmFsLk1lc3NhZ2VDaGFubmVsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBjaGFubmVsID0gbmV3IGdsb2JhbC5NZXNzYWdlQ2hhbm5lbCgpO1xuICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbmV4dFRpY2s7XG4gICAgc2NoZWR1bGVEcmFpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgnZG9jdW1lbnQnIGluIGdsb2JhbCAmJiAnb25yZWFkeXN0YXRlY2hhbmdlJyBpbiBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JykpIHtcbiAgICBzY2hlZHVsZURyYWluID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBDcmVhdGUgYSA8c2NyaXB0PiBlbGVtZW50OyBpdHMgcmVhZHlzdGF0ZWNoYW5nZSBldmVudCB3aWxsIGJlIGZpcmVkIGFzeW5jaHJvbm91c2x5IG9uY2UgaXQgaXMgaW5zZXJ0ZWRcbiAgICAgIC8vIGludG8gdGhlIGRvY3VtZW50LiBEbyBzbywgdGh1cyBxdWV1aW5nIHVwIHRoZSB0YXNrLiBSZW1lbWJlciB0byBjbGVhbiB1cCBvbmNlIGl0J3MgYmVlbiBjYWxsZWQuXG4gICAgICB2YXIgc2NyaXB0RWwgPSBnbG9iYWwuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gICAgICBzY3JpcHRFbC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5leHRUaWNrKCk7XG5cbiAgICAgICAgc2NyaXB0RWwub25yZWFkeXN0YXRlY2hhbmdlID0gbnVsbDtcbiAgICAgICAgc2NyaXB0RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHRFbCk7XG4gICAgICAgIHNjcmlwdEVsID0gbnVsbDtcbiAgICAgIH07XG4gICAgICBnbG9iYWwuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHNjcmlwdEVsKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHNjaGVkdWxlRHJhaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KG5leHRUaWNrLCAwKTtcbiAgICB9O1xuICB9XG59XG5cbnZhciBkcmFpbmluZztcbnZhciBxdWV1ZSA9IFtdO1xuLy9uYW1lZCBuZXh0VGljayBmb3IgbGVzcyBjb25mdXNpbmcgc3RhY2sgdHJhY2VzXG5mdW5jdGlvbiBuZXh0VGljaygpIHtcbiAgZHJhaW5pbmcgPSB0cnVlO1xuICB2YXIgaSwgb2xkUXVldWU7XG4gIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gIHdoaWxlIChsZW4pIHtcbiAgICBvbGRRdWV1ZSA9IHF1ZXVlO1xuICAgIHF1ZXVlID0gW107XG4gICAgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgIG9sZFF1ZXVlW2ldKCk7XG4gICAgfVxuICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgfVxuICBkcmFpbmluZyA9IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGltbWVkaWF0ZTtcbmZ1bmN0aW9uIGltbWVkaWF0ZSh0YXNrKSB7XG4gIGlmIChxdWV1ZS5wdXNoKHRhc2spID09PSAxICYmICFkcmFpbmluZykge1xuICAgIHNjaGVkdWxlRHJhaW4oKTtcbiAgfVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNPYmplY3QoeCkge1xuXHRyZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgJiYgeCAhPT0gbnVsbDtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBpbW1lZGlhdGUgPSByZXF1aXJlKCdpbW1lZGlhdGUnKTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmZ1bmN0aW9uIElOVEVSTkFMKCkge31cblxudmFyIGhhbmRsZXJzID0ge307XG5cbnZhciBSRUpFQ1RFRCA9IFsnUkVKRUNURUQnXTtcbnZhciBGVUxGSUxMRUQgPSBbJ0ZVTEZJTExFRCddO1xudmFyIFBFTkRJTkcgPSBbJ1BFTkRJTkcnXTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUHJvbWlzZTtcblxuZnVuY3Rpb24gUHJvbWlzZShyZXNvbHZlcikge1xuICBpZiAodHlwZW9mIHJlc29sdmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVzb2x2ZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gIH1cbiAgdGhpcy5zdGF0ZSA9IFBFTkRJTkc7XG4gIHRoaXMucXVldWUgPSBbXTtcbiAgdGhpcy5vdXRjb21lID0gdm9pZCAwO1xuICBpZiAocmVzb2x2ZXIgIT09IElOVEVSTkFMKSB7XG4gICAgc2FmZWx5UmVzb2x2ZVRoZW5hYmxlKHRoaXMsIHJlc29sdmVyKTtcbiAgfVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZVtcImNhdGNoXCJdID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbn07XG5Qcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgIT09ICdmdW5jdGlvbicgJiYgdGhpcy5zdGF0ZSA9PT0gRlVMRklMTEVEIHx8XG4gICAgdHlwZW9mIG9uUmVqZWN0ZWQgIT09ICdmdW5jdGlvbicgJiYgdGhpcy5zdGF0ZSA9PT0gUkVKRUNURUQpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKElOVEVSTkFMKTtcbiAgaWYgKHRoaXMuc3RhdGUgIT09IFBFTkRJTkcpIHtcbiAgICB2YXIgcmVzb2x2ZXIgPSB0aGlzLnN0YXRlID09PSBGVUxGSUxMRUQgPyBvbkZ1bGZpbGxlZCA6IG9uUmVqZWN0ZWQ7XG4gICAgdW53cmFwKHByb21pc2UsIHJlc29sdmVyLCB0aGlzLm91dGNvbWUpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMucXVldWUucHVzaChuZXcgUXVldWVJdGVtKHByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSk7XG4gIH1cblxuICByZXR1cm4gcHJvbWlzZTtcbn07XG5mdW5jdGlvbiBRdWV1ZUl0ZW0ocHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgdGhpcy5wcm9taXNlID0gcHJvbWlzZTtcbiAgaWYgKHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSBvbkZ1bGZpbGxlZDtcbiAgICB0aGlzLmNhbGxGdWxmaWxsZWQgPSB0aGlzLm90aGVyQ2FsbEZ1bGZpbGxlZDtcbiAgfVxuICBpZiAodHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLm9uUmVqZWN0ZWQgPSBvblJlamVjdGVkO1xuICAgIHRoaXMuY2FsbFJlamVjdGVkID0gdGhpcy5vdGhlckNhbGxSZWplY3RlZDtcbiAgfVxufVxuUXVldWVJdGVtLnByb3RvdHlwZS5jYWxsRnVsZmlsbGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGhhbmRsZXJzLnJlc29sdmUodGhpcy5wcm9taXNlLCB2YWx1ZSk7XG59O1xuUXVldWVJdGVtLnByb3RvdHlwZS5vdGhlckNhbGxGdWxmaWxsZWQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdW53cmFwKHRoaXMucHJvbWlzZSwgdGhpcy5vbkZ1bGZpbGxlZCwgdmFsdWUpO1xufTtcblF1ZXVlSXRlbS5wcm90b3R5cGUuY2FsbFJlamVjdGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIGhhbmRsZXJzLnJlamVjdCh0aGlzLnByb21pc2UsIHZhbHVlKTtcbn07XG5RdWV1ZUl0ZW0ucHJvdG90eXBlLm90aGVyQ2FsbFJlamVjdGVkID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHVud3JhcCh0aGlzLnByb21pc2UsIHRoaXMub25SZWplY3RlZCwgdmFsdWUpO1xufTtcblxuZnVuY3Rpb24gdW53cmFwKHByb21pc2UsIGZ1bmMsIHZhbHVlKSB7XG4gIGltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJldHVyblZhbHVlO1xuICAgIHRyeSB7XG4gICAgICByZXR1cm5WYWx1ZSA9IGZ1bmModmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBoYW5kbGVycy5yZWplY3QocHJvbWlzZSwgZSk7XG4gICAgfVxuICAgIGlmIChyZXR1cm5WYWx1ZSA9PT0gcHJvbWlzZSkge1xuICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCByZXNvbHZlIHByb21pc2Ugd2l0aCBpdHNlbGYnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbmRsZXJzLnJlc29sdmUocHJvbWlzZSwgcmV0dXJuVmFsdWUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmhhbmRsZXJzLnJlc29sdmUgPSBmdW5jdGlvbiAoc2VsZiwgdmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IHRyeUNhdGNoKGdldFRoZW4sIHZhbHVlKTtcbiAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICByZXR1cm4gaGFuZGxlcnMucmVqZWN0KHNlbGYsIHJlc3VsdC52YWx1ZSk7XG4gIH1cbiAgdmFyIHRoZW5hYmxlID0gcmVzdWx0LnZhbHVlO1xuXG4gIGlmICh0aGVuYWJsZSkge1xuICAgIHNhZmVseVJlc29sdmVUaGVuYWJsZShzZWxmLCB0aGVuYWJsZSk7XG4gIH0gZWxzZSB7XG4gICAgc2VsZi5zdGF0ZSA9IEZVTEZJTExFRDtcbiAgICBzZWxmLm91dGNvbWUgPSB2YWx1ZTtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHZhciBsZW4gPSBzZWxmLnF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICBzZWxmLnF1ZXVlW2ldLmNhbGxGdWxmaWxsZWQodmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VsZjtcbn07XG5oYW5kbGVycy5yZWplY3QgPSBmdW5jdGlvbiAoc2VsZiwgZXJyb3IpIHtcbiAgc2VsZi5zdGF0ZSA9IFJFSkVDVEVEO1xuICBzZWxmLm91dGNvbWUgPSBlcnJvcjtcbiAgdmFyIGkgPSAtMTtcbiAgdmFyIGxlbiA9IHNlbGYucXVldWUubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgc2VsZi5xdWV1ZVtpXS5jYWxsUmVqZWN0ZWQoZXJyb3IpO1xuICB9XG4gIHJldHVybiBzZWxmO1xufTtcblxuZnVuY3Rpb24gZ2V0VGhlbihvYmopIHtcbiAgLy8gTWFrZSBzdXJlIHdlIG9ubHkgYWNjZXNzIHRoZSBhY2Nlc3NvciBvbmNlIGFzIHJlcXVpcmVkIGJ5IHRoZSBzcGVjXG4gIHZhciB0aGVuID0gb2JqICYmIG9iai50aGVuO1xuICBpZiAob2JqICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGFwcHlUaGVuKCkge1xuICAgICAgdGhlbi5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzYWZlbHlSZXNvbHZlVGhlbmFibGUoc2VsZiwgdGhlbmFibGUpIHtcbiAgLy8gRWl0aGVyIGZ1bGZpbGwsIHJlamVjdCBvciByZWplY3Qgd2l0aCBlcnJvclxuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIG9uRXJyb3IodmFsdWUpIHtcbiAgICBpZiAoY2FsbGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNhbGxlZCA9IHRydWU7XG4gICAgaGFuZGxlcnMucmVqZWN0KHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU3VjY2Vzcyh2YWx1ZSkge1xuICAgIGlmIChjYWxsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2FsbGVkID0gdHJ1ZTtcbiAgICBoYW5kbGVycy5yZXNvbHZlKHNlbGYsIHZhbHVlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeVRvVW53cmFwKCkge1xuICAgIHRoZW5hYmxlKG9uU3VjY2Vzcywgb25FcnJvcik7XG4gIH1cblxuICB2YXIgcmVzdWx0ID0gdHJ5Q2F0Y2godHJ5VG9VbndyYXApO1xuICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ2Vycm9yJykge1xuICAgIG9uRXJyb3IocmVzdWx0LnZhbHVlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cnlDYXRjaChmdW5jLCB2YWx1ZSkge1xuICB2YXIgb3V0ID0ge307XG4gIHRyeSB7XG4gICAgb3V0LnZhbHVlID0gZnVuYyh2YWx1ZSk7XG4gICAgb3V0LnN0YXR1cyA9ICdzdWNjZXNzJztcbiAgfSBjYXRjaCAoZSkge1xuICAgIG91dC5zdGF0dXMgPSAnZXJyb3InO1xuICAgIG91dC52YWx1ZSA9IGU7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0cy5yZXNvbHZlID0gcmVzb2x2ZTtcbmZ1bmN0aW9uIHJlc29sdmUodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgdGhpcykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gaGFuZGxlcnMucmVzb2x2ZShuZXcgdGhpcyhJTlRFUk5BTCksIHZhbHVlKTtcbn1cblxuZXhwb3J0cy5yZWplY3QgPSByZWplY3Q7XG5mdW5jdGlvbiByZWplY3QocmVhc29uKSB7XG4gIHZhciBwcm9taXNlID0gbmV3IHRoaXMoSU5URVJOQUwpO1xuICByZXR1cm4gaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG59XG5cbmV4cG9ydHMuYWxsID0gYWxsO1xuZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChpdGVyYWJsZSkgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICByZXR1cm4gdGhpcy5yZWplY3QobmV3IFR5cGVFcnJvcignbXVzdCBiZSBhbiBhcnJheScpKTtcbiAgfVxuXG4gIHZhciBsZW4gPSBpdGVyYWJsZS5sZW5ndGg7XG4gIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgaWYgKCFsZW4pIHtcbiAgICByZXR1cm4gdGhpcy5yZXNvbHZlKFtdKTtcbiAgfVxuXG4gIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuKTtcbiAgdmFyIHJlc29sdmVkID0gMDtcbiAgdmFyIGkgPSAtMTtcbiAgdmFyIHByb21pc2UgPSBuZXcgdGhpcyhJTlRFUk5BTCk7XG5cbiAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgIGFsbFJlc29sdmVyKGl0ZXJhYmxlW2ldLCBpKTtcbiAgfVxuICByZXR1cm4gcHJvbWlzZTtcbiAgZnVuY3Rpb24gYWxsUmVzb2x2ZXIodmFsdWUsIGkpIHtcbiAgICBzZWxmLnJlc29sdmUodmFsdWUpLnRoZW4ocmVzb2x2ZUZyb21BbGwsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmdW5jdGlvbiByZXNvbHZlRnJvbUFsbChvdXRWYWx1ZSkge1xuICAgICAgdmFsdWVzW2ldID0gb3V0VmFsdWU7XG4gICAgICBpZiAoKytyZXNvbHZlZCA9PT0gbGVuICYmICFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVzb2x2ZShwcm9taXNlLCB2YWx1ZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLnJhY2UgPSByYWNlO1xuZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoaXRlcmFibGUpICE9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgcmV0dXJuIHRoaXMucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ211c3QgYmUgYW4gYXJyYXknKSk7XG4gIH1cblxuICB2YXIgbGVuID0gaXRlcmFibGUubGVuZ3RoO1xuICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gIGlmICghbGVuKSB7XG4gICAgcmV0dXJuIHRoaXMucmVzb2x2ZShbXSk7XG4gIH1cblxuICB2YXIgaSA9IC0xO1xuICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzKElOVEVSTkFMKTtcblxuICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgcmVzb2x2ZXIoaXRlcmFibGVbaV0pO1xuICB9XG4gIHJldHVybiBwcm9taXNlO1xuICBmdW5jdGlvbiByZXNvbHZlcih2YWx1ZSkge1xuICAgIHNlbGYucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgIGlmICghY2FsbGVkKSB7XG4gICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgIGhhbmRsZXJzLnJlc29sdmUocHJvbWlzZSwgcmVzcG9uc2UpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgaWYgKCFjYWxsZWQpIHtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgaGFuZGxlcnMucmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuaWYgKHR5cGVvZiBnbG9iYWwuUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICBnbG9iYWwuUHJvbWlzZSA9IHJlcXVpcmUoJy4vbGliJyk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxpc3QsIGl0ZXJhdGVlKSB7XG4gIGlmICh0eXBlb2YgaXRlcmF0ZWUgPT0gJ3N0cmluZycpIHtcbiAgICB2YXIgZmllbGROYW1lID0gaXRlcmF0ZWU7XG4gICAgaXRlcmF0ZWUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB2YXIgaW5kZXggPSB7fTtcblxuICBmb3IodmFyIG4gPSAwOyBuIDwgbGlzdC5sZW5ndGg7IG4rKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtuXTtcbiAgICB2YXIga2V5ID0gaXRlcmF0ZWU/IGl0ZXJhdGVlKGl0ZW0pOiBpdGVtW2ZpZWxkTmFtZV07XG5cbiAgICBpbmRleFtrZXldID0gaXRlbTtcbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZSB2MS40LjEgYnkgQG1hdGhpYXMgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgKi9cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJlxuXHRcdCFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHQhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKFxuXHRcdGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8XG5cdFx0ZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLnNlbGYgPT09IGZyZWVHbG9iYWxcblx0KSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGBwdW55Y29kZWAgb2JqZWN0LlxuXHQgKiBAbmFtZSBwdW55Y29kZVxuXHQgKiBAdHlwZSBPYmplY3Rcblx0ICovXG5cdHZhciBwdW55Y29kZSxcblxuXHQvKiogSGlnaGVzdCBwb3NpdGl2ZSBzaWduZWQgMzItYml0IGZsb2F0IHZhbHVlICovXG5cdG1heEludCA9IDIxNDc0ODM2NDcsIC8vIGFrYS4gMHg3RkZGRkZGRiBvciAyXjMxLTFcblxuXHQvKiogQm9vdHN0cmluZyBwYXJhbWV0ZXJzICovXG5cdGJhc2UgPSAzNixcblx0dE1pbiA9IDEsXG5cdHRNYXggPSAyNixcblx0c2tldyA9IDM4LFxuXHRkYW1wID0gNzAwLFxuXHRpbml0aWFsQmlhcyA9IDcyLFxuXHRpbml0aWFsTiA9IDEyOCwgLy8gMHg4MFxuXHRkZWxpbWl0ZXIgPSAnLScsIC8vICdcXHgyRCdcblxuXHQvKiogUmVndWxhciBleHByZXNzaW9ucyAqL1xuXHRyZWdleFB1bnljb2RlID0gL154bi0tLyxcblx0cmVnZXhOb25BU0NJSSA9IC9bXlxceDIwLVxceDdFXS8sIC8vIHVucHJpbnRhYmxlIEFTQ0lJIGNoYXJzICsgbm9uLUFTQ0lJIGNoYXJzXG5cdHJlZ2V4U2VwYXJhdG9ycyA9IC9bXFx4MkVcXHUzMDAyXFx1RkYwRVxcdUZGNjFdL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGVycm9yc1t0eXBlXSk7XG5cdH1cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGBBcnJheSNtYXBgIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeSBhcnJheVxuXHQgKiBpdGVtLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IEEgbmV3IGFycmF5IG9mIHZhbHVlcyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXAoYXJyYXksIGZuKSB7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR2YXIgcmVzdWx0ID0gW107XG5cdFx0d2hpbGUgKGxlbmd0aC0tKSB7XG5cdFx0XHRyZXN1bHRbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEEgc2ltcGxlIGBBcnJheSNtYXBgLWxpa2Ugd3JhcHBlciB0byB3b3JrIHdpdGggZG9tYWluIG5hbWUgc3RyaW5ncyBvciBlbWFpbFxuXHQgKiBhZGRyZXNzZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBkb21haW4gVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIGZvciBldmVyeVxuXHQgKiBjaGFyYWN0ZXIuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgc3RyaW5nIG9mIGNoYXJhY3RlcnMgcmV0dXJuZWQgYnkgdGhlIGNhbGxiYWNrXG5cdCAqIGZ1bmN0aW9uLlxuXHQgKi9cblx0ZnVuY3Rpb24gbWFwRG9tYWluKHN0cmluZywgZm4pIHtcblx0XHR2YXIgcGFydHMgPSBzdHJpbmcuc3BsaXQoJ0AnKTtcblx0XHR2YXIgcmVzdWx0ID0gJyc7XG5cdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdC8vIEluIGVtYWlsIGFkZHJlc3Nlcywgb25seSB0aGUgZG9tYWluIG5hbWUgc2hvdWxkIGJlIHB1bnljb2RlZC4gTGVhdmVcblx0XHRcdC8vIHRoZSBsb2NhbCBwYXJ0IChpLmUuIGV2ZXJ5dGhpbmcgdXAgdG8gYEBgKSBpbnRhY3QuXG5cdFx0XHRyZXN1bHQgPSBwYXJ0c1swXSArICdAJztcblx0XHRcdHN0cmluZyA9IHBhcnRzWzFdO1xuXHRcdH1cblx0XHQvLyBBdm9pZCBgc3BsaXQocmVnZXgpYCBmb3IgSUU4IGNvbXBhdGliaWxpdHkuIFNlZSAjMTcuXG5cdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhTZXBhcmF0b3JzLCAnXFx4MkUnKTtcblx0XHR2YXIgbGFiZWxzID0gc3RyaW5nLnNwbGl0KCcuJyk7XG5cdFx0dmFyIGVuY29kZWQgPSBtYXAobGFiZWxzLCBmbikuam9pbignLicpO1xuXHRcdHJldHVybiByZXN1bHQgKyBlbmNvZGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgbnVtZXJpYyBjb2RlIHBvaW50cyBvZiBlYWNoIFVuaWNvZGVcblx0ICogY2hhcmFjdGVyIGluIHRoZSBzdHJpbmcuIFdoaWxlIEphdmFTY3JpcHQgdXNlcyBVQ1MtMiBpbnRlcm5hbGx5LFxuXHQgKiB0aGlzIGZ1bmN0aW9uIHdpbGwgY29udmVydCBhIHBhaXIgb2Ygc3Vycm9nYXRlIGhhbHZlcyAoZWFjaCBvZiB3aGljaFxuXHQgKiBVQ1MtMiBleHBvc2VzIGFzIHNlcGFyYXRlIGNoYXJhY3RlcnMpIGludG8gYSBzaW5nbGUgY29kZSBwb2ludCxcblx0ICogbWF0Y2hpbmcgVVRGLTE2LlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmVuY29kZWBcblx0ICogQHNlZSA8aHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmc+XG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGRlY29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nIFRoZSBVbmljb2RlIGlucHV0IHN0cmluZyAoVUNTLTIpLlxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBuZXcgYXJyYXkgb2YgY29kZSBwb2ludHMuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZGVjb2RlKHN0cmluZykge1xuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgY291bnRlciA9IDAsXG5cdFx0ICAgIGxlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG5cdFx0ICAgIHZhbHVlLFxuXHRcdCAgICBleHRyYTtcblx0XHR3aGlsZSAoY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0aWYgKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCkge1xuXHRcdFx0XHQvLyBoaWdoIHN1cnJvZ2F0ZSwgYW5kIHRoZXJlIGlzIGEgbmV4dCBjaGFyYWN0ZXJcblx0XHRcdFx0ZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO1xuXHRcdFx0XHRpZiAoKGV4dHJhICYgMHhGQzAwKSA9PSAweERDMDApIHsgLy8gbG93IHN1cnJvZ2F0ZVxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKCgodmFsdWUgJiAweDNGRikgPDwgMTApICsgKGV4dHJhICYgMHgzRkYpICsgMHgxMDAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gdW5tYXRjaGVkIHN1cnJvZ2F0ZTsgb25seSBhcHBlbmQgdGhpcyBjb2RlIHVuaXQsIGluIGNhc2UgdGhlIG5leHRcblx0XHRcdFx0XHQvLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcblx0XHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHRcdFx0Y291bnRlci0tO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHN0cmluZyBiYXNlZCBvbiBhbiBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAc2VlIGBwdW55Y29kZS51Y3MyLmRlY29kZWBcblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZW5jb2RlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGNvZGVQb2ludHMgVGhlIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBuZXcgVW5pY29kZSBzdHJpbmcgKFVDUy0yKS5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpIHtcblx0XHRyZXR1cm4gbWFwKGFycmF5LCBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdFx0aWYgKHZhbHVlID4gMHhGRkZGKSB7XG5cdFx0XHRcdHZhbHVlIC09IDB4MTAwMDA7XG5cdFx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0XHR2YWx1ZSA9IDB4REMwMCB8IHZhbHVlICYgMHgzRkY7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTtcblx0XHRcdHJldHVybiBvdXRwdXQ7XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBiYXNpYyBjb2RlIHBvaW50IGludG8gYSBkaWdpdC9pbnRlZ2VyLlxuXHQgKiBAc2VlIGBkaWdpdFRvQmFzaWMoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVQb2ludCBUaGUgYmFzaWMgbnVtZXJpYyBjb2RlIHBvaW50IHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQgKGZvciB1c2UgaW5cblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpbiB0aGUgcmFuZ2UgYDBgIHRvIGBiYXNlIC0gMWAsIG9yIGBiYXNlYCBpZlxuXHQgKiB0aGUgY29kZSBwb2ludCBkb2VzIG5vdCByZXByZXNlbnQgYSB2YWx1ZS5cblx0ICovXG5cdGZ1bmN0aW9uIGJhc2ljVG9EaWdpdChjb2RlUG9pbnQpIHtcblx0XHRpZiAoY29kZVBvaW50IC0gNDggPCAxMCkge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDIyO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gNjUgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDY1O1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50IC0gOTcgPCAyNikge1xuXHRcdFx0cmV0dXJuIGNvZGVQb2ludCAtIDk3O1xuXHRcdH1cblx0XHRyZXR1cm4gYmFzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGRpZ2l0L2ludGVnZXIgaW50byBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEBzZWUgYGJhc2ljVG9EaWdpdCgpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gZGlnaXQgVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgYmFzaWMgY29kZSBwb2ludCB3aG9zZSB2YWx1ZSAod2hlbiB1c2VkIGZvclxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGlzIGBkaWdpdGAsIHdoaWNoIG5lZWRzIHRvIGJlIGluIHRoZSByYW5nZVxuXHQgKiBgMGAgdG8gYGJhc2UgLSAxYC4gSWYgYGZsYWdgIGlzIG5vbi16ZXJvLCB0aGUgdXBwZXJjYXNlIGZvcm0gaXNcblx0ICogdXNlZDsgZWxzZSwgdGhlIGxvd2VyY2FzZSBmb3JtIGlzIHVzZWQuIFRoZSBiZWhhdmlvciBpcyB1bmRlZmluZWRcblx0ICogaWYgYGZsYWdgIGlzIG5vbi16ZXJvIGFuZCBgZGlnaXRgIGhhcyBubyB1cHBlcmNhc2UgZm9ybS5cblx0ICovXG5cdGZ1bmN0aW9uIGRpZ2l0VG9CYXNpYyhkaWdpdCwgZmxhZykge1xuXHRcdC8vICAwLi4yNSBtYXAgdG8gQVNDSUkgYS4ueiBvciBBLi5aXG5cdFx0Ly8gMjYuLjM1IG1hcCB0byBBU0NJSSAwLi45XG5cdFx0cmV0dXJuIGRpZ2l0ICsgMjIgKyA3NSAqIChkaWdpdCA8IDI2KSAtICgoZmxhZyAhPSAwKSA8PCA1KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCaWFzIGFkYXB0YXRpb24gZnVuY3Rpb24gYXMgcGVyIHNlY3Rpb24gMy40IG9mIFJGQyAzNDkyLlxuXHQgKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgKGUuZy4gYSBkb21haW4gbmFtZSBsYWJlbCkgdG8gYVxuXHQgKiBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzc1xuXHQgKiB0byBVbmljb2RlLiBPbmx5IHRoZSBQdW55Y29kZWQgcGFydHMgb2YgdGhlIGlucHV0IHdpbGwgYmUgY29udmVydGVkLCBpLmUuXG5cdCAqIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IG9uIGEgc3RyaW5nIHRoYXQgaGFzIGFscmVhZHkgYmVlblxuXHQgKiBjb252ZXJ0ZWQgdG8gVW5pY29kZS5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGVkIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG9cblx0ICogY29udmVydCB0byBVbmljb2RlLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgVW5pY29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gUHVueWNvZGVcblx0ICogc3RyaW5nLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9Vbmljb2RlKGlucHV0KSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihpbnB1dCwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhQdW55Y29kZS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyBkZWNvZGUoc3RyaW5nLnNsaWNlKDQpLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgVW5pY29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgb3IgYW4gZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBQdW55Y29kZS4gT25seSB0aGUgbm9uLUFTQ0lJIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCxcblx0ICogaS5lLiBpdCBkb2Vzbid0IG1hdHRlciBpZiB5b3UgY2FsbCBpdCB3aXRoIGEgZG9tYWluIHRoYXQncyBhbHJlYWR5IGluXG5cdCAqIEFTQ0lJLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBkb21haW4gbmFtZSBvciBlbWFpbCBhZGRyZXNzIHRvIGNvbnZlcnQsIGFzIGFcblx0ICogVW5pY29kZSBzdHJpbmcuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBQdW55Y29kZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gZG9tYWluIG5hbWUgb3Jcblx0ICogZW1haWwgYWRkcmVzcy5cblx0ICovXG5cdGZ1bmN0aW9uIHRvQVNDSUkoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleE5vbkFTQ0lJLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/ICd4bi0tJyArIGVuY29kZShzdHJpbmcpXG5cdFx0XHRcdDogc3RyaW5nO1xuXHRcdH0pO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqIERlZmluZSB0aGUgcHVibGljIEFQSSAqL1xuXHRwdW55Y29kZSA9IHtcblx0XHQvKipcblx0XHQgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgUHVueWNvZGUuanMgdmVyc2lvbiBudW1iZXIuXG5cdFx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdFx0ICogQHR5cGUgU3RyaW5nXG5cdFx0ICovXG5cdFx0J3ZlcnNpb24nOiAnMS40LjEnLFxuXHRcdC8qKlxuXHRcdCAqIEFuIG9iamVjdCBvZiBtZXRob2RzIHRvIGNvbnZlcnQgZnJvbSBKYXZhU2NyaXB0J3MgaW50ZXJuYWwgY2hhcmFjdGVyXG5cdFx0ICogcmVwcmVzZW50YXRpb24gKFVDUy0yKSB0byBVbmljb2RlIGNvZGUgcG9pbnRzLCBhbmQgYmFjay5cblx0XHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiBmcmVlTW9kdWxlKSB7XG5cdFx0aWYgKG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzKSB7XG5cdFx0XHQvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBwdW55Y29kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QucHVueWNvZGUgPSBwdW55Y29kZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbi8vIElmIG9iai5oYXNPd25Qcm9wZXJ0eSBoYXMgYmVlbiBvdmVycmlkZGVuLCB0aGVuIGNhbGxpbmdcbi8vIG9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSB3aWxsIGJyZWFrLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vam95ZW50L25vZGUvaXNzdWVzLzE3MDdcbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocXMsIHNlcCwgZXEsIG9wdGlvbnMpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIHZhciBvYmogPSB7fTtcblxuICBpZiAodHlwZW9mIHFzICE9PSAnc3RyaW5nJyB8fCBxcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IC9cXCsvZztcbiAgcXMgPSBxcy5zcGxpdChzZXApO1xuXG4gIHZhciBtYXhLZXlzID0gMTAwMDtcbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMubWF4S2V5cyA9PT0gJ251bWJlcicpIHtcbiAgICBtYXhLZXlzID0gb3B0aW9ucy5tYXhLZXlzO1xuICB9XG5cbiAgdmFyIGxlbiA9IHFzLmxlbmd0aDtcbiAgLy8gbWF4S2V5cyA8PSAwIG1lYW5zIHRoYXQgd2Ugc2hvdWxkIG5vdCBsaW1pdCBrZXlzIGNvdW50XG4gIGlmIChtYXhLZXlzID4gMCAmJiBsZW4gPiBtYXhLZXlzKSB7XG4gICAgbGVuID0gbWF4S2V5cztcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICB2YXIgeCA9IHFzW2ldLnJlcGxhY2UocmVnZXhwLCAnJTIwJyksXG4gICAgICAgIGlkeCA9IHguaW5kZXhPZihlcSksXG4gICAgICAgIGtzdHIsIHZzdHIsIGssIHY7XG5cbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIGtzdHIgPSB4LnN1YnN0cigwLCBpZHgpO1xuICAgICAgdnN0ciA9IHguc3Vic3RyKGlkeCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrc3RyID0geDtcbiAgICAgIHZzdHIgPSAnJztcbiAgICB9XG5cbiAgICBrID0gZGVjb2RlVVJJQ29tcG9uZW50KGtzdHIpO1xuICAgIHYgPSBkZWNvZGVVUklDb21wb25lbnQodnN0cik7XG5cbiAgICBpZiAoIWhhc093blByb3BlcnR5KG9iaiwgaykpIHtcbiAgICAgIG9ialtrXSA9IHY7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgIG9ialtrXS5wdXNoKHYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba10gPSBbb2JqW2tdLCB2XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3RyaW5naWZ5UHJpbWl0aXZlID0gZnVuY3Rpb24odikge1xuICBzd2l0Y2ggKHR5cGVvZiB2KSB7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiB2O1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gdiA/ICd0cnVlJyA6ICdmYWxzZSc7XG5cbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgcmV0dXJuIGlzRmluaXRlKHYpID8gdiA6ICcnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnJztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIHNlcCwgZXEsIG5hbWUpIHtcbiAgc2VwID0gc2VwIHx8ICcmJztcbiAgZXEgPSBlcSB8fCAnPSc7XG4gIGlmIChvYmogPT09IG51bGwpIHtcbiAgICBvYmogPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbWFwKG9iamVjdEtleXMob2JqKSwgZnVuY3Rpb24oaykge1xuICAgICAgdmFyIGtzID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShrKSkgKyBlcTtcbiAgICAgIGlmIChpc0FycmF5KG9ialtrXSkpIHtcbiAgICAgICAgcmV0dXJuIG1hcChvYmpba10sIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICByZXR1cm4ga3MgKyBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKHYpKTtcbiAgICAgICAgfSkuam9pbihzZXApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmpba10pKTtcbiAgICAgIH1cbiAgICB9KS5qb2luKHNlcCk7XG5cbiAgfVxuXG4gIGlmICghbmFtZSkgcmV0dXJuICcnO1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShuYW1lKSkgKyBlcSArXG4gICAgICAgICBlbmNvZGVVUklDb21wb25lbnQoc3RyaW5naWZ5UHJpbWl0aXZlKG9iaikpO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uICh4cykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHhzKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIG1hcCAoeHMsIGYpIHtcbiAgaWYgKHhzLm1hcCkgcmV0dXJuIHhzLm1hcChmKTtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzLnB1c2goZih4c1tpXSwgaSkpO1xuICB9XG4gIHJldHVybiByZXM7XG59XG5cbnZhciBvYmplY3RLZXlzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24gKG9iaikge1xuICB2YXIgcmVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgcmVzLnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5kZWNvZGUgPSBleHBvcnRzLnBhcnNlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcbmV4cG9ydHMuZW5jb2RlID0gZXhwb3J0cy5zdHJpbmdpZnkgPSByZXF1aXJlKCcuL2VuY29kZScpO1xuIiwiLypcbiAqIHJhbmRvbS1zdHJpbmdcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS92YWxpdG9uL25vZGUtcmFuZG9tLXN0cmluZ1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMyBWYWxpdG9uIEdtYkgsIEJhc3RpYW4gJ2hlcmVhbmRub3cnIEJlaHJlbnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBudW1iZXJzID0gJzAxMjM0NTY3ODknLFxuICAgIGxldHRlcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eicsXG4gICAgc3BlY2lhbHMgPSAnISQlXiYqKClfK3x+LT1ge31bXTo7PD4/LC4vJztcblxuXG5mdW5jdGlvbiBfZGVmYXVsdHMgKG9wdHMpIHtcbiAgb3B0cyB8fCAob3B0cyA9IHt9KTtcbiAgcmV0dXJuIHtcbiAgICBsZW5ndGg6IG9wdHMubGVuZ3RoIHx8IDgsXG4gICAgbnVtZXJpYzogdHlwZW9mIG9wdHMubnVtZXJpYyA9PT0gJ2Jvb2xlYW4nID8gb3B0cy5udW1lcmljIDogdHJ1ZSxcbiAgICBsZXR0ZXJzOiB0eXBlb2Ygb3B0cy5sZXR0ZXJzID09PSAnYm9vbGVhbicgPyBvcHRzLmxldHRlcnMgOiB0cnVlLFxuICAgIHNwZWNpYWw6IHR5cGVvZiBvcHRzLnNwZWNpYWwgPT09ICdib29sZWFuJyA/IG9wdHMuc3BlY2lhbCA6IGZhbHNlXG4gIH07XG59XG5cbmZ1bmN0aW9uIF9idWlsZENoYXJzIChvcHRzKSB7XG4gIHZhciBjaGFycyA9ICcnO1xuICBpZiAob3B0cy5udW1lcmljKSB7IGNoYXJzICs9IG51bWJlcnM7IH1cbiAgaWYgKG9wdHMubGV0dGVycykgeyBjaGFycyArPSBsZXR0ZXJzOyB9XG4gIGlmIChvcHRzLnNwZWNpYWwpIHsgY2hhcnMgKz0gc3BlY2lhbHM7IH1cbiAgcmV0dXJuIGNoYXJzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJhbmRvbVN0cmluZyhvcHRzKSB7XG4gIG9wdHMgPSBfZGVmYXVsdHMob3B0cyk7XG4gIHZhciBpLCBybixcbiAgICAgIHJuZCA9ICcnLFxuICAgICAgbGVuID0gb3B0cy5sZW5ndGgsXG4gICAgICByYW5kb21DaGFycyA9IF9idWlsZENoYXJzKG9wdHMpO1xuICBmb3IgKGkgPSAxOyBpIDw9IGxlbjsgaSsrKSB7XG4gICAgcm5kICs9IHJhbmRvbUNoYXJzLnN1YnN0cmluZyhybiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJhbmRvbUNoYXJzLmxlbmd0aCksIHJuICsgMSk7XG4gIH1cbiAgcmV0dXJuIHJuZDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuZXhwb3J0cy5wYXJzZSA9IHVybFBhcnNlO1xuZXhwb3J0cy5yZXNvbHZlID0gdXJsUmVzb2x2ZTtcbmV4cG9ydHMucmVzb2x2ZU9iamVjdCA9IHVybFJlc29sdmVPYmplY3Q7XG5leHBvcnRzLmZvcm1hdCA9IHVybEZvcm1hdDtcblxuZXhwb3J0cy5VcmwgPSBVcmw7XG5cbmZ1bmN0aW9uIFVybCgpIHtcbiAgdGhpcy5wcm90b2NvbCA9IG51bGw7XG4gIHRoaXMuc2xhc2hlcyA9IG51bGw7XG4gIHRoaXMuYXV0aCA9IG51bGw7XG4gIHRoaXMuaG9zdCA9IG51bGw7XG4gIHRoaXMucG9ydCA9IG51bGw7XG4gIHRoaXMuaG9zdG5hbWUgPSBudWxsO1xuICB0aGlzLmhhc2ggPSBudWxsO1xuICB0aGlzLnNlYXJjaCA9IG51bGw7XG4gIHRoaXMucXVlcnkgPSBudWxsO1xuICB0aGlzLnBhdGhuYW1lID0gbnVsbDtcbiAgdGhpcy5wYXRoID0gbnVsbDtcbiAgdGhpcy5ocmVmID0gbnVsbDtcbn1cblxuLy8gUmVmZXJlbmNlOiBSRkMgMzk4NiwgUkZDIDE4MDgsIFJGQyAyMzk2XG5cbi8vIGRlZmluZSB0aGVzZSBoZXJlIHNvIGF0IGxlYXN0IHRoZXkgb25seSBoYXZlIHRvIGJlXG4vLyBjb21waWxlZCBvbmNlIG9uIHRoZSBmaXJzdCBtb2R1bGUgbG9hZC5cbnZhciBwcm90b2NvbFBhdHRlcm4gPSAvXihbYS16MC05ListXSs6KS9pLFxuICAgIHBvcnRQYXR0ZXJuID0gLzpbMC05XSokLyxcblxuICAgIC8vIFNwZWNpYWwgY2FzZSBmb3IgYSBzaW1wbGUgcGF0aCBVUkxcbiAgICBzaW1wbGVQYXRoUGF0dGVybiA9IC9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyByZXNlcnZlZCBmb3IgZGVsaW1pdGluZyBVUkxzLlxuICAgIC8vIFdlIGFjdHVhbGx5IGp1c3QgYXV0by1lc2NhcGUgdGhlc2UuXG4gICAgZGVsaW1zID0gWyc8JywgJz4nLCAnXCInLCAnYCcsICcgJywgJ1xccicsICdcXG4nLCAnXFx0J10sXG5cbiAgICAvLyBSRkMgMjM5NjogY2hhcmFjdGVycyBub3QgYWxsb3dlZCBmb3IgdmFyaW91cyByZWFzb25zLlxuICAgIHVud2lzZSA9IFsneycsICd9JywgJ3wnLCAnXFxcXCcsICdeJywgJ2AnXS5jb25jYXQoZGVsaW1zKSxcblxuICAgIC8vIEFsbG93ZWQgYnkgUkZDcywgYnV0IGNhdXNlIG9mIFhTUyBhdHRhY2tzLiAgQWx3YXlzIGVzY2FwZSB0aGVzZS5cbiAgICBhdXRvRXNjYXBlID0gWydcXCcnXS5jb25jYXQodW53aXNlKSxcbiAgICAvLyBDaGFyYWN0ZXJzIHRoYXQgYXJlIG5ldmVyIGV2ZXIgYWxsb3dlZCBpbiBhIGhvc3RuYW1lLlxuICAgIC8vIE5vdGUgdGhhdCBhbnkgaW52YWxpZCBjaGFycyBhcmUgYWxzbyBoYW5kbGVkLCBidXQgdGhlc2VcbiAgICAvLyBhcmUgdGhlIG9uZXMgdGhhdCBhcmUgKmV4cGVjdGVkKiB0byBiZSBzZWVuLCBzbyB3ZSBmYXN0LXBhdGhcbiAgICAvLyB0aGVtLlxuICAgIG5vbkhvc3RDaGFycyA9IFsnJScsICcvJywgJz8nLCAnOycsICcjJ10uY29uY2F0KGF1dG9Fc2NhcGUpLFxuICAgIGhvc3RFbmRpbmdDaGFycyA9IFsnLycsICc/JywgJyMnXSxcbiAgICBob3N0bmFtZU1heExlbiA9IDI1NSxcbiAgICBob3N0bmFtZVBhcnRQYXR0ZXJuID0gL15bK2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oWythLXowLTlBLVpfLV17MCw2M30pKC4qKSQvLFxuICAgIC8vIHByb3RvY29scyB0aGF0IGNhbiBhbGxvdyBcInVuc2FmZVwiIGFuZCBcInVud2lzZVwiIGNoYXJzLlxuICAgIHVuc2FmZVByb3RvY29sID0ge1xuICAgICAgJ2phdmFzY3JpcHQnOiB0cnVlLFxuICAgICAgJ2phdmFzY3JpcHQ6JzogdHJ1ZVxuICAgIH0sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgbmV2ZXIgaGF2ZSBhIGhvc3RuYW1lLlxuICAgIGhvc3RsZXNzUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBhbHdheXMgY29udGFpbiBhIC8vIGJpdC5cbiAgICBzbGFzaGVkUHJvdG9jb2wgPSB7XG4gICAgICAnaHR0cCc6IHRydWUsXG4gICAgICAnaHR0cHMnOiB0cnVlLFxuICAgICAgJ2Z0cCc6IHRydWUsXG4gICAgICAnZ29waGVyJzogdHJ1ZSxcbiAgICAgICdmaWxlJzogdHJ1ZSxcbiAgICAgICdodHRwOic6IHRydWUsXG4gICAgICAnaHR0cHM6JzogdHJ1ZSxcbiAgICAgICdmdHA6JzogdHJ1ZSxcbiAgICAgICdnb3BoZXI6JzogdHJ1ZSxcbiAgICAgICdmaWxlOic6IHRydWVcbiAgICB9LFxuICAgIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcblxuZnVuY3Rpb24gdXJsUGFyc2UodXJsLCBwYXJzZVF1ZXJ5U3RyaW5nLCBzbGFzaGVzRGVub3RlSG9zdCkge1xuICBpZiAodXJsICYmIHV0aWwuaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCF1dGlsLmlzU3RyaW5nKHVybCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIiArIHR5cGVvZiB1cmwpO1xuICB9XG5cbiAgLy8gQ29weSBjaHJvbWUsIElFLCBvcGVyYSBiYWNrc2xhc2gtaGFuZGxpbmcgYmVoYXZpb3IuXG4gIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAvLyBTZWU6IGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD0yNTkxNlxuICB2YXIgcXVlcnlJbmRleCA9IHVybC5pbmRleE9mKCc/JyksXG4gICAgICBzcGxpdHRlciA9XG4gICAgICAgICAgKHF1ZXJ5SW5kZXggIT09IC0xICYmIHF1ZXJ5SW5kZXggPCB1cmwuaW5kZXhPZignIycpKSA/ICc/JyA6ICcjJyxcbiAgICAgIHVTcGxpdCA9IHVybC5zcGxpdChzcGxpdHRlciksXG4gICAgICBzbGFzaFJlZ2V4ID0gL1xcXFwvZztcbiAgdVNwbGl0WzBdID0gdVNwbGl0WzBdLnJlcGxhY2Uoc2xhc2hSZWdleCwgJy8nKTtcbiAgdXJsID0gdVNwbGl0LmpvaW4oc3BsaXR0ZXIpO1xuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIGlmICghc2xhc2hlc0Rlbm90ZUhvc3QgJiYgdXJsLnNwbGl0KCcjJykubGVuZ3RoID09PSAxKSB7XG4gICAgLy8gVHJ5IGZhc3QgcGF0aCByZWdleHBcbiAgICB2YXIgc2ltcGxlUGF0aCA9IHNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7XG4gICAgaWYgKHNpbXBsZVBhdGgpIHtcbiAgICAgIHRoaXMucGF0aCA9IHJlc3Q7XG4gICAgICB0aGlzLmhyZWYgPSByZXN0O1xuICAgICAgdGhpcy5wYXRobmFtZSA9IHNpbXBsZVBhdGhbMV07XG4gICAgICBpZiAoc2ltcGxlUGF0aFsyXSkge1xuICAgICAgICB0aGlzLnNlYXJjaCA9IHNpbXBsZVBhdGhbMl07XG4gICAgICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5xdWVyeSA9IHRoaXMuc2VhcmNoLnN1YnN0cigxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55Y29kZWQgcmVwcmVzZW50YXRpb24gb2YgXCJkb21haW5cIi5cbiAgICAgIC8vIEl0IG9ubHkgY29udmVydHMgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHRoYXRcbiAgICAgIC8vIGhhdmUgbm9uLUFTQ0lJIGNoYXJhY3RlcnMsIGkuZS4gaXQgZG9lc24ndCBtYXR0ZXIgaWZcbiAgICAgIC8vIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCBhbHJlYWR5IGlzIEFTQ0lJLW9ubHkuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLmhvc3RuYW1lKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICBpZiAocmVzdC5pbmRleE9mKGFlKSA9PT0gLTEpXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgdmFyIGVzYyA9IGVuY29kZVVSSUNvbXBvbmVudChhZSk7XG4gICAgICBpZiAoZXNjID09PSBhZSkge1xuICAgICAgICBlc2MgPSBlc2NhcGUoYWUpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IHJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKTtcbiAgICB9XG4gIH1cblxuXG4gIC8vIGNob3Agb2ZmIGZyb20gdGhlIHRhaWwgZmlyc3QuXG4gIHZhciBoYXNoID0gcmVzdC5pbmRleE9mKCcjJyk7XG4gIGlmIChoYXNoICE9PSAtMSkge1xuICAgIC8vIGdvdCBhIGZyYWdtZW50IHN0cmluZy5cbiAgICB0aGlzLmhhc2ggPSByZXN0LnN1YnN0cihoYXNoKTtcbiAgICByZXN0ID0gcmVzdC5zbGljZSgwLCBoYXNoKTtcbiAgfVxuICB2YXIgcW0gPSByZXN0LmluZGV4T2YoJz8nKTtcbiAgaWYgKHFtICE9PSAtMSkge1xuICAgIHRoaXMuc2VhcmNoID0gcmVzdC5zdWJzdHIocW0pO1xuICAgIHRoaXMucXVlcnkgPSByZXN0LnN1YnN0cihxbSArIDEpO1xuICAgIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7XG4gICAgfVxuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIHFtKTtcbiAgfSBlbHNlIGlmIChwYXJzZVF1ZXJ5U3RyaW5nKSB7XG4gICAgLy8gbm8gcXVlcnkgc3RyaW5nLCBidXQgcGFyc2VRdWVyeVN0cmluZyBzdGlsbCByZXF1ZXN0ZWRcbiAgICB0aGlzLnNlYXJjaCA9ICcnO1xuICAgIHRoaXMucXVlcnkgPSB7fTtcbiAgfVxuICBpZiAocmVzdCkgdGhpcy5wYXRobmFtZSA9IHJlc3Q7XG4gIGlmIChzbGFzaGVkUHJvdG9jb2xbbG93ZXJQcm90b10gJiZcbiAgICAgIHRoaXMuaG9zdG5hbWUgJiYgIXRoaXMucGF0aG5hbWUpIHtcbiAgICB0aGlzLnBhdGhuYW1lID0gJy8nO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICBpZiAodGhpcy5wYXRobmFtZSB8fCB0aGlzLnNlYXJjaCkge1xuICAgIHZhciBwID0gdGhpcy5wYXRobmFtZSB8fCAnJztcbiAgICB2YXIgcyA9IHRoaXMuc2VhcmNoIHx8ICcnO1xuICAgIHRoaXMucGF0aCA9IHAgKyBzO1xuICB9XG5cbiAgLy8gZmluYWxseSwgcmVjb25zdHJ1Y3QgdGhlIGhyZWYgYmFzZWQgb24gd2hhdCBoYXMgYmVlbiB2YWxpZGF0ZWQuXG4gIHRoaXMuaHJlZiA9IHRoaXMuZm9ybWF0KCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZm9ybWF0IGEgcGFyc2VkIG9iamVjdCBpbnRvIGEgdXJsIHN0cmluZ1xuZnVuY3Rpb24gdXJsRm9ybWF0KG9iaikge1xuICAvLyBlbnN1cmUgaXQncyBhbiBvYmplY3QsIGFuZCBub3QgYSBzdHJpbmcgdXJsLlxuICAvLyBJZiBpdCdzIGFuIG9iaiwgdGhpcyBpcyBhIG5vLW9wLlxuICAvLyB0aGlzIHdheSwgeW91IGNhbiBjYWxsIHVybF9mb3JtYXQoKSBvbiBzdHJpbmdzXG4gIC8vIHRvIGNsZWFuIHVwIHBvdGVudGlhbGx5IHdvbmt5IHVybHMuXG4gIGlmICh1dGlsLmlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIHV0aWwuaXNPYmplY3QodGhpcy5xdWVyeSkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aCkge1xuICAgIHF1ZXJ5ID0gcXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO1xuICB9XG5cbiAgdmFyIHNlYXJjaCA9IHRoaXMuc2VhcmNoIHx8IChxdWVyeSAmJiAoJz8nICsgcXVlcnkpKSB8fCAnJztcblxuICBpZiAocHJvdG9jb2wgJiYgcHJvdG9jb2wuc3Vic3RyKC0xKSAhPT0gJzonKSBwcm90b2NvbCArPSAnOic7XG5cbiAgLy8gb25seSB0aGUgc2xhc2hlZFByb3RvY29scyBnZXQgdGhlIC8vLiAgTm90IG1haWx0bzosIHhtcHA6LCBldGMuXG4gIC8vIHVubGVzcyB0aGV5IGhhZCB0aGVtIHRvIGJlZ2luIHdpdGguXG4gIGlmICh0aGlzLnNsYXNoZXMgfHxcbiAgICAgICghcHJvdG9jb2wgfHwgc2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkgJiYgaG9zdCAhPT0gZmFsc2UpIHtcbiAgICBob3N0ID0gJy8vJyArIChob3N0IHx8ICcnKTtcbiAgICBpZiAocGF0aG5hbWUgJiYgcGF0aG5hbWUuY2hhckF0KDApICE9PSAnLycpIHBhdGhuYW1lID0gJy8nICsgcGF0aG5hbWU7XG4gIH0gZWxzZSBpZiAoIWhvc3QpIHtcbiAgICBob3N0ID0gJyc7XG4gIH1cblxuICBpZiAoaGFzaCAmJiBoYXNoLmNoYXJBdCgwKSAhPT0gJyMnKSBoYXNoID0gJyMnICsgaGFzaDtcbiAgaWYgKHNlYXJjaCAmJiBzZWFyY2guY2hhckF0KDApICE9PSAnPycpIHNlYXJjaCA9ICc/JyArIHNlYXJjaDtcblxuICBwYXRobmFtZSA9IHBhdGhuYW1lLnJlcGxhY2UoL1s/I10vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKTtcbiAgfSk7XG4gIHNlYXJjaCA9IHNlYXJjaC5yZXBsYWNlKCcjJywgJyUyMycpO1xuXG4gIHJldHVybiBwcm90b2NvbCArIGhvc3QgKyBwYXRobmFtZSArIHNlYXJjaCArIGhhc2g7XG59O1xuXG5mdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSwgcmVsYXRpdmUpIHtcbiAgcmV0dXJuIHVybFBhcnNlKHNvdXJjZSwgZmFsc2UsIHRydWUpLnJlc29sdmUocmVsYXRpdmUpO1xufVxuXG5VcmwucHJvdG90eXBlLnJlc29sdmUgPSBmdW5jdGlvbihyZWxhdGl2ZSkge1xuICByZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCBmYWxzZSwgdHJ1ZSkpLmZvcm1hdCgpO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIGlmICghc291cmNlKSByZXR1cm4gcmVsYXRpdmU7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlT2JqZWN0ID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgaWYgKHV0aWwuaXNTdHJpbmcocmVsYXRpdmUpKSB7XG4gICAgdmFyIHJlbCA9IG5ldyBVcmwoKTtcbiAgICByZWwucGFyc2UocmVsYXRpdmUsIGZhbHNlLCB0cnVlKTtcbiAgICByZWxhdGl2ZSA9IHJlbDtcbiAgfVxuXG4gIHZhciByZXN1bHQgPSBuZXcgVXJsKCk7XG4gIHZhciB0a2V5cyA9IE9iamVjdC5rZXlzKHRoaXMpO1xuICBmb3IgKHZhciB0ayA9IDA7IHRrIDwgdGtleXMubGVuZ3RoOyB0aysrKSB7XG4gICAgdmFyIHRrZXkgPSB0a2V5c1t0a107XG4gICAgcmVzdWx0W3RrZXldID0gdGhpc1t0a2V5XTtcbiAgfVxuXG4gIC8vIGhhc2ggaXMgYWx3YXlzIG92ZXJyaWRkZW4sIG5vIG1hdHRlciB3aGF0LlxuICAvLyBldmVuIGhyZWY9XCJcIiB3aWxsIHJlbW92ZSBpdC5cbiAgcmVzdWx0Lmhhc2ggPSByZWxhdGl2ZS5oYXNoO1xuXG4gIC8vIGlmIHRoZSByZWxhdGl2ZSB1cmwgaXMgZW1wdHksIHRoZW4gdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG8gaGVyZS5cbiAgaWYgKHJlbGF0aXZlLmhyZWYgPT09ICcnKSB7XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGhyZWZzIGxpa2UgLy9mb28vYmFyIGFsd2F5cyBjdXQgdG8gdGhlIHByb3RvY29sLlxuICBpZiAocmVsYXRpdmUuc2xhc2hlcyAmJiAhcmVsYXRpdmUucHJvdG9jb2wpIHtcbiAgICAvLyB0YWtlIGV2ZXJ5dGhpbmcgZXhjZXB0IHRoZSBwcm90b2NvbCBmcm9tIHJlbGF0aXZlXG4gICAgdmFyIHJrZXlzID0gT2JqZWN0LmtleXMocmVsYXRpdmUpO1xuICAgIGZvciAodmFyIHJrID0gMDsgcmsgPCBya2V5cy5sZW5ndGg7IHJrKyspIHtcbiAgICAgIHZhciBya2V5ID0gcmtleXNbcmtdO1xuICAgICAgaWYgKHJrZXkgIT09ICdwcm90b2NvbCcpXG4gICAgICAgIHJlc3VsdFtya2V5XSA9IHJlbGF0aXZlW3JrZXldO1xuICAgIH1cblxuICAgIC8vdXJsUGFyc2UgYXBwZW5kcyB0cmFpbGluZyAvIHRvIHVybHMgbGlrZSBodHRwOi8vd3d3LmV4YW1wbGUuY29tXG4gICAgaWYgKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdICYmXG4gICAgICAgIHJlc3VsdC5ob3N0bmFtZSAmJiAhcmVzdWx0LnBhdGhuYW1lKSB7XG4gICAgICByZXN1bHQucGF0aCA9IHJlc3VsdC5wYXRobmFtZSA9ICcvJztcbiAgICB9XG5cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKHJlbGF0aXZlLnByb3RvY29sICYmIHJlbGF0aXZlLnByb3RvY29sICE9PSByZXN1bHQucHJvdG9jb2wpIHtcbiAgICAvLyBpZiBpdCdzIGEga25vd24gdXJsIHByb3RvY29sLCB0aGVuIGNoYW5naW5nXG4gICAgLy8gdGhlIHByb3RvY29sIGRvZXMgd2VpcmQgdGhpbmdzXG4gICAgLy8gZmlyc3QsIGlmIGl0J3Mgbm90IGZpbGU6LCB0aGVuIHdlIE1VU1QgaGF2ZSBhIGhvc3QsXG4gICAgLy8gYW5kIGlmIHRoZXJlIHdhcyBhIHBhdGhcbiAgICAvLyB0byBiZWdpbiB3aXRoLCB0aGVuIHdlIE1VU1QgaGF2ZSBhIHBhdGguXG4gICAgLy8gaWYgaXQgaXMgZmlsZTosIHRoZW4gdGhlIGhvc3QgaXMgZHJvcHBlZCxcbiAgICAvLyBiZWNhdXNlIHRoYXQncyBrbm93biB0byBiZSBob3N0bGVzcy5cbiAgICAvLyBhbnl0aGluZyBlbHNlIGlzIGFzc3VtZWQgdG8gYmUgYWJzb2x1dGUuXG4gICAgaWYgKCFzbGFzaGVkUHJvdG9jb2xbcmVsYXRpdmUucHJvdG9jb2xdKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHJlbGF0aXZlKTtcbiAgICAgIGZvciAodmFyIHYgPSAwOyB2IDwga2V5cy5sZW5ndGg7IHYrKykge1xuICAgICAgICB2YXIgayA9IGtleXNbdl07XG4gICAgICAgIHJlc3VsdFtrXSA9IHJlbGF0aXZlW2tdO1xuICAgICAgfVxuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghdXRpbC5pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKSB7XG4gICAgLy8ganVzdCBwdWxsIG91dCB0aGUgc2VhcmNoLlxuICAgIC8vIGxpa2UgaHJlZj0nP2ZvbycuXG4gICAgLy8gUHV0IHRoaXMgYWZ0ZXIgdGhlIG90aGVyIHR3byBjYXNlcyBiZWNhdXNlIGl0IHNpbXBsaWZpZXMgdGhlIGJvb2xlYW5zXG4gICAgaWYgKHBzeWNob3RpYykge1xuICAgICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBzcmNQYXRoLnNoaWZ0KCk7XG4gICAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgICAvL3RoaXMgZXNwZWNpYWxseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghdXRpbC5pc051bGwocmVzdWx0LnBhdGhuYW1lKSB8fCAhdXRpbC5pc051bGwocmVzdWx0LnNlYXJjaCkpIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmICghc3JjUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBubyBwYXRoIGF0IGFsbC4gIGVhc3kuXG4gICAgLy8gd2UndmUgYWxyZWFkeSBoYW5kbGVkIHRoZSBvdGhlciBzdHVmZiBhYm92ZS5cbiAgICByZXN1bHQucGF0aG5hbWUgPSBudWxsO1xuICAgIC8vdG8gc3VwcG9ydCBodHRwLnJlcXVlc3RcbiAgICBpZiAocmVzdWx0LnNlYXJjaCkge1xuICAgICAgcmVzdWx0LnBhdGggPSAnLycgKyByZXN1bHQuc2VhcmNoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvLyBpZiBhIHVybCBFTkRzIGluIC4gb3IgLi4sIHRoZW4gaXQgbXVzdCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgLy8gaG93ZXZlciwgaWYgaXQgZW5kcyBpbiBhbnl0aGluZyBlbHNlIG5vbi1zbGFzaHksXG4gIC8vIHRoZW4gaXQgbXVzdCBOT1QgZ2V0IGEgdHJhaWxpbmcgc2xhc2guXG4gIHZhciBsYXN0ID0gc3JjUGF0aC5zbGljZSgtMSlbMF07XG4gIHZhciBoYXNUcmFpbGluZ1NsYXNoID0gKFxuICAgICAgKHJlc3VsdC5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgfHwgc3JjUGF0aC5sZW5ndGggPiAxKSAmJlxuICAgICAgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fCBsYXN0ID09PSAnJyk7XG5cbiAgLy8gc3RyaXAgc2luZ2xlIGRvdHMsIHJlc29sdmUgZG91YmxlIGRvdHMgdG8gcGFyZW50IGRpclxuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gc3JjUGF0aC5sZW5ndGg7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGFzdCA9IHNyY1BhdGhbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFsbHkgaGFwcGVucyBpbiBjYXNlcyBsaWtlXG4gICAgLy91cmwucmVzb2x2ZU9iamVjdCgnbWFpbHRvOmxvY2FsMUBkb21haW4xJywgJ2xvY2FsMkBkb21haW4yJylcbiAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgcmVzdWx0Lmhvc3Quc3BsaXQoJ0AnKSA6IGZhbHNlO1xuICAgIGlmIChhdXRoSW5Ib3N0KSB7XG4gICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgIHJlc3VsdC5ob3N0ID0gcmVzdWx0Lmhvc3RuYW1lID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG11c3RFbmRBYnMgPSBtdXN0RW5kQWJzIHx8IChyZXN1bHQuaG9zdCAmJiBzcmNQYXRoLmxlbmd0aCk7XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBzcmNQYXRoLnVuc2hpZnQoJycpO1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgcmVzdWx0LnBhdGggPSBudWxsO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdC5wYXRobmFtZSA9IHNyY1BhdGguam9pbignLycpO1xuICB9XG5cbiAgLy90byBzdXBwb3J0IHJlcXVlc3QuaHR0cFxuICBpZiAoIXV0aWwuaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIXV0aWwuaXNOdWxsKHJlc3VsdC5zZWFyY2gpKSB7XG4gICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgIChyZXN1bHQuc2VhcmNoID8gcmVzdWx0LnNlYXJjaCA6ICcnKTtcbiAgfVxuICByZXN1bHQuYXV0aCA9IHJlbGF0aXZlLmF1dGggfHwgcmVzdWx0LmF1dGg7XG4gIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5VcmwucHJvdG90eXBlLnBhcnNlSG9zdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaG9zdCA9IHRoaXMuaG9zdDtcbiAgdmFyIHBvcnQgPSBwb3J0UGF0dGVybi5leGVjKGhvc3QpO1xuICBpZiAocG9ydCkge1xuICAgIHBvcnQgPSBwb3J0WzBdO1xuICAgIGlmIChwb3J0ICE9PSAnOicpIHtcbiAgICAgIHRoaXMucG9ydCA9IHBvcnQuc3Vic3RyKDEpO1xuICAgIH1cbiAgICBob3N0ID0gaG9zdC5zdWJzdHIoMCwgaG9zdC5sZW5ndGggLSBwb3J0Lmxlbmd0aCk7XG4gIH1cbiAgaWYgKGhvc3QpIHRoaXMuaG9zdG5hbWUgPSBob3N0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU3RyaW5nOiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gdHlwZW9mKGFyZykgPT09ICdzdHJpbmcnO1xuICB9LFxuICBpc09iamVjdDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHR5cGVvZihhcmcpID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG4gIH0sXG4gIGlzTnVsbDogZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbiAgfSxcbiAgaXNOdWxsT3JVbmRlZmluZWQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBhcmcgPT0gbnVsbDtcbiAgfVxufTtcbiIsInZhciBjcmVhdGVFbGVtZW50ID0gcmVxdWlyZShcIi4vdmRvbS9jcmVhdGUtZWxlbWVudC5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVsZW1lbnRcbiIsInZhciBkaWZmID0gcmVxdWlyZShcIi4vdnRyZWUvZGlmZi5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmZcbiIsInZhciBwYXRjaCA9IHJlcXVpcmUoXCIuL3Zkb20vcGF0Y2guanNcIilcblxubW9kdWxlLmV4cG9ydHMgPSBwYXRjaFxuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZShcImlzLW9iamVjdFwiKVxudmFyIGlzSG9vayA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy12aG9vay5qc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcGx5UHJvcGVydGllc1xuXG5mdW5jdGlvbiBhcHBseVByb3BlcnRpZXMobm9kZSwgcHJvcHMsIHByZXZpb3VzKSB7XG4gICAgZm9yICh2YXIgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXVxuXG4gICAgICAgIGlmIChwcm9wVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmVtb3ZlUHJvcGVydHkobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXMpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzSG9vayhwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICByZW1vdmVQcm9wZXJ0eShub2RlLCBwcm9wTmFtZSwgcHJvcFZhbHVlLCBwcmV2aW91cylcbiAgICAgICAgICAgIGlmIChwcm9wVmFsdWUuaG9vaykge1xuICAgICAgICAgICAgICAgIHByb3BWYWx1ZS5ob29rKG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIHByb3BOYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyA/IHByZXZpb3VzW3Byb3BOYW1lXSA6IHVuZGVmaW5lZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpc09iamVjdChwcm9wVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hPYmplY3Qobm9kZSwgcHJvcHMsIHByZXZpb3VzLCBwcm9wTmFtZSwgcHJvcFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlUHJvcGVydHkobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSwgcHJldmlvdXMpIHtcbiAgICBpZiAocHJldmlvdXMpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91c1twcm9wTmFtZV1cblxuICAgICAgICBpZiAoIWlzSG9vayhwcmV2aW91c1ZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKHByb3BOYW1lID09PSBcImF0dHJpYnV0ZXNcIikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIHByZXZpb3VzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9wTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBwcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGVbaV0gPSBcIlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgcHJldmlvdXNWYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gXCJcIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwcmV2aW91c1ZhbHVlLnVuaG9vaykge1xuICAgICAgICAgICAgcHJldmlvdXNWYWx1ZS51bmhvb2sobm9kZSwgcHJvcE5hbWUsIHByb3BWYWx1ZSlcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2hPYmplY3Qobm9kZSwgcHJvcHMsIHByZXZpb3VzLCBwcm9wTmFtZSwgcHJvcFZhbHVlKSB7XG4gICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91cyA/IHByZXZpb3VzW3Byb3BOYW1lXSA6IHVuZGVmaW5lZFxuXG4gICAgLy8gU2V0IGF0dHJpYnV0ZXNcbiAgICBpZiAocHJvcE5hbWUgPT09IFwiYXR0cmlidXRlc1wiKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIHByb3BWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIGF0dHJWYWx1ZSA9IHByb3BWYWx1ZVthdHRyTmFtZV1cblxuICAgICAgICAgICAgaWYgKGF0dHJWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZihwcmV2aW91c1ZhbHVlICYmIGlzT2JqZWN0KHByZXZpb3VzVmFsdWUpICYmXG4gICAgICAgIGdldFByb3RvdHlwZShwcmV2aW91c1ZhbHVlKSAhPT0gZ2V0UHJvdG90eXBlKHByb3BWYWx1ZSkpIHtcbiAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSBwcm9wVmFsdWVcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCFpc09iamVjdChub2RlW3Byb3BOYW1lXSkpIHtcbiAgICAgICAgbm9kZVtwcm9wTmFtZV0gPSB7fVxuICAgIH1cblxuICAgIHZhciByZXBsYWNlciA9IHByb3BOYW1lID09PSBcInN0eWxlXCIgPyBcIlwiIDogdW5kZWZpbmVkXG5cbiAgICBmb3IgKHZhciBrIGluIHByb3BWYWx1ZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwcm9wVmFsdWVba11cbiAgICAgICAgbm9kZVtwcm9wTmFtZV1ba10gPSAodmFsdWUgPT09IHVuZGVmaW5lZCkgPyByZXBsYWNlciA6IHZhbHVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpXG4gICAgfSBlbHNlIGlmICh2YWx1ZS5fX3Byb3RvX18pIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLl9fcHJvdG9fX1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY29uc3RydWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZVxuICAgIH1cbn1cbiIsInZhciBkb2N1bWVudCA9IHJlcXVpcmUoXCJnbG9iYWwvZG9jdW1lbnRcIilcblxudmFyIGFwcGx5UHJvcGVydGllcyA9IHJlcXVpcmUoXCIuL2FwcGx5LXByb3BlcnRpZXNcIilcblxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdm5vZGUuanNcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZ0ZXh0LmpzXCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0LmpzXCIpXG52YXIgaGFuZGxlVGh1bmsgPSByZXF1aXJlKFwiLi4vdm5vZGUvaGFuZGxlLXRodW5rLmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRWxlbWVudFxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHZub2RlLCBvcHRzKSB7XG4gICAgdmFyIGRvYyA9IG9wdHMgPyBvcHRzLmRvY3VtZW50IHx8IGRvY3VtZW50IDogZG9jdW1lbnRcbiAgICB2YXIgd2FybiA9IG9wdHMgPyBvcHRzLndhcm4gOiBudWxsXG5cbiAgICB2bm9kZSA9IGhhbmRsZVRodW5rKHZub2RlKS5hXG5cbiAgICBpZiAoaXNXaWRnZXQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiB2bm9kZS5pbml0KClcbiAgICB9IGVsc2UgaWYgKGlzVlRleHQodm5vZGUpKSB7XG4gICAgICAgIHJldHVybiBkb2MuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dClcbiAgICB9IGVsc2UgaWYgKCFpc1ZOb2RlKHZub2RlKSkge1xuICAgICAgICBpZiAod2Fybikge1xuICAgICAgICAgICAgd2FybihcIkl0ZW0gaXMgbm90IGEgdmFsaWQgdmlydHVhbCBkb20gbm9kZVwiLCB2bm9kZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cblxuICAgIHZhciBub2RlID0gKHZub2RlLm5hbWVzcGFjZSA9PT0gbnVsbCkgP1xuICAgICAgICBkb2MuY3JlYXRlRWxlbWVudCh2bm9kZS50YWdOYW1lKSA6XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50TlModm5vZGUubmFtZXNwYWNlLCB2bm9kZS50YWdOYW1lKVxuXG4gICAgdmFyIHByb3BzID0gdm5vZGUucHJvcGVydGllc1xuICAgIGFwcGx5UHJvcGVydGllcyhub2RlLCBwcm9wcylcblxuICAgIHZhciBjaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjaGlsZE5vZGUgPSBjcmVhdGVFbGVtZW50KGNoaWxkcmVuW2ldLCBvcHRzKVxuICAgICAgICBpZiAoY2hpbGROb2RlKSB7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNoaWxkTm9kZSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBub2RlXG59XG4iLCIvLyBNYXBzIGEgdmlydHVhbCBET00gdHJlZSBvbnRvIGEgcmVhbCBET00gdHJlZSBpbiBhbiBlZmZpY2llbnQgbWFubmVyLlxuLy8gV2UgZG9uJ3Qgd2FudCB0byByZWFkIGFsbCBvZiB0aGUgRE9NIG5vZGVzIGluIHRoZSB0cmVlIHNvIHdlIHVzZVxuLy8gdGhlIGluLW9yZGVyIHRyZWUgaW5kZXhpbmcgdG8gZWxpbWluYXRlIHJlY3Vyc2lvbiBkb3duIGNlcnRhaW4gYnJhbmNoZXMuXG4vLyBXZSBvbmx5IHJlY3Vyc2UgaW50byBhIERPTSBub2RlIGlmIHdlIGtub3cgdGhhdCBpdCBjb250YWlucyBhIGNoaWxkIG9mXG4vLyBpbnRlcmVzdC5cblxudmFyIG5vQ2hpbGQgPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvbUluZGV4XG5cbmZ1bmN0aW9uIGRvbUluZGV4KHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcykge1xuICAgIGlmICghaW5kaWNlcyB8fCBpbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge31cbiAgICB9IGVsc2Uge1xuICAgICAgICBpbmRpY2VzLnNvcnQoYXNjZW5kaW5nKVxuICAgICAgICByZXR1cm4gcmVjdXJzZShyb290Tm9kZSwgdHJlZSwgaW5kaWNlcywgbm9kZXMsIDApXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWN1cnNlKHJvb3ROb2RlLCB0cmVlLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KSB7XG4gICAgbm9kZXMgPSBub2RlcyB8fCB7fVxuXG5cbiAgICBpZiAocm9vdE5vZGUpIHtcbiAgICAgICAgaWYgKGluZGV4SW5SYW5nZShpbmRpY2VzLCByb290SW5kZXgsIHJvb3RJbmRleCkpIHtcbiAgICAgICAgICAgIG5vZGVzW3Jvb3RJbmRleF0gPSByb290Tm9kZVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZDaGlsZHJlbiA9IHRyZWUuY2hpbGRyZW5cblxuICAgICAgICBpZiAodkNoaWxkcmVuKSB7XG5cbiAgICAgICAgICAgIHZhciBjaGlsZE5vZGVzID0gcm9vdE5vZGUuY2hpbGROb2Rlc1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRyZWUuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICByb290SW5kZXggKz0gMVxuXG4gICAgICAgICAgICAgICAgdmFyIHZDaGlsZCA9IHZDaGlsZHJlbltpXSB8fCBub0NoaWxkXG4gICAgICAgICAgICAgICAgdmFyIG5leHRJbmRleCA9IHJvb3RJbmRleCArICh2Q2hpbGQuY291bnQgfHwgMClcblxuICAgICAgICAgICAgICAgIC8vIHNraXAgcmVjdXJzaW9uIGRvd24gdGhlIHRyZWUgaWYgdGhlcmUgYXJlIG5vIG5vZGVzIGRvd24gaGVyZVxuICAgICAgICAgICAgICAgIGlmIChpbmRleEluUmFuZ2UoaW5kaWNlcywgcm9vdEluZGV4LCBuZXh0SW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlY3Vyc2UoY2hpbGROb2Rlc1tpXSwgdkNoaWxkLCBpbmRpY2VzLCBub2Rlcywgcm9vdEluZGV4KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJvb3RJbmRleCA9IG5leHRJbmRleFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzXG59XG5cbi8vIEJpbmFyeSBzZWFyY2ggZm9yIGFuIGluZGV4IGluIHRoZSBpbnRlcnZhbCBbbGVmdCwgcmlnaHRdXG5mdW5jdGlvbiBpbmRleEluUmFuZ2UoaW5kaWNlcywgbGVmdCwgcmlnaHQpIHtcbiAgICBpZiAoaW5kaWNlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdmFyIG1pbkluZGV4ID0gMFxuICAgIHZhciBtYXhJbmRleCA9IGluZGljZXMubGVuZ3RoIC0gMVxuICAgIHZhciBjdXJyZW50SW5kZXhcbiAgICB2YXIgY3VycmVudEl0ZW1cblxuICAgIHdoaWxlIChtaW5JbmRleCA8PSBtYXhJbmRleCkge1xuICAgICAgICBjdXJyZW50SW5kZXggPSAoKG1heEluZGV4ICsgbWluSW5kZXgpIC8gMikgPj4gMFxuICAgICAgICBjdXJyZW50SXRlbSA9IGluZGljZXNbY3VycmVudEluZGV4XVxuXG4gICAgICAgIGlmIChtaW5JbmRleCA9PT0gbWF4SW5kZXgpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50SXRlbSA+PSBsZWZ0ICYmIGN1cnJlbnRJdGVtIDw9IHJpZ2h0XG4gICAgICAgIH0gZWxzZSBpZiAoY3VycmVudEl0ZW0gPCBsZWZ0KSB7XG4gICAgICAgICAgICBtaW5JbmRleCA9IGN1cnJlbnRJbmRleCArIDFcbiAgICAgICAgfSBlbHNlICBpZiAoY3VycmVudEl0ZW0gPiByaWdodCkge1xuICAgICAgICAgICAgbWF4SW5kZXggPSBjdXJyZW50SW5kZXggLSAxXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICAgIHJldHVybiBhID4gYiA/IDEgOiAtMVxufVxuIiwidmFyIGFwcGx5UHJvcGVydGllcyA9IHJlcXVpcmUoXCIuL2FwcGx5LXByb3BlcnRpZXNcIilcblxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXdpZGdldC5qc1wiKVxudmFyIFZQYXRjaCA9IHJlcXVpcmUoXCIuLi92bm9kZS92cGF0Y2guanNcIilcblxudmFyIHVwZGF0ZVdpZGdldCA9IHJlcXVpcmUoXCIuL3VwZGF0ZS13aWRnZXRcIilcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseVBhdGNoXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2godnBhdGNoLCBkb21Ob2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIHR5cGUgPSB2cGF0Y2gudHlwZVxuICAgIHZhciB2Tm9kZSA9IHZwYXRjaC52Tm9kZVxuICAgIHZhciBwYXRjaCA9IHZwYXRjaC5wYXRjaFxuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgVlBhdGNoLlJFTU9WRTpcbiAgICAgICAgICAgIHJldHVybiByZW1vdmVOb2RlKGRvbU5vZGUsIHZOb2RlKVxuICAgICAgICBjYXNlIFZQYXRjaC5JTlNFUlQ6XG4gICAgICAgICAgICByZXR1cm4gaW5zZXJ0Tm9kZShkb21Ob2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guVlRFWFQ6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nUGF0Y2goZG9tTm9kZSwgdk5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5XSURHRVQ6XG4gICAgICAgICAgICByZXR1cm4gd2lkZ2V0UGF0Y2goZG9tTm9kZSwgdk5vZGUsIHBhdGNoLCByZW5kZXJPcHRpb25zKVxuICAgICAgICBjYXNlIFZQYXRjaC5WTk9ERTpcbiAgICAgICAgICAgIHJldHVybiB2Tm9kZVBhdGNoKGRvbU5vZGUsIHZOb2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucylcbiAgICAgICAgY2FzZSBWUGF0Y2guT1JERVI6XG4gICAgICAgICAgICByZW9yZGVyQ2hpbGRyZW4oZG9tTm9kZSwgcGF0Y2gpXG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgICAgICBjYXNlIFZQYXRjaC5QUk9QUzpcbiAgICAgICAgICAgIGFwcGx5UHJvcGVydGllcyhkb21Ob2RlLCBwYXRjaCwgdk5vZGUucHJvcGVydGllcylcbiAgICAgICAgICAgIHJldHVybiBkb21Ob2RlXG4gICAgICAgIGNhc2UgVlBhdGNoLlRIVU5LOlxuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VSb290KGRvbU5vZGUsXG4gICAgICAgICAgICAgICAgcmVuZGVyT3B0aW9ucy5wYXRjaChkb21Ob2RlLCBwYXRjaCwgcmVuZGVyT3B0aW9ucykpXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gZG9tTm9kZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShkb21Ob2RlLCB2Tm9kZSkge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG5cbiAgICBpZiAocGFyZW50Tm9kZSkge1xuICAgICAgICBwYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpXG4gICAgfVxuXG4gICAgZGVzdHJveVdpZGdldChkb21Ob2RlLCB2Tm9kZSk7XG5cbiAgICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBpbnNlcnROb2RlKHBhcmVudE5vZGUsIHZOb2RlLCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXJPcHRpb25zLnJlbmRlcih2Tm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgIHBhcmVudE5vZGUuYXBwZW5kQ2hpbGQobmV3Tm9kZSlcbiAgICB9XG5cbiAgICByZXR1cm4gcGFyZW50Tm9kZVxufVxuXG5mdW5jdGlvbiBzdHJpbmdQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHZUZXh0LCByZW5kZXJPcHRpb25zKSB7XG4gICAgdmFyIG5ld05vZGVcblxuICAgIGlmIChkb21Ob2RlLm5vZGVUeXBlID09PSAzKSB7XG4gICAgICAgIGRvbU5vZGUucmVwbGFjZURhdGEoMCwgZG9tTm9kZS5sZW5ndGgsIHZUZXh0LnRleHQpXG4gICAgICAgIG5ld05vZGUgPSBkb21Ob2RlXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICAgICAgbmV3Tm9kZSA9IHJlbmRlck9wdGlvbnMucmVuZGVyKHZUZXh0LCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgIGlmIChwYXJlbnROb2RlICYmIG5ld05vZGUgIT09IGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiB3aWRnZXRQYXRjaChkb21Ob2RlLCBsZWZ0Vk5vZGUsIHdpZGdldCwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciB1cGRhdGluZyA9IHVwZGF0ZVdpZGdldChsZWZ0Vk5vZGUsIHdpZGdldClcbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKHVwZGF0aW5nKSB7XG4gICAgICAgIG5ld05vZGUgPSB3aWRnZXQudXBkYXRlKGxlZnRWTm9kZSwgZG9tTm9kZSkgfHwgZG9tTm9kZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUgPSByZW5kZXJPcHRpb25zLnJlbmRlcih3aWRnZXQsIHJlbmRlck9wdGlvbnMpXG4gICAgfVxuXG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcblxuICAgIGlmIChwYXJlbnROb2RlICYmIG5ld05vZGUgIT09IGRvbU5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSlcbiAgICB9XG5cbiAgICBpZiAoIXVwZGF0aW5nKSB7XG4gICAgICAgIGRlc3Ryb3lXaWRnZXQoZG9tTm9kZSwgbGVmdFZOb2RlKVxuICAgIH1cblxuICAgIHJldHVybiBuZXdOb2RlXG59XG5cbmZ1bmN0aW9uIHZOb2RlUGF0Y2goZG9tTm9kZSwgbGVmdFZOb2RlLCB2Tm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIG5ld05vZGUgPSByZW5kZXJPcHRpb25zLnJlbmRlcih2Tm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgIGlmIChwYXJlbnROb2RlICYmIG5ld05vZGUgIT09IGRvbU5vZGUpIHtcbiAgICAgICAgcGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSlcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3Tm9kZVxufVxuXG5mdW5jdGlvbiBkZXN0cm95V2lkZ2V0KGRvbU5vZGUsIHcpIHtcbiAgICBpZiAodHlwZW9mIHcuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiICYmIGlzV2lkZ2V0KHcpKSB7XG4gICAgICAgIHcuZGVzdHJveShkb21Ob2RlKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVvcmRlckNoaWxkcmVuKGRvbU5vZGUsIG1vdmVzKSB7XG4gICAgdmFyIGNoaWxkTm9kZXMgPSBkb21Ob2RlLmNoaWxkTm9kZXNcbiAgICB2YXIga2V5TWFwID0ge31cbiAgICB2YXIgbm9kZVxuICAgIHZhciByZW1vdmVcbiAgICB2YXIgaW5zZXJ0XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG1vdmVzLnJlbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVtb3ZlID0gbW92ZXMucmVtb3Zlc1tpXVxuICAgICAgICBub2RlID0gY2hpbGROb2Rlc1tyZW1vdmUuZnJvbV1cbiAgICAgICAgaWYgKHJlbW92ZS5rZXkpIHtcbiAgICAgICAgICAgIGtleU1hcFtyZW1vdmUua2V5XSA9IG5vZGVcbiAgICAgICAgfVxuICAgICAgICBkb21Ob2RlLnJlbW92ZUNoaWxkKG5vZGUpXG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IGNoaWxkTm9kZXMubGVuZ3RoXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBtb3Zlcy5pbnNlcnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGluc2VydCA9IG1vdmVzLmluc2VydHNbal1cbiAgICAgICAgbm9kZSA9IGtleU1hcFtpbnNlcnQua2V5XVxuICAgICAgICAvLyB0aGlzIGlzIHRoZSB3ZWlyZGVzdCBidWcgaSd2ZSBldmVyIHNlZW4gaW4gd2Via2l0XG4gICAgICAgIGRvbU5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGluc2VydC50byA+PSBsZW5ndGgrKyA/IG51bGwgOiBjaGlsZE5vZGVzW2luc2VydC50b10pXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXBsYWNlUm9vdChvbGRSb290LCBuZXdSb290KSB7XG4gICAgaWYgKG9sZFJvb3QgJiYgbmV3Um9vdCAmJiBvbGRSb290ICE9PSBuZXdSb290ICYmIG9sZFJvb3QucGFyZW50Tm9kZSkge1xuICAgICAgICBvbGRSb290LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld1Jvb3QsIG9sZFJvb3QpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld1Jvb3Q7XG59XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKFwiZ2xvYmFsL2RvY3VtZW50XCIpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoXCJ4LWlzLWFycmF5XCIpXG5cbnZhciByZW5kZXIgPSByZXF1aXJlKFwiLi9jcmVhdGUtZWxlbWVudFwiKVxudmFyIGRvbUluZGV4ID0gcmVxdWlyZShcIi4vZG9tLWluZGV4XCIpXG52YXIgcGF0Y2hPcCA9IHJlcXVpcmUoXCIuL3BhdGNoLW9wXCIpXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGNoXG5cbmZ1bmN0aW9uIHBhdGNoKHJvb3ROb2RlLCBwYXRjaGVzLCByZW5kZXJPcHRpb25zKSB7XG4gICAgcmVuZGVyT3B0aW9ucyA9IHJlbmRlck9wdGlvbnMgfHwge31cbiAgICByZW5kZXJPcHRpb25zLnBhdGNoID0gcmVuZGVyT3B0aW9ucy5wYXRjaCAmJiByZW5kZXJPcHRpb25zLnBhdGNoICE9PSBwYXRjaFxuICAgICAgICA/IHJlbmRlck9wdGlvbnMucGF0Y2hcbiAgICAgICAgOiBwYXRjaFJlY3Vyc2l2ZVxuICAgIHJlbmRlck9wdGlvbnMucmVuZGVyID0gcmVuZGVyT3B0aW9ucy5yZW5kZXIgfHwgcmVuZGVyXG5cbiAgICByZXR1cm4gcmVuZGVyT3B0aW9ucy5wYXRjaChyb290Tm9kZSwgcGF0Y2hlcywgcmVuZGVyT3B0aW9ucylcbn1cblxuZnVuY3Rpb24gcGF0Y2hSZWN1cnNpdmUocm9vdE5vZGUsIHBhdGNoZXMsIHJlbmRlck9wdGlvbnMpIHtcbiAgICB2YXIgaW5kaWNlcyA9IHBhdGNoSW5kaWNlcyhwYXRjaGVzKVxuXG4gICAgaWYgKGluZGljZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiByb290Tm9kZVxuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGRvbUluZGV4KHJvb3ROb2RlLCBwYXRjaGVzLmEsIGluZGljZXMpXG4gICAgdmFyIG93bmVyRG9jdW1lbnQgPSByb290Tm9kZS5vd25lckRvY3VtZW50XG5cbiAgICBpZiAoIXJlbmRlck9wdGlvbnMuZG9jdW1lbnQgJiYgb3duZXJEb2N1bWVudCAhPT0gZG9jdW1lbnQpIHtcbiAgICAgICAgcmVuZGVyT3B0aW9ucy5kb2N1bWVudCA9IG93bmVyRG9jdW1lbnRcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZGljZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5vZGVJbmRleCA9IGluZGljZXNbaV1cbiAgICAgICAgcm9vdE5vZGUgPSBhcHBseVBhdGNoKHJvb3ROb2RlLFxuICAgICAgICAgICAgaW5kZXhbbm9kZUluZGV4XSxcbiAgICAgICAgICAgIHBhdGNoZXNbbm9kZUluZGV4XSxcbiAgICAgICAgICAgIHJlbmRlck9wdGlvbnMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3ROb2RlXG59XG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2gocm9vdE5vZGUsIGRvbU5vZGUsIHBhdGNoTGlzdCwgcmVuZGVyT3B0aW9ucykge1xuICAgIGlmICghZG9tTm9kZSkge1xuICAgICAgICByZXR1cm4gcm9vdE5vZGVcbiAgICB9XG5cbiAgICB2YXIgbmV3Tm9kZVxuXG4gICAgaWYgKGlzQXJyYXkocGF0Y2hMaXN0KSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGNoTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbmV3Tm9kZSA9IHBhdGNoT3AocGF0Y2hMaXN0W2ldLCBkb21Ob2RlLCByZW5kZXJPcHRpb25zKVxuXG4gICAgICAgICAgICBpZiAoZG9tTm9kZSA9PT0gcm9vdE5vZGUpIHtcbiAgICAgICAgICAgICAgICByb290Tm9kZSA9IG5ld05vZGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld05vZGUgPSBwYXRjaE9wKHBhdGNoTGlzdCwgZG9tTm9kZSwgcmVuZGVyT3B0aW9ucylcblxuICAgICAgICBpZiAoZG9tTm9kZSA9PT0gcm9vdE5vZGUpIHtcbiAgICAgICAgICAgIHJvb3ROb2RlID0gbmV3Tm9kZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb3ROb2RlXG59XG5cbmZ1bmN0aW9uIHBhdGNoSW5kaWNlcyhwYXRjaGVzKSB7XG4gICAgdmFyIGluZGljZXMgPSBbXVxuXG4gICAgZm9yICh2YXIga2V5IGluIHBhdGNoZXMpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIGluZGljZXMucHVzaChOdW1iZXIoa2V5KSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbmRpY2VzXG59XG4iLCJ2YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0LmpzXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gdXBkYXRlV2lkZ2V0XG5cbmZ1bmN0aW9uIHVwZGF0ZVdpZGdldChhLCBiKSB7XG4gICAgaWYgKGlzV2lkZ2V0KGEpICYmIGlzV2lkZ2V0KGIpKSB7XG4gICAgICAgIGlmIChcIm5hbWVcIiBpbiBhICYmIFwibmFtZVwiIGluIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLmlkID09PSBiLmlkXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYS5pbml0ID09PSBiLmluaXRcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dHJpYnV0ZUhvb2s7XG5cbmZ1bmN0aW9uIEF0dHJpYnV0ZUhvb2sobmFtZXNwYWNlLCB2YWx1ZSkge1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBBdHRyaWJ1dGVIb29rKSkge1xuICAgICAgICByZXR1cm4gbmV3IEF0dHJpYnV0ZUhvb2sobmFtZXNwYWNlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5BdHRyaWJ1dGVIb29rLnByb3RvdHlwZS5ob29rID0gZnVuY3Rpb24gKG5vZGUsIHByb3AsIHByZXYpIHtcbiAgICBpZiAocHJldiAmJiBwcmV2LnR5cGUgPT09ICdBdHRyaWJ1dGVIb29rJyAmJlxuICAgICAgICBwcmV2LnZhbHVlID09PSB0aGlzLnZhbHVlICYmXG4gICAgICAgIHByZXYubmFtZXNwYWNlID09PSB0aGlzLm5hbWVzcGFjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUyh0aGlzLm5hbWVzcGFjZSwgcHJvcCwgdGhpcy52YWx1ZSk7XG59O1xuXG5BdHRyaWJ1dGVIb29rLnByb3RvdHlwZS51bmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcCwgbmV4dCkge1xuICAgIGlmIChuZXh0ICYmIG5leHQudHlwZSA9PT0gJ0F0dHJpYnV0ZUhvb2snICYmXG4gICAgICAgIG5leHQubmFtZXNwYWNlID09PSB0aGlzLm5hbWVzcGFjZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNvbG9uUG9zaXRpb24gPSBwcm9wLmluZGV4T2YoJzonKTtcbiAgICB2YXIgbG9jYWxOYW1lID0gY29sb25Qb3NpdGlvbiA+IC0xID8gcHJvcC5zdWJzdHIoY29sb25Qb3NpdGlvbiArIDEpIDogcHJvcDtcbiAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZU5TKHRoaXMubmFtZXNwYWNlLCBsb2NhbE5hbWUpO1xufTtcblxuQXR0cmlidXRlSG9vay5wcm90b3R5cGUudHlwZSA9ICdBdHRyaWJ1dGVIb29rJztcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBTb2Z0U2V0SG9vaztcblxuZnVuY3Rpb24gU29mdFNldEhvb2sodmFsdWUpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU29mdFNldEhvb2spKSB7XG4gICAgICAgIHJldHVybiBuZXcgU29mdFNldEhvb2sodmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuU29mdFNldEhvb2sucHJvdG90eXBlLmhvb2sgPSBmdW5jdGlvbiAobm9kZSwgcHJvcGVydHlOYW1lKSB7XG4gICAgaWYgKG5vZGVbcHJvcGVydHlOYW1lXSAhPT0gdGhpcy52YWx1ZSkge1xuICAgICAgICBub2RlW3Byb3BlcnR5TmFtZV0gPSB0aGlzLnZhbHVlO1xuICAgIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBzcGxpdCA9IHJlcXVpcmUoJ2Jyb3dzZXItc3BsaXQnKTtcblxudmFyIGNsYXNzSWRTcGxpdCA9IC8oW1xcLiNdP1thLXpBLVowLTlcXHUwMDdGLVxcdUZGRkZfOi1dKykvO1xudmFyIG5vdENsYXNzSWQgPSAvXlxcLnwjLztcblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVRhZztcblxuZnVuY3Rpb24gcGFyc2VUYWcodGFnLCBwcm9wcykge1xuICAgIGlmICghdGFnKSB7XG4gICAgICAgIHJldHVybiAnRElWJztcbiAgICB9XG5cbiAgICB2YXIgbm9JZCA9ICEocHJvcHMuaGFzT3duUHJvcGVydHkoJ2lkJykpO1xuXG4gICAgdmFyIHRhZ1BhcnRzID0gc3BsaXQodGFnLCBjbGFzc0lkU3BsaXQpO1xuICAgIHZhciB0YWdOYW1lID0gbnVsbDtcblxuICAgIGlmIChub3RDbGFzc0lkLnRlc3QodGFnUGFydHNbMV0pKSB7XG4gICAgICAgIHRhZ05hbWUgPSAnRElWJztcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NlcywgcGFydCwgdHlwZSwgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCB0YWdQYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJ0ID0gdGFnUGFydHNbaV07XG5cbiAgICAgICAgaWYgKCFwYXJ0KSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHR5cGUgPSBwYXJ0LmNoYXJBdCgwKTtcblxuICAgICAgICBpZiAoIXRhZ05hbWUpIHtcbiAgICAgICAgICAgIHRhZ05hbWUgPSBwYXJ0O1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcuJykge1xuICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMgfHwgW107XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2gocGFydC5zdWJzdHJpbmcoMSwgcGFydC5sZW5ndGgpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnIycgJiYgbm9JZCkge1xuICAgICAgICAgICAgcHJvcHMuaWQgPSBwYXJ0LnN1YnN0cmluZygxLCBwYXJ0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xhc3Nlcykge1xuICAgICAgICBpZiAocHJvcHMuY2xhc3NOYW1lKSB7XG4gICAgICAgICAgICBjbGFzc2VzLnB1c2gocHJvcHMuY2xhc3NOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb3BzLmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbignICcpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9wcy5uYW1lc3BhY2UgPyB0YWdOYW1lIDogdGFnTmFtZS50b1VwcGVyQ2FzZSgpO1xufVxuIiwidmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzVlRleHQgPSByZXF1aXJlKFwiLi9pcy12dGV4dFwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuL2lzLXRodW5rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaGFuZGxlVGh1bmtcblxuZnVuY3Rpb24gaGFuZGxlVGh1bmsoYSwgYikge1xuICAgIHZhciByZW5kZXJlZEEgPSBhXG4gICAgdmFyIHJlbmRlcmVkQiA9IGJcblxuICAgIGlmIChpc1RodW5rKGIpKSB7XG4gICAgICAgIHJlbmRlcmVkQiA9IHJlbmRlclRodW5rKGIsIGEpXG4gICAgfVxuXG4gICAgaWYgKGlzVGh1bmsoYSkpIHtcbiAgICAgICAgcmVuZGVyZWRBID0gcmVuZGVyVGh1bmsoYSwgbnVsbClcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhOiByZW5kZXJlZEEsXG4gICAgICAgIGI6IHJlbmRlcmVkQlxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyVGh1bmsodGh1bmssIHByZXZpb3VzKSB7XG4gICAgdmFyIHJlbmRlcmVkVGh1bmsgPSB0aHVuay52bm9kZVxuXG4gICAgaWYgKCFyZW5kZXJlZFRodW5rKSB7XG4gICAgICAgIHJlbmRlcmVkVGh1bmsgPSB0aHVuay52bm9kZSA9IHRodW5rLnJlbmRlcihwcmV2aW91cylcbiAgICB9XG5cbiAgICBpZiAoIShpc1ZOb2RlKHJlbmRlcmVkVGh1bmspIHx8XG4gICAgICAgICAgICBpc1ZUZXh0KHJlbmRlcmVkVGh1bmspIHx8XG4gICAgICAgICAgICBpc1dpZGdldChyZW5kZXJlZFRodW5rKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGh1bmsgZGlkIG5vdCByZXR1cm4gYSB2YWxpZCBub2RlXCIpO1xuICAgIH1cblxuICAgIHJldHVybiByZW5kZXJlZFRodW5rXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzVGh1bmtcclxuXHJcbmZ1bmN0aW9uIGlzVGh1bmsodCkge1xyXG4gICAgcmV0dXJuIHQgJiYgdC50eXBlID09PSBcIlRodW5rXCJcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzSG9va1xuXG5mdW5jdGlvbiBpc0hvb2soaG9vaykge1xuICAgIHJldHVybiBob29rICYmXG4gICAgICAodHlwZW9mIGhvb2suaG9vayA9PT0gXCJmdW5jdGlvblwiICYmICFob29rLmhhc093blByb3BlcnR5KFwiaG9va1wiKSB8fFxuICAgICAgIHR5cGVvZiBob29rLnVuaG9vayA9PT0gXCJmdW5jdGlvblwiICYmICFob29rLmhhc093blByb3BlcnR5KFwidW5ob29rXCIpKVxufVxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gaXNWaXJ0dWFsTm9kZVxuXG5mdW5jdGlvbiBpc1ZpcnR1YWxOb2RlKHgpIHtcbiAgICByZXR1cm4geCAmJiB4LnR5cGUgPT09IFwiVmlydHVhbE5vZGVcIiAmJiB4LnZlcnNpb24gPT09IHZlcnNpb25cbn1cbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVmlydHVhbFRleHRcblxuZnVuY3Rpb24gaXNWaXJ0dWFsVGV4dCh4KSB7XG4gICAgcmV0dXJuIHggJiYgeC50eXBlID09PSBcIlZpcnR1YWxUZXh0XCIgJiYgeC52ZXJzaW9uID09PSB2ZXJzaW9uXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGlzV2lkZ2V0XG5cbmZ1bmN0aW9uIGlzV2lkZ2V0KHcpIHtcbiAgICByZXR1cm4gdyAmJiB3LnR5cGUgPT09IFwiV2lkZ2V0XCJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gXCIyXCJcbiIsInZhciB2ZXJzaW9uID0gcmVxdWlyZShcIi4vdmVyc2lvblwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi9pcy12bm9kZVwiKVxudmFyIGlzV2lkZ2V0ID0gcmVxdWlyZShcIi4vaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuL2lzLXRodW5rXCIpXG52YXIgaXNWSG9vayA9IHJlcXVpcmUoXCIuL2lzLXZob29rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbE5vZGVcblxudmFyIG5vUHJvcGVydGllcyA9IHt9XG52YXIgbm9DaGlsZHJlbiA9IFtdXG5cbmZ1bmN0aW9uIFZpcnR1YWxOb2RlKHRhZ05hbWUsIHByb3BlcnRpZXMsIGNoaWxkcmVuLCBrZXksIG5hbWVzcGFjZSkge1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWVcbiAgICB0aGlzLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzIHx8IG5vUHJvcGVydGllc1xuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbiB8fCBub0NoaWxkcmVuXG4gICAgdGhpcy5rZXkgPSBrZXkgIT0gbnVsbCA/IFN0cmluZyhrZXkpIDogdW5kZWZpbmVkXG4gICAgdGhpcy5uYW1lc3BhY2UgPSAodHlwZW9mIG5hbWVzcGFjZSA9PT0gXCJzdHJpbmdcIikgPyBuYW1lc3BhY2UgOiBudWxsXG5cbiAgICB2YXIgY291bnQgPSAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB8fCAwXG4gICAgdmFyIGRlc2NlbmRhbnRzID0gMFxuICAgIHZhciBoYXNXaWRnZXRzID0gZmFsc2VcbiAgICB2YXIgaGFzVGh1bmtzID0gZmFsc2VcbiAgICB2YXIgZGVzY2VuZGFudEhvb2tzID0gZmFsc2VcbiAgICB2YXIgaG9va3NcblxuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHByb3BlcnRpZXMpIHtcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkocHJvcE5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBwcm9wZXJ0aWVzW3Byb3BOYW1lXVxuICAgICAgICAgICAgaWYgKGlzVkhvb2socHJvcGVydHkpICYmIHByb3BlcnR5LnVuaG9vaykge1xuICAgICAgICAgICAgICAgIGlmICghaG9va3MpIHtcbiAgICAgICAgICAgICAgICAgICAgaG9va3MgPSB7fVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhvb2tzW3Byb3BOYW1lXSA9IHByb3BlcnR5XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICAgICAgaWYgKGlzVk5vZGUoY2hpbGQpKSB7XG4gICAgICAgICAgICBkZXNjZW5kYW50cyArPSBjaGlsZC5jb3VudCB8fCAwXG5cbiAgICAgICAgICAgIGlmICghaGFzV2lkZ2V0cyAmJiBjaGlsZC5oYXNXaWRnZXRzKSB7XG4gICAgICAgICAgICAgICAgaGFzV2lkZ2V0cyA9IHRydWVcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFoYXNUaHVua3MgJiYgY2hpbGQuaGFzVGh1bmtzKSB7XG4gICAgICAgICAgICAgICAgaGFzVGh1bmtzID0gdHJ1ZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWRlc2NlbmRhbnRIb29rcyAmJiAoY2hpbGQuaG9va3MgfHwgY2hpbGQuZGVzY2VuZGFudEhvb2tzKSkge1xuICAgICAgICAgICAgICAgIGRlc2NlbmRhbnRIb29rcyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFzV2lkZ2V0cyAmJiBpc1dpZGdldChjaGlsZCkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGQuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgaGFzV2lkZ2V0cyA9IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaGFzVGh1bmtzICYmIGlzVGh1bmsoY2hpbGQpKSB7XG4gICAgICAgICAgICBoYXNUaHVua3MgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb3VudCA9IGNvdW50ICsgZGVzY2VuZGFudHNcbiAgICB0aGlzLmhhc1dpZGdldHMgPSBoYXNXaWRnZXRzXG4gICAgdGhpcy5oYXNUaHVua3MgPSBoYXNUaHVua3NcbiAgICB0aGlzLmhvb2tzID0gaG9va3NcbiAgICB0aGlzLmRlc2NlbmRhbnRIb29rcyA9IGRlc2NlbmRhbnRIb29rc1xufVxuXG5WaXJ0dWFsTm9kZS5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxOb2RlLnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsTm9kZVwiXG4iLCJ2YXIgdmVyc2lvbiA9IHJlcXVpcmUoXCIuL3ZlcnNpb25cIilcblxuVmlydHVhbFBhdGNoLk5PTkUgPSAwXG5WaXJ0dWFsUGF0Y2guVlRFWFQgPSAxXG5WaXJ0dWFsUGF0Y2guVk5PREUgPSAyXG5WaXJ0dWFsUGF0Y2guV0lER0VUID0gM1xuVmlydHVhbFBhdGNoLlBST1BTID0gNFxuVmlydHVhbFBhdGNoLk9SREVSID0gNVxuVmlydHVhbFBhdGNoLklOU0VSVCA9IDZcblZpcnR1YWxQYXRjaC5SRU1PVkUgPSA3XG5WaXJ0dWFsUGF0Y2guVEhVTksgPSA4XG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFBhdGNoXG5cbmZ1bmN0aW9uIFZpcnR1YWxQYXRjaCh0eXBlLCB2Tm9kZSwgcGF0Y2gpIHtcbiAgICB0aGlzLnR5cGUgPSBOdW1iZXIodHlwZSlcbiAgICB0aGlzLnZOb2RlID0gdk5vZGVcbiAgICB0aGlzLnBhdGNoID0gcGF0Y2hcbn1cblxuVmlydHVhbFBhdGNoLnByb3RvdHlwZS52ZXJzaW9uID0gdmVyc2lvblxuVmlydHVhbFBhdGNoLnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsUGF0Y2hcIlxuIiwidmFyIHZlcnNpb24gPSByZXF1aXJlKFwiLi92ZXJzaW9uXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gVmlydHVhbFRleHRcblxuZnVuY3Rpb24gVmlydHVhbFRleHQodGV4dCkge1xuICAgIHRoaXMudGV4dCA9IFN0cmluZyh0ZXh0KVxufVxuXG5WaXJ0dWFsVGV4dC5wcm90b3R5cGUudmVyc2lvbiA9IHZlcnNpb25cblZpcnR1YWxUZXh0LnByb3RvdHlwZS50eXBlID0gXCJWaXJ0dWFsVGV4dFwiXG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKFwiaXMtb2JqZWN0XCIpXG52YXIgaXNIb29rID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZob29rXCIpXG5cbm1vZHVsZS5leHBvcnRzID0gZGlmZlByb3BzXG5cbmZ1bmN0aW9uIGRpZmZQcm9wcyhhLCBiKSB7XG4gICAgdmFyIGRpZmZcblxuICAgIGZvciAodmFyIGFLZXkgaW4gYSkge1xuICAgICAgICBpZiAoIShhS2V5IGluIGIpKSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IHVuZGVmaW5lZFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFWYWx1ZSA9IGFbYUtleV1cbiAgICAgICAgdmFyIGJWYWx1ZSA9IGJbYUtleV1cblxuICAgICAgICBpZiAoYVZhbHVlID09PSBiVmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoYVZhbHVlKSAmJiBpc09iamVjdChiVmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoZ2V0UHJvdG90eXBlKGJWYWx1ZSkgIT09IGdldFByb3RvdHlwZShhVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICBkaWZmW2FLZXldID0gYlZhbHVlXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzSG9vayhiVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICAgICAgIGRpZmZbYUtleV0gPSBiVmFsdWVcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iamVjdERpZmYgPSBkaWZmUHJvcHMoYVZhbHVlLCBiVmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgKG9iamVjdERpZmYpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlmZiA9IGRpZmYgfHwge31cbiAgICAgICAgICAgICAgICAgICAgZGlmZlthS2V5XSA9IG9iamVjdERpZmZcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkaWZmID0gZGlmZiB8fCB7fVxuICAgICAgICAgICAgZGlmZlthS2V5XSA9IGJWYWx1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgYktleSBpbiBiKSB7XG4gICAgICAgIGlmICghKGJLZXkgaW4gYSkpIHtcbiAgICAgICAgICAgIGRpZmYgPSBkaWZmIHx8IHt9XG4gICAgICAgICAgICBkaWZmW2JLZXldID0gYltiS2V5XVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpZmZcbn1cblxuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHtcbiAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbHVlKVxuICB9IGVsc2UgaWYgKHZhbHVlLl9fcHJvdG9fXykge1xuICAgIHJldHVybiB2YWx1ZS5fX3Byb3RvX19cbiAgfSBlbHNlIGlmICh2YWx1ZS5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcbiAgfVxufVxuIiwidmFyIGlzQXJyYXkgPSByZXF1aXJlKFwieC1pcy1hcnJheVwiKVxuXG52YXIgVlBhdGNoID0gcmVxdWlyZShcIi4uL3Zub2RlL3ZwYXRjaFwiKVxudmFyIGlzVk5vZGUgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtdm5vZGVcIilcbnZhciBpc1ZUZXh0ID0gcmVxdWlyZShcIi4uL3Zub2RlL2lzLXZ0ZXh0XCIpXG52YXIgaXNXaWRnZXQgPSByZXF1aXJlKFwiLi4vdm5vZGUvaXMtd2lkZ2V0XCIpXG52YXIgaXNUaHVuayA9IHJlcXVpcmUoXCIuLi92bm9kZS9pcy10aHVua1wiKVxudmFyIGhhbmRsZVRodW5rID0gcmVxdWlyZShcIi4uL3Zub2RlL2hhbmRsZS10aHVua1wiKVxuXG52YXIgZGlmZlByb3BzID0gcmVxdWlyZShcIi4vZGlmZi1wcm9wc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZmZcblxuZnVuY3Rpb24gZGlmZihhLCBiKSB7XG4gICAgdmFyIHBhdGNoID0geyBhOiBhIH1cbiAgICB3YWxrKGEsIGIsIHBhdGNoLCAwKVxuICAgIHJldHVybiBwYXRjaFxufVxuXG5mdW5jdGlvbiB3YWxrKGEsIGIsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChhID09PSBiKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBhcHBseSA9IHBhdGNoW2luZGV4XVxuICAgIHZhciBhcHBseUNsZWFyID0gZmFsc2VcblxuICAgIGlmIChpc1RodW5rKGEpIHx8IGlzVGh1bmsoYikpIHtcbiAgICAgICAgdGh1bmtzKGEsIGIsIHBhdGNoLCBpbmRleClcbiAgICB9IGVsc2UgaWYgKGIgPT0gbnVsbCkge1xuXG4gICAgICAgIC8vIElmIGEgaXMgYSB3aWRnZXQgd2Ugd2lsbCBhZGQgYSByZW1vdmUgcGF0Y2ggZm9yIGl0XG4gICAgICAgIC8vIE90aGVyd2lzZSBhbnkgY2hpbGQgd2lkZ2V0cy9ob29rcyBtdXN0IGJlIGRlc3Ryb3llZC5cbiAgICAgICAgLy8gVGhpcyBwcmV2ZW50cyBhZGRpbmcgdHdvIHJlbW92ZSBwYXRjaGVzIGZvciBhIHdpZGdldC5cbiAgICAgICAgaWYgKCFpc1dpZGdldChhKSkge1xuICAgICAgICAgICAgY2xlYXJTdGF0ZShhLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgICAgICBhcHBseSA9IHBhdGNoW2luZGV4XVxuICAgICAgICB9XG5cbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guUkVNT1ZFLCBhLCBiKSlcbiAgICB9IGVsc2UgaWYgKGlzVk5vZGUoYikpIHtcbiAgICAgICAgaWYgKGlzVk5vZGUoYSkpIHtcbiAgICAgICAgICAgIGlmIChhLnRhZ05hbWUgPT09IGIudGFnTmFtZSAmJlxuICAgICAgICAgICAgICAgIGEubmFtZXNwYWNlID09PSBiLm5hbWVzcGFjZSAmJlxuICAgICAgICAgICAgICAgIGEua2V5ID09PSBiLmtleSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm9wc1BhdGNoID0gZGlmZlByb3BzKGEucHJvcGVydGllcywgYi5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgICAgIGlmIChwcm9wc1BhdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFZQYXRjaC5QUk9QUywgYSwgcHJvcHNQYXRjaCkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFwcGx5ID0gZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoLCBhcHBseSwgaW5kZXgpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZOT0RFLCBhLCBiKSlcbiAgICAgICAgICAgICAgICBhcHBseUNsZWFyID0gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChWUGF0Y2guVk5PREUsIGEsIGIpKVxuICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWVcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWVGV4dChiKSkge1xuICAgICAgICBpZiAoIWlzVlRleHQoYSkpIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZURVhULCBhLCBiKSlcbiAgICAgICAgICAgIGFwcGx5Q2xlYXIgPSB0cnVlXG4gICAgICAgIH0gZWxzZSBpZiAoYS50ZXh0ICE9PSBiLnRleHQpIHtcbiAgICAgICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLlZURVhULCBhLCBiKSlcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNXaWRnZXQoYikpIHtcbiAgICAgICAgaWYgKCFpc1dpZGdldChhKSkge1xuICAgICAgICAgICAgYXBwbHlDbGVhciA9IHRydWVcbiAgICAgICAgfVxuXG4gICAgICAgIGFwcGx5ID0gYXBwZW5kUGF0Y2goYXBwbHksIG5ldyBWUGF0Y2goVlBhdGNoLldJREdFVCwgYSwgYikpXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGx5XG4gICAgfVxuXG4gICAgaWYgKGFwcGx5Q2xlYXIpIHtcbiAgICAgICAgY2xlYXJTdGF0ZShhLCBwYXRjaCwgaW5kZXgpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaWZmQ2hpbGRyZW4oYSwgYiwgcGF0Y2gsIGFwcGx5LCBpbmRleCkge1xuICAgIHZhciBhQ2hpbGRyZW4gPSBhLmNoaWxkcmVuXG4gICAgdmFyIG9yZGVyZWRTZXQgPSByZW9yZGVyKGFDaGlsZHJlbiwgYi5jaGlsZHJlbilcbiAgICB2YXIgYkNoaWxkcmVuID0gb3JkZXJlZFNldC5jaGlsZHJlblxuXG4gICAgdmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoXG4gICAgdmFyIGxlbiA9IGFMZW4gPiBiTGVuID8gYUxlbiA6IGJMZW5cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFyIGxlZnROb2RlID0gYUNoaWxkcmVuW2ldXG4gICAgICAgIHZhciByaWdodE5vZGUgPSBiQ2hpbGRyZW5baV1cbiAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgIGlmICghbGVmdE5vZGUpIHtcbiAgICAgICAgICAgIGlmIChyaWdodE5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBFeGNlc3Mgbm9kZXMgaW4gYiBuZWVkIHRvIGJlIGFkZGVkXG4gICAgICAgICAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZQYXRjaChWUGF0Y2guSU5TRVJULCBudWxsLCByaWdodE5vZGUpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FsayhsZWZ0Tm9kZSwgcmlnaHROb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNWTm9kZShsZWZ0Tm9kZSkgJiYgbGVmdE5vZGUuY291bnQpIHtcbiAgICAgICAgICAgIGluZGV4ICs9IGxlZnROb2RlLmNvdW50XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3JkZXJlZFNldC5tb3Zlcykge1xuICAgICAgICAvLyBSZW9yZGVyIG5vZGVzIGxhc3RcbiAgICAgICAgYXBwbHkgPSBhcHBlbmRQYXRjaChhcHBseSwgbmV3IFZQYXRjaChcbiAgICAgICAgICAgIFZQYXRjaC5PUkRFUixcbiAgICAgICAgICAgIGEsXG4gICAgICAgICAgICBvcmRlcmVkU2V0Lm1vdmVzXG4gICAgICAgICkpXG4gICAgfVxuXG4gICAgcmV0dXJuIGFwcGx5XG59XG5cbmZ1bmN0aW9uIGNsZWFyU3RhdGUodk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIC8vIFRPRE86IE1ha2UgdGhpcyBhIHNpbmdsZSB3YWxrLCBub3QgdHdvXG4gICAgdW5ob29rKHZOb2RlLCBwYXRjaCwgaW5kZXgpXG4gICAgZGVzdHJveVdpZGdldHModk5vZGUsIHBhdGNoLCBpbmRleClcbn1cblxuLy8gUGF0Y2ggcmVjb3JkcyBmb3IgYWxsIGRlc3Ryb3llZCB3aWRnZXRzIG11c3QgYmUgYWRkZWQgYmVjYXVzZSB3ZSBuZWVkXG4vLyBhIERPTSBub2RlIHJlZmVyZW5jZSBmb3IgdGhlIGRlc3Ryb3kgZnVuY3Rpb25cbmZ1bmN0aW9uIGRlc3Ryb3lXaWRnZXRzKHZOb2RlLCBwYXRjaCwgaW5kZXgpIHtcbiAgICBpZiAoaXNXaWRnZXQodk5vZGUpKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygdk5vZGUuZGVzdHJveSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICBwYXRjaFtpbmRleF0gPSBhcHBlbmRQYXRjaChcbiAgICAgICAgICAgICAgICBwYXRjaFtpbmRleF0sXG4gICAgICAgICAgICAgICAgbmV3IFZQYXRjaChWUGF0Y2guUkVNT1ZFLCB2Tm9kZSwgbnVsbClcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNWTm9kZSh2Tm9kZSkgJiYgKHZOb2RlLmhhc1dpZGdldHMgfHwgdk5vZGUuaGFzVGh1bmtzKSkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlblxuICAgICAgICB2YXIgbGVuID0gY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICBpbmRleCArPSAxXG5cbiAgICAgICAgICAgIGRlc3Ryb3lXaWRnZXRzKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgIGlmIChpc1ZOb2RlKGNoaWxkKSAmJiBjaGlsZC5jb3VudCkge1xuICAgICAgICAgICAgICAgIGluZGV4ICs9IGNoaWxkLmNvdW50XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVGh1bmsodk5vZGUpKSB7XG4gICAgICAgIHRodW5rcyh2Tm9kZSwgbnVsbCwgcGF0Y2gsIGluZGV4KVxuICAgIH1cbn1cblxuLy8gQ3JlYXRlIGEgc3ViLXBhdGNoIGZvciB0aHVua3NcbmZ1bmN0aW9uIHRodW5rcyhhLCBiLCBwYXRjaCwgaW5kZXgpIHtcbiAgICB2YXIgbm9kZXMgPSBoYW5kbGVUaHVuayhhLCBiKVxuICAgIHZhciB0aHVua1BhdGNoID0gZGlmZihub2Rlcy5hLCBub2Rlcy5iKVxuICAgIGlmIChoYXNQYXRjaGVzKHRodW5rUGF0Y2gpKSB7XG4gICAgICAgIHBhdGNoW2luZGV4XSA9IG5ldyBWUGF0Y2goVlBhdGNoLlRIVU5LLCBudWxsLCB0aHVua1BhdGNoKVxuICAgIH1cbn1cblxuZnVuY3Rpb24gaGFzUGF0Y2hlcyhwYXRjaCkge1xuICAgIGZvciAodmFyIGluZGV4IGluIHBhdGNoKSB7XG4gICAgICAgIGlmIChpbmRleCAhPT0gXCJhXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2Vcbn1cblxuLy8gRXhlY3V0ZSBob29rcyB3aGVuIHR3byBub2RlcyBhcmUgaWRlbnRpY2FsXG5mdW5jdGlvbiB1bmhvb2sodk5vZGUsIHBhdGNoLCBpbmRleCkge1xuICAgIGlmIChpc1ZOb2RlKHZOb2RlKSkge1xuICAgICAgICBpZiAodk5vZGUuaG9va3MpIHtcbiAgICAgICAgICAgIHBhdGNoW2luZGV4XSA9IGFwcGVuZFBhdGNoKFxuICAgICAgICAgICAgICAgIHBhdGNoW2luZGV4XSxcbiAgICAgICAgICAgICAgICBuZXcgVlBhdGNoKFxuICAgICAgICAgICAgICAgICAgICBWUGF0Y2guUFJPUFMsXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlLFxuICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWRLZXlzKHZOb2RlLmhvb2tzKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2Tm9kZS5kZXNjZW5kYW50SG9va3MgfHwgdk5vZGUuaGFzVGh1bmtzKSB7XG4gICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlblxuICAgICAgICAgICAgdmFyIGxlbiA9IGNoaWxkcmVuLmxlbmd0aFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMVxuXG4gICAgICAgICAgICAgICAgdW5ob29rKGNoaWxkLCBwYXRjaCwgaW5kZXgpXG5cbiAgICAgICAgICAgICAgICBpZiAoaXNWTm9kZShjaGlsZCkgJiYgY2hpbGQuY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gY2hpbGQuY291bnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGlzVGh1bmsodk5vZGUpKSB7XG4gICAgICAgIHRodW5rcyh2Tm9kZSwgbnVsbCwgcGF0Y2gsIGluZGV4KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gdW5kZWZpbmVkS2V5cyhvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge31cblxuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0XG59XG5cbi8vIExpc3QgZGlmZiwgbmFpdmUgbGVmdCB0byByaWdodCByZW9yZGVyaW5nXG5mdW5jdGlvbiByZW9yZGVyKGFDaGlsZHJlbiwgYkNoaWxkcmVuKSB7XG4gICAgLy8gTyhNKSB0aW1lLCBPKE0pIG1lbW9yeVxuICAgIHZhciBiQ2hpbGRJbmRleCA9IGtleUluZGV4KGJDaGlsZHJlbilcbiAgICB2YXIgYktleXMgPSBiQ2hpbGRJbmRleC5rZXlzXG4gICAgdmFyIGJGcmVlID0gYkNoaWxkSW5kZXguZnJlZVxuXG4gICAgaWYgKGJGcmVlLmxlbmd0aCA9PT0gYkNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hpbGRyZW46IGJDaGlsZHJlbixcbiAgICAgICAgICAgIG1vdmVzOiBudWxsXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPKE4pIHRpbWUsIE8oTikgbWVtb3J5XG4gICAgdmFyIGFDaGlsZEluZGV4ID0ga2V5SW5kZXgoYUNoaWxkcmVuKVxuICAgIHZhciBhS2V5cyA9IGFDaGlsZEluZGV4LmtleXNcbiAgICB2YXIgYUZyZWUgPSBhQ2hpbGRJbmRleC5mcmVlXG5cbiAgICBpZiAoYUZyZWUubGVuZ3RoID09PSBhQ2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGlsZHJlbjogYkNoaWxkcmVuLFxuICAgICAgICAgICAgbW92ZXM6IG51bGxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE8oTUFYKE4sIE0pKSBtZW1vcnlcbiAgICB2YXIgbmV3Q2hpbGRyZW4gPSBbXVxuXG4gICAgdmFyIGZyZWVJbmRleCA9IDBcbiAgICB2YXIgZnJlZUNvdW50ID0gYkZyZWUubGVuZ3RoXG4gICAgdmFyIGRlbGV0ZWRJdGVtcyA9IDBcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhIGFuZCBtYXRjaCBhIG5vZGUgaW4gYlxuICAgIC8vIE8oTikgdGltZSxcbiAgICBmb3IgKHZhciBpID0gMCA7IGkgPCBhQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFJdGVtID0gYUNoaWxkcmVuW2ldXG4gICAgICAgIHZhciBpdGVtSW5kZXhcblxuICAgICAgICBpZiAoYUl0ZW0ua2V5KSB7XG4gICAgICAgICAgICBpZiAoYktleXMuaGFzT3duUHJvcGVydHkoYUl0ZW0ua2V5KSkge1xuICAgICAgICAgICAgICAgIC8vIE1hdGNoIHVwIHRoZSBvbGQga2V5c1xuICAgICAgICAgICAgICAgIGl0ZW1JbmRleCA9IGJLZXlzW2FJdGVtLmtleV1cbiAgICAgICAgICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKGJDaGlsZHJlbltpdGVtSW5kZXhdKVxuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBvbGQga2V5ZWQgaXRlbXNcbiAgICAgICAgICAgICAgICBpdGVtSW5kZXggPSBpIC0gZGVsZXRlZEl0ZW1zKytcbiAgICAgICAgICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKG51bGwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNYXRjaCB0aGUgaXRlbSBpbiBhIHdpdGggdGhlIG5leHQgZnJlZSBpdGVtIGluIGJcbiAgICAgICAgICAgIGlmIChmcmVlSW5kZXggPCBmcmVlQ291bnQpIHtcbiAgICAgICAgICAgICAgICBpdGVtSW5kZXggPSBiRnJlZVtmcmVlSW5kZXgrK11cbiAgICAgICAgICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKGJDaGlsZHJlbltpdGVtSW5kZXhdKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGVyZSBhcmUgbm8gZnJlZSBpdGVtcyBpbiBiIHRvIG1hdGNoIHdpdGhcbiAgICAgICAgICAgICAgICAvLyB0aGUgZnJlZSBpdGVtcyBpbiBhLCBzbyB0aGUgZXh0cmEgZnJlZSBub2Rlc1xuICAgICAgICAgICAgICAgIC8vIGFyZSBkZWxldGVkLlxuICAgICAgICAgICAgICAgIGl0ZW1JbmRleCA9IGkgLSBkZWxldGVkSXRlbXMrK1xuICAgICAgICAgICAgICAgIG5ld0NoaWxkcmVuLnB1c2gobnVsbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsYXN0RnJlZUluZGV4ID0gZnJlZUluZGV4ID49IGJGcmVlLmxlbmd0aCA/XG4gICAgICAgIGJDaGlsZHJlbi5sZW5ndGggOlxuICAgICAgICBiRnJlZVtmcmVlSW5kZXhdXG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggYiBhbmQgYXBwZW5kIGFueSBuZXcga2V5c1xuICAgIC8vIE8oTSkgdGltZVxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgYkNoaWxkcmVuLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBuZXdJdGVtID0gYkNoaWxkcmVuW2pdXG5cbiAgICAgICAgaWYgKG5ld0l0ZW0ua2V5KSB7XG4gICAgICAgICAgICBpZiAoIWFLZXlzLmhhc093blByb3BlcnR5KG5ld0l0ZW0ua2V5KSkge1xuICAgICAgICAgICAgICAgIC8vIEFkZCBhbnkgbmV3IGtleWVkIGl0ZW1zXG4gICAgICAgICAgICAgICAgLy8gV2UgYXJlIGFkZGluZyBuZXcgaXRlbXMgdG8gdGhlIGVuZCBhbmQgdGhlbiBzb3J0aW5nIHRoZW1cbiAgICAgICAgICAgICAgICAvLyBpbiBwbGFjZS4gSW4gZnV0dXJlIHdlIHNob3VsZCBpbnNlcnQgbmV3IGl0ZW1zIGluIHBsYWNlLlxuICAgICAgICAgICAgICAgIG5ld0NoaWxkcmVuLnB1c2gobmV3SXRlbSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChqID49IGxhc3RGcmVlSW5kZXgpIHtcbiAgICAgICAgICAgIC8vIEFkZCBhbnkgbGVmdG92ZXIgbm9uLWtleWVkIGl0ZW1zXG4gICAgICAgICAgICBuZXdDaGlsZHJlbi5wdXNoKG5ld0l0ZW0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgc2ltdWxhdGUgPSBuZXdDaGlsZHJlbi5zbGljZSgpXG4gICAgdmFyIHNpbXVsYXRlSW5kZXggPSAwXG4gICAgdmFyIHJlbW92ZXMgPSBbXVxuICAgIHZhciBpbnNlcnRzID0gW11cbiAgICB2YXIgc2ltdWxhdGVJdGVtXG5cbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGJDaGlsZHJlbi5sZW5ndGg7KSB7XG4gICAgICAgIHZhciB3YW50ZWRJdGVtID0gYkNoaWxkcmVuW2tdXG4gICAgICAgIHNpbXVsYXRlSXRlbSA9IHNpbXVsYXRlW3NpbXVsYXRlSW5kZXhdXG5cbiAgICAgICAgLy8gcmVtb3ZlIGl0ZW1zXG4gICAgICAgIHdoaWxlIChzaW11bGF0ZUl0ZW0gPT09IG51bGwgJiYgc2ltdWxhdGUubGVuZ3RoKSB7XG4gICAgICAgICAgICByZW1vdmVzLnB1c2gocmVtb3ZlKHNpbXVsYXRlLCBzaW11bGF0ZUluZGV4LCBudWxsKSlcbiAgICAgICAgICAgIHNpbXVsYXRlSXRlbSA9IHNpbXVsYXRlW3NpbXVsYXRlSW5kZXhdXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNpbXVsYXRlSXRlbSB8fCBzaW11bGF0ZUl0ZW0ua2V5ICE9PSB3YW50ZWRJdGVtLmtleSkge1xuICAgICAgICAgICAgLy8gaWYgd2UgbmVlZCBhIGtleSBpbiB0aGlzIHBvc2l0aW9uLi4uXG4gICAgICAgICAgICBpZiAod2FudGVkSXRlbS5rZXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2ltdWxhdGVJdGVtICYmIHNpbXVsYXRlSXRlbS5rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgYW4gaW5zZXJ0IGRvZXNuJ3QgcHV0IHRoaXMga2V5IGluIHBsYWNlLCBpdCBuZWVkcyB0byBtb3ZlXG4gICAgICAgICAgICAgICAgICAgIGlmIChiS2V5c1tzaW11bGF0ZUl0ZW0ua2V5XSAhPT0gayArIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZXMucHVzaChyZW1vdmUoc2ltdWxhdGUsIHNpbXVsYXRlSW5kZXgsIHNpbXVsYXRlSXRlbS5rZXkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2ltdWxhdGVJdGVtID0gc2ltdWxhdGVbc2ltdWxhdGVJbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByZW1vdmUgZGlkbid0IHB1dCB0aGUgd2FudGVkIGl0ZW0gaW4gcGxhY2UsIHdlIG5lZWQgdG8gaW5zZXJ0IGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNpbXVsYXRlSXRlbSB8fCBzaW11bGF0ZUl0ZW0ua2V5ICE9PSB3YW50ZWRJdGVtLmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydHMucHVzaCh7a2V5OiB3YW50ZWRJdGVtLmtleSwgdG86IGt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXRlbXMgYXJlIG1hdGNoaW5nLCBzbyBza2lwIGFoZWFkXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW11bGF0ZUluZGV4KytcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydHMucHVzaCh7a2V5OiB3YW50ZWRJdGVtLmtleSwgdG86IGt9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnRzLnB1c2goe2tleTogd2FudGVkSXRlbS5rZXksIHRvOiBrfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaysrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhIGtleSBpbiBzaW11bGF0ZSBoYXMgbm8gbWF0Y2hpbmcgd2FudGVkIGtleSwgcmVtb3ZlIGl0XG4gICAgICAgICAgICBlbHNlIGlmIChzaW11bGF0ZUl0ZW0gJiYgc2ltdWxhdGVJdGVtLmtleSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZXMucHVzaChyZW1vdmUoc2ltdWxhdGUsIHNpbXVsYXRlSW5kZXgsIHNpbXVsYXRlSXRlbS5rZXkpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2ltdWxhdGVJbmRleCsrXG4gICAgICAgICAgICBrKytcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBhbGwgdGhlIHJlbWFpbmluZyBub2RlcyBmcm9tIHNpbXVsYXRlXG4gICAgd2hpbGUoc2ltdWxhdGVJbmRleCA8IHNpbXVsYXRlLmxlbmd0aCkge1xuICAgICAgICBzaW11bGF0ZUl0ZW0gPSBzaW11bGF0ZVtzaW11bGF0ZUluZGV4XVxuICAgICAgICByZW1vdmVzLnB1c2gocmVtb3ZlKHNpbXVsYXRlLCBzaW11bGF0ZUluZGV4LCBzaW11bGF0ZUl0ZW0gJiYgc2ltdWxhdGVJdGVtLmtleSkpXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIG9ubHkgbW92ZXMgd2UgaGF2ZSBhcmUgZGVsZXRlcyB0aGVuIHdlIGNhbiBqdXN0XG4gICAgLy8gbGV0IHRoZSBkZWxldGUgcGF0Y2ggcmVtb3ZlIHRoZXNlIGl0ZW1zLlxuICAgIGlmIChyZW1vdmVzLmxlbmd0aCA9PT0gZGVsZXRlZEl0ZW1zICYmICFpbnNlcnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2hpbGRyZW46IG5ld0NoaWxkcmVuLFxuICAgICAgICAgICAgbW92ZXM6IG51bGxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNoaWxkcmVuOiBuZXdDaGlsZHJlbixcbiAgICAgICAgbW92ZXM6IHtcbiAgICAgICAgICAgIHJlbW92ZXM6IHJlbW92ZXMsXG4gICAgICAgICAgICBpbnNlcnRzOiBpbnNlcnRzXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShhcnIsIGluZGV4LCBrZXkpIHtcbiAgICBhcnIuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZnJvbTogaW5kZXgsXG4gICAgICAgIGtleToga2V5XG4gICAgfVxufVxuXG5mdW5jdGlvbiBrZXlJbmRleChjaGlsZHJlbikge1xuICAgIHZhciBrZXlzID0ge31cbiAgICB2YXIgZnJlZSA9IFtdXG4gICAgdmFyIGxlbmd0aCA9IGNoaWxkcmVuLmxlbmd0aFxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXVxuXG4gICAgICAgIGlmIChjaGlsZC5rZXkpIHtcbiAgICAgICAgICAgIGtleXNbY2hpbGQua2V5XSA9IGlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyZWUucHVzaChpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAga2V5czoga2V5cywgICAgIC8vIEEgaGFzaCBvZiBrZXkgbmFtZSB0byBpbmRleFxuICAgICAgICBmcmVlOiBmcmVlICAgICAgLy8gQW4gYXJyYXkgb2YgdW5rZXllZCBpdGVtIGluZGljZXNcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFwcGVuZFBhdGNoKGFwcGx5LCBwYXRjaCkge1xuICAgIGlmIChhcHBseSkge1xuICAgICAgICBpZiAoaXNBcnJheShhcHBseSkpIHtcbiAgICAgICAgICAgIGFwcGx5LnB1c2gocGF0Y2gpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcHBseSA9IFthcHBseSwgcGF0Y2hdXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXBwbHlcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGF0Y2hcbiAgICB9XG59XG4iLCJ2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVJc0FycmF5IHx8IGlzQXJyYXlcblxuZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSBcIltvYmplY3QgQXJyYXldXCJcbn1cbiIsInJlcXVpcmUoJ2xpZS9wb2x5ZmlsbCcpXG52YXIgaHlwZXJkb20gPSByZXF1aXJlKCdoeXBlcmRvbScpXG52YXIgcm91dGVyID0gcmVxdWlyZSgnaHlwZXJkb20vcm91dGVyJylcbnZhciBodHRwID0gcmVxdWlyZSgnaHR0cGlzbS9icm93c2VyJylcbnZhciBpbmRleEJ5ID0gcmVxdWlyZSgnbG93c2NvcmUvaW5kZXhCeScpXG5cbnZhciByb3V0ZXMgPSB7XG4gIGVtYWlsczogcm91dGVyLnJvdXRlKCc6cGF0aConKSxcbn1cblxuY2xhc3MgRW1haWxTaW11bGF0b3JBcHAge1xuICByb3V0ZXMgKCkge1xuICAgIHJldHVybiBbXG4gICAgICByb3V0ZXMuZW1haWxzKHtcbiAgICAgICAgb25sb2FkOiAoKSA9PiB0aGlzLmxvYWRFbWFpbHMoKSxcbiAgICAgICAgcmVuZGVyOiAoKSA9PiB0aGlzLnJlbmRlckVtYWlscygpLFxuICAgICAgfSksXG4gICAgXVxuICB9XG5cbiAgbG9hZEVtYWlscyAoKSB7XG4gICAgcmV0dXJuIGh0dHAuZ2V0KCdlbWFpbHMnKS50aGVuKGVtYWlscyA9PiB7XG4gICAgICB0aGlzLmVtYWlscyA9IGVtYWlsc1xuICAgIH0pXG4gIH1cblxuICByZWFkIChlbWFpbCkge1xuICAgIGlmICh0aGlzLnJlYWRpbmcgPT0gZW1haWwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlYWRpbmdcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWFkaW5nID0gZW1haWxcbiAgICB9XG4gIH1cblxuICB0ZXN0ICgpIHtcbiAgICByZXR1cm4gaHR0cC5nZXQoJ3Rlc3QnKS50aGVuKCgpID0+IHRoaXMubG9hZEVtYWlscygpKVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHJldHVybiBodHRwLnBvc3QoJ3Jlc2V0JykudGhlbigoKSA9PiB0aGlzLmxvYWRFbWFpbHMoKSlcbiAgfVxuXG4gIHJlbmRlckVtYWlscyAoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9XCJlbWFpbFNpbXVsYXRvckFwcFwiPlxuICAgICAgPGgxPkVtYWlsIFNlcnZlciBTaW11bGF0b3I8L2gxPlxuICAgICAgPHVsIGNsYXNzPVwiYWRtaW5cIj5cbiAgICAgICAgPGxpPjxhIGhyZWY9XCIjdGVzdFwiIG9uY2xpY2s9eyhldikgPT4ge2V2LnByZXZlbnREZWZhdWx0KCk7cmV0dXJuIHRoaXMudGVzdCgpfX0+dGVzdDwvYT48L2xpPlxuICAgICAgICA8bGk+PGEgaHJlZj1cIiNyZXNldFwiIG9uY2xpY2s9eyhldikgPT4ge2V2LnByZXZlbnREZWZhdWx0KCk7cmV0dXJuIHRoaXMucmVzZXQoKX19PnJlc2V0PC9hPjwvbGk+XG4gICAgICA8L3VsPlxuICAgICAge1xuICAgICAgICB0aGlzLmVtYWlscyA/XG4gICAgICAgICAgPHRhYmxlIGlkPVwiZW1haWxzXCI+XG4gICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICA8dGg+RnJvbTwvdGg+XG4gICAgICAgICAgICAgICAgPHRoPlRvPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+QkNDPC90aD5cbiAgICAgICAgICAgICAgICA8dGg+PC90aD5cbiAgICAgICAgICAgICAgICA8dGg+U2VudDwvdGg+XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWFpbHMuc29ydCgoYSxiKSA9PiB7bmV3IERhdGUoYS5yZWNlaXZlZEF0KS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShiLnJlY2VpdmVkQXQpLmdldFRpbWUoKX0pLm1hcChlbWFpbCA9PiB0aGlzLnJlbmRlckVtYWlsKGVtYWlsKSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgfVxuICAgIDwvZGl2PlxuICB9XG5cbiAgcmVuZGVyQWRkcmVzc2VzIChhZGRyZXNzZXMpIHtcbiAgICByZXR1cm4gYWRkcmVzc2VzLm1hcChhID0+IHtcbiAgICAgIGlmIChhLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGAke2EubmFtZX0gPCR7YS5hZGRyZXNzfT5gXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYS5hZGRyZXNzXG4gICAgICB9XG4gICAgfSkuam9pbignLCAnKVxuICB9XG5cbiAgZW1haWxCY2MgKGVtYWlsKSB7XG4gICAgdmFyIGVtYWlscyA9IChlbWFpbC50byB8fCBbXSkuY29uY2F0KGVtYWlsLmNjIHx8IFtdKVxuICAgIHZhciBhZGRyZXNzZXMgPSBpbmRleEJ5KGVtYWlscywgZSA9PiBlLmFkZHJlc3MpXG4gICAgcmV0dXJuIGVtYWlsLmVudmVsb3BlLnJjcHRUby5maWx0ZXIoYSA9PiAhYWRkcmVzc2VzW2EuYWRkcmVzc10pXG4gIH1cblxuICByZW5kZXJFbWFpbCAoZW1haWwpIHtcbiAgICBsZXQgYm9keVJvdyA9IHRoaXMucmVhZGluZyA9PSBlbWFpbCA/XG4gICAgICA8dHIgY2xhc3M9XCJlbWFpbFwiPlxuICAgICAgICA8dGQgY29sc3Bhbj1cIjRcIj5cbiAgICAgICAgeyBoeXBlcmRvbS5yYXdIdG1sKFwiZGl2XCIsIGVtYWlsLmh0bWwpIH1cbiAgICAgICAgPC90ZD5cbiAgICAgIDwvdHI+XG4gICAgICA6IHVuZGVmaW5lZFxuXG4gICAgbGV0IGJvZHlUZXh0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKVxuICAgIGJvZHlUZXh0RWxlbWVudC5pbm5lckhUTUwgPSBlbWFpbC5odG1sLnJlcGxhY2UoLzwvZywgJyA8JykucmVwbGFjZSgvPi9nLCAnPiAnKVxuICAgIGxldCBib2R5VGV4dCA9IGJvZHlUZXh0RWxlbWVudC5pbm5lclRleHQucmVwbGFjZSgvXFxuL2csICcgJylcblxuICAgIHJldHVybiBbPHRyIGNsYXNzPVwic3VtbWFyeVwiIG9uY2xpY2s9eygpID0+IHRoaXMucmVhZChlbWFpbCl9PlxuICAgICAgPHRkIGNsYXNzPVwiZnJvbVwiPnt0aGlzLnJlbmRlckFkZHJlc3NlcyhlbWFpbC5mcm9tKX08L3RkPlxuICAgICAgPHRkIGNsYXNzPVwidG9cIj57dGhpcy5yZW5kZXJBZGRyZXNzZXMoZW1haWwudG8pfTwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJiY2NcIj57dGhpcy5yZW5kZXJBZGRyZXNzZXModGhpcy5lbWFpbEJjYyhlbWFpbCkpfTwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJtZXNzYWdlXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJtZXNzYWdlLXdyYXBwZXJcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInN1YmplY3RcIj57ZW1haWwuc3ViamVjdH08L3NwYW4+IC0ge2JvZHlUZXh0fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvdGQ+XG4gICAgICA8dGQgY2xhc3M9XCJzZW50XCI+e2VtYWlsLmRhdGV9PC90ZD5cbiAgICAgIDx0ZCBjbGFzcz1cInJlY2VpdmVkXCI+e2VtYWlsLnJlY2VpdmVkQXR9PC90ZD5cbiAgICA8L3RyPixib2R5Um93XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW1haWxTaW11bGF0b3JBcHBcbiIsInZhciBBcHAgPSByZXF1aXJlKCcuL2FwcCcpXG52YXIgaHlwZXJkb20gPSByZXF1aXJlKCdoeXBlcmRvbScpXG52YXIgcm91dGVyID0gcmVxdWlyZSgnaHlwZXJkb20vcm91dGVyJylcblxuaHlwZXJkb20uYXBwZW5kKGRvY3VtZW50LmJvZHksIG5ldyBBcHAoKSwge3JvdXRlcjogcm91dGVyfSlcbiJdfQ==
    