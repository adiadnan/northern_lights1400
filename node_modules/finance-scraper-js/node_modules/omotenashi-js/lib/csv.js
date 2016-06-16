/**
 * Module dependencies.
 */

var cp = require("./copy");
var json = require("./json");
var st = require("./stats");

module.exports = {
  /**
   * parsing string to csv.
   *   in default configuration, this parse csv string to output array of array containing strings.
   *   with "delim" option, you can designate csv's delimiter.
   *   with "asType" option, this assigns adequate type for string.
   *     false, null, true, number, (also NaN/Infinity), string, date and regexp can be assigned,
   *     but this cannot understand array, function, undefined and object.
   *     this assumes that "string" enclosed quotation "\"" or "'" is string, strings without quotation are other types.
   *   with "toDict" option, this tries to make associative array using array[0] as header, which is first line of a result of csv parsing.
   *     for example, '"h1", "h2"\n"v1", "v2"\n' is returned {"h1": "v1", "h2", "v2"} with this option.
   *   with "header" option, you can designate header strings. if you set header option, this makes object from first line forward.
   *
   * @param {String} str is csv string.
   * @param {Object} opt has several options as below.
   *   {String} delim is delimiter string that is used in "str". default is ",".
   *   {Boolean} trimLastDelim will be true when to remove extra delimiter in each line, like "a,b,c,".
   *   {Boolean} asType with true involves to assign suitable type to string. default is false.
   *   {Boolean} if transpose is true, return transposed array.
   *             this option is alternative of toDict option and has the priority over toDict.
   *   {Boolean} toDict is whether to transform table format (array of array) to object. default is false.
   *   {Array} headher contains header strings in its array, which is used for property name of "toDict" object.
   *
   * @return array of array or array of object.
   */
  parse: function (str, opt, next) {
    var nxtargs = Array.prototype.slice.call(arguments, 3);

    str = str || "";
    opt = {
      delim: opt && opt.delim? opt.delim : ",",
      trim: opt && opt.trimLastDelim? true : false,
      asType: opt && opt.asType? true : false,
      transpose: opt && opt.transpose? true : false,
      toDict: opt && opt.toDict? true : false,
      header: opt? opt.header : undefined
    };

    // change line break
    str = str.replace(/\r\n|\r/g, "\n");

    // return array of array
    var err;
    var table = str.split((opt.trim? opt.delim : "") + "\n").reduce(function (tbl, row) {
      if (!row.length) return tbl;

      // row string to srray of string, then concat divided string.
      var strings = row.split(opt.delim).reduce(function (p, v, i) {
        v = v.trim();

        var quot = p.length && (p[p.length - 1][0] === "'" || p[p.length - 1][0] === "\"")? p[p.length - 1][0] : undefined;

        if (quot && (p[p.length - 1].match(new RegExp(quot, "g")) || []).length % 2 !== 0) {
          // FIXME: current version trim space of back and forth in string,
          // then "this is 'string', and .." is to "this is 'string',and ..". so adding " ".
          // but if string is originally "this is 'string',and ..", this adds uncessary space.
          p[p.length - 1] +=  opt.delim + " " + v;
          return p;
        } else {
          p.push(v);
          return p;
        }
      }, []);

      // transform quotation and escape charactor for JSON.parse.
      //   quotation: replacing ' to ", and adding backslash for inner quotation.
      //   espace charactor: adding one more backslash.
      var each;
      if (opt.asType) {
        strings = strings.map(function (v) {
          if ((v[0] === "\"" || v[0] === "'") && v.length >= 3) {
            var vv = v.substr(1, v.length - 2);
            vv = vv.replace(/(?:\\)*("|'|\\)/g, "\\\$1");
            v = "\"" + vv.replace(/'/g, "\"") + "\"";
          }
          return v;
        });

        try {
          each = json.parse("[" + strings + "]", {
            holdUndefined: false,
            holdInfinity: true,
            holdNaN: true,
            holdDate: true,
            holdRegExp: true,
            holdFunction: false
          });
        } catch (e) {
          err = e;
        }
      } else {
        each = strings;
      }

      tbl.push(each);
      return tbl;
    }, []);

    prs = opt.transpose? st.trans(table) : opt.toDict? this.toDictionary(table, opt.header) : table;

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
   * stringify csv to string.
   *   basically, this can treat with data types, false/null/true/object/array/number/string, which follows json specification.
   *   but for convienience, this also treat with Date and RegExp.
   *
   * @param {Object} obj is a transformed object that should be array.
   *   obj could be formatted object of array or array of array.
   * @param {Object} opt has several optional parameters as follows.
   *   delim {String}: delimiter you want. default is ",".
   *   br {String}: break/linefeed string you want. default is "\n".
   *   miss {String}: unclear value in csv is replaced with this, like "\"NA\"". default is null.
   *   nan {String}: NaN is replaced with this value, like "\"NaN\"". default is null.
   *   infinity {String}: Infinity is replaced with this value, like "\"Inf\"". default is null.
   *   header {Boolean}: if true, create header from object's property names.
   *   exclusions {array}: each element is keyword to exclude stringifying to csv.
   */
  stringify: function (obj, opt, next) {
    var nxtargs = Array.prototype.slice.call(arguments, 3);
    opt = opt || {};

    var str = "",
        line = "",
        delim = opt.delim || ",",
        br = opt.br || "\n",
        miss = opt.miss === undefined? null : opt.miss,
        nan = opt.nan === undefined? miss : opt.nan,
        inf = opt.infinity === undefined? miss : opt.infinity,
        header = opt.header,
        excl = opt.exclusions || [];


    /**
     * make template for csv.
     * csv is likely to RDB format, which means some of rows have same the number of line, on the contrary, json have not.
     * so this makes row that has the biggest number of lines.
     * @param {Object} obj is array of array/json.
     */
    function template (obj) {
      // we need to check all symbols because last one has bigger array
      return obj.reduce(function (p, v, i, a) {
        return cp.copy(true, v, miss, p);
      }, {});
    }

    /**
     * create csv header.
     * @param {Object} obj is transformed object.
     * @param {String} str is buffer string. this must be set "" in initial calling.
     * @param {String} key is header string to walk down to child element. this must be set "" in initial calling.
     *   if obj is {"a": {"b": "c"}}, this returns "a.b".
     */
    function toHeader(obj, str, key) {
      switch (typeof obj) {
        case "number":
        case "string":
        case "boolean":
        case "undefined":
        case "function":
          str += "\"" + key.replace(/^\./, "") + "\"" + delim;
          break;
        case "object":
          if (obj instanceof Date || obj instanceof RegExp || obj === null) {
            str += "\"" + key.replace(/^\./, "") + "\"" + delim;
          } else if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
              str = toHeader(obj[i], str, key + "[" + i + "]");
            }
          } else {
            for (var j in obj) {
              if (excl.indexOf(j) === -1) {
                str = toHeader(obj[j], str, key + "." + j);
              }
            }
          }
          break;
      }
      return str;
    }

    /**
     * stringify body of csv.
     * @param {Object} obj is transformed object.
     * @param {String} str is buffer string. this must be set "" in initial calling.
     */
    function toLine(obj, str) {
      switch (typeof obj) {
        case "number":
          if (isNaN(obj)) {
            str += nan + delim;
          } else if (!isFinite(obj)) {
            str += inf + delim;
          } else {
            str += obj + delim;
          }
          break;
        case "string":
          str += "\"" + obj + "\"" + delim;
          break;
        case "boolean":
          str += obj + delim;
          break;
        case "object":
          if (obj instanceof Date) {
            str += "\"" + obj.toJSON() + "\"" + delim;
          } else if (obj instanceof RegExp) {
            str += "\"" + obj.toString() + "\"" + delim;
          } else if (obj === null) {
            str += miss + delim;
          } else if (obj instanceof Array) {
            for (var i = 0; i < obj.length; i++) {
              str = toLine(obj[i], str);
            }
          } else {
            for (var j in obj) {
              if (excl.indexOf(j) === -1) {
                str = toLine(obj[j], str);
              }
            }
          }
          break;
        default:
          // in case of "undefined", "function" and so on.
          str += miss + delim;
          break;
      }
      return str;
    }

    // create template
    // assume all lines have the same length, if opt.header is true or obj is array of array.
    // on the assumeption, need not to create "big daddy", so only making template only with first line.
    var temp = template(obj[0] instanceof Array? [obj[0]] : obj);

    var garbage = new RegExp(delim + "$");

    // create header
    if (header) {
      line = toHeader(temp, "", "");
      str += line.replace(garbage, br);
    }

    // set line corresponding to template's header
    for (var i = 0; i < obj.length; i++) {
      // cloning
      var clone = cp.copy(true, temp);
      // to fit object to template
      var extend = cp.overwrite(clone, obj[i]);

      line = toLine(extend, "");
      str += line.replace(garbage, br);
    }

    if (next instanceof Function) {
      next.apply(null, [undefined, str].concat(nxtargs));
    } else {
      return str;
    }
  },

  /**
   * table to dictionary.
   * @param {Array} tbl is two-dim array.
   * @param {Array} optional. array of header string.
   */
  toDictionary: function (tbl, header) {
    var list = [],
        hdr = header? true : false;
    header = header || tbl[0];

    for (var i = hdr? 0 : 1; i < tbl.length; i++) {
      var prof = {};
      for (var j = 0; j < header.length; j++) {
        prof[header[j]] = tbl[i][j];
      }
      list.push(prof);
    }
    return list;
  }
};
