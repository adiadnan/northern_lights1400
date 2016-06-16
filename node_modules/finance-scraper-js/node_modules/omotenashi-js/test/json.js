var should = require("should");
var json = require("../lib/json");

describe("Json parse/stringify test", function () {
  var target = {
    string: "test",
    number: 12345,
    bool: true,
    func: function () { var name = "FUNCTION."; console.log(name); },
    date: new Date(),
    regex: new RegExp("[a-zA-Z0-9]", "g"),
    array: [NaN, undefined, Infinity],
    obj: {
      $regex: "\\s.*\\s",
      $options: "ig"
    }
  };

  describe("Json stringify test", function () {
    it("return the same value of JSON.stringify.", function (done) {
      var options = {
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);
        r.should.eql(JSON.stringify(target));
        done();
      });
    });

    it("return JSON.stringify() with bare expression (NaN, Infinity, undefined, RegExp and function)", function (done) {
      var options = {
        holdUndefined: true,
        holdInfinity: true,
        holdNaN: true,
        holdDate: true,
        holdRegExp: true,
        holdFunction: true
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);
        r.should.eql(JSON.stringify({
          string: target.string,
          number: target.number,
          bool: target.bool,
          func: target.func.toString(),
          date: target.date,
          regex: target.regex.toString(),
          array: target.array.map(function (v) {
            return v === undefined? "undefined" : isNaN(v)? "NaN" : !isFinite(v)? "Infinity" : "";
          }),
          obj: target.obj
        }));
        done();
      });
    });

    it("return JSON.stringify() with bare expression without callback.", function (done) {
      var options = {
        holdUndefined: true,
        holdInfinity: true,
        holdNaN: true,
        holdDate: true,
        holdRegExp: true,
        holdFunction: true
      };

      var r, e;
      try {
        r = json.stringify(target, options);
      } catch (err) {
        e = err;
      }

      should.not.exist(e);
      should.exist(r);
      r.should.eql(JSON.stringify({
        string: target.string,
        number: target.number,
        bool: target.bool,
        func: target.func.toString(),
        date: target.date,
        regex: target.regex.toString(),
        array: target.array.map(function (v) {
          return v === undefined? "undefined" : isNaN(v)? "NaN" : !isFinite(v)? "Infinity" : "";
        }),
        obj: target.obj
      }));
      done();
    });

    it("return json with regexp formatted as object.", function (done) {
      var options = {
        holdUndefined: true,
        holdInfinity: true,
        holdNaN: true,
        holdDate: true,
        holdRegExp: true,
        holdFunction: true,
        RegExp2Object: true
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);
        r.should.eql(JSON.stringify({
          string: target.string,
          number: target.number,
          bool: target.bool,
          func: target.func.toString(),
          date: target.date,
          regex: {
            $regex: target.regex.source,
            $options: "g"
          },
          array: target.array.map(function (v) {
            return v === undefined? "undefined" : isNaN(v)? "NaN" : !isFinite(v)? "Infinity" : null;
          }),
          obj: target.obj
        }));
        done();
      });
    });
  });

  describe("Json parse test", function () {
    it("return the same value of JSON.parse.", function (done) {
      var options = {
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        json.parse(r, options, function (ee, rr) {
          should.not.exist(ee);
          should.exist(rr);
          rr.should.eql(({
            string: target.string,
            number: target.number,
            bool: target.bool,
            // property with function is eliminated.
            date: target.date.toJSON(),
            regex: {},
            array: target.array.map(function (v) {
              return null;
            }),
            obj: target.obj
          }));
          done();
        });
      });
    });

    it("return the same value of JSON.parse without callback.", function (done) {
      var options = {
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        var rr, ee;
        try {
          rr = json.parse(r, options);
        } catch (eee) {
          ee = eee;
        }

        should.not.exist(ee);
        should.exist(rr);
        rr.should.eql(({
          string: target.string,
          number: target.number,
          bool: target.bool,
          // property with function is eliminated.
          date: target.date.toJSON(),
          regex: {},
          array: target.array.map(function (v) {
            return null;
          }),
          obj: target.obj
        }));
        done();
      });
    });

    it("return as same as the target.", function (done) {
      var options = {
        holdUndefined: true,
        holdInfinity: true,
        holdNaN: true,
        holdDate: true,
        holdRegExp: true,
        holdFunction: true,
        eval: true
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        json.parse(r, options, function (ee, rr) {
          should.not.exist(ee);
          should.exist(rr);
          rr.string.should.eql(target.string);
          rr.number.should.eql(target.number);
          rr.bool.should.eql(target.bool);
          rr.func.toString().should.equal(target.func.toString());
          rr.date.should.eql(target.date);
          rr.regex.should.eql(target.regex);
          rr.array.should.be.an.Array;
          rr.array[0].should.be.NaN;
          (rr.array[1] === undefined).should.be.true;
          rr.array[2].should.be.Infinity;
          target.obj.should.eql(rr.obj);
          done();
        });
      });
    });

    it("return the same value of the target except for regexp (this varies to object).", function (done) {
      var options = {
        holdUndefined: true,
        holdInfinity: true,
        holdNaN: true,
        holdDate: true,
        holdRegExp: true,
        holdFunction: true,
        RegExp2Object: true,
        eval: true
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        json.parse(r, options, function (ee, rr) {
          should.not.exist(ee);
          should.exist(rr);
          rr.string.should.eql(target.string);
          rr.number.should.eql(target.number);
          rr.bool.should.eql(target.bool);
          rr.func.toString().should.equal(target.func.toString());
          rr.date.should.eql(target.date);
          rr.regex.should.eql({
            $regex: target.regex.source,
            $options: "g"
          });
          rr.array.should.be.an.Array;
          rr.array[0].should.be.NaN;
          (rr.array[1] === undefined).should.be.true;
          rr.array[2].should.be.Infinity;
          target.obj.should.eql(rr.obj);
          done();
        });
      });
    });

    it("return error without exception.", function (done) {
      var options = {
      };

      json.stringify(target, options, function (e, r) {
        should.not.exist(e);
        should.exist(r);

        r = r.substring(0, Math.ceil(Math.random() * r.length - 1));

        json.parse(r, options, function (ee, rr) {
          should.exist(ee);
          done();
        });
      });
    });
  });
});