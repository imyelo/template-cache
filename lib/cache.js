var fs = require('fs');
var path = require('path');

var caches = {};

var _ = (function () {
  var exports = {};
  exports.isUndefined = function (obj) {
    return typeof obj === 'undefined';
  };
  exports.isString = function (obj) {
    return typeof obj === 'string';
  };
  exports.isArray = function (obj) {
    return obj instanceof Array;
  };
  exports.isFunction = function (obj) {
    return typeof obj === 'function';
  };
  exports.argsToArray = function (args) {
    return Array.prototype.slice.call(args);
  };
  exports.each = function (list, func) {
    var i, len;
    if (exports.isArray(list)) {
      for (i = 0, len = list.length; i < len; i++) {
        func(list[i], i, list);
      }
    } else {
      for (i in list) {
        func(list[i], i, list);
      }
    }
    return list;
  };
  exports.map = function (list, func) {
    var result = exports.isArray(list) ? [] : {};
    exports.each(list, function (val, key, list) {
      result[key] = func(val, key, list);
    });
    return result;
  };
  exports.defaults = function (options, defaults) {
    var result = {};
    exports.each(defaults, function (val, key) {
      result[key] = val;
    });
    exports.each(options, function (val, key) {
      result[key] = val;
    });
    return result;
  };
  // shallow clone
  exports.clone = function (src) {
    var result;
    if (exports.isArray(src)) {
      result = [];
      exports.each(src, function (val, key) {
        result.push(val)
      });
    } else {
      result = {};
      exports.each(src, function (val, key) {
        result[key] = val;
      });
    }
    return result;
  };
  return exports;
})();

// return if the filename with the extension
var isExt = function (filename, ext) {
  if (!_.isString(filename) || !_.isString(ext)) {
    return false;
  }
  ext = ext.slice(0, 1) === '.' ? ext : ('.' + ext);
  return !!(filename && filename.split(ext).pop() === '');
};

// input ('filename', 'ext') or ('filename', '.ext') will return 'filename.ext'
var joinExt = function (filename, ext) {
  return [filename, ext.slice(0, 1) === '.' ? ext : ('.' + ext)].join('');
};

var slim = function (store) {
  return _.map(store, function (val) {
    return val.replace(/\n\s*/g, '').replace(/\\n/g, '\n');
  });
};

// auto convert the crlf to lf (linux mode)
var autocrlf = function (store) {
  return _.map(store, function (val) {
    return val.replace(/\r\n/g, '\n');
  });
};

// compile template
var compile = function (engine, store) {
  return _.map(store, function (val) {
    return engine(val);
  });
};

// recursive read each file in directories
var eachFile = function (basepath, action, recursive) {
  var isDirectory = function (target) {
    return fs.statSync(target).isDirectory();
  };
  var nextLevel = function (subpath) {
    _.each(fs.readdirSync(path.join(basepath, subpath)), function (filename) {
      if (isDirectory(path.join(basepath, (filename = path.join(subpath, filename))))) {
        if (recursive) {
          nextLevel(filename);
        }
      } else {
        action(filename);
      }
    });
  };
  nextLevel('./');
};

var Cache = function () {
  this.clear();
  return this;
};

Cache.prototype.clear = function () {
  this._loaded = false;
  this._basepath = '';
  this._options = {};
  this._store = {};
  return this;
};

Cache.prototype.refresh = function () {
  var basepath = this._basepath;
  var options = _.clone(this._options);
  return this.clear().load(basepath, options);
};

Cache.prototype.toJSON = function () {
  return _.clone(this._store);
};

Cache.prototype.load = function (basepath, options) {
  options = _.defaults((options = options || {}), {
    extension: '.tpl',
    recursive: false,
    autocrlf: true,
    slim: false,
    engine: null,
  });

  var files = (function () {
    var result = [];
    eachFile(basepath, function (filename) {
      if (isExt(filename, options.extension)) {
        result.push(filename);
      }
    }, options.recursive);
    return result;
  })();

  var store = (function () {
    var result = {};
    _.each(files, function (filename) {
      result[filename.replace(/\\/, '/')] = fs.readFileSync(path.join(basepath, filename), {encoding: 'utf8'});
    });
    return result;
  })();

  if (options.autocrlf) {
    store = autocrlf(store);
  }

  if (options.slim) {
    store = slim(store);
  }

  if (typeof options.engine === 'function') {
    store = compile(options.engine, store);
  }

  this._loaded = true;
  this._basepath = basepath;
  this._options = options;
  this._store = store;

  return this;
};

Cache.prototype.require = function (filename) {
  if (!_.isString(filename)) {
    throw new TypeError('unexpected arguments');
  }

  if (!this._loaded) {
    throw new Error('files not loaded yet');
  }

  filename = isExt(filename, this._options.extension) ? filename : joinExt(filename, this._options.extension);

  if (!(filename in this._store)) {
    throw new Error('file not found: ' + filename);
  }

  return this._store[filename];
};

Cache.prototype.namespace = function (ns) {
  return caches[ns] || (caches[ns] = new Cache());
};

var cache = new Cache();

module.exports = cache;
