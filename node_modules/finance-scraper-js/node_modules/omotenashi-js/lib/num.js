
module.exports = {
  /**
   * abbreviated string from number.
   *
   * @param {Number} calculated number.
   *   we cannot convert over 16 digits without significant figures because of cap of floating calclation.
   * @param {Number} a significant figure.
   *   this is not for calcrating collect significant figure.
   *   for example, if you set toAbbr(1, 3), this return "1" not "1.00".
   * @param {String} desc is "symbol" or "name", which is abbreviated type. for example, 10^9 is "10G" in "symbol" or "10B" in "name".
   *   default is "symbol".
   * @param {String} sub is substitute string for "NaN" if n might be NaN.
   * @return n's abbreviation.
   */
  toAbbr: function (n, sig, desc, sub) {
    if (isNaN(n)) {
      return sub || "" + n;
    }

    var map = desc === "name"? ["", "K", "M", "B", "T", "Q"] : ["", "K", "M", "G", "T", "P"],
        per = 3;

    var exp = n.toExponential(sig? sig - 1 : undefined).split("e");
    var imap = Math.min(map.length - 1, ~~(exp[1] / per));
    var extra = exp[1] - imap * per;

    return this.mul(exp[0], Math.pow(10, extra)) + map[imap];
  },

  /**
   * abbreviated string to number.
   *
   * @param {String} transformed string with abbreviation.
   * @return s's number.
   */
  fromAbbr: function (s) {
    var sign = s[s.length - 1] || "";

    var shift = (function () {
      var map = { "k": 3, "m": 6, "g": 9, "b": 9, "t": 12, "p": 15};
      return Math.pow(10, map[sign.toLowerCase()]);
    })();

    return isNaN(shift)? s - 0 : s.substring(0, s.length - 1) * shift;
  },

  /**
   * return percent string from number.
   *
   * @param {Number} n is to be transformed to percent string.
   * @param {String} sub is substitute string for "NaN" if n might be NaN.
   * @return n's percent string.
   */
  toPercent: function (n, sub) {
    return isNaN(n)? (sub || "" + n) : this.mul(n, 100) + "%";
  },

  /**
   * return number from percent string.
   *
   * @param {String} transformed string with percent.
   * @return s's number. if s is not number (like "N/A"), return NaN.
   */
  fromPercent: function (s) {
    var parts = s.split("%");
    return parts.length < 2? parts[0] - 0 : this.mul(parts[0], 0.01);
  },

  mul: function (x, y) {
    function shift (i) {
      var parts = ("" + i).split(".");
      return parts.length < 2? 1 : Math.pow(10, parts[1].length);
    }

    var xx = shift(x);
    var yy = shift(y);

    return Math.round(x * xx) * Math.round(y * yy) / (xx * yy);
  },

  /**
   * judge given string is number or not.
   *
   * @param {String} numeric string. this can contain ",", "%" and abbreviation like "K", "T", of course also ".".
   *   note that "%" cannot be used with abbreviation character (maybe this case is no longer in everyday usage).
   * @param {Object} optonal. this can contain "trim" and "currency" members.
   *   "trim" might be true to trim space from x. by default, this is false.
   *   "currency" can set array that contains currency's string, like "₩", "؋", "₲", "₡", "₪", "₵", "¢", "৲", "৳", "US\\$".
   *     note that string with [KMBTQGP] as top character cannot recognize currency.
   * @param {Boolean} extra optional. this might be true to return result of regular expression not boolean.
   * @return true/false.
   */
  isNumber: function (x, opt, detail) {
    opt = opt || {};

    x = opt.trim? x.replace(/ /g, "") : x;

    var currency = ["\\$", "€", "£", "Ұ"].concat(opt.currency || []);

    // regexp of currencies
    var cur = "(?:(?:" + currency.join(")|(?:") + "))",
    // regexp of base number
        base = "([+]?[\\d,]+(?:\\.\\d+)?[KMBTQGP%]?)",
    // regexp of number with sign
        sign = ["\\(" + base + "\\)", "[-]{1}" + base];

    //
    var candidates = [
      cur + "?" + base, base + cur,
      cur + "?" + sign[0], sign[0] + cur,
      cur + "?" + sign[1], sign[1] + cur,
      // oppsition
      "\\(" + cur + base + "\\)", "\\(" + base + cur + "\\)",
      "[-]{1}" + cur + base //"[+-]?" + base + cur is as same as sign[1] + cur.
    ];

    var re = "^(?:(" + candidates.join(")|(") + "))$";
    var num = x.match(re);

    return detail? num : num? true : false;
  },

  /**
   * transform given string is number or not.
   *
   * @param {String} numeric string.
   * @param {Object} optonal. this can contain "trim" and "currency" members. this is for "isNumber".
   * @return number or NaN.
   */
  toNumber: function (x, opt) {
    opt = opt || {};

    var num = this.isNumber(x, opt, true);
        val = NaN;

    if (num) {
      // find result
      var idx;
      for (idx = 1; idx < num.length; idx++) {
        if (num[idx] !== undefined) {
          break;
        }
      }

      var minus = [2, 3, 4, 5, 6, 7, 8];
      minus = minus.map(function (v, i) {
        return v * 2 + 1;
      });

      val = (minus.indexOf(idx) === -1? "" : "-") + num[idx + 1];
      val = val.replace(/,/g, "");
      val = this.fromAbbr(val) || val;
      val = (typeof val === "string"? this.fromPercent(val) : val) || val;
      val = val - 0;
    }

    return val;
  }
};