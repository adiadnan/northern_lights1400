var should = require("should");
var csv = require("../lib/csv");

describe("CSV test", function () {

  describe("stringify test.", function () {

    it("table with one object to csv string.", function (done) {
      var tgt = [{
        string1: "this is 'test' and \"test\" string.",
        string2: 'this is too "test" string.',
        number: 12345,
        number2: NaN,
        number3: Infinity,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date("2000-01-01"),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        array: ["1", 2, undefined, true],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      }];

      var a = '"this is \'test\' and "test" string.","this is too "test" string.",12345,null,null,true,null,"2000-01-01T00:00:00.000Z","/[a-zA-Z0-9]/g","1",2,null,true,"\\s.*\\s","ig"\n';

      csv.stringify(tgt).should.eql(a);

      done();
    });


    it("table with some objects to csv string.", function (done) {
      var tgt = [{
        string: "this is 'test' and \"test\" string.",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date("2000-01-01"),
        regex: new RegExp("[a-zA-Z]"),
        array: ["1", undefined, Infinity],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      }, {
        string: 'this is too "test" string.',
        number: NaN,
        bool: false,
        // func: function () { var name = "FUNCTION 2."; console.log(name); },
        date: new Date("2000-01-02"),
        regex: new RegExp("[0-9]", "g"),
        array: ["10"],
        obj: {
          $regex: "name|phone"
        }
      }];

      var a = '"this is \'test\' and "test" string.",12345,true,null,"2000-01-01T00:00:00.000Z","/[a-zA-Z]/","1",null,null,"\\s.*\\s","ig"\n"this is too "test" string.",null,false,null,"2000-01-02T00:00:00.000Z","/[0-9]/g","10",null,null,"name|phone",null\n';

      csv.stringify(tgt).should.eql(a);

      done();
    });

    it("table with some objects to csv string with options.", function (done) {
      var tgt = [{
        string: "this is 'test' and \"test\" string.",
        number: 12345,
        bool: true,
        func: function () { var name = "FUNCTION."; console.log(name); },
        date: new Date("2000-01-01"),
        regex: new RegExp("[a-zA-Z]"),
        array: ["1", undefined, Infinity],
        obj: {
          $regex: "\\s.*\\s",
          $options: "ig"
        }
      }, {
        string: 'this is too "test" string.',
        string2: "this will be omitted.",
        number: NaN,
        bool: false,
        // func: function () { var name = "FUNCTION 2."; console.log(name); },
        date: new Date("2000-01-02"),
        regex: new RegExp("[0-9]", "g"),
        array: ["10"],
        obj: {
          $regex: "name|phone"
        }
      }];

      var opt = {
        delim: "\t",
        br: "\r\n",
        exclusions: ["string2"],
        miss: "\"NA\"",
        nan: "\"NaN\"",
        infinity: "\"Inf\""
      };

      var a =  '"this is \'test\' and "test" string."\t12345\ttrue\t"NA"\t"2000-01-01T00:00:00.000Z"\t"/[a-zA-Z]/"\t"1"\t"NA"\t"Inf"\t"\\s.*\\s"\t"ig"\r\n"this is too "test" string."\t"NaN"\tfalse\t""NA""\t"2000-01-02T00:00:00.000Z"\t"/[0-9]/g"\t"10"\t""NA""\t""NA""\t"name|phone"\t""NA""\r\n';

      csv.stringify(tgt, opt).should.eql(a);

      done();
    });

    it("table with some objects to csv string only with header and miss option.", function (done) {
      var tgt = [{
        string: "yamamoto",
        number: 12345,
        array: [10, 20, 30],
        object: {
          s: "taroh",
          n: 100
        }
      }, {
        string: "satoh",
        string2: "jr",
        number: NaN,
        array: [100, 200, 300, 400],
        object: {
          s: "youko",
          n: 1000
        }
      }];

      var opt = {
        miss: "\"NA\"",
        header: true
      };

      var a = '"string","number","array[0]","array[1]","array[2]","array[3]","object.s","object.n","string2"\n"yamamoto",12345,10,20,30,""NA"","taroh",100,""NA""\n"satoh","NA",100,200,300,400,"youko",1000,"jr"\n';

      csv.stringify(tgt, opt).should.eql(a);

      done();
    });

    it("2-dim table to csv string without options.", function (done) {
      var q = [
        [
          "string",
          "number",
          "bool",
          "date",
          "regexp",
          [{flag: "array[0].flag", value: "array[0].value"}, {flag: "array[1].flag", value: "array[1].value"}],
          {name: "object.name", number: "object.number"},
          "function"
        ],
        [
          "id_123456",
          987,
          false,
          new Date("2000-01-01"),
          (/[0-9]/),
          [{flag: true, value: 345}, {flag: false, value: 2}],
          {name: "John", number: "123456789"},
          function () {return 10;}
        ],
        [
          "id_98765",
          678,
          true,
          new Date("2001-01-01"),
          (/[A-Z]/),
          [{flag: false, value: 5}, {flag: true, value: 400}],
          {name: "Mark", number: "987654321"},
          function () {return 20;}
        ]
      ];

      var a = '"string","number","bool","date","regexp","array[0].flag","array[0].value","array[1].flag","array[1].value","object.name","object.number","function"\n"id_123456",987,false,"2000-01-01T00:00:00.000Z","/[0-9]/",true,345,false,2,"John","123456789",null\n"id_98765",678,true,"2001-01-01T00:00:00.000Z","/[A-Z]/",false,5,true,400,"Mark","987654321",null\n';

      csv.stringify(q).should.eql(a);

      done();
    });

    it("2-dim table to csv string with options test.", function (done) {
      var q = [
        [
          "id_123456",
          987,
          false,
          new Date("2000-01-01"),
          (/[0-9]/),
          [{flag: true, value: 345}, {flag: false, value: 2}],
          {name: "John", number: "123456789"},
          function () {return 10;}
        ],
        [
          "id_98765",
          NaN,
          true,
          new Date("2001-01-01"),
          (/[A-Z]/),
          [{flag: false, value: 5}, {flag: true, value: 400}],
          {name: "Mark", number: "987654321"},
          function () {return 20;}
        ]
      ];

      var opt = {
        delim: "\t",
        nan: "\"NaN\"",
        header: true
      };

      var a = '"[0]"\t"[1]"\t"[2]"\t"[3]"\t"[4]"\t"[5][0].flag"\t"[5][0].value"\t"[5][1].flag"\t"[5][1].value"\t"[6].name"\t"[6].number"\t"[7]"\n"id_123456"\t987\tfalse\t"2000-01-01T00:00:00.000Z"\t"/[0-9]/"\ttrue\t345\tfalse\t2\t"John"\t"123456789"\tnull\n"id_98765"\t"NaN"\ttrue\t"2001-01-01T00:00:00.000Z"\t"/[A-Z]/"\tfalse\t5\ttrue\t400\t"Mark"\t"987654321"\tnull\n';

      csv.stringify(q, opt).should.eql(a);

      done();
    });
  });

  describe("parse test.", function () {

    it("csv string to array of array.", function (done) {
      // this checks belows.
      //   all types of transformation is corrent.
      //   string with single/double quotation is correctly transformed.
      //   correct transforming from csv with delimiter that has space in back and forth.
      var q = '"string", "string2","number","number2","number3","bool","date","regex","array[0]","array[1]","array[2]","array[3]","obj.$regex","obj.$options"\n"this is \"test\" string, try string.", \'this is "sinle" \'quotation\' test.\',12345,"NaN","Infinity", true,"2000-01-01T00:00:00.000Z","/[a-zA-Z0-9]/g","1",2,"NA",true,"\\s.*\\s","ig"\n';

      var a = [
        ['"string"', '"string2"', '"number"', '"number2"', '"number3"', '"bool"', '"date"', '"regex"',
         '"array[0]"', '"array[1]"', '"array[2]"', '"array[3]"', '"obj.$regex"', '"obj.$options"'],
        ['"this is "test" string, try string."', '\'this is "sinle" \'quotation\' test.\'',
         '12345', '"NaN"', '"Infinity"', 'true', '"2000-01-01T00:00:00.000Z"', '"/[a-zA-Z0-9]/g"',
         '"1"','2', '"NA"', 'true', '"\\s.*\\s"', '"ig"']
      ];

      csv.parse(q).should.eql(a);
      done();
    });

    it("csv string to array of array with changing delimiter options.", function (done) {

      var q = '"string"; "string2";"number";"number2";"number3";"bool";"date";"regex";"array[0]";"array[1]";"array[2]";"array[3]";"obj.$regex";"obj.$options"\n"this is \"test\" string, try string."; \'this is "sinle" \'quotation\' test.\';12345;"NaN";"Infinity"; true;"2000-01-01T00:00:00.000Z";"/[a-zA-Z0-9]/g";"1";2;"NA";true;"\\s.*\\s";"ig"\n';

      var a = [
        ['"string"', '"string2"', '"number"', '"number2"', '"number3"', '"bool"', '"date"', '"regex"',
         '"array[0]"', '"array[1]"', '"array[2]"', '"array[3]"', '"obj.$regex"', '"obj.$options"'],
        ['"this is "test" string, try string."', '\'this is "sinle" \'quotation\' test.\'',
         '12345', '"NaN"', '"Infinity"', 'true', '"2000-01-01T00:00:00.000Z"', '"/[a-zA-Z0-9]/g"',
         '"1"','2', '"NA"', 'true', '"\\s.*\\s"', '"ig"']
      ];

      var opt = {
        delim: ";"
      };
      csv.parse(q, opt).should.eql(a);
      done();
    });

    it("csv string to array of array with type transformation options.", function (done) {

      var q = '"string", "string2","number","number2","number3","bool","date","regex","array[0]","array[1]","array[2]","array[3]","obj.$regex","obj.$options",\n"this is \"test\" string, try string.", \'this is "sinle" \'quotation\' test.\',12345,"NaN","Infinity", true,"2000-01-01T00:00:00.000Z","/[a-zA-Z0-9]/g","1",2,"NA",true,"\\s.*\\s","ig",\n';

      var a = [
        ['string', 'string2', 'number', 'number2', 'number3', 'bool', 'date', 'regex',
         'array[0]', 'array[1]', 'array[2]', 'array[3]', 'obj.$regex', 'obj.$options'],
        ['this is "test" string, try string.', 'this is "sinle" "quotation" test.',
         12345, NaN, Infinity, true, new Date("2000-01-01T00:00:00.000Z"), new RegExp("[a-zA-Z0-9]", "g"),
         '1',2, 'NA', true, '\\s.*\\s', 'ig']
      ];

      var opt = {
        asType: true,
        trimLastDelim: true
      };
      var ans = csv.parse(q, opt);
      ans[0].should.eql(a[0]);
      ans[1][0].should.eql(a[1][0]);
      ans[1][1].should.eql(a[1][1]);
      ans[1][2].should.eql(a[1][2]);
      ans[1][3].should.be.NaN;
      ans[1][4].should.be.Infinity;
      ans[1][5].should.eql(a[1][5]);
      ans[1][6].should.eql(a[1][6]);
      ans[1][7].should.eql(a[1][7]);
      ans[1][8].should.eql(a[1][8]);
      ans[1][9].should.eql(a[1][9]);
      ans[1][10].should.eql(a[1][10]);
      ans[1][11].should.eql(a[1][11]);
      ans[1][12].should.eql(a[1][12]);
      ans[1][13].should.eql(a[1][13]);

      done();
    });

    it("csv string to array of object with transforming object options.", function (done) {

      var q = '"string", "string2","number","number2","number3","bool","date","regex","array[0]","array[1]","array[2]","array[3]","obj.$regex","obj.$options"\n"this is \"test\" string, try string.", \'this is "sinle" \'quotation\' test.\',12345,"NaN","Infinity", true,"2000-01-01T00:00:00.000Z","/[a-zA-Z0-9]/g","1",2,"NA",true,"\\s.*\\s","ig"\n';

      var a = [{
        string: 'this is "test" string, try string.',
        string2: 'this is "sinle" "quotation" test.',
        number: 12345,
        number2: NaN,
        number3: Infinity,
        bool: true,
        date: new Date("2000-01-01T00:00:00.000Z"),
        regex: new RegExp("[a-zA-Z0-9]", "g"),
        'array[0]': '1',
        'array[1]': 2,
        'array[2]': 'NA',
        'array[3]': true,
        'obj.$regex': '\\s.*\\s',
        'obj.$options': 'ig'
      }];

      var opt = {
        asType: true,
        toDict: true
      };
      var ans = csv.parse(q, opt);
      for (var p in a[0]) {
        if (typeof a[0][p] === "number" && isNaN(a[0][p])) {
          ans[0][p].should.be.NaN;
        } else if (typeof a[0][p] === "number" && !isFinite(a[0][p])) {
          ans[0][p].should.be.Infinity;
        } else {
          a[0][p].should.eql(ans[0][p]);
        }
      }
      done();
    });

    it("csv string to object with transforming object with designated header options.", function (done) {

      var q = '"string", "string2","number","number2","number3","bool","date","regex","array[0]","array[1]","array[2]","array[3]","obj.$regex","obj.$options"\n"this is \"test\" string, try string.", \'this is "sinle" \'quotation\' test.\',12345,"NaN","Infinity", true,"2000-01-01T00:00:00.000Z","/[a-zA-Z0-9]/g","1",2,"NA",true,"\\s.*\\s","ig"\n';

      var h = [
        "s1", "s2", "n1", "n2", "n3", "b", "d", "r", "a0", "a1", "a2", "a3", "or", "oo"
      ];

      var a = [{}, {}];
      a[0][h[0]] = "string";
      a[0][h[1]] = "string2";
      a[0][h[2]] = "number";
      a[0][h[3]] = "number2";
      a[0][h[4]] = "number3";
      a[0][h[5]] = "bool";
      a[0][h[6]] = "date";
      a[0][h[7]] = "regex";
      a[0][h[8]] = "array[0]";
      a[0][h[9]] = "array[1]";
      a[0][h[10]] = "array[2]";
      a[0][h[11]] = "array[3]";
      a[0][h[12]] = "obj.$regex";
      a[0][h[13]] = "obj.$options";

      a[1][h[0]] = 'this is "test" string, try string.';
      a[1][h[1]] = 'this is "sinle" "quotation" test.';
      a[1][h[2]] = 12345;
      a[1][h[3]] = NaN;
      a[1][h[4]] = Infinity;
      a[1][h[5]] = true;
      a[1][h[6]] = new Date("2000-01-01T00:00:00.000Z");
      a[1][h[7]] = new RegExp("[a-zA-Z0-9]", "g");
      a[1][h[8]] = '1';
      a[1][h[9]] = 2;
      a[1][h[10]] = 'NA';
      a[1][h[11]] = true;
      a[1][h[12]] = '\\s.*\\s';
      a[1][h[13]] = 'ig';

      var opt = {
        asType: true,
        toDict: true,
        header: h
      };
      var ans = csv.parse(q, opt);
      for (var p in a[0]) {
        if (typeof a[0][p] === "number" && isNaN(a[0][p])) {
          ans[0][p].should.be.NaN;
        } else if (typeof a[0][p] === "number" && !isFinite(a[0][p])) {
          ans[0][p].should.be.Infinity;
        } else {
          a[0][p].should.eql(ans[0][p]);
        }
      }
      done();
    });

    it("csv string to transposed array.", function (done) {

      var q = 'Date,Open,High,Low,Close,Volume,Adj Close\n2015-01-16,286.28,290.79,285.25,290.74,3466400,290.74\n2015-01-15,294.00,296.00,286.82,286.95,4410200,286.95\n2015-01-14,291.93,295.91,286.50,293.27,5464600,293.27\n2015-01-13,297.48,301.50,293.23,294.74,4130900,294.74\n2015-01-12,297.56,298.51,289.28,291.41,3404300,291.41\n2015-01-09,301.48,302.87,296.68,296.93,2589500,296.93\n';

      var a = [
        ['Date', '2015-01-16', '2015-01-15', '2015-01-14', '2015-01-13', '2015-01-12', '2015-01-09'],
        ['Open', '286.28', '294.00', '291.93', '297.48', '297.56', '301.48'],
        ['High', '290.79', '296.00', '295.91', '301.50', '298.51', '302.87'],
        ['Low', '285.25', '286.82', '286.50', '293.23', '289.28', '296.68'],
        ['Close', '290.74', '286.95', '293.27', '294.74', '291.41', '296.93'],
        ['Volume', '3466400', '4410200', '5464600', '4130900', '3404300', '2589500'],
        ['Adj Close', '290.74', '286.95', '293.27', '294.74', '291.41', '296.93']
      ];

      var opt = {
        transpose: true,
        // toDict should be ignored.
        toDict: true
      };

      csv.parse(q, opt).should.eql(a);
      done();
    });
  });
});