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

# Function List

Here are all the functions included in the tools library.

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

## digestHex

```
	STRING digestHex( PLAINTEXT )
```

This function is just a simple wrapper around Node's [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hashing algorithm.  It returns a 64-character hexadecimal hash of the given string.

```javascript
	var sig = Tools.digestHex( "my plaintext string" );
	// --> "6b4fdfd705d05b11a56b8c3020058b666359d3939b6eda354f529ebad77695c2"
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

This function returns all the hash keys as an array.  Useful for sorting and then iterating over the sorted list.

```javascript
	var my_hash = { foo: "bar", baz: 12345 };
	var keys = Tools.hashKeysToArray( my_hash ).sort();
	
	for (var idx = 0, len = keys.length; idx < len; idx++) {
		var key = keys[idx];
		// do something with key and my_hash[key]
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

Please note that this is a very simple function, and you should probably use the built-in Node.JS [querystring](http://nodejs.org/api/querystring.html) module instead.

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

Please note that this is a very simple function, and you should probably use the built-in Node.JS [querystring](http://nodejs.org/api/querystring.html) module instead.

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

## lookupPath

```
	MIXED lookupPath( PATH, ARGS )
```

This function will perform a directory-style path lookup on a hash/array tree, returning whatever object or value is pointed to, or `null` if not found.

```javascript
	var tree = {
		folder1: {
			file1: "foo",
			folder2: {
				file2: "bar"
			}
		}
	};
	
	var file = Tools.lookupPath( "/folder1/folder2/file2", tree );
	// --> "bar"
```

For walking into arrays, simply provide the index number of the element you want.

## substitute

```
	STRING substitute( TEMPLATE, ARGS )
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
	var template = "Hello, I would like [/folder1/folder2/file2] and also [/folder/file1] please!";
	
	var str = Tools.substitute( template, tree );
	// --> "Hello, I would like bar and also foo please!"
```

You can omit the leading slashes if you are doing single-level hash lookups.

## getDateArgs

```
	OBJECT getDateArgs( MIXED )
```

This function parses any date string, Epoch timestamp or Date object, and produces a hash with the following keys (all localized to the current timezone):

| Key | Sample Value | Description |
| --- | ------------ | ----------- |
| `year` | 2015 | Full year as integer. | 
| `mon` | 3 | Month of year as integer (1 - 12). | 
| `mday` | 6 | Day of month as integer (1 - 31). | 
| `wday` | 4 | Day of week as integer (0 - 6). | 
| `hour` | 9 | Hour of day as integer (0 - 23). | 
| `min` | 2 | Minute of hour as integer (0 - 59). | 
| `sec` | 10 | Second of minute as integer (0 - 59). | 
| `msec` | 999 | Millisecond of second as integer (0 - 999). | 
| `yyyy` | "2015" | 4-digit year as string. | 
| `mm` | "03" | 2-digit month as string with padded zeros if needed. | 
| `dd` | "06" | 2-digit day as string with padded zeros if needed. | 
| `hh` | "09" | 2-digit hour as string with padded zeros if needed. | 
| `mi` | "02" | 2-digit minute as string with padded zeros if needed. | 
| `ss` | "10" | 2-digit second as string with padded zeros if needed. | 
| `hour12` | 9 | Hour expressed in 12-hour time (i.e. 1 PM = 1.) | 
| `ampm` | "am" | String representing ante meridiem (`am`) or post meridiem (`pm`). | 
| `yyyy_mm_dd` | "2015/03/06" | Formatted string representing date in `YYYY/MM/DD` format. |
| `hh_mi_ss` | "09:02:10" | Formatted string representing local time in `HH:MI:SS` format. |
| `epoch` | 1425661330 | Epoch seconds used to generate all the date args. |

Example usage:

```javascript
	var args = Tools.getDateArgs( new Date() );
	var date_str = args.yyyy + '/' + args.mm + '/' + args.dd;
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
	NUMBER shortFloat( NUMBER )
```

This function "shortens" a floating point number by only allowing two digits after the decimal point, *unless they are zeros*.

```javascript
	var short = Tools.shortFloat( 0.12345 ); // 0.12
	var short = Tools.shortFloat( 0.00001 ); // 0.00001
	var short = Tools.shortFloat( 0.00123 ); // 0.0012
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

# License

Copyright (c) 2015 Joseph Huckaby.

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
