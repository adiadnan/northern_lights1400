
module.exports = {
  /**
   * calc mean of array that has any dimension.
   *
   * @param {Array} x is calculated array.
   * @param {Number} ddof is optional and should be integer number, which is “Delta Degrees Of Freedom”
   *   and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.
   * @param {Boolean} this is for internal use, which indicates the current is recursive call.
   * @return x's mean, which would be NaN when x is no array or array without valid length, like [], [1] with ddof = 1.
   */
  mean: function (x, ddof, recur) {
    var self = this;
    ddof = ddof || 0;

    if (x instanceof Array) {
      var sum = x.reduce(function (p, v) {
        var inner;
        if (v instanceof Array) {
          inner = self.mean(v, ddof, true);
        } else {
          inner = [v, 1];
        }
        return [p[0] + inner[0], p[1] + inner[1]];
      }, [0, 0]);

      return recur? sum : sum[1] - ddof <= 0? NaN : sum[0] / (sum[1] - ddof);
    } else {
      return NaN;
    }
  },

  /**
   * calc variance of array that has any dimension.
   *
   * calculation of sum((x_i - u)^2)/n has a slightly decreased performance than that of E(x^2) - E(x)^2 when it is not for unbiased.
   *   note that sum((x-u)^2)/(n-1) = sum(x^2 -2ux + u^2)/(n-1) = sum(x^2)/(n-1) - 2u*sum(x)/(n-1) + n*u^2/(n-1) when unbiased variance.
   *     no sum(x^2)/n - n*u^2/n.
   * otherwise, the latter gives a slightly decreased performance than the former, when it is for unbiased.
   * furthermore, the former makes an implementation more simple than the latter.
   * so simple one was adopted.
   *
   * @param {Array} x is calculated array.
   * @param {Number} ddof is optional and should be integer number, which is “Delta Degrees Of Freedom”
   *   and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.
   * @return x's variance, which is NaN when x is non-array or array without valid length with unbiased option.
   */
  var: function (x, ddof) {
    var u  = this.mean(x);
    return this.mean(this.apply(x, function (y) {
      return Math.pow(y - u, 2);
    }), ddof);
  },

  /**
   * calc standard deviation of array that has any dimension.
   *
   * @param {Array} x is calculated array.
   * @param {Number} ddof is optional and should be integer number, which is “Delta Degrees Of Freedom”
   *   and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.
   * @return x's sd.
   */
  sd: function (x, ddof) {
    return Math.sqrt(this.var(x, ddof));
  },

  /**
   * calc volatilities of array that has one dimension.
   * (p_t - p_(t-1))/p_(t-1) = ln(1 + (p_t - p_(t-1))/p_(t-1)) = ln(p_t / p_(t-1) +1-1) = ln(p_t / p_(t-1)) = ln(p_t) - ln(p_(t-1)),
   * this is used ln(1+x) = x, where |x| << 1.
   * if it is linealy shifted by a certain of volatility per week, vol per year is vol^(4 * 12).
   *
   * @param {Array} calculated array that has one dimension.
   * @return x's volatility. note that this returns NaN when given undefined.
   */
  vol: function (x) {
    if (x instanceof Array) {
      return x.reduce(function (p, v) {
        if (isNaN(p[1])) {
          return [[], v];
        } else {
          p[0].push(Math.log(v / p[1]));
          return [p[0], v];
        }
      }, [ [], NaN ])[0];
    } else {
      return undefined;
    }
  },

  /**
   * calc histrical volatility of array that has one dimension.
   * historical volatility is calculated by multiplying standard deviation of volatility by sqrt(250)
   *   because a fluctuation range of volatility are increasing after 250 working days, which 250 days is days in a year.
   * easily, by pascal's triangle, 3/2 (~= sqrt(2)) after 2 days, 4/2 (~= sqrt(3)) after 3 days and 5/2 (~= sqrt(4)) after 4 days.
   * of cource, given yearly historical volatility, original value * historical volatility / sqrt(250) to calculate volatility of a day.
   *
   * @param {Array} calculated array that has one dimension.
   * @param {Number} n is the number of days in year. default is 250.
   * @return x's histrical volatility.
   */
  hv: function (x, n) {
    n = n || 250;
    return this.sd(this.vol(x), 1) * Math.sqrt(n);
  },

  /**
   * apply given method to all values in array.
   *
   * @param {Array} applied array.
   * @param {Function} method has one argument being number.
   * @return deep copied and given method applied array.
   */
  apply: function (x, method) {
    var self = this;

    if (x instanceof Array) {
      return x.reduce(function (p, v) {
        if (v instanceof Array) {
          p.push(self.apply(v, method));
        } else {
          p.push(method(v));
        }
        return p;
      }, []);
    } else {
      return method(x);
    }
  },

  /**
   * return transposed matrix.
   *
   * @param {Array} x is array with multi-dimentional.
   * @return transposed matrix.
   */
  trans: function (x) {
    // get length of all of inner array
    var len = (function mulLen (y, p) {
      if (y instanceof Array) {
        p.push(y.length);
        return mulLen(y[0], p);
      } else {
        return p;
      }
    })(x, []);

    // filter irrigal case
    if (len.length === 0) {
      return NaN;
    // return deeply copied array to be given one-dimentional array.
    } else if (len.length === 1) {
      return x.reduce(function (p, v) {
        p.push(v);
        return p;
      }, []);
    }

    // create frame. it's ok that len is reversed directly
    //   because of walking frame of transposed array according to reversed len.
    var t = (function frame (l, p) {
      if (l.length > 1) {
        for (var i = 0; i < l[0]; i++) {
          p.push([]);
          frame(l.slice(1), p[i]);
        }
      } else {
        // nothing to do
      }
      return p;
    })(len.reverse(), []);

    // assign transposed value to frame with recursive loop.
    function T (dst, src, times, idx) {
      if (times.length > 1) {
        for (var i = 0; i < times[0]; i++) {
          T(dst[i], src, times.slice(1), idx.concat([i]));
        }
      } else {
        for (var j = 0; j < times[0]; j++) {
          dst[j] = value(src, idx.concat([j]).reverse());
        }
      }
      return dst;
    }

    // access value of array without blacket.
    function value (y, list) {
      if (list.length > 1) {
        return value(y[list[0]], list.slice(1));
      } else {
        return y[list[0]];
      }
    }

    return T(t, x, len, []);
  }
};
