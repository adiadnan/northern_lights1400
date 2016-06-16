var should = require("should");
var num = require("../lib/num");

describe("Transforming number test", function () {

  describe("number to string with abbreviation.", function () {
    it("basic test", function (done) {
      // we cannot convert over 16 digits without significant figures because of cap of floating calclation.
      var q = [
        NaN, 1, 12, 123, 1234, 12345, 123456, 1234567, 12345678, 123456789,
        1234567891, 12345678912, 123456789123, 1234567891234, 12345678912345, 123456789123456, 1234567891234567,
        // cannot convert over 1234567891234567 to be overflowed
        -1, -12, -123, -1234, -12345, -123456, -1234567, -12345678, -123456789,
        -1234567891, -12345678912, -123456789123, -1234567891234, -12345678912345, -123456789123456, -1234567891234567,
        0.1, 0.12, 0.123, 0.1234, 0.12345, 0.123456, 0.1234567, 0.12345678, 0.123456789,
        0.1234567891, 0.12345678912, 0.123456789123, 0.1234567891234, 0.12345678912345, 0.123456789123456, 0.1234567891234567
      ];
      var a = [
        "NaN", "1", "12", "123", "1.234K", "12.345K", "123.456K", "1.234567M", "12.345678M", "123.456789M",
        "1.234567891G", "12.345678912G", "123.456789123G", "1.234567891234T", "12.345678912345T", "123.456789123456T", "1.234567891234567P",
        "-1", "-12", "-123", "-1.234K", "-12.345K", "-123.456K", "-1.234567M", "-12.345678M", "-123.456789M",
        "-1.234567891G", "-12.345678912G", "-123.456789123G", "-1.234567891234T", "-12.345678912345T", "-123.456789123456T",
        "-1.234567891234567P",
        "0.1", "0.12", "0.123", "0.1234", "0.12345", "0.123456", "0.1234567", "0.12345678", "0.123456789",
        "0.1234567891", "0.12345678912", "0.123456789123", "0.1234567891234", "0.12345678912345", "0.123456789123456", "0.1234567891234567"
      ];

      for (var i = 0; i < q.length; i++) {
        num.toAbbr(q[i]).should.eql(a[i]);
      }

      done();
    });

    it("significant test", function (done) {
      // we cannot convert over 16 digits without significant figures because of cap of floating calclation.
      var q = [
        1, 12, 123, 1234, 12345, 123456, 1234567, 12345678, 123456789,
        1234567891, 12345678912, 123456789123, 1234567891234, 12345678912345, 123456789123456,
        1234567891234567, 12345678912345678, 123456789123456789, 1234567891234567891, 12345678912345678912
      ];
      var a = [
        "1", "12", "123", "1.234K", "12.35K", "123.5K", "1.235M", "12.35M", "123.5M",
        "1.235G", "12.35G", "123.5G", "1.235T", "12.35T", "123.5T",
        "1.235P", "12.35P", "123.5P", "1235P", "12350P"
      ];
      var sig = 4;

      for (var i = 0; i < q.length; i++) {
        num.toAbbr(q[i], sig).should.eql(a[i]);
      }

      done();
    });

    it("not symbol but name test", function (done) {
      var q = [
        1, 12, 123, 1234, 12345, 123456, 1234567, 12345678, 123456789,
        1234567891, 12345678912, 123456789123, 1234567891234, 12345678912345, 123456789123456, 1234567891234567
      ];
      var a = [
        "1", "12", "123", "1.234K", "12.345K", "123.456K", "1.234567M", "12.345678M", "123.456789M",
        "1.234567891B", "12.345678912B", "123.456789123B", "1.234567891234T", "12.345678912345T", "123.456789123456T", "1.234567891234567Q"
      ];

      for (var i = 0; i < q.length; i++) {
        num.toAbbr(q[i], undefined, "name").should.eql(a[i]);
      }

      done();
    });

    it("substituting for nan test", function (done) {
      var q = [ NaN, NaN ];
      var a = [ "NaN", "N/A" ];

      num.toAbbr(q[0]).should.eql(a[0]);
      num.toAbbr(q[1], undefined, undefined, "N/A").should.eql(a[1]);

      done();
    });
  });

  describe("string with abbreviation to number.", function () {
    it("basic test", function (done) {
      // we cannot convert over 16 digits without significant figures because of cap of floating calclation.
      var q = [
        "", "1", "12", "123", "1.234K", "12.345K", "123.456K", "1.234567M", "12.345678M", "123.456789M",
        "1.234567891G", "12.345678912G", "123.456789123G", "1.234567891234T", "12.345678912345T", "123.456789123456T", "1.234567891234567P",
        "-1", "-12", "-123", "-1.234K", "-12.345K", "-123.456K", "-1.234567M", "-12.345678M", "-123.456789M",
        "-1.234567891G", "-12.345678912G", "-123.456789123G", "-1.234567891234T", "-12.345678912345T", "-123.456789123456T",
        "-1.234567891234567P",
        "0.1", "0.12", "0.123", "0.1234", "0.12345", "0.123456", "0.1234567", "0.12345678", "0.123456789",
        "0.1234567891", "0.12345678912", "0.123456789123", "0.1234567891234", "0.12345678912345", "0.123456789123456", "0.1234567891234567"
      ];
      var a = [
        0, 1, 12, 123, 1234, 12345, 123456, 1234567, 12345678, 123456789,
        1234567891, 12345678912, 123456789123, 1234567891234, 12345678912345, 123456789123456, 1234567891234567,
        // cannot convert over 1234567891234567 to be overflowed
        -1, -12, -123, -1234, -12345, -123456, -1234567, -12345678, -123456789,
        -1234567891, -12345678912, -123456789123, -1234567891234, -12345678912345, -123456789123456, -1234567891234567,
        0.1, 0.12, 0.123, 0.1234, 0.12345, 0.123456, 0.1234567, 0.12345678, 0.123456789,
        0.1234567891, 0.12345678912, 0.123456789123, 0.1234567891234, 0.12345678912345, 0.123456789123456, 0.1234567891234567
      ];

      for (var i = 0; i < q.length; i++) {
        num.fromAbbr(q[i]).should.eql(a[i]);
      }

      done();
    });
  });

  describe("number from/to percent string test", function () {
    it("to percent test", function (done) {
      // we cannot convert over 16 digits without significant figures because of cap of floating calclation.
      var q = [ NaN, 0.123, NaN ];
      var a = [ "NaN", "12.3%", "N/A" ];

      num.toPercent(q[0]).should.eql(a[0]);
      num.toPercent(q[1]).should.eql(a[1]);
      num.toPercent(q[2], "N/A").should.eql(a[2]);

      done();
    });

    it("from percent test", function (done) {
      // we cannot convert over 16 digits without significant figures because of cap of floating calclation.
      var q = [ "NaN", "12.3%", "N/A" ];
      var a = [ NaN, 0.123, NaN ];

      num.fromPercent(q[0]).should.be.NaN;
      num.fromPercent(q[1]).should.eql(a[1]);
      num.fromPercent(q[2]).should.be.NaN;

      done();
    });
  });

  describe("number detection test.", function () {
    it("valid number test", function (done) {
      var q = [
        "123", "1,234", "12,345.6", "1,234.5G", "1,234.5%", "(1,234.5)", "(1,234.5G)", "-1,234.5G", "+1,234.5G",
        "$1,234.5G", "1,234.5G$", "$(1,234.5G)", "(1,234.5G$)", "$-1,234.5G", "-1,234.5G$", "($1,234.5G)", "(1,234.5G$)",
        "-$1,234.5G"
      ];

      for (var i = 0; i < q.length; i++) {
        num.isNumber(q[i]).should.be.true;
      }

      done();
    });

    it("invalid number test", function (done) {
      var q = [
        // given null and undefined, throw exception.
        "", "Hi, i wanna drink beer."
      ];

      for (var i = 0; i < q.length; i++) {
        num.isNumber(q[i]).should.be.false;
      }

      done();
    });

    it("option test", function (done) {
      var q = [
        " €12,345.6", "12,345.6£ ", "Ұ( 12,345.6)", "(12,345.6HK$ )", "-12,345.6 US$"
      ];
      var option = {
        trim: true,
        currency: ["HK\\$", "US\\$"]
      };

      for (var i = 0; i < q.length; i++) {
        num.isNumber(q[i], option).should.be.true;
      }

      done();
    });

    it("transform test", function (done) {
      var q = [
        "", "Hi, i wanna drink beer.",
        "123", "1,234", "12,345.6", "1,234.5G", "1,234.5%", "(1,234.5)", "(1,234.5G)", "-1,234.5G", "+1,234.5G",
        "$1,234.5G", "1,234.5G$", "$(1,234.5G)", "(1,234.5G$)", "$-1,234.5G", "-1,234.5G$", "($1,234.5G)", "(1,234.5G$)",
        "-$1,234.5G",
        " €12,345.6", "12,345.6£ ", "Ұ( 12,345.6)", "(12,345.6HK$ )", "-12,345.6 US$"
      ];
      var a = [
        NaN, NaN,
        123, 1234, 12345.6, 1234500000000, 12.345, -1234.5, -1234500000000, -1234500000000, 1234500000000,
        1234500000000, 1234500000000, -1234500000000, -1234500000000, -1234500000000, -1234500000000, -1234500000000, -1234500000000,
        -1234500000000,
        12345.6, 12345.6, -12345.6, -12345.6, -12345.6
      ];
      var option = {
        trim: true,
        currency: ["HK\\$", "US\\$"]
      };

      for (var i = 0; i < q.length; i++) {
        var res = num.toNumber(q[i], option);
        if (isNaN(a[i])) {
          res.should.be.NaN;
        } else {
          res.should.eql(a[i]);
        }
      }
      done();
    });
  });
});