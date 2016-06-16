# omotenashi-js

This is released under the MIT License, see LICENSE.

This tools is for not re-inventing the wheel, which contain deep copying, stringify/parse csv/json, number abbreviation, forming time series data and so on.

## Installation

To install with [npm](http://github.com/isaacs/npm):

    npm install omotenashi-js

Current version is tested with node v0.10.33.

## Test

See test/*.js and below "How to use" to learn how to use.

```bash
$ mocha test
```

## Features

+ deep copy with not only normal use but also template creation.

"copy.copy" copies object shallowly and deeply. Furthermore, this method creates bigger object/array as template in base of source object. For example, you can set copy.copy(true, {a: [1]}, "NA", {a: [10,20], b: "dad"}), this returns {a: ["NA", "NA"], b:"NA"}. This involves copied objects with the same object container so that this is suitable for parser of csv. See below "how to use" section in details.

+ stringifying/parsing from/to csv.

"csv.stringify/parse" stringifies/parses from/to csv. "csv.stringify" and "csv.parse" can recognize not only array but also object. In details, "csv.stringify" stringifies not only two-dimentional array but also array of objects. Objects in an array can have different properties from others, and their properties can have array with different length. For exmanple, [{name: "yamamoto", attr: ["Male", 24]}, {phone: 123, attr: ["Female", undefined, "student"]}] is stringifies to '"name", "phone", "attr[0]", "attr[1]", "attr[2]" \n "yamamot", null, "Male", 24, null \n null, 123, "Female", null, "student"\n' (add space for easily reading). Furthermore, "csv.parse" can transform a word in csv string to value as it is. For example, '"yamamoto", 123' is parsed String "yamamoto" and Number 123. This means that this recognizes false/null/true/object/array/number/string/date/regexp, but otherwises, like function, are stringified to "null".

+ extended json parser/stringifier that can transform Function, Date, RegExp, undefined, Infinity and NaN.

"json.parse" and "json.stringify" methods parse/stringify to/from your json/object. The json.stringify is expanded stringifier, which can stringifies undefined, Infinity, NaN, RegExp and Function to their own string. Besides, this can transform RegExp to mongoDB's format ({$regex: RegExp.source, $options: "i/g/m"}). The json.parse is expanded method from JSON.parse, and this parses a string to which json.stringify has transformed. In addition, this parses Date string in json to Date object.

+ number from/to abbreviated string, and detector of number

"num.toAbbr" can abbreviate number without a floating point error. Furthermore, "num.toAbbr" can set a significant figure to abbreviated string. For example, 10^9 is transformed to "10G" or "10B". "num.fromAbbr" can transform the opposite to "num.toAbbr".
And "num.isNumber/toNumer" is detect/transform string to number, which string can contain ",", "%", abbreviation like "K" and "G" and currency "$" and "£".

+ extra statistics library

"stats.mean/var/sd" can calculate mean/variance/standard deviation with delta degrees of freedom of multi-dimentional array respectively. "stats.vol/hv" can calculate volatility array/historical volatility of one-dimentional array. Further, "stats.trans" can make given array transposed, which given array can have any dimention.

+ sorting and filling gap in time series array.

"ts.formAnnualDays" forms and fills a gap in an array of time series, which time series array contains several annual days. For example, [Date("Dec 27, 2014"), Date("Dec 30, 2013"), Date("Jan 1, 2012")] that is skipped 2012's annual day is given, this returns [Date("Dec 27, 2014"), Date("Dec 30, 2013"), Date("Dec 30, 2012"), Date("Jan 1, 2012")] that is filled "2012's annual date" gap.


## How to use

### deep copying and template creation

```javascript
// copy.copy

var cp = require("omotenashi-js").copy;
var src = {
  name: "yamamoto",
  phone: 012-345-6789,
  location: [35.658551, 139.745542]
};
var dst, diff;

// shallow copy
dst = cp.copy(false, src);
dst.location[0] = 10.0;
diff = src === dst; // true

// deep copy
dst = cp.copy(true, src);
dst.location[0] = 20.0;
diff = src === dst; // false

// deep copy with substitute
// dst is {
//   name: "NA",
//   phone: "NA",
//   location: ["NA", "NA"]
// }
dst = cp.copy(true, src, "NA");

// deep copy with daddy. Note that copy.copy makes daddy overwritten by src.
// dst is {
//   name: "yamamoto",
//   address: "New Tokyo",
//   phone: 012-345-6789,
//   location: [35.658551, 139.745542, "Mars"]
// }
var daddy = {
  name: "satoh",
  address: "New Tokyo",
  location: [0.0, 0.0, "Mars"]
};
dst = cp.copy(true, src, undefined, daddy);

// create template and acquire copied objects with the same template.
src = [{
  name: "yamamoto",
  phone: 012-345-6789,
  location: [35.658551, 139.745542]
}, {
  name: "satoh",
  address: "New Tokyo",
  location: [0.0, 0.0, "Mars"]
}];

var template = src.reduce(function (p, v) {
  return cp.copy(true, v, "NA", p);
}, {});
// dst is [{
//   name: "yamamoto",
//   address: "NA",
//   phone: 012-345-6789,
//   location: [35.658551, 139.745542, "NA"]
// }, {
//   name: "satoh",
//   address: "New Tokyo",
//   phone: "NA",
//   location: [0.0, 0.0, "Mars"]
//
// }]
var dst = src.reduce(function (p, v) {
  var temp = cp.copy(true, template);
  p.push(cp.copy(true, v, undefined, temp));
  return p;
}, []);
```

### Parse/Stringify CSV

```javascript
// csv.stringify
var csv = require("omotenashi-js").csv;
var options = {
  delim: String, // delimiter, default is ","
  br: String, // break code, default is "\n"
  miss: "Anything", // substitute for values that cannot be stringified, like function. default is null.
  nan: "Anything", // substitute for NaN, like '"NaN"'. default is null.
  infinity: "Anything", // substitute for Infinity, like '"Inf"'. default is null.
  header: Boolean, // whether given array of arguments has header on first line or not.
  exclusions: Array // array of string that is property name for ignoring.
};

var result = csv.stringify([{"your": "object"}], options);
// or
csv.stringify([{"your": "object"}], options, function (err, result) {
  // your code
});
```

```javascript
// csv.parse
var csv = require("omotenashi-js").csv;
var options = {
  delim: String, // delimiter string, default is ",".
  trimLastDelim: Boolean, // true to remove extra delimiter in each line, like "a,b,c,".
  asType: Boolean, // whether to cast adequate type.
  transpose: Boolean, // whether to return transposed array.
  toDict: Boolean, // whether to cast dictionary (hash). if false, this returns 2-dim array.
  header: Array // array of strings that become property name. this should be set with options.toDict.
                // if options.toDict is true and options.header is undefined,
                // this assumes that first line of csv string might contain property names.
};

var result = csv.parse("your csv string", options);
// or
csv.parse("your csv string", options, function (err, result) {
  // your code
});
```

### Parse/Stringify JSON

```javascript
// json.stringify
var json = require("omotenashi-js").json;
var options = {
  holdUndefined: Boolean, // to remain undefined.
  holdInfinity: Boolean, // to remain Infinity.
  holdNaN: Boolean, // to remain NaN.
  holdRegExp: Boolean, // to remain RegExp, if RegExp2Object is false, transform to String.
  holdFunction: Boolean, // to remain Function.
  RegExp2Object: Boolean // to transform RegExp to mongo format
                         // {$regex: RegExp.source, $options: "i/g/m"}.
                         // this is only refered when holdRegExp is true.
};
json.stringify({"your": "object"}, options, function (err, res) {
  // res is stringified json, which is only returned when no error.
});
// or (doesnot be given callback, return stringified json and throw error.)
var result = json.stringify({"your": "object"}, options);
```

```javascript
// json.parse
var json = require("omotenashi-js").json;
var options = {
  holdUndefined: Boolean, // to parse "undefined" to undefined.
  holdInfinity: Boolean, // to parse "Infinity" to Inifinity.
  holdNaN: Boolean, // to parse "NaN" to NaN.
  holdDate: Boolean, // to parse stringified Date string to Date object.
  holdRegExp: Boolean, // to parse stringified RegExp string to RegExp object.
                       // object with mongo format IS NOT converted to RegExp object.
  holdFunction: Boolean, // to parse and evaluate from stringified function to function
                         // when both this AND "eval" option are true.
  eval: Boolean // for safety
};
json.parse("your json string", options, function (err, res) {
  // res is parsed from json, which is only returned when no error.
});
// or (doesnot be given callback, return stringified json and throw error.)
var result = json.parse("your json string"}, options);
```

### number from/to abbreviated string/percent, and detector of number.

```javascript
// num.toAbbr
var num = require("omotenashi-js").num;
var result;

result = num.toAbbr(1234); // "1.234K"
result = num.toAbbr(1234567891, 4); // "1.235G"
result = num.toAbbr(1234567891); // "1.234567891B"
result = num.toAbbr(-1234567891234567); // "-1.234567891234567P"
result = num.toAbbr(0.1234567891234567); // 0.1234567891234567
result = num.toAbbr(NaN); // "NaN"
result = num.toAbbr(NaN, undefined, undefined, "N/A"); // "N/A"
```

```javascript
// num.fromAbbr
var num = require("omotenashi-js").num;
var result;

result = num.fromAbbr(""); // 0
result = num.fromAbbr("1.234567891234567P"); // 1234567891234567
result = num.fromAbbr("-123.456789M"); // -123456789
result = num.fromAbbr("1.234567891B"); // 1234567891
```

```javascript
// num.toPercent
var num = require("omotenashi-js").num;
var result;

result = num.toPercent(NaN); // "NaN"
result = num.toPercent(0.123); // "12.3%"
result = num.toPercent(NaN, "N/A"); // "N/A"
```

```javascript
// num.fromPercent
var num = require("omotenashi-js").num;
var result;

result = num.fromPercent("NaN"); // NaN
result = num.fromPercent("12.3%"); // 0.123
```

```javascript
// num.isNumber
var num = require("omotenashi-js").num;
var result;

result = num.isNumber("€12,345.6"); // true
result = num.isNumber("12,345.6£ "); // true
result = num.isNumber("Ұ( 12,345.6)"); // true
result = num.isNumber("string"); // false
```
```javascript
// num.toNumber
var num = require("omotenashi-js").num;
var result;

result = num.toNumber("€12,345.6"); // result is 12345.6
result = num.toNumber("12,345.6£ "); // result is 12345.6
result = num.toNumber("Ұ( 12,345.6)"); // result is 12345.6
result = num.toNumber("string"); // NaN
```

### extra statistics

```javascript
// stats.mean/var/sd.
var st = require("omotenashi-js").stats;
var src1 = [60, 56, 61, 68, 51, 53, 69, 54];
var src2 = [[[[60], [56, 61]], [68]], [51, 53, 69, 54]];

// return 59, 40.0, 6.324555320336759 respectively.
console.log("s1's mean: ", st.mean(src1), ", variance: ", st.var(src1), ", std. deviation: ", st.sd(src1), ". ",
            "s2's mean: ", st.mean(src2), ", variance: ", st.var(src2), ", std. deviation: ", st.sd(src2));

// return 67.42857142857143, 45.714285714285715, 6.761234037828133 respectively.
console.log("s1's mean with 1 freedom: ", st.mean(src1, 1),
            ", variance with 1 freedom: ", st.var(src1, 1),
            ", std. deviation with 1 freedom: ", st.sd(src1, 1), ". ",
            "s2's mean with 1 freedom: ", st.mean(src2, 1),
            ", variance with 1 freedom: ", st.var(src2, 1),
            ", std. deviation with 1 freedom: ", st.sd(src2, 1));

// stats.vol/hv
// returns [0.010059814481564917, ...] (see in test/stats.js), 0.44474988721639824 and 0.4871990913525997 respectively.
var src3 = [31.65, 31.97, 32.25, 32.28, 34.62, 34.48, 32.28, 32.73, 34.9, 35.1, 35.33, 34.94, 35.23,
            35.24, 35.38, 36.03, 36.12, 36.32, 36.99, 38.45];
console.log("s3's volatility's array: ", st.vol(src3),
            ", s3's historical volatility in 250 days: ", st.hv(src3),
            ", historical volatility in 250 days: ", st.hv(src3),
            ", historical volatility in 300 days: ", st.hv(src3, 300));

// stats.trans
var src4 = [[[[1,2]], [[3,4]], [[5,6]]], [[[7,8]], [[9,10]], [[11,12]]]];
// returns [[[[1, 7], [3, 9], [5, 11]]], [[[2, 8], [4, 10], [6, 12]]]].
console.log(st.trans(src4));
```

### Forming and Filling a gap in time series.

```javascript
// ts.formAnnualDays
var ts = require("omotenashi-js").ts;

// source array should contain dates with the same timezone offset.
// it is acceptable that source is multi-dimentional array that has dates in first line of source and
//   some arrays in second and fowarding line. second arrays must have the same length of first array.
var src = [
  [new Date("Dec 30, 2011 EST"), new Date("Jan 1, 2014 EST"), new Date("Jan 10, 2011 EST")],
  [10, 100, 1000],
  [20, 200, 2000]
], dst;

// date of array is acceptable, and this returns date array sorted and filled a gap.
// returned array is sorted by descending.
// dst is []
//  new Date("Jan 1, 2014 EST"), "the date with 2013 as year and an average day as date",
//  new Date("Dec 30, 2011 EST"), new Date("Jan 10, 2011 EST")
// ]
dst = ts.formAnnualDays(src[0]);

// multi-dimentional array is acceptable, and this returns a multi-dimentional array
//   with sorted date array in the first line and sorted secondary arrays correspondingly.
// returned array is sorted by descending.
// dst is [
//  [new Date("Jan 1, 2014 EST"), "the date with 2013 as year and an average day as date",
//   new Date("Dec 30, 2011 EST"), new Date("Jan 10, 2011 EST")],
//  [100, "NA", 10, 1000],
//  [200, "NA", 20, 2000]
// ]
dst = ts.formAnnualDays(src);

var opt = {
  where: true, // need a sorted index or not. undefined/null is acceptable.
  order: "ascending", // order for sorting. default is "descending". undefined/null is acceptable.
  na: NaN, // substitute for a gap in secondary array. default is "NA". undefined/null is acceptable.
  latest: 2016, // the maximum year. no default value. undefined/null is acceptable.
  length: 5 // the maximum length of returned array. no default value. undefined/null is acceptable.
};

// you can get how source array is sorted, with "where" option.
// also, you can specify how to sort and complementary for a gap.
// any year is designated as a terminal year, and any length is done for a returned array.
// dst is [
//  [Date("Dec 30, 2011 EST"), "the date with 2013 as year and an average day as date",
//   Date("Jan 1, 2014 EST"), "the date with 2015 as year and an average day as date",
//   "the date with 2016 as year and an average day as date"],
//  [10, NaN, 100, NaN, NaN],
//  [20, NaN, 200, NaN, NaN]
// ]
dst = ts.formAnnualDays(src, opt);

// you can get a result using callback function.
var next = function (error, result) {
  if (!error) {
    dst = result;
  }
}
ts.formAnnualDays(src, undefined, next);
```


## Methods

### copy

#### copy.copy (deep, src, sub, daddy)

shallow/deep copying.

**deep**
- *Boolean* if true, this copies deeply. if false, this copies shallowly.

**src**
- *Object* copying source object. Boolean, Number, String, undefined, Function, Date, RegExp, Array, Object are acceptable. Please note that Function is copied as reference copy even if _deep_ is true.

**sub**
- *ANY_except_for_undefined*, *optional* substitute value assigned in copying destination object. Boolean, Number, String, null, Function, Date, RegExp, Array, Object are acceptable.

**daddy**
- *Object*, *optional* copying destination object. This is overwritten by src. If this is undefined, src is copied to new Object {}.

### csv

#### csv.parse (str, opt, next)

parsing csv.

**csv**
- *String* CSV string.

**opt**
- *Object*, *optional* options. this object can have "delim", "trimLastDelim", "asType", "transpose", "toDict" and "header". With "delim" option, you can designate csv's delimiter. "trimLastDelim" will be set true to eliminate extra delimiter in each line string, like "a,b,c,\n1,2,3,".
With "asType" set to true, this assigns adequate type for string. false, null, true, number, (also NaN/Infinity), string, date and regexp can be assigned, but this cannot understand function and undefined. This assumes that "string" enclosed quotation "\"" or "'" might be string, strings without quotation might be other types. With "transpose" option set to true, this make result csv array transposed like [[h0, h1], [0, 1], [10, 11]] to [[h0, 0, 10], [h1, 1, 11]]. This option is alternative of toDict option and has the priority over toDict. With "toDict" set to true, this tries to make object using array[0] as property name, which array[0] is first line of a result of csv parsing. For example, '"h1", "h2"\n"v1", "v2"\n' is returned {"h1": "v1", "h2", "v2"} with this option. With "header" option, you can designate header strings. opt.header can have an array with string values, like ["h1", "h2"].

**next**
- *Function*, *optional* this is optional and callback function with arguments "error", "parsed object" and your original arguments. if the function doesnot be set, this method return the result and throw the error as needed.

#### csv.stringify (obj, opt, next)

stringify an array of javaspcript object or array.

**obj**
- *Object* two dimentional array, each of which inner array has the same length as others. or array of objects, which objects can have different properties and their properties can have array with different length from other properties.

**opt**
- *Object*, *optional* options. this object can have "delim", "br", "miss", "nan", "infinity", "header" and "exclusions". "dellim" and "br" options, you can set the delimiter and break code respectively. their default value is "," and "\n" respectively. With "miss", "nan" and "infinity" options, you can set substitute string to a default value null, like "\"NA\"", "\"NaN\"" and "\"Inf\"". Note that "opt.infinity" should be set to \""Infinity"\" if you have a plan that stringified csv will be parsed with "opt.asType" option. "header" option is Boolean. if this option is true, this method makes header string in the head of csv string, which is made from inner array/object's property names. For example, header string of [{a:1, b:2}] and [[1, 2]] are '"a", "b"' and '"[0]", "[1]"' respectively. "exclusions" option is array of String. if this option is set like ["h2"], this method stringifies all property's values except for "h2", like '"h1"\n"v11"\n"v21"' when [{"h1":"v11", "h2": "v12"}, {"h1":"v21", "h2": "v22"}] is given. This option is valid only when "obj" is array of objects.

**next**
- *Function*, *optional* this is optional and callback function with arguments "error", "stringified" and your original arguments. if the function doesnot be set, this method return the result and throw the error as needed.

### json

#### json.parse (json, opt, next)

parsing json.
This uses "eval" only when opt.eval is set, so please be careful to use.

**json**
- *String* JSON string.

**opt**
- *Object*, *optional* options. see above "How to use" in details.

**next**
- *Function*, *optional* this is optional and callback function with arguments "error", "parsed object" and your original arguments. if the function doesnot be set, this method return the result and throw the error as needed.

#### json.stringify (obj, opt, next)

stringify javaspcript object.

**obj**
- *Object* JavaScript Object.

**opt**
- *Object*, *optional* options. see above "How to use" in details.

**next**
- *Function*, *optional* this is optional and callback function with arguments "error", "stringified" and your original arguments. if the function doesnot be set, this method return the result and throw the error as needed.

#### json.isString (val)

return whether argument "val" is String or not.

**val**
- *Object or built-in object* checked value.

#### json.isNumber (val)

return whether argument "val" is Number or not.

**val**
- *Object or built-in object* checked value.

#### json.isBoolean (val)

return whether argument "val" is Boolean or not.

**val**
- *Object or built-in object* checked value.

#### json.isFunction (val)

return whether argument "val" is Function or not.

**val**
- *Object or built-in object* checked value.

#### json.isDate (val)

return whether argument "val" is Date or not.

**val**
- *Object or built-in object* checked value.

#### json.isRegExp (val)

return whether argument "val" is RegExp or not.

**val**
- *Object or built-in object* checked value.

#### json.isNaN (val)

return whether argument "val" is NaN or not.

**val**
- *Object or built-in object* checked value.

#### json.isInfinity (val)

return whether argument "val" is Infinity or not.

**val**
- *Object or built-in object* checked value.

#### json.isDateString (str)

return whether argument "str" is string that can indicates date or not.

**str**
- *String* checked value.

#### json.isRegExpString (str)

return whether argument "str" is string that can indicates RegExp or not.

**str**
- *String* checked value.

#### json.isFunctionString (str)

return whether argument "str" is string that can indicates Function or not.

**str**
- *String* checked value.

#### json.isRegExpObject (val)

return whether argument "val" is object that can indicates regular expression with mongoDB format or not.

**val**
- *Object* checked value.

#### json.isActuallyRegExp (val)

return whether argument "val" is object that is RegExp() or regular expression with mongoDB format or not.

**val**
- *Object* checked value.

#### json.regexp2object (re)

return transformed regular expression with mongoDB format.

**re**
- *Object* RegExp object.

#### json.string2regexp (str, opt)

convert string to RegExp object. If opt.RegExp2Object is true, convert to RegExp object with mongoDB format.

**str**
- *String* coverted value.

**opt**
- *Object* options.

#### json.string2date (str)

strictly convert string to Date. If "str" doesnot equal with toJSON() of transformed Date, this returns undefined.

**str**
- *String* coverted value.

#### json.string2function (str)

convert string that assumes to indicate function to Function.
This uses "eval", so please be careful to use.

**str**
- *String* coverted value.

### num

#### num.toAbbr (n, sig, desc, sub)

number to abbreviated string.

**n**
- *Number* calculated number. we cannot convert over 16 digits without significant figures because of cap of floating calclation.

**sig**
- *Number*, *optional* a significant figure. this is not for calcrating collect significant figure. for example, if you set toAbbr(1, 3), this return "1" not "1.00".

**desc**
- *String*, *optional* desc is "symbol" or "name", which is abbreviated type. for example, 10^9 is "10G" in "symbol" or "10B" in "name". by default this is "symbol".

**sub**
- *String*, *optional* sub is substitute string for "NaN" if n might be NaN.

#### num.fromAbbr (s)

abbreviated string to number.

**s**
- *String* transformed string with abbreviation.

#### num.toPercent (n, sub)

number to percentage string.

**n**
- *Number* n is to be transformed to percent string.

**sub**
- *String*, *optional* sub is substitute string for "NaN" if n might be NaN.

#### num.fromPercent (s)

**s**
- *String* transformed string with percent.

#### num.isNumber (s, opt, detail)

detect number from given string, and then return true/false.

**s**
- *String* numeric string. this can contain ",", "%" and abbreviation like "K", "T", of course also ".". note that "%" cannot be used with abbreviation character (maybe this case is no longer in everyday usage).

**opt**
- *Object* optonal. this can contain "trim" and "currency" members. "trim" might be true to trim space from s. by default, this is false. "currency" can set array that contains currency's string, like ["₩", "؋", "₲", "₡", "₪", "₵", "¢", "৲", "৳", "US\\$"]. note that string with [KMBTQGP] as top character cannot recognize currency.

**detail**
- *Boolean* extra optional. this might be true to return result of regular expression not boolean.

#### num.toNumber (s, opt)

detect and transform number from given string, then return Number or NaN.

**s**
- *String* numeric string. see remarks in an explanation of isNumber function.

**opt**
- *Object* optonal. this option is for isNumber function.

### stats

#### stats.mean (x, ddos)

calculate mean of array that has any dimension.

**x**
- *Array* calculated array with Number. x can have any dimention. See "How to use".

**ddos**
- *Number*, *optional* ddof is optional and should be integer number, which is “Delta Degrees Of Freedom” and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.

#### stats.var (x, ddos)

calculate variance of array that has any dimension.

**x**
- *Array* calculated array with Number. x can have any dimention. See "How to use".

**ddos**
- *Number*, *optional* ddof is optional and should be integer number, which is “Delta Degrees Of Freedom” and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.

#### stats.sd (x, ddos)

calculate standard deviation of array that has any dimension.

**x**
- *Array* calculated array with Number. x can have any dimention. See "How to use".

**ddos**
- *Number*, *optional* ddof is optional and should be integer number, which is “Delta Degrees Of Freedom” and makes the divisor calculated N - ddof, where N represents the number of elements. By default this is zero.

#### stats.vol (x)

calculate volatilities ((x_t - x_(t-1)) / x_(t-1)) of one-dimentional array.

**x**
- *Array* calculated array with Number. x can have one dimention.

#### stats.hv (x, n)

calculate historical volatility of one-dimentional array.

**x**
- *Array* calculated array with Number. x can have one dimention.

**n**
- *Number*, *optional* n is optional and means the number of days in year for calculating volatility at an annual rate. by default this is 250.

#### stats.trans (x)

make array transposed.

**x**
- *Array* array with Number. x can have any dimention. See "How to use".

### ts

#### ts.formAnnualDays (unlined, options, next)

returns date array sorted and filled a gap.

**unlined**
- *Array* one or two dimentional array is acceptable. when one-dimentional array is given, this array must contain Date objects, and two-dimentional array must contain an array within Date object as first line and arrays that has the same length of first date array. Date objects in date array should be set with the same timezone offset.

**options**
- *Object*, *optional* Object within options, each of which properties is where, order, na, latest and length. "where" is boolean whether returned array should contain sorted index. If this option is true, this function returns {x: "sorted date array", ix: "sorted index"}. If false, this returns only sorted date array (also and secondary sorted arrays when to be given). -1 in index array means gap's index. "order" indicates an order of elements in array and allowed to be set "descending" or "ascending". "na" is value filled to gap of "second" arrays. For example, [[Date("Dec 27, 2014 EST"), Date("Dec 30, 2012 EST")], [10, 100]] is given, this returns [[Date("Dec 27, 2014 EST"), Date("Dec 28, 2013 EST"), Date("Dec 30, 2012 EST")], [10, "NA", 100]]. "NA" is default value for filled gap. "latest" is set as the utmost year, which involves that this arranges the date array to have designated year as the maximum year. "length" is length of returned array. if this is not set, this returns array with sufficient length.

**next**
- *Function*, *optional* this is optional and callback function with arguments "error", "result" and your original arguments. if the function doesnot be set, this method return the result and throw the error as needed.

#### nextQ (date)

returns the first day of next quarter to the quarter with the given date.

**date**
- *Date* Date object. If this is undefined, this assumes that today in local timezone is given.

#### currentQ (date)

returns the first day of current quarter to the quarter with the given date.

**date**
- *Date* Date object. If this is undefined, this assumes that today in local timezone is given.

#### lastQ (date)

returns the first day of last quarter to the quarter with the given date.

**date**
- *Date* Date object. If this is undefined, this assumes that today in local timezone is given.
