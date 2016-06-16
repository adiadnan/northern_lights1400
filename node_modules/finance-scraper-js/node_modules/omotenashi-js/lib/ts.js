/*
 * Module dependencies.
 */

require("./date");

module.exports = {
  /**
   * get utc time that has year, month and day as same as those of local.
   * note that this doesnot take into account a summer time and
   *   a time at locations where has over 12 hours of offset from GMT (like Kiribati or New Zealand).
   *
   * @param {Date} source date. it is assumed that source date is set to 00:00:00.
   *   without argument, return psuedo UTC date of today in "current location".
   */
  psuedoUTCDate: function (date) {
    date = (date instanceof Date)? date : new Date();

    // get utc time to acquire offset from GMT.
    var offset = date.toJSON().match(/T([0-9]{2}):/)[1] - 0;
    offset = offset >= 12? 24 - offset : 0 - offset;

    return new Date(date.getTime() + offset * 60 * 60 * 1000);
  },

  /**
   * return date in the first month of next quarter.
   *
   * @param {Date} source date. without argument, return next quarter from today.
   */
  nextQ: function (date) {
    date = (date instanceof Date)? date : new Date();
    var uMon = this.psuedoUTCDate(date).getUTCMonth();

    // psuedo UTC date is used only for comparison whether the month of source day is older than quarter's last month.
    //   this is why to eliminate the difference by timezone offset.
    // on the other hand, the given date is only acceptable for creating the next quarter's day.
    //   why? psuedo day is differenct from the given day.
    if (uMon < 3) return new Date(date).next().apr().set({day: 1});
    else if (uMon < 6) return new Date(date).next().jul().set({day: 1});
    else if (uMon < 9) return new Date(date).next().oct().set({day: 1});
    else return new Date(date).next().jan().set({day: 1});
  },

  /**
   * return date in the first day of current quarter.
   *
   * @param {Date} source date. without argument, return current quarter from today in "current location".
   */
  currentQ: function (date) {
    date = (date instanceof Date)? date : new Date();

    // last() method of date.js translates a target date to "last" month. for example, 2014/4/1 to 2013/4/1
    var uMon = this.psuedoUTCDate(date).getUTCMonth(),
        modified = this.nextQ(date).add(-1).month();

    // psuedo UTC date is used only for comparison whether the month of source day is older than quarter's last month.
    //   this is why to eliminate the difference by timezone offset.
    // on the other hand, the given date is only acceptable for creating the last quarter's day.
    //   why? psuedo day is differenct from the given day.
    if (uMon < 3) return new Date(modified).last().jan().set({day: 1});
    else if (uMon < 6) return new Date(modified).last().apr().set({day: 1});
    else if (uMon < 9) return new Date(modified).last().jul().set({day: 1});
    else return new Date(modified).last().oct().set({day: 1});
  },

  /**
   * return date in the first month of last quarter.
   *
   * @param {Date} source date. without argument, return last quarter from today.
   */
  lastQ: function (date) {
    date = (date instanceof Date)? date : new Date();

    // last() method of date.js translates a target date to "last" month. for example, 2014/4/1 to 2013/4/1
    var uMon = this.psuedoUTCDate(date).getUTCMonth(),
        modified = this.nextQ(date).add(-1).month();

    // psuedo UTC date is used only for comparison whether the month of source day is older than quarter's last month.
    //   this is why to eliminate the difference by timezone offset.
    // on the other hand, the given date is only acceptable for creating the last quarter's day.
    //   why? psuedo day is differenct from the given day.
    if (uMon < 3) return new Date(modified).last().oct().set({day: 1});
    else if (uMon < 6) return new Date(modified).last().jan().set({day: 1});
    else if (uMon < 9) return new Date(modified).last().apr().set({day: 1});
    else return new Date(modified).last().jul().set({day: 1});
  },

  /**
   * form and fill gap of a set of annual dates to a sequencial yearly line.
   * when [Date("Dec 27, 2014 EST"), Date("Dec 30, 2013 EST"), Date("Jan 1, 2012 EST")] is given,
   *   this returns [Date("Dec 27, 2014 EST"), Date("Dec 30, 2013 EST"), Date("Dec 30, 2012 EST"), Date("Jan 1, 2012 EST")].
   * gap of date is filled out with "average day of given dates" when given array with elements skipped some years.
   *
   * @param {Array} unlined is array that consists of Date objects.
   *   both one and two dimentional array are acceptable, one-dim array of which has only Date objects
   *   and two-dim array of which contains Date objects as "first" array and some arrays with any objects.
   * @param {Object} options can contain below settings.
   *   "where" is boolean whether returned array should contain sorted index.
   *     if this option is true, this function returns {x: "sorted date array", ix: "sorted index"}.
   *     -1 is assigned as indexes of gap.
   *   "order" is allowed to be set "descending" or "ascending".
   *   "na" is value filled to gap of "second" arrays.
   *     for example, [[Date("Dec 27, 2014 EST"), Date("Dec 30, 2012 EST")], [10, 100]] is given,
   *       this returns [[Date("Dec 27, 2014 EST"), Date("Dec 28, 2013 EST"), Date("Dec 30, 2012 EST")], [10, "NA", 100]].
   *     "NA" is default value for filling gap.
   *   "latest" is set as the utmost year, which involves that this forms the date line with given year as the maximum.
   *   "length" is length of returned array. if this is not set, this returns array with sufficient length.
   * @return yearly lined date array.
   *   if "where" option is true, this returns object that has "x" and "ix" properties
   *     which are sorted dates and sorted indexes respectively.
   */
  formAnnualDays: function (unlined, options, next) {
    var nxtargs = Array.prototype.slice.call(arguments, 3);

    var mul = unlined && unlined[0] instanceof Array,
        dates = mul? unlined[0] : unlined;

    // filter unacceptable argument.
    if (!dates || dates.length === 0 || !(dates[0] instanceof Date)) {
      if (next instanceof Function) {
        next.apply(null, [undefined, []].concat(nxtargs));
      } else {
        return [];
      }
    }

    // constant
    var baseYear = 2000,
        acceptableWeeks = 2;

    var opt = {
      whr: options && options.where? true : false,
      odr: options && options.order? options.order : "descending",
      na: options? options.na : "NA",
      // dont set default date because timezone of given date is unknown.
      lst: options? options.latest : undefined,
      len: options? options.length : undefined
    };

    /**
     * return both ends of year line.
     *
     * @param {Array} d is array consisting of Date objects.
     * @return {Array} [start year, end year]
     */
    function yearEnds (d) {
      var e = d.reduce(function (p, v) {
        // no need to create psuedo UTC time like this.psuedoUTCDate(v) due to prepairing preliminary +1/-1 buffer.
        var y = v.getUTCFullYear();

        // insert +1/-1 year of given because it is unknown to which year an annual day is assigned in this timing.
        // ex. 3rd element of [Dec 26, 2014, Dec 31, 2013, Jan 1, 2010] should be assigned to 2009 even though that is in 2010.
        //   (because it is assumed that annual day is about Dec 30.)
        p[1] = Math.max(y + 1, p[1]);
        p[0] = Math.min(Math.min(y - 1, p[1]), p[0]);

        return p;
      }, [Infinity, -Infinity]);

      // adjustment only when given max/min are larger than that of given years.
      // adjustment in opposite case is exerted in the last of this method (in trim method)
      //   because we need the preliminary year space to assign days precisely.
      e[1] = Math.max(opt.lst || -Infinity, e[1]);
      e[0] = Math.min(Math.min(opt.lst || Infinity, e[1]) - (opt.len || 0) + 1, e[0]);

      return e;
    }

    /**
     * return histgram of given dates.
     *
     * @param {Array} d is array consisting of Date objects.
     * @param {Boolean} median is true, which involves that only representative date with the utmost count of hist.
     *
     * @return {Object/Date} {"REPERSENTATIVE DATE": "count"} will be returned
     *   or utmost representative date will be done when median would be true.
     */
    function dayHist (d, median) {
      var h = d.reduce(function (p, v) {
        var vv = (new Date(v)).set({year: baseYear});

        var any = Object.keys(p).some(function (w) {
          function between (src, tgt, rec) {
            var s = new Date(src),
                inn = s.between(new Date(tgt).add(-1 * acceptableWeeks).week(), new Date(tgt).add(acceptableWeeks).week());

            if (!inn && !rec) {
              var ret = [false, s];
              if (s.is().dec()) {
                s.set({year: s.getUTCFullYear() - 1});
                ret = between(s, tgt, true);
              } else if (s.is().jan()) {
                s.set({year: s.getUTCFullYear() + 1});
                ret = between(s, tgt, true);
              }
              inn = ret[0];
              s = ret[1];
            }

            return [inn, s];
          }

          var bw = between(vv, w);
          if (bw[0]) {
            var avg = new Date(Math.round((bw[1].getTime() + (new Date(w)).getTime() * p[w]) / (p[w] + 1)));
            p[avg.set({year: baseYear}).toJSON()] = p[w] + 1;
            delete p[w];
          }
          return bw[0];
        });

        if(!any) {
          p[vv.toJSON()] = 1;
        }
        return p;
      }, {});

      return median? new Date(Object.keys(h).reduce(function (p, v) {
        if (h[v] > p[1]) {
          return [v, h[v]];
        } else {
          return p;
        }
      }, [null, 0])[0]) : h;
    }

    /**
     * create sequential days for template.
     */
    function seq (yends, mon) {
      var str, end, inr, odr,
          vec = {
            x: [],
            ix: [],
            iy: []
          };

      if (opt.odr === "descending") {
        str = yends[1];
        end = yends[0];
        inr = -1;
        odr = true;
      } else {
        str = yends[0];
        end = yends[1];
        inr = 1;
        odr = false;
      }

      for (var i = str; odr? i >= end : i <= end; i += inr) {
        vec.x.push((new Date(mon)).set({year: i}));
        vec.ix.push(-1);
        vec.iy.push(i);
      }
      return vec;
    }

    /**
     * assign given days to template line.
     */
    function fillgap (d) {
      // create base date line
      var dline = seq(yearEnds(d), dayHist(d, true));

      // assign given date to consecutive year line.
      return d.reduce(function (p, v, i) {
        // find adjacent one
        var idx = -1, dmin = Infinity;
        dline.x.some(function (vv, ii) {
          var diff = Math.abs(v - vv);
          if (diff < dmin) {
            dmin = diff;
            idx = ii;
            return false;
          }
          return true;
        });

        p.x[idx] = v;
        p.ix[idx] = i;
        return p;
      }, dline);
    }

    /**
     * trim excess year
     */
    function trim (l) {
      var dsc = opt.odr === "descending";

      // first, cut upper excess year because lower depends on a length from upper year.
      var stopper = opt.lst,
          len = l.ix.length;
          str = dsc? 0 : len - 1;
          end = dsc? len - 1: 0;
          inr = dsc? 1 : -1;

      for (i = str; (dsc? i <= end : i >= end) && (stopper? l.iy[i] > stopper : l.ix[i] === -1); i += inr);

      var org = dsc? 0 : i + 1,
          term = dsc? i : len - 1 - i;
      l.x.splice(org, term);
      l.ix.splice(org, term);
      l.iy.splice(org, term);

      // second, cut lower excess year.
      // update values after splicing
      stopper = (opt.lst || l.iy[dsc? 0 : l.iy.length - 1]) - opt.len + 1;
      len = l.ix.length;
      str = dsc? len - 1 : 0;
      end = dsc? 0 : len - 1;
      inr = dsc? -1 : 1;

      for (var i = str; (dsc? i >= end : i <= end) && (isNaN(stopper)? l.ix[i] === -1 : l.iy[i] < stopper); i += inr);

      org = dsc? i + 1 : 0;
      term = dsc? len - 1 - i : i;
      l.x.splice(org, term);
      l.ix.splice(org, term);
      l.iy.splice(org, term);
    }

    var dline = fillgap(dates);
    trim(dline);

    if (mul) {
      var mlen = unlined.length - 1;
      dline.x = dline.ix.reduce(function (p, i) {
        for (var j = 1; j < mlen + 1; j++) {
          if (i !== -1) {
            p[j].push(unlined[j][i]);
          } else {
            p[j].push(opt.na);
          }
        }
        return p;
      }, unlined.reduce(function (p, v, i) {
        if (i > 0) {
          p.push([]);
        }
        return p;
      }, [dline.x]));
    }

    delete dline.iy;
    var formed = opt.whr? dline : dline.x;

    if (next instanceof Function) {
      next.apply(null, [undefined, formed].concat(nxtargs));
    } else {
      return formed;
    }
  }
};
