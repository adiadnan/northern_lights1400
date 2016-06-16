
module.exports = {
  /**
   * parse json
   *
   * @param {String/Object} json.
   * @param {Object} opt: option for parsing.
   * @param {Function} next: callback function. if there is no callback, return result or throw error.
   * @api public
   */
  parse: function (json, opt, next) {
    var nxtargs = Array.prototype.slice.call(arguments, 3);
    var err, prs, tmp, self = this;

    try {
      prs = JSON.parse(json, function (k, v) {
        var tmp;
        return opt && self.isString(v)? (
          opt.holdUndefined && v === "undefined"? undefined :
          opt.holdInfinity  && v === "Infinity"? Infinity :
          opt.holdNaN       && v === "NaN"? NaN :
          opt.holdDate      && (tmp = self.string2date(v))? tmp :
          // regexp object (ex. {$regex: "source", $options: "i"}) need not be translated.
          opt.holdRegExp    && (tmp = self.string2regexp(v, opt))? tmp :
          opt.holdFunction  && opt.eval && (tmp = self.string2function(v))? tmp : v
        ) : v;
      });
    } catch (e) {
      err = e;
    }

    if (next instanceof Function) {
      next.apply(null, [err, prs].concat(nxtargs));
    } else {
      if (err) {
        throw err;
      } else {
        return prs;
      }
    }
  },

  /**
   * stringify json
   *
   * @param {Object} obj: object.
   * @param {Object} opt: option for parsing.
   * @param {Function} next: callback function. if there is no callback, return result or throw error.
   *
   * @api public
   */
  stringify: function (obj, opt, next) {
    var nxtargs = Array.prototype.slice.call(arguments, 3);
    var err, str, self = this;

    try {
      str = JSON.stringify(obj, function (k, v) {
        return opt? (
          opt.holdUndefined && v === undefined? "undefined" :
          opt.holdInfinity  && self.isInfinity(v)? "Infinity" :
          opt.holdNaN       && self.isNaN(v)? "NaN" :
          opt.holdRegExp    && self.isRegExp(v)? (opt.RegExp2Object? self.regexp2object(v) : v.toString()) :
          opt.holdFunction  && typeof v === "function"? "" + v : v
        ) : v;
      });
    } catch (e) {
      err = e;
    }

    if (next instanceof Function) {
      next.apply(null, [err, str].concat(nxtargs));
    } else {
      if (err) {
        throw err;
      } else {
        return str;
      }
    }
  }
};

(function () {
  ["String", "Number", "Boolean", "Function", "Date", "RegExp"].forEach(function (each) {
    module.exports["is" + each] = function (val) {
      return toString.call(val) === "[object " + each + "]";
    };
  });

  ["NaN", "Infinity"].forEach(function (each) {
    // in a replacer, cannot use isNaN() that returns true with non-number value like {obj:"ct"}, "string" and so on.
    // (of course, "v === NaN" cannot evaluate NaN.)
    module.exports["is" + each] = function (val) {
      return val !== undefined && val !== null && val.toString() === each;
    };
  });
})();

module.exports.isDateString = function (str) {
  return this.string2date(str)? true : false;
};

module.exports.isRegExpString = function (str) {
  return this.string2regexp(str)? true : false;
};

module.exports.isFunctionString = function (str) {
  return this.string2function(str)? true : false;
};

module.exports.isRegExpObject = function (val) {
  return val.hasOwnProperty("$regex") && val.hasOwnProperty("$options");
};

module.exports.isActuallyRegExp = function (val) {
  return this.isRegExp(val) || this.isRegExpObject(val);
};

module.exports.regexp2object = function (re) {
  // to the same format for MongoDB.
  return {
    $regex: re.source,
    $options: (function (r) {
      return "" + (r.global? "g" : "") + (r.ignoreCase? "i" : "") + (r.multiline? "m" : "");
    })(re)
  };
};

module.exports.string2regexp = function (str, opt) {
  var elms = str.match(/^\/(.*)\/([igm]{0,3})$/);

  if (elms && elms.length > 1) {
    var resrc = elms[1];
    var reopt = elms[2]? elms[2].split("").filter(function (v, i, a) {
      return a.indexOf(v) === i;
    }).join("") : "";

    var re = new RegExp(resrc, reopt);
    return opt && opt.RegExp2Object? this.regexp2object(re) : re;
  } else {
    return undefined;
  }
};

module.exports.string2date = function (str) {
  var date = new Date(str);
  return str === date.toJSON()? date : undefined;
};

module.exports.string2function = function (str) {
  var f;
  if (str.search(/^\s*function(?:\s+[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*)*\s*\(.*\)\s*\{.*\}\s*$/) === 0) {
    try {
      f = eval("(" + str + ")");
    } catch (e) {
      f = undefined;
    }
  }
  return f;
};
