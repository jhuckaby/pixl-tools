<details><summary>Table of Contents</summary>

<!-- toc -->
- [Overview](#overview)
- [Usage](#usage)
- [Module List](#module-list)
- [Function List](#function-list)
	* [timeNow](#timenow)
	* [generateUniqueID](#generateuniqueid)
	* [generateShortID](#generateshortid)
	* [digestHex](#digesthex)
	* [numKeys](#numkeys)
	* [firstKey](#firstkey)
	* [hashKeysToArray](#hashkeystoarray)
	* [hashValuesToArray](#hashvaluestoarray)
	* [isaHash](#isahash)
	* [isaArray](#isaarray)
	* [copyHash](#copyhash)
	* [copyHashRemoveKeys](#copyhashremovekeys)
	* [copyHashRemoveProto](#copyhashremoveproto)
	* [mergeHashes](#mergehashes)
	* [mergeHashInto](#mergehashinto)
	* [parseQueryString](#parsequerystring)
	* [composeQueryString](#composequerystring)
	* [findObjectsIdx](#findobjectsidx)
	* [findObjectIdx](#findobjectidx)
	* [findObject](#findobject)
	* [findObjects](#findobjects)
	* [deleteObject](#deleteobject)
	* [deleteObjects](#deleteobjects)
	* [alwaysArray](#alwaysarray)
	* [sub](#sub)
	* [setPath](#setpath)
	* [getPath](#getpath)
	* [getDateArgs](#getdateargs)
	* [getTimeFromArgs](#gettimefromargs)
	* [normalizeTime](#normalizetime)
	* [formatDate](#formatdate)
	* [getTextFromBytes](#gettextfrombytes)
	* [getBytesFromText](#getbytesfromtext)
	* [commify](#commify)
	* [shortFloat](#shortfloat)
	* [pct](#pct)
	* [zeroPad](#zeropad)
	* [clamp](#clamp)
	* [lerp](#lerp)
	* [getTextFromSeconds](#gettextfromseconds)
	* [getSecondsFromText](#getsecondsfromtext)
	* [getNiceRemainingTime](#getniceremainingtime)
	* [randArray](#randarray)
	* [pluralize](#pluralize)
	* [escapeRegExp](#escaperegexp)
	* [ucfirst](#ucfirst)
	* [getErrorDescription](#geterrordescription)
	* [bufferSplit](#buffersplit)
	* [fileEachLine](#fileeachline)
	* [getpwnam](#getpwnam)
	* [tween](#tween)
	* [findFiles](#findfiles)
	* [walkDir](#walkdir)
	* [writeFileAtomic](#writefileatomic)
	* [writeFileAtomicSync](#writefileatomicsync)
	* [parseJSON](#parsejson)
	* [findBin](#findbin)
	* [findBinSync](#findbinsync)
- [License](#license)

</details>

# Overview

This module contains a set of miscellaneous utility functions that don't fit into any particular category.

# Usage

Use [npm](https://www.npmjs.com/) to install the module:

```
npm install pixl-tools
```

Then use `require()` to load it in your code:

```javascript
var Tools = require('pixl-tools');
```

Then call the function of your choice:

```javascript
var id = Tools.generateUniqueID();
```

# Module List

Because I use these three modules so often, I've included them in pixl-tools as a convenience.  Here is how to access them:

| Module Name | Description |
|-------------|-------------|
| `Tools.async` | The [async](https://www.npmjs.com/package/async) module is essential for parallel and series async loops and queues. |
| `Tools.mkdirp` | The [mkdirp](https://www.npmjs.com/package/mkdirp) module creates directories, including parent directories. |
| `Tools.glob` | The [glob](https://www.npmjs.com/package/glob) module performs filesystem globs (searches). |
| `Tools.rimraf` | The [rimraf](https://www.npmjs.com/package/rimraf) module performs recursive directory deletes. |

Example use:

```js
var Tools = require('pixl-tools');
var async = Tools.async;
var mkdirp = Tools.mkdirp;
var glob = Tools.glob;
```

# Function List

Here are all the functions included in the tools library, with links to full descriptions and examples:

## timeNow

```
NUMBER timeNow( FLOOR )
```

This function returns the current time expressed as [Epoch Seconds](http://en.wikipedia.org/wiki/Unix_time).  Pass `true` if you want the value floored to the nearest integer.

```javascript
var epoch = Tools.timeNow();
var floored = Tools.timeNow(true);
```

## generateUniqueID

```
STRING generateUniqueID( LENGTH, SALT )
```

This function generates a pseudo-random alphanumeric (hexadecimal) ID by combining various bits of local entropy, and hashing it together with [SHA-256](http://en.wikipedia.org/wiki/SHA-2).  The default length is 64 characters, but you can pass in any lesser length to chop it.  If you want to add your own entropy, pass it as the 2nd argument.

```javascript
var id = Tools.generateUniqueID();
var id = Tools.generateUniqueID( 32 );
var id = Tools.generateUniqueID( 64, "my extra entropy!" );
```

Please note that this is *not* designed to be cryptographically secure.  It doesn't use Node's [crypto.randomBytes](http://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback), because generating true random bits takes time, and can block execution.

## generateShortID

```
STRING generateShortID( PREFIX )
```

This function generates a short, semi-unique pseudo-random alphanumeric ID using high-resolution server time, and a static counter.  Both values are converted to [Base-36](https://en.wikipedia.org/wiki/Base36) (lower-case alphanumeric encoding), and combined to produce a 10-12 character ID, plus an optional string prefix if provided.  This algorithm allows for *up to* 1,296 unique IDs per millisecond, but due to server clock adjustments (NTP) this could theoretically collide with itself.  Use with caution.  Example:

```js
var id = Tools.generateShortID('z');
// --> "zjcdtsls30r"
```

## digestHex

```
STRING digestHex( PLAINTEXT, [ALGO] )
```

This function is just a simple wrapper around Node's [SHA-256](http://en.wikipedia.org/wiki/SHA-2) or other hashing algorithms.  The default is SHA-256, in which case it returns a 64-character hexadecimal hash of the given string.

```javascript
var sig = Tools.digestHex( "my plaintext string" );
// --> "6b4fdfd705d05b11a56b8c3020058b666359d3939b6eda354f529ebad77695c2"
```

To specify the algorithm, include it as the second argument.  It should be a string set to `md5`, `sha256`, etc.  On recent releases of OpenSSL, typing `openssl list-message-digest-algorithms` will display the available digest algorithms.  Example (MD5):

```javascript
var sig = Tools.digestHex( "my plaintext string", "md5" );
// --> "659a30fb5d9958326b15c17e8444c123"
```

## numKeys

```
INTEGER numKeys( OBJECT )
```

This function returns the number of keys in the specified hash.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var num = Tools.numKeys( my_hash ); // 2
```

## firstKey

```
STRING firstKey( OBJECT )
```

This function returns the first key of the hash when iterating over it.  Note that hash keys are stored in an undefined order.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var key = Tools.firstKey( my_hash ); // foo or baz
```

## hashKeysToArray

```
ARRAY hashKeysToArray( OBJECT )
```

This function returns all the hash keys as an array.  The values are discarded.  Useful for sorting and then iterating over the sorted list.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var keys = Tools.hashKeysToArray( my_hash ).sort();

for (var idx = 0, len = keys.length; idx < len; idx++) {
	var key = keys[idx];
	// do something with key and my_hash[key]
}
```

## hashValuesToArray

```
ARRAY hashValuesToArray( OBJECT )
```

This function returns all the hash values as an array.  The keys are discarded.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var values = Tools.hashValuesToArray( my_hash );

for (var idx = 0, len = values.length; idx < len; idx++) {
	var value = values[idx];
	// do something with value
}
```

## isaHash

```
BOOLEAN isaHash( MIXED )
```

This function returns `true` if the provided argument is a hash (object), `false` otherwise.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var is_hash = Tools.isaHash( my_hash );
```

## isaArray

```
BOOLEAN isaArray( MIXED )
```

This function returns `true` if the provided argument is an array (or is array-like), `false` otherwise.

```javascript
var my_arr = [ "foo", "bar", 12345 ];
var is_arr = Tools.isaArray( my_arr );
```

## copyHash

```
OBJECT copyHash( OBJECT, DEEP )
```

This function performs a shallow copy of the specified hash, and returns the copy.  Pass `true` as the 2nd argument to perform a *deep copy*, which uses JSON parse/stringify.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var my_copy = Tools.copyHash( my_hash );
```

## copyHashRemoveKeys

```
OBJECT copyHashRemoveKeys( OBJECT, REMOVE )
```

This function performs a shallow copy of the specified hash, and returns the copy, but *omits* any keys you specify in a separate hash.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var omit_these = { baz: true };
var my_copy = Tools.copyHashRemoveKeys( my_hash, omit_these );
```

## copyHashRemoveProto

```
OBJECT copyHashRemoveProto( OBJECT )
```

This function performs a shallow copy of the specified hash, and returns the copy, but ensures that the copy is a "pure" object with no prototype, constructor, or any of the special properties that all standard Objects implicitly have.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var clean_copy = Tools.copyHashRemoveProto( my_hash );
```

## mergeHashes

```
OBJECT mergeHashes( OBJECT_A, OBJECT_B )
```

This function merges two hashes (objects) together, and returns a new hash which contains the combination of the two keys (shallow copy).  The 2nd hash takes precedence over the first, in the event of duplicate keys.

```javascript
var hash1 = { foo: "bar" };
var hash2 = { baz: 12345 };
var combo = Tools.mergeHashes( hash1, hash2 );
```

## mergeHashInto

```
VOID mergeHashInto( OBJECT_A, OBJECT_B )
```

This function shallow-merges {OBJECT_B} into {OBJECT_A}.  There is no return value.  Existing keys are replaced in {OBJECT_A}.

```javascript
var hash1 = { foo: "bar" };
var hash2 = { baz: 12345 };
Tools.mergeHashInto( hash1, hash2 );
```

## parseQueryString

```
OBJECT parseQueryString( URL )
```

This function parses a standard URL query string, and returns a hash with key/value pairs for every query parameter.  Duplicate params are clobbered, the latter prevails.  Values are URL-unescaped, and all of them are strings.  The function accepts a full URL, or just the query string portion.

```javascript
var url = 'http://something.com/hello.html?foo=bar&baz=12345';
var query = Tools.parseQueryString( url );
var foo = query.foo; // "bar"
var baz = query.baz; // "12345"
```

Please note that this is a very simple function, and you should probably use the built-in Node.js [querystring](http://nodejs.org/api/querystring.html) module instead.

## composeQueryString

```
STRING composeQueryString( OBJECT )
```

This function takes a hash of key/value pairs, and constructs a URL query string out of it.  Values are URL-escaped.

```javascript
var my_hash = { foo: "bar", baz: 12345 };
var qs = Tools.composeQueryString( my_hash );
// --> "?foo=bar&baz=12345"
```

Please note that this is a very simple function, and you should probably use the built-in Node.js [querystring](http://nodejs.org/api/querystring.html) module instead.

## findObjectsIdx

```
ARRAY findObjectsIdx( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and returns all the array indexes whose objects have keys which match a given criteria hash.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

var idxs = Tools.findObjectsIdx( list, criteria );
// --> [0, 2]
```

## findObjectIdx

```
INTEGER findObjectIdx( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and returns the first array index whose object has keys which match a given criteria hash.  If no objects match, `-1` is returned.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

var idx = Tools.findObjectIdx( list, criteria );
// --> 0
```

## findObject

```
OBJECT findObject( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and returns the first item whose object has keys which match a given criteria hash.  If no objects match, `null` is returned.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

var obj = Tools.findObject( list, criteria );
// --> { id: 12345, name: "Joe", eyes: "blue" }
```

## findObjects

```
ARRAY findObjects( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and returns all the items whose objects have keys which match a given criteria hash.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

var objs = Tools.findObjects( list, criteria );
// --> [{ id: 12345, name: "Joe", eyes: "blue" }, { id: 12347, name: "Cynthia", eyes: "blue" }]
```

## deleteObject

```
BOOLEAN deleteObject( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and deletes the first item whose object has keys which match a given criteria hash.  It returns `true` for success or `false` if no matching object could be found.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

Tools.deleteObject( list, criteria );
// list will now contain only Frank and Cynthia
```

## deleteObjects

```
INTEGER deleteObjects( ARRAY, CRITERIA )
```

This function iterates over an array of hashes, and deletes all items whose objects have keys which match a given criteria hash.  It returns the number of objects deleted.

```javascript
var list = [
	{ id: 12345, name: "Joe", eyes: "blue" },
	{ id: 12346, name: "Frank", eyes: "brown" },
	{ id: 12347, name: "Cynthia", eyes: "blue" }
];
var criteria = { eyes: "blue" };

Tools.deleteObjects( list, criteria );
// list will now contain only Frank
```

## alwaysArray

```
ARRAY alwaysArray( MIXED )
```

This function will wrap anything passed to it into an array and return the array, unless the item passed is already an array, in which case it is simply returned verbatim.

```javascript
var arr = Tools.alwaysArray( maybe_array );
```

## sub

```
STRING sub( TEMPLATE, ARGS, FATAL )
```

This function performs placeholder substitution on a string, using square bracket delimited placeholders which may contain simple keys or even paths.

```javascript
var tree = {
	folder1: {
		file1: "foo",
		folder2: {
			file2: "bar"
		}
	}
};
var template = "Hello, I would like [/folder1/folder2/file2] and also [/folder1/file1] please!";

var str = Tools.sub( template, tree );
// --> "Hello, I would like bar and also foo please!"
```

You can omit the leading slashes if you are doing single-level hash lookups.

If you pass true for the `FATAL` argument, the function will return `null` if any variable lookups fail.  The default behavior is to preserve the original formatting (with placeholders and all) if the lookup fails.

## setPath

```
BOOLEAN setPath( OBJECT, PATH, VALUE )
```

This function will set a property value inside a hash/array tree, by first traversing a directory-style path.  Will auto-create new objects if needed.  You can use either `dir/slash/syntax` or `dot.path.syntax`.  Returns `true` on success or `false` on failure.

```js
var tree = {
	folder1: {
		file1: "foo"
	}
};

Tools.setPath( tree, "folder1/folder2/file2", "bar" );
```

For walking through arrays, simply provide the index number of the element you want.

## getPath

```
MIXED getPath( OBJECT, PATH )
```

This function will perform a directory-style path lookup on a hash/array tree, returning whatever object or value is pointed to, or `undefined` if not found.  You can use either `dir/slash/syntax` or `dot.path.syntax`.

```javascript
var tree = {
	folder1: {
		file1: "foo",
		folder2: {
			file2: "bar"
		}
	}
};

var file = Tools.getPath( tree, "folder1/folder2/file2" );
// --> "bar"

var file = Tools.getPath( tree, "folder1.folder2.file2" );
// --> "bar"
```

For walking into arrays, simply provide the index number of the element you want.

## getDateArgs

```
OBJECT getDateArgs( MIXED )
```

This function parses any date string, Epoch timestamp or Date object, and produces a hash with the following keys (all localized to the current timezone):

| Key | Sample Value | Description |
| --- | ------------ | ----------- |
| `year` | 2015 | Full year as integer. | 
| `yy` | "15" | 2-digit year as string, with padded zeros if needed. |
| `yyyy` | "2015" | 4-digit year as string. | 
| `mon` | 3 | Month of year as integer (1 - 12). | 
| `mm` | "03" | 2-digit month as string with padded zeros if needed. | 
| `mmm` | "Mar" | Month name abbreviated to first three letters. |
| `mmmm` | "March" | Full month name. |
| `mday` | 6 | Day of month as integer (1 - 31). | 
| `dd` | "06" | 2-digit day as string with padded zeros if needed. | 
| `wday` | 4 | Day of week as integer (0 - 6), starting with Sunday. | 
| `ddd` | "Thu" | Weekday name abbreviated to first three letters. |
| `dddd` | "Thursday" | Full weekday name. |
| `hour` | 9 | Hour of day as integer (0 - 23). | 
| `hour12` | 9 | Hour expressed in 12-hour time (i.e. 3 PM = 3). | 
| `hh` | "09" | 2-digit hour as string with padded zeros if needed. | 
| `min` | 2 | Minute of hour as integer (0 - 59). | 
| `mi` | "02" | 2-digit minute as string with padded zeros if needed. | 
| `sec` | 10 | Second of minute as integer (0 - 59). | 
| `ss` | "10" | 2-digit second as string with padded zeros if needed. | 
| `msec` | 999 | Millisecond of second as integer (0 - 999). | 
| `ampm` | "am" | String representing ante meridiem (`am`) or post meridiem (`pm`). | 
| `AMPM` | "AM" | Upper-case version of `ampm`. |
| `yyyy_mm_dd` | "2015/03/06" | Formatted string representing date in `YYYY/MM/DD` format. |
| `hh_mi_ss` | "09:02:10" | Formatted string representing local time in `HH:MI:SS` format. |
| `epoch` | 1425661330 | Epoch seconds used to generate all the date properties. |
| `offset` | -8 | Local offset from GMT/UTC in hours. |
| `tz` | "GMT-8" | Formatted GMT hour offset string. |

Example usage:

```javascript
var args = Tools.getDateArgs( new Date() );
var date_str = args.yyyy + '/' + args.mm + '/' + args.dd;
```

## getTimeFromArgs

```
INTEGER getTimeFromArgs( OBJECT )
```

This function will recalculate a date given an `args` object as returned from [getDateArgs()](#getdateargs).  It allows you to manipulate the `year`, `mon`, `mday`, `hour`, `min` and/or `sec` properties, and will return the computed Epoch seconds from the new set of values.  Example:

```javascript
var args = Tools.getDateArgs( new Date() );
args.mday = 15;

var epoch = Tools.getTimeFromArgs(args);
```

This example would return the Epoch seconds from the 15th day of the current month, in the current year, and using the current time of day.

## normalizeTime

```
INTEGER normalizeTime( INTEGER, OBJECT )
```

This function will "normalize" (i.e. quantize) an Epoch value to the nearest minute, hour, day, month, or year.  Meaning, you can pass in an Epoch time value, and have it return a value of the start of the current hour, midnight on the current day, the 1st of the month, etc.  To do this, pass in an object containing any keys you wish to change, e.g. `year`, `mon`, `mday`, `hour`, `min` and/or `sec`.  Example:

```javascript
var midnight = Tools.normalizeTime( Tools.timeNow(), { hour: 0, min: 0, sec: 0 } );
```

You can actually set the values to non-zero.  For example, to return the Epoch time of exactly noon today:

```javascript
var noon = Tools.normalizeTime( Tools.timeNow(), { hour: 12, min: 0, sec: 0 } );
```

## formatDate

```
STRING formatDate( MIXED, STRING )
```

This function parses any date string, Epoch timestamp or Date object, and produces a formatted date/time string according to a custom template, and in the local timezone.  The template is populated using [sub()](#sub) (i.e. square bracket syntax) and can use any of the date/time properties returned by [getDateArgs()](#getdateargs).  Examples:

```js
var now = new Date();

var str = Tools.formatDate( now, "[yyyy]/[mm]/[dd]" );
// 2019/03/22

var str = Tools.formatDate( now, "[dddd], [mmmm] [mday], [yyyy]" );
// Friday, March 22, 2019

var str = Tools.formatDate( now, "[hour12]:[mi] [ampm]" );
// 10:43 am
```

## getTextFromBytes

```
STRING getTextFromBytes( BYTES, PRECISION )
```

This function generates a human-friendly text string given a number of bytes.  It reduces the units to K, MB, GB or TB as needed, and allows a configurable amount of precision after the decimal point.  The default is one decimal of precision (specify as `1`, `10`, `100`, etc.).

```javascript
var str = Tools.getTextFromBytes( 0 );    // "0 bytes"
var str = Tools.getTextFromBytes( 1023 ); // "1023 bytes"
var str = Tools.getTextFromBytes( 1024 ); // "1 K"
var str = Tools.getTextFromBytes( 1126 ); // "1.1 K"

var str = Tools.getTextFromBytes( 1599078, 1 ); // "1 MB"
var str = Tools.getTextFromBytes( 1599078, 10 ); // "1.5 MB"
var str = Tools.getTextFromBytes( 1599078, 100 ); // "1.52 MB"
var str = Tools.getTextFromBytes( 1599078, 1000 ); // "1.525 MB"
```

## getBytesFromText

```
INTEGER getBytesFromText( STRING )
```

This function parses a string containing a human-friendly size count (e.g. `45 bytes` or `1.5 MB`) and converts it to raw bytes.

```javascript
var bytes = Tools.getBytesFromText( "0 bytes" ); // 0
var bytes = Tools.getBytesFromText( "1023 bytes" ); // 1023
var bytes = Tools.getBytesFromText( "1 K" ); // 1024
var bytes = Tools.getBytesFromText( "1.1k" ); // 1126
var bytes = Tools.getBytesFromText( "1.525 MB" ); // 1599078	
```

## commify

```
STRING commify( INTEGER )
```

This function adds commas to long numbers following US-style formatting rules (add comma every 3 digits counting from right side).  Only positive integers are supported.

```javascript
var c = Tools.commify( 123 ); // "123"
var c = Tools.commify( 1234 ); // "1,234"
var c = Tools.commify( 1234567890 ); // "1,234,567,890"
```

## shortFloat

```
NUMBER shortFloat( NUMBER, [PLACES] )
```

This function "shortens" a floating point number by only allowing up to `N` digits after the decimal point (defaults to `2`).  You can customize this by passing an optional 2nd argument.  Examples:

```javascript
var num1 = Tools.shortFloat( 0.12345 ); // 0.12
var num2 = Tools.shortFloat( 0.00001 ); // 0.0
var num3 = Tools.shortFloat( 0.00123, 3 ); // 0.001
```

## pct

```
STRING pct( AMOUNT, MAX, FLOOR )
```

This function calculates a percentage given an arbitrary numerical amount and a maximum value, and returns a formatted string with a '%' symbol.  Pass `true` as the 3rd argument to floor the percentage to the nearest integer.  Otherwise the value is shortened with `shortFloat()`.

```javascript
var p = Tools.pct( 5, 10 ); // "50%"
var p = Tools.pct( 0, 1 );  // "0%"
var p = Tools.pct( 751, 1000 ); // "75.1%"
var p = Tools.pct( 751, 1000, true ); // "75%"
```

## zeroPad

```
STRING zeroPad( NUMBER, MAX )
```

This function adds zeros to the left side of a number, until the total string length meets a specified maximum (up to 10 characters).  The return value is a string, not a number.

```javascript
var padded = Tools.zeroPad( 5, 1 ); // "5"
var padded = Tools.zeroPad( 5, 2 ); // "05"
var padded = Tools.zeroPad( 5, 3 ); // "005"
var padded = Tools.zeroPad( 100, 3 ); // "100"
var padded = Tools.zeroPad( 100, 4 ); // "0100"
var padded = Tools.zeroPad( 100, 5 ); // "00100"
```

## clamp

```
NUMBER clamp( NUMBER, MIN, MAX )
```

This function performs a simple mathematical "clamp" operation, restricting a value between a defined range.  This is just a convenience method, which can save you a few keystrokes.  Example:

```js
var clamped = Tools.clamp( 50, 0, 10 );
// --> 10
```

## lerp

```
NUMBER lerp( START, END, AMOUNT )
```

This function performs linear interpolation between two values and a specified amount between `0.0` and `1.0`.  This is just a convenience method, which can save you a few keystrokes.  Example:

```js
var lerped = Tools.lerp( 0, 50, 0.25 );
// --> 12.5
```

## getTextFromSeconds

```
STRING getTextFromSeconds( NUMBER, ABBREVIATE, SHORTEN )
```

This function generates a human-friendly time string given a number of seconds.  It reduces the units to minutes, hours or days as needed.  You can also abbreviate the output, and shorten the extra precision.

```javascript
var str = Tools.getTextFromSeconds( 0 ); // "0 seconds"
var str = Tools.getTextFromSeconds( 86400 ); // "1 day"
var str = Tools.getTextFromSeconds( 90 ); // "1 minute, 30 seconds"
var str = Tools.getTextFromSeconds( 90, true ); // "1 min, 30 sec"
var str = Tools.getTextFromSeconds( 90, false, true ); // "1 minute"
var str = Tools.getTextFromSeconds( 90, true, true ); // "1 min"
```

## getSecondsFromText

```
INTEGER getSecondsFromText( STRING )
```

This function parses a string containing a human-friendly time (e.g. `45 minutes` or `7 days`) and converts it to raw seconds.  It accepts seconds, minutes, hours, days and/or weeks.  It does not interpret "months" or "years" because those are non-exact measurements.

```javascript
var sec = Tools.getSecondsFromText( "1 second" ); // 1
var sec = Tools.getSecondsFromText( "2min" ); // 120
var sec = Tools.getSecondsFromText( "30m" ); // 1800
var sec = Tools.getSecondsFromText( "12 HOURS" ); // 43200
var sec = Tools.getSecondsFromText( "1day" ); // 86400
```

## getNiceRemainingTime

```
STRING getNiceRemainingTime( ELAPSED, COUNTER, MAX, ABBREV, SHORTEN )
```

This function calculates the estimated remaining time on a job in progress, given the elapsed time in seconds, an arbitrary counter representing the job's progress, and a maximum value for the counter.

```javascript
var remain = Tools.getNiceRemainingTime( 45, 0.75, 1.0 );
// --> "15 seconds"

var remain = Tools.getNiceRemainingTime( 3640, 0.75, 1.0 );
// --> "20 minutes, 13 seconds"

var remain = Tools.getNiceRemainingTime( 3640, 0.75, 1.0, true );
// --> "20 min, 13 sec"

var remain = Tools.getNiceRemainingTime( 3640, 0.75, 1.0, false, true );
// --> "20 minutes"

var remain = Tools.getNiceRemainingTime( 3640, 0.75, 1.0, true, true );
// --> "20 min"
```

Note that this works best when the job's progress is somewhat constant.  If it proceeds at a varying pace, the remaining time may appear to go too fast or too slow at times.  It always computes the average speed over the course of the time elapsed, versus the current progress.

## randArray

```
MIXED randArray( ARRAY )
```

This function picks a random element from the given array, and returns it.

```javascript
var fruit = ['apple', 'orange', 'banana'];
var rand = Tools.randArray( fruit );
```

## pluralize

```
STRING pluralize( STRING, NUMBER )
```

This function pluralizes a string using US-English rules, given an arbitrary number.  This is useful when constructing human-friendly sentences containing a quantity of things, and you wish to say either "thing" or "things" depending on the number.

```javascript
var list = ['apple', 'orange', 'banana'];
var text = "You have " + list.length + Tools.pluralize(" item", list.length) + " in your list.";
// --> "You have 3 items in your list.";
```

## escapeRegExp

```
STRING escapeRegExp( STRING )
```

This function escapes a string so that it can be used inside a regular expression.  Meaning, any regular expression metacharacters are prefixed with a backslash, so they are interpreted literally.  It was taken from the [MDN Regular Expression Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

## ucfirst

```
STRING ucfirst( STRING )
```

The function upper-cases the first character of a string, and lower-cases the rest.  This is very similar to the Perl core function of the same name.  Example:

```javascript
var first_name = Tools.ucfirst( 'george' );
// --> "George"
```

## getErrorDescription

```
STRING getErrorDescription( ERROR )
```

This function takes a standard Node.js [System Error](https://nodejs.org/api/errors.html#errors_class_system_error) object, such as one emitted when a filesystem or network error occurs, and produces a prettier and more verbose string description.  It uses the 3rd party [errno](https://www.npmjs.com/package/errno) package, and adds its own decorations as well.  Example:

```javascript
require('fs').readFile( '/bad/file.txt', function(err, data) {
	if (err) {
		console.log( "Native Error: " + err.message );
		console.log( "Better Error: " + Tools.getErrorDescription(err) );
	}
} );

// Outputs:
// Native Error: ENOENT, open '/bad/file.txt'
// Better Error: No such file or directory (ENOENT, open '/bad/file.txt')
```

Basically it resolves the Node.js error codes such as `ENOENT` to a human-readable string (i.e. `No such file or directory`), but also appends the raw native error message in parenthesis as well.

## bufferSplit

```
ARRAY bufferSplit( BUFFER, SEPARATOR )
```

This function splits a buffer into an array of chunks, given a separator (string or buffer).  It works similarly to the [String.split](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split) core function, with two main differences.  First, the separator cannot be a regular expression (it must be a string or another buffer), and second, the returned split buffer chunks will occupy the same memory space as the original buffer.  Example:

```js
var EOL = require('os').EOL;
var data = require('fs').readFileSync( 'some_file.csv' );
var lines = Tools.bufferSplit( data, EOL );
```

## fileEachLine

```
VOID fileEachLine( FILE, OPTS, ITERATOR, CALLBACK )
```

This function iterates over a file line by line, firing `ITERATOR` for each.  This is done in asynchronous fashion, akin to the [async](http://caolan.github.io/async/) module.  Your `ITERATOR` function is passed the line (encoded string or buffer) and a callback to fire.  When all the lines are completed, the main `CALLBACK` is fired once, including an error or not.  This is designed to handle huge files without using much memory at all.

The `OPTS` object may include:

| Property Name | Default Value | Description |
|---------------|---------------|-------------|
| `buffer_size` | `1024` | How many bytes to read from the file at a time. |
| `eol` | os.EOL | The end-of-line separator, defaults to the current system EOL. |
| `encoding` | `utf8` | The encoding to use for each line, set to `null` if you want buffers. |

Example:

```js
Tools.fileEachLine( "my_large_spreadsheet.csv",
	function(line, callback) {
		// this is fired for each line
		var columns = line.split(/\,\s*/);
		// do something with the data here, possibly async
		// fire callback for next line, pass error to abort
		callback();
	},
	function(err) {
		// all lines are complete
		if (err) throw err;
	}
);
```

## getpwnam

```
OBJECT getpwnam( USERNAME, [USE_CACHE] )
```

This function fetches local user account information, give a username or numerical UID.  This is similar to the POSIX [getpwnam](http://man7.org/linux/man-pages/man3/getpwnam.3.html) function, which is missing from Node core.  This function works on Linux and OS X only.  It runs in synchronous mode, and returns an object with the following properties, or `null` on error:

| Property Name | Sample Value | Description |
|---------------|---------------|-------------|
| `username` | `jhuckaby` | The username of the account. |
| `password` | `****` | The hashed password of the account (often masked). |
| `uid` | `501` | The numerical UID (User ID) of the account. |
| `gid` | `501` | The numeric GID (Group ID) of the account. |
| `name` | `Joseph Huckaby` | The full name of the user. |
| `dir` | `/home/jhuckaby` | The home directory path of the user. |
| `shell` | `/bin/bash` | The login shell used by the user. |

If you pass `true` as the 2nd argument, the user information will be cached in RAM for future queries on the same username or UID.  Example use:

```js
var info = Tools.getpwnam( "jhuckaby", true );
if (info) {
	process.chdir( info.dir );
}
```

## tween

```
NUMBER tween( START, END, AMOUNT, MODE, ALGORITHM )
```

This function calculates a [tween](https://en.wikipedia.org/wiki/Inbetweening) between two numbers, and returns the in-between value.  For example, this can be used to control animation with "easing" (i.e. ease-in, ease-out), and also custom mathematical curves like quadratic, quintic, etc.  Example use:

```js
var x = Tools.tween( 0, 150, 0.5, 'EaseOut', 'Quadratic' );
```

The output will be somewhere between `0` and `150`, controlled by the `EaseOut` mode and `Quadratic` algorithm.  If you had selected the `Linear` algorithm, this would be exactly `75` (halfway between the start and end).

Here is a more detailed list of the function arguments:

| Argument | Description |
|----------|-------------|
| `START` | The starting value for the property (any number). |
| `END` | The ending value for the property (any number). |
| `AMOUNT` | This value should be between `0.0` and `1.0`, and sets the position along the animation path. |
| `MODE` | The animation mode as string, one of `EaseIn`, `EaseOut` or `EaseInOut`. |
| `ALGORITHM` | The algorithm name as string, one of `Linear`, `Quadratic`, `Cubic`, `Quartetic`, `Quintic`, `Sine` or `Circular`. |

## findFiles

```
VOID findFiles( DIR, [OPTS], CALLBACK )
```

The `findFiles()` function will recursively scan for files on the filesystem, and can include several filters for customization.  You need to specify a starting directory path, an object containing options (see below), and a callback to receive the list of files.  Your callback will be called with two arguments: an error if any, and an array of files.  The options object can include:

| Property | Type | Description |
|----------|------|-------------|
| `filespec` | RegExp / String | An optional regular expression or string to match against filenames (not paths).  Defaults to `/.+/`. |
| `recurse` | Boolean | Recurse into nested subdirectories, defaults to `true`.  Set this to `false` to only scan the outermost directory. |
| `all` | Boolean | Normally, dotfiles are skipped.  When this is set to `true`, dotfiles will be included (unless filtered out by `filespec`). |
| `filter` | Function | Optional custom filter function, called for each file.  See example below for usage. |

Here is a simple example that finds all image files:

```js
Tools.findFiles( "/path/to/starting/dir", {
	filespec: /\.(jpg|png|gif)$/i
},
function(err, files) {
	console.log("All the images: ", files);
});
```

Here is an example of using a custom filter function:

```js
Tools.findFiles( "/path/to/starting/dir", {
	filter: function(file, stats) {
		return stats.size <= 32768; // only include files 32K or less
	}
},
function(err, files) {
	console.log("All files 32K or less: ", files);
});
```

If you just want all the files, you can omit the options object:

```js
Tools.findFiles( "/path/to/starting/dir", function(err, files) {
	console.log("All the files: ", files);
});
```

Please note that this function specifically returns *files*, not directories.  For more low-level control over this process, see [walkDir()](#walkdir) below, which this uses internally.

## walkDir

```
VOID walkDir( DIR, ITERATOR, CALLBACK )
```

The `walkDir()` function recursively walks a directory on the filesystem, including all subdirectories, and it fires a custom iterator function for each file or directory encountered.  Your iterator function is passed the file path, an [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats) object, and a callback.  It needs to fire the callback function, and pass `true` to recurse for directories, or `false` to skip it.  When the full directory tree is walked, the final callback is fired.  Example:

```js
Tools.walkDir( "/path/to/starting/dir",
	function(file, stats, callback) {
		// called for each file and directory
		if (stats.isDirectory()) callback(true); // recurse into
		else {
			console.log("Found file: " + file);
			callback();
		}
	},
	function() {
		// all done!
		console.log("Walk complete!");
	}
);
```

## writeFileAtomic

```
VOID writeFileAtomic( FILE, DATA, OPTS, CALLBACK )
```

This function writes a file *atomically*.  That is, it writes to a temp file first, and then renames that file atop the original.  This ensures that no corruption can occur with multiple threads or processes writing to the same file at the same time.  In this case the latter prevails.  The temp file is created in the same directory to ensure the same filesystem (cross-FS renames are **not** atomic), and is named with a `.tmp.[UNIQUE]` file extension.  It accepts the same arguments as [fs.writeFile()](https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback).  Example:

```js
Tools.writeFileAtomic( "/path/to/my/file.json", data, function(err) {
	if (err) throw err;
});
```

## writeFileAtomicSync

```
VOID writeFileAtomicSync( FILE, DATA, OPTS )
```

This function writes a file *atomically* and synchronously.  That is, it writes to a temp file first, and then renames that file atop the original.  This ensures that no corruption can occur with multiple threads or processes writing to the same file at the same time.  In this case the latter prevails.  The temp file is created in the same directory to ensure the same filesystem (cross-FS renames are **not** atomic), and is named with a `.tmp.[UNIQUE]` file extension.  It accepts the same arguments as [fs.writeFileSync()](https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options).  Example:

```js
try {
	Tools.writeFileAtomicSync( "/path/to/my/file.json", data );
}
catch (err) {
	throw err;
}
```

## parseJSON

```
OBJECT parseJSON( TEXT )
```

This function is a wrapper around the built-in `JSON.parse()`.  It works in exactly the same way, except that it throws improved error messages in the event of parser errors.  Specifically, it specifies the exact line number and column of the error in the source JSON.  This is mainly useful for multi-line (i.e. pretty-printed) JSON files.  Here is an example:

```js
var bad_json = `{
	"good_property_name": 12345,
	bad_missing_quotes: 67890
}`;

var obj = Tools.parseJSON(bad_json);
// Error: Unexpected token b in JSON on line 3 column 2
```

## findBin

```
VOID findBin( FILENAME, CALLBACK )
```

This function locates the path to a binary executable given a filename and a callback.  It searches all directories in the current environment `PATH`, as well as a number of known common locations (`/usr/local/bin`, `/usr/bin`, `/bin`, `/usr/sbin`, and `/sbin`).  Your callback is invoked with an error (or `false` on success), and the path to the first binary executable found.  Example use:

```js
Tools.findBin( 'lsof', function(err, file) {
	if (err) throw err;
	console.log("Found: " + file);
} );
```

## findBinSync

```
STRING findBinSync( FILENAME )
```

A synchronous version of [findBin](#findbin).  This returns the binary path, or `false` if none was found.  It will not throw.

# License

**The MIT License**

*Copyright (c) 2015 - 2021 Joseph Huckaby.*

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
