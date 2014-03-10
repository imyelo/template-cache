var fs = require('fs');
var path = require('path');

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
  return exports;
})();

var isExt = function (filename, ext) {
  if (!_.isString(filename) || !_.isString(ext)) {
    return false;
  }
  ext = ext.slice(0, 1) === '.' ? ext : ('.' + ext);
  return !!(filename && filename.split(ext).pop() === '');
};

var slim = function (store) {
  return _.map(store, function (val) {
    return val.replace(/\n\s*/g, '').replace(/\\n/g, '\n');
  });
};

var filesStore = function (basepath, ext, options) {
  options = _.defaults((options = options || {}), {
    slim: false
  });

  var files = (function () {
    var result = [];
    _.each(fs.readdirSync(basepath), function (filename) {
      if (isExt(filename, ext)) {
        result.push(filename);
      }
    });
    return result;
  })();

  var store = (function () {
    var result = {};
    _.each(files, function (filename) {
      result[filename] = fs.readFileSync(path.join(basepath, filename), {encoding: 'utf8'});
    });
    return result;
  })();

  if (options.slim) {
    store = slim(store);
  }

  return store;
};

var test = function () {
  var basepath = path.join(process.cwd(), './tpl')
  var ext = '.tpl';
  console.log(filesStore(basepath, ext, {slim: true}));
};

(function (env) {
  if (env === 'fileStore:test') {
    test();
  }
})(process.env.NODE_ENV);

module.exports = filesStore;
