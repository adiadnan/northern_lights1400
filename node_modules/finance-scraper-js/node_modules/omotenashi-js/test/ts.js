var should = require("should");
var ts = require("../lib/ts");

describe("ts test", function () {

  describe("Test forming date array to sorted and filled date array", function () {
    it("without options", function (done) {
      var q = [
        // test given an invalid argument
        undefined,
        // test given an invalid argument
        [],
        // test given one/two element
        [new Date("Dec 30, 2014 EST")],
        [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2013 EST")],
        // test given an unsorted array
        [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2012 EST"), new Date("Dec 31, 2013 EST")],
        // test given an array that need to be filled out
        [new Date("May 30, 2014 EST"), new Date("May 31, 2012 EST"), new Date("Jun 1, 2009 EST")],
        // test given some dates with the same year.
        [new Date("Dec 27, 2014 EST"), new Date("Jan 1, 2014 EST")],
        [new Date("Jan 1, 2014 EST"), new Date("Dec 27, 2014 EST")],
        [new Date("Dec 27, 2014 EST"), new Date("Dec 30, 2013 EST"), new Date("Jan 1, 2013 EST")],
        [new Date("Jan 3, 2012 EST"), new Date("Dec 29, 2012 EST"), new Date("Jan 2, 2014 EST"), new Date("Dec 31, 2014 EST")],
        // test given dates that make average date within Jan.
        [new Date("Jan 3, 2012 EST"), new Date("Jan 1, 2013 EST"), new Date("Jan 5, 2014 EST"), new Date("Dec 31, 2014 EST")],
        // test given values.
        [[new Date("Dec 30, 2011 EST"), new Date("Jan 1, 2014 EST"), new Date("Jan 10, 2011 EST")],
         [10, 100, 1000], [20, 200, 2000]],
        [[10, 100, 1000],
         [new Date("Dec 30, 2011 EST"), new Date("Jan 1, 2014 EST"), new Date("Jan 10, 2011 EST")]],
        // border test
        [new Date("Dec 30, 1968 EST"), new Date("Dec 31, 1969 EST"), new Date("Dec 31, 1970 EST"), new Date("Dec 27, 1971 EST")],
        // in case of timezone offset that is faster than GMT.
        // test given one/two element (14)
        [new Date("Dec 30, 2014 GMT+0900")],
        [new Date("Dec 30, 2014 GMT+0900"), new Date("Dec 31, 2013 GMT+0900")],
        // test given an unsorted array
        [new Date("Dec 30, 2014 GMT+0900"), new Date("Dec 31, 2012 GMT+0900"), new Date("Dec 31, 2013 GMT+0900")],
        // test given an array that need to be filled out
        [new Date("May 30, 2014 GMT+0900"), new Date("May 31, 2012 GMT+0900"), new Date("Jun 1, 2009 GMT+0900")],
        // test given some dates with the same year.
        [new Date("Dec 27, 2014 GMT+0900"), new Date("Jan 1, 2014 GMT+0900")],
        [new Date("Jan 1, 2014 GMT+0900"), new Date("Dec 27, 2014 GMT+0900")],
        [new Date("Dec 27, 2014 GMT+0900"), new Date("Dec 30, 2013 GMT+0900"), new Date("Jan 1, 2013 GMT+0900")],
        [new Date("Jan 3, 2012 GMT+0900"), new Date("Dec 29, 2012 GMT+0900"), new Date("Jan 2, 2014 GMT+0900"),
         new Date("Dec 31, 2014 GMT+0900")],
        // test all date is following date
        [new Date("Jan 3, 2012 GMT+0900"), new Date("Jan 1, 2013 GMT+0900"), new Date("Jan 5, 2014 GMT+0900"),
         new Date("Dec 31, 2014 GMT+0900")]
      ];

      var a_s5 = new Date(
        (
          (new Date(q[5][0])).set({year: 2015}).getTime() +
          (new Date(q[5][1])).set({year: 2015}).getTime() +
          (new Date(q[5][2])).set({year: 2015}).getTime()
        ) / 3
      );
      var a_s11 = new Date(
        (
          (new Date(q[11][0][0])).set({year: 2015}).getTime() +
          (new Date(q[11][0][1])).set({year: 2016}).getTime() +
          (new Date(q[11][0][2])).set({year: 2016}).getTime()
        ) / 3
      ).set({year: 2015});
      var a_s17 = new Date(
        (
          (new Date(q[17][0])).set({year: 2015}).getTime() +
          (new Date(q[17][1])).set({year: 2015}).getTime() +
          (new Date(q[17][2])).set({year: 2015}).getTime()
        ) / 3
      );

      var a = [
        [],
        [],
        [new Date("Dec 30, 2014 EST")],
        [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2013 EST")],
        [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Dec 31, 2012 EST")],
        [new Date("May 30, 2014 EST"), (new Date(a_s5)).set({year: 2013}), new Date("May 31, 2012 EST"),
         (new Date(a_s5)).set({year: 2011}), (new Date(a_s5)).set({year: 2010}), new Date("Jun 1, 2009 EST")],
        [new Date("Dec 27, 2014 EST"), new Date("Jan 1, 2014 EST")],
        [new Date("Dec 27, 2014 EST"), new Date("Jan 1, 2014 EST")],
        [new Date("Dec 27, 2014 EST"), new Date("Dec 30, 2013 EST"), new Date("Jan 1, 2013 EST")],
        [new Date("Dec 31, 2014 EST"), new Date("Jan 2, 2014 EST"), new Date("Dec 29, 2012 EST"), new Date("Jan 3, 2012 EST")],
        [new Date("Dec 31, 2014 EST"), new Date("Jan 5, 2014 EST"), new Date("Jan 1, 2013 EST"), new Date("Jan 3, 2012 EST")],
        [[new Date("Jan 1, 2014 EST"), (new Date(a_s11)).set({year: 2013}), new Date("Dec 30, 2011 EST"),
          new Date("Jan 10, 2011 EST")], [100, "NA", 10, 1000], [200, "NA", 20, 2000]],
        [],
        [new Date("Dec 27, 1971 EST"), new Date("Dec 31, 1970 EST"), new Date("Dec 31, 1969 EST"), new Date("Dec 30, 1968 EST")],

        [new Date("Dec 30, 2014 GMT+0900")],
        [new Date("Dec 30, 2014 GMT+0900"), new Date("Dec 31, 2013 GMT+0900")],
        [new Date("Dec 30, 2014 GMT+0900"), new Date("Dec 31, 2013 GMT+0900"), new Date("Dec 31, 2012 GMT+0900")],
        [new Date("May 30, 2014 GMT+0900"), (new Date(a_s17)).set({year: 2013}), new Date("May 31, 2012 GMT+0900"),
         (new Date(a_s17)).set({year: 2011}), (new Date(a_s17)).set({year: 2010}), new Date("Jun 1, 2009 GMT+0900")],
        [new Date("Dec 27, 2014 GMT+0900"), new Date("Jan 1, 2014 GMT+0900")],
        [new Date("Dec 27, 2014 GMT+0900"), new Date("Jan 1, 2014 GMT+0900")],
        [new Date("Dec 27, 2014 GMT+0900"), new Date("Dec 30, 2013 GMT+0900"), new Date("Jan 1, 2013 GMT+0900")],
        [new Date("Dec 31, 2014 GMT+0900"), new Date("Jan 2, 2014 GMT+0900"), new Date("Dec 29, 2012 GMT+0900"),
         new Date("Jan 3, 2012 GMT+0900")],
        [new Date("Dec 31, 2014 GMT+0900"), new Date("Jan 5, 2014 GMT+0900"), new Date("Jan 1, 2013 GMT+0900"),
         new Date("Jan 3, 2012 GMT+0900")]
      ];

      for (var i = 0; i < q.length; i++) {
        ts.formAnnualDays(q[i]).should.eql(a[i]);
      }

      done();
    });

    it("with options (where, order, na are indipendently respectively and with latest and length.)", function (done) {
      var q = [
        // check to where, order, na, latest and length.
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2012 EST")], [10, 100, 1000]],
        // check to where, order, na, latest (change) and length.
        [[new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST"), new Date("Jan 1, 2012 EST")], [100, 10, 1000]],
        // check to where, order, na, latest (change) and length.
        [[new Date("Jan 1, 2012 EST"), new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST")], [1000, 10, 100]],
        // check to where, order, na, latest and length (change).
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2012 EST")], [10, 100, 1000]],
        // check to where, order, na, latest and length (change).
        [[new Date("Dec 26, 2014 EST"), new Date("Jan 3, 2014 EST")], [20, 200]],
        // move average date to next year.
        [[new Date("Dec 31, 2014 EST"), new Date("Jan 5, 2014 EST")], [200, 20]],
        // latest is undefined
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2010 EST")], [10, 100, 1000]],
        // length is undefined
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2010 EST")], [10, 100, 1000]],
        // descending case (= options.order is undefined)
        // check to where, order, na, latest and length.
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2012 EST")], [10, 100, 1000]],
        // check to where, order, na, latest (change) and length.
        [[new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST"), new Date("Jan 1, 2012 EST")], [100, 10, 1000]],
        // check to where, order, na, latest (change) and length.
        [[new Date("Jan 1, 2012 EST"), new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST")], [1000, 10, 100]],
        // check to where, order, na, latest and length (change).
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2012 EST")], [10, 100, 1000]],
        // check to where, order, na, latest and length (change).
        [[new Date("Dec 26, 2014 EST"), new Date("Jan 3, 2014 EST")], [20, 200]],
        // move average date to next year.
        [[new Date("Dec 31, 2014 EST"), new Date("Jan 5, 2014 EST")], [200, 20]],
        // latest is undefined
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2010 EST")], [10, 100, 1000]],
        // length is undefined
        [[new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), new Date("Jan 1, 2010 EST")], [10, 100, 1000]]
      ];

      var a_s = new Date(
        (
          (new Date(q[0][0][0])).set({year: 2015}).getTime() +
          (new Date(q[0][0][1])).set({year: 2015}).getTime() +
          (new Date(q[0][0][2])).set({year: 2016}).getTime()
        ) / 3
      ).set({year: 2015}),
      a_s4 = new Date(
        (
          (new Date(q[4][0][0])).set({year: 2015}).getTime() +
          (new Date(q[4][0][1])).set({year: 2016}).getTime()
        ) / 2
      ).set({year: 2015});

      var a = [
        {
          x: [
            [(new Date(a_s)).set({year: 2009}), (new Date(a_s)).set({year: 2010}), new Date("Jan 1, 2012 EST"),
            (new Date(a_s)).set({year: 2012}), new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST"),
            (new Date(a_s)).set({year: 2015}), (new Date(a_s)).set({year: 2016})],
            ["N/A", "N/A", 1000, "N/A", 100, 10, "N/A", "N/A"]
          ],
          ix: [-1, -1, 2, -1, 1, 0, -1, -1]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2007}), (new Date(a_s)).set({year: 2008}), (new Date(a_s)).set({year: 2009}),
             (new Date(a_s)).set({year: 2010}), new Date("Jan 1, 2012 EST"), (new Date(a_s)).set({year: 2012}),
             new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST")],
            ["N/A", "N/A", "N/A", "N/A", 1000, "N/A", 100, 10]
          ],
          ix: [-1, -1, -1, -1, 2, -1, 0, 1]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2005}), (new Date(a_s)).set({year: 2006}), (new Date(a_s)).set({year: 2007}),
             (new Date(a_s)).set({year: 2008}), (new Date(a_s)).set({year: 2009}), (new Date(a_s)).set({year: 2010}),
             new Date("Jan 1, 2012 EST"), (new Date(a_s)).set({year: 2012})],
            ["N/A", "N/A", "N/A", "N/A", "N/A", "N/A", 1000, "N/A"]
          ],
          ix: [-1, -1, -1, -1, -1, -1, 0, -1]
        }, {
          x: [
            [new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST"), (new Date(a_s)).set({year: 2015}),
             (new Date(a_s)).set({year: 2016})],
            [100, 10, "N/A", "N/A"]
          ],
          ix: [1, 0, -1, -1]
        }, {
          x: [
            [new Date("Dec 26, 2014 EST"), (new Date(a_s4)).set({year: 2015})],
            [20, "N/A"]
          ],
          ix: [0, -1]
        }, {
          x: [
            [new Date("Jan 5, 2014 EST"), new Date("Dec 31, 2014 EST")],
            [20, 200]
          ],
          ix: [1, 0]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2012}), new Date("Dec 31, 2013 EST"), new Date("Dec 26, 2014 EST")],
            ["N/A", 100, 10]
          ],
          ix: [-1, 1, 0]
        }, {
          x: [
            [new Date("Jan 1, 2010 EST"), (new Date(a_s)).set({year: 2010}), (new Date(a_s)).set({year: 2011}),
             (new Date(a_s)).set({year: 2012})],
            [1000, "N/A", "N/A", "N/A"]
          ],
          ix: [2, -1, -1, -1]
        },

        // descending
        {
          x: [
            [(new Date(a_s)).set({year: 2016}), (new Date(a_s)).set({year: 2015}), new Date("Dec 26, 2014 EST"),
             new Date("Dec 31, 2013 EST"), (new Date(a_s)).set({year: 2012}), new Date("Jan 1, 2012 EST"),
             (new Date(a_s)).set({year: 2010}), (new Date(a_s)).set({year: 2009})],
            ["N/A", "N/A", 10, 100, "N/A", 1000, "N/A", "N/A"]
          ],
          ix: [-1, -1, 0, 1, -1, 2, -1, -1]
        }, {
          x: [
            [new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), (new Date(a_s)).set({year: 2012}),
             new Date("Jan 1, 2012 EST"), (new Date(a_s)).set({year: 2010}), (new Date(a_s)).set({year: 2009}),
            (new Date(a_s)).set({year: 2008}), (new Date(a_s)).set({year: 2007})],
            [10, 100, "N/A", 1000, "N/A", "N/A", "N/A", "N/A"]
          ],
          ix: [1, 0, -1, 2, -1, -1, -1, -1]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2012}), new Date("Jan 1, 2012 EST"), (new Date(a_s)).set({year: 2010}),
             (new Date(a_s)).set({year: 2009}), (new Date(a_s)).set({year: 2008}), (new Date(a_s)).set({year: 2007}),
             (new Date(a_s)).set({year: 2006}), (new Date(a_s)).set({year: 2005})],
            ["N/A", 1000, "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]
          ],
          ix: [-1, 0, -1, -1, -1, -1, -1, -1]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2016}), (new Date(a_s)).set({year: 2015}), new Date("Dec 26, 2014 EST"),
             new Date("Dec 31, 2013 EST")],
            ["N/A", "N/A", 10, 100]
          ],
          ix: [-1, -1, 0, 1]
        }, {
          x: [
            [(new Date(a_s4)).set({year: 2015}), new Date("Dec 26, 2014 EST")],
            ["N/A", 20]
          ],
          ix: [-1, 0]
        }, {
          x: [
            [new Date("Dec 31, 2014 EST"), new Date("Jan 5, 2014 EST")],
            [200, 20]
          ],
          ix: [0, 1]
        }, {
          x: [
            [new Date("Dec 26, 2014 EST"), new Date("Dec 31, 2013 EST"), (new Date(a_s)).set({year: 2012})],
            [10, 100, "N/A"]
          ],
          ix: [0, 1, -1]
        }, {
          x: [
            [(new Date(a_s)).set({year: 2012}), (new Date(a_s)).set({year: 2011}), (new Date(a_s)).set({year: 2010}),
             new Date("Jan 1, 2010 EST")],
            ["N/A", "N/A", "N/A", 1000]
          ],
          ix: [-1, -1, -1, 2]
        }
      ];

      var opt = [{
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2016,
        length: 8
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2014,
        length: 8
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2012,
        length: 8
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2016,
        length: 4
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2015,
        length: 2
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2015,
        length: 2
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: undefined,
        length: 3
      }, {
        where: true,
        order: "ascending",
        na: "N/A",
        latest: 2012,
        length: undefined
      },
      //
      {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2016,
        length: 8
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2014,
        length: 8
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2012,
        length: 8
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2016,
        length: 4
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2015,
        length: 2
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2015,
        length: 2
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: undefined,
        length: 3
      }, {
        where: true,
        order: undefined,
        na: "N/A",
        latest: 2012,
        length: undefined
      }];

      for (var i = 0; i < q.length; i++) {
        ts.formAnnualDays(q[i], opt[i]).should.eql(a[i]);
      }

      done();
    });

    it("callbacks", function (done) {
      var q = [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2013 EST")];
      var a = [new Date("Dec 30, 2014 EST"), new Date("Dec 31, 2013 EST")];

      ts.formAnnualDays(q, undefined, function(e, r) {
        should.not.exist(e);
        should.exist(r);
        r.should.eql(a);

        done();
      });
    });
  });

  describe("Test acquiring quarter's first day.", function () {
    it("get next, current and last quarter's first day.", function (done) {
      var q = [
        new Date("Dec 31, 2014 EST"),
        new Date("Jan 1, 2015 EST"),
        new Date("Dec 31, 2014 GMT"),
        new Date("Jan 1, 2015 GMT"),
        new Date("Dec 31, 2014 GMT+0900"),
        new Date("Jan 1, 2015 GMT+0900")
      ];
      var a = [
        [new Date("Jan 1, 2015 EST"), new Date("Oct 1, 2014 EST"), new Date("Jul 1, 2014 EST")],
        [new Date("Apr 1, 2015 EST"), new Date("Jan 1, 2015 EST"), new Date("Oct 1, 2014 EST")],
        [new Date("Jan 1, 2015 GMT"), new Date("Oct 1, 2014 GMT"), new Date("Jul 1, 2014 GMT")],
        [new Date("Apr 1, 2015 GMT"), new Date("Jan 1, 2015 GMT"), new Date("Oct 1, 2014 GMT")],
        [new Date("Jan 1, 2015 GMT+0900"), new Date("Oct 1, 2014 GMT+0900"), new Date("Jul 1, 2014 GMT+0900")],
        [new Date("Apr 1, 2015 GMT+0900"), new Date("Jan 1, 2015 GMT+0900"), new Date("Oct 1, 2014 GMT+0900")]
      ];

      for (var i = 0; i < q.length; i++) {
        ts.nextQ(q[i]).should.eql(a[i][0]);
        ts.currentQ(q[i]).should.eql(a[i][1]);
        ts.lastQ(q[i]).should.eql(a[i][2]);
      }

      done();
    });
  });
});