
module.exports = {
  /**
   * shallow / deep copy.
   * if you want mere shallow / deep copy, you can use copy(false, YOUR_OBJECT) or copy(true, YOUR_OBJECT) respectively.
   * if you want to make "template" which values are replaced to a substitute, use "sub".
   *   for example, you can set copy(true, {a: 1}, "NA"), this returns {a: "NA"}.
   * if you want to deep copy to another object "daddy", set it to "daddy". it is useful for making bigger one that has same schema.
   *   you can set copy(true, {a: [1]}, "NA", {a: [1,2], b: "dad"}), this returns {a: ["NA", "NA"], b:"dad"}.
   *   NOTE that daddy's properties are overwritten by src.
   *   see csv.js::stringify::templete function in details.
   *
   * @param {Boolean} deep: if true, deep copy, else false, shallow copy.
   * @param {Object} src is a copied object.
   * @param {any} sub is optional, and substitute for value of Number/String/Boolean/Date/Function/undefined/null.
   * @param {Object} daddy is optional, and the overwritten object by src.
   * @return a copied object.
   */
  copy: function (deep, src, sub, daddy) {
    // shallow copy
    if (!deep) {
      return src;
    }

    function isSameType (x, y) {
      return typeof x === typeof y;
    }

    // deep copy
    function dcp (dst, s) {
      switch (typeof s) {
        case "number":
        case "string":
        case "boolean":
        case "undefined":
        case "function":
          return sub === undefined? s : sub;
        case "object":
          if (s instanceof Date) {
            return sub === undefined? new Date(s) : sub;
          } else if (s instanceof RegExp) {
            return sub === undefined? new RegExp(s) : sub;
          } else if (s === null) {
            return sub === undefined? s : sub;
          } else if (s instanceof Array) {
            if (!(dst instanceof Array)) {
              dst = [];
            }
            for (var i = 0; i < s.length; i++) {
              dst[i] = dcp(isSameType(dst[i], s[i])? dst[i] : {}, s[i]);
            }
            return dst;
          } else {
            for (var j in s) {
              dst[j] = dcp(isSameType(dst[j], s[j])? dst[j] : {}, s[j]);
            }
            return dst;
          }
      }
    }
    return dcp(isSameType(daddy, src)? daddy : {}, src);
  },

  /**
   * overwrite object to another object.
   * if you want deep copying with to fit another object with bigger array in its properties,
   *   you can do this as follow. see csv.js::stringify function in details.
   *   templete=copy(true, daddy, undefined); overwrite(template, YOUR_OBJECT).
   *
   * @param {Object} dst is an overwritten object.
   * @param {Object} src is a source object.
   * @return an overwritten object.
   */
  overwrite: function (dst, src) {
    function ow(dst, src) {
      switch (typeof src) {
        case "number":
        case "string":
        case "boolean":
        case "undefined":
        case "function":
          return src;
        case "object":
          if (src instanceof Date) {
            return src;
          } else if (src instanceof RegExp) {
            return src;
          } else if (src === null) {
            return src;
          } else if (src instanceof Array) {
            var ary = (dst && dst instanceof Array && dst.length >= src.length)? dst : [];
            for (var i = 0; i < src.length; i++) {
              ary[i] = ow(ary[i] || {}, src[i]);
            }
            return ary;
          } else {
            for (var j in src) {
              dst[j] = ow(dst? dst[j] : {}, src[j]);
            }
            return dst;
          }
      }
    }
    return ow(dst, src);
  }
};
