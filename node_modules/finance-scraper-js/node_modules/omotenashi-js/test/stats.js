var should = require("should");
var st = require("../lib/stats");

describe("statistics methods test", function () {

  it("mean/variance/std. deviation.", function (done) {
    var q = [
      // test given an invalid argument
      undefined,
      [],
      [[], []],
      // test returning valid answer
      [60, 56, 61, 68, 51, 53, 69, 54],
      [[60, 56, 61, 68], [51, 53, 69, 54]],
      [[60], [56], [61], [68], [51], [53], [69], [54]],
      [[[60, 56], 61, 68], [51, 53, [69, 54]]],
      [[60, [56, 61], 68], [[51, 53, 69, 54]]],
      [[60], [56, 61, 68], [51, 53, 69, 54]],
      [[[[60], [56, 61]], [68]], [51, 53, 69, 54]],
      [60, 56, 61, 68, 51, 53, 69, 54],
    ];

    // these were derived from results of numpy of python
    var m = [
      NaN,
      NaN,
      NaN,
      59,
      59,
      59,
      59,
      59,
      59,
      59,
      67.42857142857143
    ],
    v = [
      NaN,
      NaN,
      NaN,
      40.0,
      40.0,
      40.0,
      40.0,
      40.0,
      40.0,
      40.0,
      45.714285714285715
    ],
    s = [
      NaN,
      NaN,
      NaN,
      6.324555320336759,
      6.324555320336759,
      6.324555320336759,
      6.324555320336759,
      6.324555320336759,
      6.324555320336759,
      6.324555320336759,
      6.761234037828133
    ],
    o = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
    ];

    var am, av, as;
    for (var i = 0; i < q.length; i++) {
      am = st.mean(q[i], o[i]);
      av = st.var(q[i], o[i]);
      as = st.sd(q[i], o[i]);

      if (i < 3) {
        am.should.be.NaN;
        av.should.be.NaN;
        as.should.be.NaN;
      } else {
        am.should.eql(m[i]);
        av.should.eql(v[i]);
        as.should.eql(s[i]);
      }
    }

    done();
  });

  it("volatility.", function (done) {
    var q = [
      undefined,
      [],
      [31.65, 31.97, 32.25, 32.28, 34.62, 34.48, 32.28, 32.73, 34.9, 35.1, 35.33, 34.94, 35.23,
       35.24, 35.38, 36.03, 36.12, 36.32, 36.99, 38.45]
    ];

    // these were derived from results of numpy of python
    var aa = [
      undefined,
      [],
      [0.010059814481564917, 0.0087200801700314575, 0.00092980015996652738, 0.069983706346314997,
       -0.0040521039525708864, -0.06593160239374414, 0.013844245111340947, 0.064194740695292352,
       0.0057143012634386352, 0.0065313308992336269, -0.011100156665143376, 0.0082656876472356634,
       0.00028380871483265794, 0.0039648876636605547, 0.01820523602836252, 0.0024948037887826502,
       0.0055218251843079467, 0.018279052111270178, 0.038711090107290409]
    ],
    av = [
      NaN,
      NaN,
      0.44474988721639824
    ];

    var v, hv;
    for (var i = 0; i < 2; i++) {
      v  = st.vol(q[i]);
      hv = st.hv(q[i]);
      if (i < 1) {
        (v === undefined).should.be.true;
        hv.should.be.NaN;
      } else if (i < 2) {
        v.should.eql(aa[i]);
        hv.should.be.NaN;
      } else {
        v.should.eql(aa[i]);
        hv.should.eql(av[i]);
      }
    }

    done();
  });

  it("trans.", function (done) {
    var q = [
      // one-dim
      [1, 3, 5],
      // two-dim
      [[1],[2],[3]],
      [[1, 2, 3]],
      [[1, 4],[2, 5],[3, 6]],
      // error case in two-dim
      [[1, 4],[2, 5],[3]],
      [[1],[2, 5],[3, 6]],
      // three-dim
      [[[1,2], [3,4]], [[5,6], [7,8]]],
      // four-dim
      [[[[1,2]], [[3,4]], [[5,6]]], [[[7,8]], [[9,10]], [[11,12]]]]
    ];
    var a = [
      [1, 3, 5],
      [[1,2,3]],
      [[1],[2],[3]],
      [[1,2,3], [4,5,6]],
      // error case
      [[1,2,3], [4,5,undefined]],
      [[1,2,3]],
      [[[1, 5], [3, 7]], [[2, 6], [4, 8]]],
      [[[[1, 7], [3, 9], [5, 11]]], [[[2, 8], [4, 10], [6, 12]]]]
    ];

    for (var i = 0; i < q.length; i++) {
      st.trans(q[i]).should.eql(a[i]);
    }

    done();
  });
});