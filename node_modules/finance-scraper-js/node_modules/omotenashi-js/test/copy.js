var should = require("should");
var cp = require("../lib/copy");

describe("Copy test", function () {

  describe("shallow/deep copy test.", function () {
    it("shallow copy test", function (done) {
      var tgt = {
        string: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      var ans = cp.copy(false, tgt);
      ans.should.eql(tgt);

      // changes should be refrected to original.
      ans.string = "change";
      ans.should.eql(tgt);

      done();
    });

    it("deep copy test", function (done) {
      var tgt = {
        string: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      var ans = cp.copy(true, tgt);
      ans.should.eql(tgt);

      // changes should not be refrected to original.
      ans.string = "change";
      ans.should.not.eql(tgt);

      done();
    });

    it("deep copy test (not object)", function (done) {
      var q = ["string", 1, true, [1, "2", 3], new Date()];

      for (var i = 0; i < q.length; i++) {
        cp.copy(true, q[i]).should.eql(q[i]);
      }

      done();
    });

    it("deep copy with substitution test", function (done) {
      var tgt = {
        string: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      var teacher = {
        string: "NA",
        number: "NA",
        bool: "NA",
        func: "NA",
        date: "NA",
        regex: "NA",
        array: ["NA", "NA", "NA"],
        obj: {
          $regex: "NA",
          $options: "NA"
        }
      };

      var ans = cp.copy(true, tgt, "NA");
      ans.should.eql(teacher);

      done();
    });

    it("deep copy with daddy and substitution test", function (done) {
      var tgt = {
        string: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      var dad = {
        string: "dad test",
        number: 123456789,
        bool: true,
        func: function () { var name = "FUNCTION DAD."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true, "NA"],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      var teacher = {
        string: "NA",
        number: "NA",
        bool: "NA",
        func: "NA",
        date: "NA",
        regex: "NA",
        array: ["NA", "NA", "NA", "NA"],
        obj: {
          $regex: "NA",
          $options: "NA"
        }
      };

      var ans = cp.copy(true, tgt, "NA", dad);
      ans.should.eql(teacher);

      done();
    });

    it("deep copy with daddy test", function (done) {
      var tgt = {
        string2: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; return name; },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, true],
        obj: {
          $regex2: "\\s.*\\s",
          $options2: "g"
        }
      };

      var dad = {
        string1: "dad test",
        number: 123456789,
        bool: true,
        func: function () { var name = "FUNCTION DAD."; return name; },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: [{any: "value"}, "123", 100, new Date()],
        obj: {
          $regex1: "a-zA-Z0-9",
          $options1: "i"
        }
      };

      var teacher = {
        string1: dad.string1,
        string2: tgt.string2,
        number: tgt.number,
        bool: tgt.bool,
        func: tgt.func,
        date: tgt.date,
        regex: tgt.regex,
        array: [tgt.array[0], tgt.array[1], tgt.array[2], dad.array[3]],
        obj: {
          $regex1: dad.obj.$regex1,
          $options1: dad.obj.$options1,
          $regex2: tgt.obj.$regex2,
          $options2: tgt.obj.$options2
        }
      };

      var ans = cp.copy(true, tgt, undefined, dad);
      ans.should.eql(teacher);
      ans.func().should.eql(tgt.func());

      done();
    });
  });

  describe("overwrite test.", function () {
    it("basic test", function (done) {
      var dst0 = {
        string: undefined,
        number: undefined,
        bool: undefined,
        func: undefined,
        date: undefined,
        regex: undefined,
        array: undefined,
        obj: {
          $regex: undefined,
          $options: undefined
        }
      };

      var dst1 = {
        string: undefined,
        number: undefined,
        bool: undefined,
        func: undefined,
        date: undefined,
        regex: undefined,
        array: [],
        obj: {
          $regex: undefined,
          $options: undefined
        }
      };

      var dst2 = {
        string: undefined,
        number: undefined,
        bool: undefined,
        func: undefined,
        date: undefined,
        regex: undefined,
        array: ["1", "2", "3"],
        obj: {
          $regex: undefined,
          $options: undefined
        }
      };

      var src = {
        string: "test",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date(),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["4", "5"],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      };

      // src's array is copied if property in destination has no array.
      var ans = cp.overwrite(dst0, src);
      ans.should.eql(src);

      // src's array is copied if property in destination has smaller array than that of src.
      ans = cp.overwrite(dst1, src);
      ans.should.eql(src);

      ans = cp.overwrite(dst2, src);
      var teac = cp.copy(true, src);
      for (var i = teac.array.length; i < dst2.array.length; i++) {
        teac.array.push(dst2.array[i]);
      }
      ans.should.eql(teac);

      done();
    });
  });
});