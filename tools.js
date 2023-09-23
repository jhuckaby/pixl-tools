// Misc Tools for Node.js
// Copyright (c) 2015 - 2021 Joseph Huckaby
// Released under the MIT License

const fs = require('fs');
const Path = require('path');
const cp = require('child_process');
const crypto = require('crypto');
const ErrNo = require('errno');
const os = require('os');
const hostname = os.hostname();

const MONTH_NAMES = [ 
	'January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December' ];

const SHORT_MONTH_NAMES = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 
	'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec' ];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];
	
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EASE_ALGOS = {
	Linear: function(_amount) { return _amount; },
	Quadratic: function(_amount) { return Math.pow(_amount, 2); },
	Cubic: function(_amount) { return Math.pow(_amount, 3); },
	Quartetic: function(_amount) { return Math.pow(_amount, 4); },
	Quintic: function(_amount) { return Math.pow(_amount, 5); },
	Sine: function(_amount) { return 1 - Math.sin((1 - _amount) * Math.PI / 2); },
	Circular: function(_amount) { return 1 - Math.sin(Math.acos(_amount)); }
};

const EASE_MODES = {
	EaseIn: function(_amount, _algo) { return EASE_ALGOS[_algo](_amount); },
	EaseOut: function(_amount, _algo) { return 1 - EASE_ALGOS[_algo](1 - _amount); },
	EaseInOut: function(_amount, _algo) {
		return (_amount <= 0.5) ? EASE_ALGOS[_algo](2 * _amount) / 2 : (2 - EASE_ALGOS[_algo](2 * (1 - _amount))) / 2;
	}
};

const BIN_DIRS = ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];

module.exports = {
	
	"async": require('async'),
	"glob": require('glob'),
	"rimraf": require('rimraf'),
	
	hostname: hostname,
	user_cache: {},
	group_cache: {},
	
	timeNow: function(floor) {
		// return current epoch time
		var epoch = (new Date()).getTime() / 1000;
		return floor ? Math.floor(epoch) : epoch;
	},
	
	_uniqueIDCounter: 0,
	generateUniqueID: function(len, salt) {
		// generate unique ID using some readily-available bits of entropy
		this._uniqueIDCounter++;
		var shasum = crypto.createHash('sha256');
		
		shasum.update([
			'SALT_7fb1b7485647b1782c715474fba28fd1',
			this.timeNow(),
			Math.random(),
			hostname,
			process.pid,
			this._uniqueIDCounter,
			salt || ''
		].join('-'));
		
		return shasum.digest('hex').substring(0, len || 64);
	},
	
	_shortIDCounter: Math.floor( Math.random() * Math.pow(36, 2) ),
	
	generateShortID: function(prefix) {
		// generate short id using high-res server time, and a static counter,
		// both converted to alphanumeric lower-case (base-36), ends up being ~10 chars.
		// allows for *up to* 1,296 unique ids per millisecond (sort of).
		this._shortIDCounter++;
		if (this._shortIDCounter >= Math.pow(36, 2)) this._shortIDCounter = 0;
		
		return [
			prefix || '',
			this.zeroPad( (new Date()).getTime().toString(36), 8 ),
			this.zeroPad( this._shortIDCounter.toString(36), 2 )
		].join('');
	},
	
	digestHex: function(str, algo) {
		// digest string using SHA256 (by default), return hex hash
		var shasum = crypto.createHash( algo || 'sha256' );
		shasum.update( str );
		return shasum.digest('hex');
	},
	
	numKeys: function(hash) {
		// count keys in hash
		// Object.keys(hash).length may be faster, but this uses far less memory
		var count = 0;
		for (var key in hash) { count++; }
		return count;
	},
	
	firstKey: function(hash) {
		// return first key in hash (key order is undefined)
		for (var key in hash) return key;
		return null; // no keys in hash
	},
	
	hashKeysToArray: function(hash) {
		// convert hash keys to array (discard values)
		var arr = [];
		for (var key in hash) arr.push(key);
		return arr;
	},
	
	hashValuesToArray: function(hash) {
		// convert hash values to array (discard keys)
		var arr = [];
		for (var key in hash) arr.push( hash[key] );
		return arr;
	},
	
	isaHash: function(arg) {
		// determine if arg is a hash or hash-like
		return( !!arg && (typeof(arg) == 'object') && (typeof(arg.length) == 'undefined') );
	},
	
	isaArray: function(arg) {
		// determine if arg is an array or is array-like
		return( !!arg && (typeof(arg) == 'object') && (typeof(arg.length) != 'undefined') );
	},
	
	copyHash: function(hash, deep) {
		// copy hash to new one, with optional deep mode (uses JSON)
		if (deep) {
			// deep copy
			return JSON.parse( JSON.stringify(hash) );
		}
		else {
			// shallow copy
			var output = {};
			for (var key in hash) {
				output[key] = hash[key];
			}
			return output;
		}
	},
	
	copyHashRemoveKeys: function(hash, remove) {
		// shallow copy hash, excluding some keys
		var output = {};
		for (var key in hash) {
			if (!remove[key]) output[key] = hash[key];
		}
		return output;
	},
	
	copyHashRemoveProto: function(hash) {
		// shallow copy hash, but remove __proto__ and family from copy
		var output = Object.create(null);
		for (var key in hash) {
			output[key] = hash[key];
		}
		return output;
	},
	
	mergeHashes: function(a, b) {
		// shallow-merge keys from a and b into c and return c
		// b has precedence over a
		if (!a) a = {};
		if (!b) b = {};
		var c = {};
		
		for (var key in a) c[key] = a[key];
		for (var key in b) c[key] = b[key];
		
		return c;
	},
	
	mergeHashInto: function(a, b) {
		// shallow-merge keys from b into a
		for (var key in b) a[key] = b[key];
	},
	
	parseQueryString: function(url) {
		// parse query string into key/value pairs and return as object
		var query = {}; 
		url.replace(/^.*\?/, '').replace(/([^\=]+)\=([^\&]*)\&?/g, function(match, key, value) {
			query[key] = decodeURIComponent(value);
			if (query[key].match(/^\-?\d+$/)) query[key] = parseInt(query[key]);
			else if (query[key].match(/^\-?\d*\.\d+$/)) query[key] = parseFloat(query[key]);
			return ''; 
		} );
		return query; 
	},
	
	composeQueryString: function(query) {
		// compose key/value pairs into query string
		var qs = '';
		for (var key in query) {
			qs += (qs.length ? '&' : '?') + key + '=' + encodeURIComponent(query[key]);
		}
		return qs;
	},
	
	findObjectsIdx: function(arr, crit, max) {
		// find idx of all objects that match crit keys/values
		var idxs = [];
		var num_crit = 0;
		for (var a in crit) num_crit++;
		
		for (var idx = 0, len = arr.length; idx < len; idx++) {
			var matches = 0;
			for (var key in crit) {
				if (arr[idx][key] == crit[key]) matches++;
			}
			if (matches == num_crit) {
				idxs.push(idx);
				if (max && (idxs.length >= max)) return idxs;
			}
		} // foreach elem
		
		return idxs;
	},
	
	findObjectIdx: function(arr, crit) {
		// find idx of first matched object, or -1 if not found
		var idxs = this.findObjectsIdx(arr, crit, 1);
		return idxs.length ? idxs[0] : -1;
	},
	
	findObject: function(arr, crit) {
		// return first found object matching crit keys/values, or null if not found
		var idx = this.findObjectIdx(arr, crit);
		return (idx > -1) ? arr[idx] : null;
	},
	
	findObjects: function(arr, crit) {
		// find and return all objects that match crit keys/values
		var idxs = this.findObjectsIdx(arr, crit);
		var objs = [];
		for (var idx = 0, len = idxs.length; idx < len; idx++) {
			objs.push( arr[idxs[idx]] );
		}
		return objs;
	},
	
	deleteObject: function(arr, crit) {
		// walk array looking for nested object matching criteria object
		// delete first object found
		var idx = this.findObjectIdx(arr, crit);
		if (idx > -1) {
			arr.splice( idx, 1 );
			return true;
		}
		return false;
	},
	
	deleteObjects: function(arr, crit) {
		// delete all objects in obj array matching criteria
		// TODO: This is not terribly efficient -- could use a rewrite.
		var count = 0;
		while (this.deleteObject(arr, crit)) count++;
		return count;
	},
	
	alwaysArray: function(obj) {
		// if obj is not an array, wrap it in one and return it
		return this.isaArray(obj) ? obj : [obj];
	},
	
	lookupPath: function(path, obj) {
		// LEGACY METHOD, included for backwards compatibility only -- use getPath() instead
		// walk through object tree, psuedo-XPath-style
		// supports arrays as well as objects
		// return final object or value
		// always start query with a slash, i.e. /something/or/other
		path = path.replace(/\/$/, ""); // strip trailing slash
		
		while (/\/[^\/]+/.test(path) && (typeof(obj) == 'object')) {
			// find first slash and strip everything up to and including it
			var slash = path.indexOf('/');
			path = path.substring( slash + 1 );
			
			// find next slash (or end of string) and get branch name
			slash = path.indexOf('/');
			if (slash == -1) slash = path.length;
			var name = path.substring(0, slash);

			// advance obj using branch
			if ((typeof(obj.length) == 'undefined') || name.match(/\D/)) {
				// obj is probably a hash
				if (typeof(obj[name]) != 'undefined') obj = obj[name];
				else return null;
			}
			else {
				// obj is array
				var idx = parseInt(name, 10);
				if (isNaN(idx)) return null;
				if (typeof(obj[idx]) != 'undefined') obj = obj[idx];
				else return null;
			}

		} // while path contains branch

		return obj;
	},
	
	sub: function(text, args, fatal, fallback) {
		// perform simple [placeholder] substitution using supplied
		// args object and return transformed text
		var self = this;
		var result = true;
		var value = '';
		if (typeof(text) == 'undefined') text = '';
		text = '' + text;
		if (!args) args = {};
		
		text = text.replace(/\[([^\]]+)\]/g, function(m_all, name) {
			value = self.getPath(args, name);
			if (value === undefined) {
				result = false;
				return fallback || m_all;
			}
			else return value;
		} );
		
		if (!result && fatal) return null;
		else return text;
	},
	
	substitute: function(text, args, fatal) {
		// LEGACY METHOD, included for backwards compatibility only -- use sub() instead
		// perform simple [placeholder] substitution using supplied
		// args object and return transformed text
		if (typeof(text) == 'undefined') text = '';
		text = '' + text;
		if (!args) args = {};
		
		while (text.indexOf('[') > -1) {
			var open_bracket = text.indexOf('[');
			var close_bracket = text.indexOf(']');
			
			if (close_bracket < open_bracket) {
				// error, mismatched brackets, we must abort
				return fatal ? null : text.replace(/__APLB__/g, '[').replace(/__APRB__/g, ']');
			}
			
			var before = text.substring(0, open_bracket);
			var after = text.substring(close_bracket + 1, text.length);
			
			var name = text.substring( open_bracket + 1, close_bracket );
			var value = '';
			
			// prevent infinite loop with nested open brackets
			name = name.replace(/\[/g, '__APLB__');
			
			if (name.indexOf('/') == 0) {
				value = this.lookupPath(name, args);
				if (value === null) {
					if (fatal) return null;
					else value = '__APLB__' + name + '__APRB__';
				}
			}
			else if (typeof(args[name]) != 'undefined') value = args[name];
			else {
				if (fatal) return null;
				else value = '__APLB__' + name + '__APRB__';
			}
			
			text = before + value + after;
		} // while text contains [
		
		return text.replace(/__APLB__/g, '[').replace(/__APRB__/g, ']');
	},
	
	setPath: function(target, path, value) {
		// set path using dir/slash/syntax or dot.path.syntax
		// support inline dots and slashes if backslash-escaped
		var parts = (path.indexOf("\\") > -1) ? path.replace(/\\\./g, '__PXDOT__').replace(/\\\//g, '__PXSLASH__').split(/[\.\/]/).map( function(elem) {
			return elem.replace(/__PXDOT__/g, '.').replace(/__PXSLASH__/g, '/');
		} ) : path.split(/[\.\/]/);
		
		var key = parts.pop();
		
		// traverse path
		while (parts.length) {
			var part = parts.shift();
			if (part) {
				if (!(part in target)) {
					// auto-create nodes
					target[part] = {};
				}
				if (typeof(target[part]) != 'object') {
					// path runs into non-object
					return false;
				}
				target = target[part];
			}
		}
		
		target[key] = value;
		return true;
	},
	
	deletePath: function(target, path) {
		// delete path using dir/slash/syntax or dot.path.syntax
		// support inline dots and slashes if backslash-escaped
		var parts = (path.indexOf("\\") > -1) ? path.replace(/\\\./g, '__PXDOT__').replace(/\\\//g, '__PXSLASH__').split(/[\.\/]/).map( function(elem) {
			return elem.replace(/__PXDOT__/g, '.').replace(/__PXSLASH__/g, '/');
		} ) : path.split(/[\.\/]/);
		
		var key = parts.pop();
		
		// traverse path
		while (parts.length) {
			var part = parts.shift();
			if (part) {
				if (!(part in target)) {
					// path runs into non-existent object
					return false;
				}
				if (typeof(target[part]) != 'object') {
					// path runs into non-object
					return false;
				}
				target = target[part];
			}
		}
		
		delete target[key];
		return true;
	},
	
	getPath: function(target, path) {
		// get path using dir/slash/syntax or dot.path.syntax
		// support inline dots and slashes if backslash-escaped
		var parts = (path.indexOf("\\") > -1) ? path.replace(/\\\./g, '__PXDOT__').replace(/\\\//g, '__PXSLASH__').split(/[\.\/]/).map( function(elem) {
			return elem.replace(/__PXDOT__/g, '.').replace(/__PXSLASH__/g, '/');
		} ) : path.split(/[\.\/]/);
		
		var key = parts.pop();
		
		// traverse path
		while (parts.length) {
			var part = parts.shift();
			if (part) {
				if (typeof(target[part]) != 'object') {
					// path runs into non-object
					return undefined;
				}
				target = target[part];
			}
		}
		
		return target[key];
	},
	
	formatDate: function(thingy, template) {
		// format date using get_date_args
		// e.g. '[yyyy]/[mm]/[dd]' or '[dddd], [mmmm] [mday], [yyyy]' or '[hour12]:[mi] [ampm]'
		return this.sub( template, this.getDateArgs(thingy) );
	},
	
	getDateArgs: function(thingy) {
		// return hash containing year, mon, mday, hour, min, sec
		// given epoch seconds, date object or date string
		if (!thingy) thingy = new Date();
		var date = (typeof(thingy) == 'object') ? thingy : (new Date( (typeof(thingy) == 'number') ? (thingy * 1000) : thingy ));
		var args = {
			epoch: Math.floor( date.getTime() / 1000 ),
			year: date.getFullYear(),
			mon: date.getMonth() + 1,
			mday: date.getDate(),
			wday: date.getDay(),
			hour: date.getHours(),
			min: date.getMinutes(),
			sec: date.getSeconds(),
			msec: date.getMilliseconds(),
			offset: 0 - (date.getTimezoneOffset() / 60)
		};
		
		args.yyyy = '' + args.year;
		args.yy = args.year % 100;
		if (args.yy < 10) args.yy = "0" + args.yy; else args.yy = '' + args.yy;
		if (args.mon < 10) args.mm = "0" + args.mon; else args.mm = '' + args.mon;
		if (args.mday < 10) args.dd = "0" + args.mday; else args.dd = '' + args.mday;
		if (args.hour < 10) args.hh = "0" + args.hour; else args.hh = '' + args.hour;
		if (args.min < 10) args.mi = "0" + args.min; else args.mi = '' + args.min;
		if (args.sec < 10) args.ss = "0" + args.sec; else args.ss = '' + args.sec;
		
		if (args.hour >= 12) {
			args.ampm = 'pm';
			args.hour12 = args.hour - 12;
			if (!args.hour12) args.hour12 = 12;
		}
		else {
			args.ampm = 'am';
			args.hour12 = args.hour;
			if (!args.hour12) args.hour12 = 12;
		}
		
		args.AMPM = args.ampm.toUpperCase();
		args.yyyy_mm_dd = args.yyyy + '/' + args.mm + '/' + args.dd;
		args.hh_mi_ss = args.hh + ':' + args.mi + ':' + args.ss;
		args.tz = 'GMT' + (args.offset >= 0 ? '+' : '') + args.offset;
		
		// add formatted month and weekdays
		args.mmm = SHORT_MONTH_NAMES[ args.mon - 1 ];
		args.mmmm = MONTH_NAMES[ args.mon - 1];
		args.ddd = SHORT_DAY_NAMES[ args.wday ];
		args.dddd = DAY_NAMES[ args.wday ];
		
		return args;
	},
	
	getTimeFromArgs: function(args) {
		// return epoch given args like those returned from getDateArgs()
		var then = new Date(
			args.year,
			args.mon - 1,
			args.mday,
			args.hour,
			args.min,
			args.sec,
			0
		);
		return Math.floor( then.getTime() / 1000 );
	},
	
	normalizeTime: function(epoch, zero_args) {
		// quantize time into any given precision
		// examples: 
		//   hour: { min:0, sec:0 }
		//   day: { hour:0, min:0, sec:0 }
		var args = this.getDateArgs(epoch);
		for (var key in zero_args) args[key] = zero_args[key];
		
		// mday is 1-based
		if (!args['mday']) args['mday'] = 1;
		
		return this.getTimeFromArgs(args);
	},
	
	getTextFromBytes: function(bytes, precision) {
		// convert raw bytes to english-readable format
		// set precision to 1 for ints, 10 for 1 decimal point (default), 100 for 2, etc.
		bytes = Math.floor(bytes);
		if (!precision) precision = 10;
		
		if (bytes >= 1024) {
			bytes = Math.floor( (bytes / 1024) * precision ) / precision;
			if (bytes >= 1024) {
				bytes = Math.floor( (bytes / 1024) * precision ) / precision;
				if (bytes >= 1024) {
					bytes = Math.floor( (bytes / 1024) * precision ) / precision;
					if (bytes >= 1024) {
						bytes = Math.floor( (bytes / 1024) * precision ) / precision;
						return bytes + ' TB';
					} 
					else return bytes + ' GB';
				} 
				else return bytes + ' MB';
			}
			else return bytes + ' K';
		}
		else return bytes + this.pluralize(' byte', bytes);
	},
	
	getBytesFromText: function(text) {
		// parse text into raw bytes, e.g. "1 K" --> 1024
		if (text.toString().match(/^\d+$/)) return parseInt(text); // already in bytes
		var multipliers = {
			b: 1,
			k: 1024,
			m: 1024 * 1024,
			g: 1024 * 1024 * 1024,
			t: 1024 * 1024 * 1024 * 1024
		};
		var bytes = 0;
		text = text.toString().replace(/([\d\.]+)\s*(\w)\w*\s*/g, function(m_all, m_g1, m_g2) {
			var mult = multipliers[ m_g2.toLowerCase() ] || 0;
			bytes += (parseFloat(m_g1) * mult); 
			return '';
		} );
		return Math.floor(bytes);
	},
	
	commify: function(number) {
		// add US-formatted commas to integer, like 1,234,567
		if (!number) number = 0;
		number = '' + number;
		
		if (number.length > 3) {
			var mod = number.length % 3;
			var output = (mod > 0 ? (number.substring(0,mod)) : '');
			for (var i=0 ; i < Math.floor(number.length / 3); i++) {
				if ((mod == 0) && (i == 0))
					output += number.substring(mod+ 3 * i, mod + 3 * i + 3);
				else
					output+= ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
			}
			return (output);
		}
		else return number;
	},
	
	shortFloat: function(value, places) {
		// Shorten floating-point decimal to N places max
		if (!places) places = 2;
		var mult = Math.pow(10, places);
		return( Math.floor(parseFloat(value || 0) * mult) / mult );
	},
	
	pct: function(count, max, floor) {
		// Return formatted percentage given a number along a sliding scale from 0 to 'max'
		var pct = (count * 100) / (max || 1);
		if (!pct.toString().match(/^\d+(\.\d+)?$/)) { pct = 0; }
		return '' + (floor ? Math.floor(pct) : this.shortFloat(pct)) + '%';
	},
	
	zeroPad: function(value, len) {
		// Pad a number with zeroes to achieve a desired total length (max 10)
		return ('0000000000' + value).slice(0 - len);
	},
	
	clamp: function(val, min, max) {
		// simple math clamp implementation
		return Math.max(min, Math.min(max, val));
	},
	
	lerp: function(start, end, amount) {
		// simple linear interpolation algo
		return start + ((end - start) * this.clamp(amount, 0, 1));
	},
	
	getTextFromSeconds: function(sec, abbrev, no_secondary) {
		// convert raw seconds to human-readable relative time
		var neg = '';
		sec = Math.floor(sec);
		if (sec<0) { sec =- sec; neg = '-'; }
		
		var p_text = abbrev ? "sec" : "second";
		var p_amt = sec;
		var s_text = "";
		var s_amt = 0;
		
		if (sec > 59) {
			var min = Math.floor(sec / 60);
			sec = sec % 60; 
			s_text = abbrev ? "sec" : "second"; 
			s_amt = sec; 
			p_text = abbrev ? "min" : "minute"; 
			p_amt = min;
			
			if (min > 59) {
				var hour = Math.floor(min / 60);
				min = min % 60; 
				s_text = abbrev ? "min" : "minute"; 
				s_amt = min; 
				p_text = abbrev ? "hr" : "hour"; 
				p_amt = hour;
				
				if (hour > 23) {
					var day = Math.floor(hour / 24);
					hour = hour % 24; 
					s_text = abbrev ? "hr" : "hour"; 
					s_amt = hour; 
					p_text = "day"; 
					p_amt = day;
				} // hour>23
			} // min>59
		} // sec>59
		
		var text = p_amt + " " + p_text;
		if ((p_amt != 1) && !abbrev) text += "s";
		if (s_amt && !no_secondary) {
			text += ", " + s_amt + " " + s_text;
			if ((s_amt != 1) && !abbrev) text += "s";
		}
		
		return(neg + text);
	},
	
	getSecondsFromText: function(text) {
		// parse text into raw seconds, e.g. "1 minute" --> 60
		if (text.toString().match(/^\d+$/)) return parseInt(text); // already in seconds
		var multipliers = {
			s: 1,
			m: 60,
			h: 60 * 60,
			d: 60 * 60 * 24,
			w: 60 * 60 * 24 * 7,
			y: 60 * 60 * 24 * 365
		};
		var seconds = 0;
		text = text.toString().replace(/([\d\.]+)\s*(\w)\w*\s*/g, function(m_all, m_g1, m_g2) {
			var mult = multipliers[ m_g2.toLowerCase() ] || 0;
			seconds += (parseFloat(m_g1) * mult); 
			return '';
		} );
		return Math.floor(seconds);
	},
	
	getNiceRemainingTime: function(elapsed, counter, counter_max, abbrev, shorten) {
		// estimate remaining time given starting epoch, a counter and the 
		// counter maximum (i.e. percent and 100 would work)
		// return in english-readable format
		if (counter == counter_max) return 'Complete';
		if (counter == 0) return 'n/a';
		
		var sec_remain = Math.floor(((counter_max - counter) * elapsed) / counter);
		
		return this.getTextFromSeconds( sec_remain, abbrev, shorten );
	},
	
	randArray: function(arr) {
		// return random element from array
		return arr[ Math.floor(Math.random() * arr.length) ];
	},
	
	pluralize: function(word, num) {
		// apply english pluralization to word if 'num' is not equal to 1
		if (num != 1) {
			return word.replace(/y$/, 'ie') + 's';
		}
		else return word;
	},
	
	escapeRegExp: function(text) {
		// escape text for regular expression
		return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	},
	
	ucfirst: function(text) {
		// capitalize first character only, lower-case rest
		return text.substring(0, 1).toUpperCase() + text.substring(1, text.length).toLowerCase();
	},
	
	getErrorDescription: function(err) {
		// attempt to get better error description using 'errno' module
		var msg = err.message;
		
		if (err.errno && ErrNo.code[err.errno]) {
			msg = this.ucfirst(ErrNo.code[err.errno].description) + " (" + err.message + ")";
		}
		else if (err.code && ErrNo.code[err.code]) {
			msg = this.ucfirst(ErrNo.code[err.code].description) + " (" + err.message + ")";
		}
		
		return msg;
	},
	
	bufferSplit: function(buf, chunk) {
		// Split a buffer like string split (no reg exp support tho)
		// WARNING: Splits use SAME MEMORY SPACE as original buffer
		var idx = -1;
		var lines = [];
		
		while ((idx = buf.indexOf(chunk)) > -1) {
			lines.push( buf.subarray(0, idx) );
			buf = buf.subarray( idx + chunk.length, buf.length );
		}
		
		lines.push(buf);
		return lines;
	},
	
	fileEachLine: function(file, opts, iterator, callback) {
		// asynchronously process file line by line, using very little memory
		var self = this;
		if (!callback && (typeof(opts) == 'function')) {
			// support 3-arg convention: file, iterator, callback
			callback = iterator;
			iterator = opts;
			opts = {};
		}
		if (!opts) opts = {};
		if (!opts.buffer_size) opts.buffer_size = 1024;
		if (!opts.eol) opts.eol = os.EOL;
		if (!('encoding' in opts)) opts.encoding = 'utf8';
		
		var chunk = Buffer.alloc(opts.buffer_size);
		var lastChunk = null;
		var processNextLine = null;
		var processChunk = null;
		var readNextChunk = null;
		var lines = [];
		
		fs.open(file, "r", function(err, fh) {
			if (err) {
				if ((err.code == 'ENOENT') && (opts.ignore_not_found)) return callback();
				else return callback(err);
			}
			
			processNextLine = function() {
				// process single line from buffer
				var line = lines.shift();
				if (opts.encoding) line = line.toString( opts.encoding );
				
				iterator(line, function(err) {
					if (err) {
						fs.close(fh, function() {});
						return callback(err);
					}
					// if (lines.length) setImmediate( processNextLine ); // ensure async
					if (lines.length) process.nextTick( processNextLine );
					else readNextChunk();
				});
			};
			
			processChunk = function(err, num_bytes, chunk) {
				if (err) {
					fs.close(fh, function() {});
					return callback(err);
				}
				var eof = (num_bytes != opts.buffer_size);
				var data = chunk.subarray(0, num_bytes);
				
				if (lastChunk && lastChunk.length) {
					data = Buffer.concat([lastChunk, data], lastChunk.length + data.length);
					lastChunk = null;
				}
				
				if (data.length) {
					lines = self.bufferSplit( data, opts.eol );
					
					// see if data ends on EOL -- if not, we have a partial block
					// fill buffer for next read (unless at EOF)
					if (data.subarray(0 - opts.eol.length).toString() == opts.eol) {
						lines.pop(); // remove empty line caused by split
					}
					else if (!eof) {
						// more to read, save excess for next loop iteration
						var line = lines.pop();
						lastChunk = Buffer.from(line);
					}
					
					if (lines.length) processNextLine();
					else readNextChunk();
				}
				else {
					// close file and complete
					fs.close(fh, callback);
				}
			};
			
			readNextChunk = function() {
				// read chunk from file
				fs.read(fh, chunk, 0, opts.buffer_size, null, processChunk);
			};
			
			// begin reading
			readNextChunk();
		}); // fs.open
	},
	
	getpwnam: function(username, use_cache) {
		// Simulate POSIX getpwnam by querying getent on linux, or /usr/bin/id on darwin / OSX.
		// Accepts username or uid, and can optionally cache results for repeat queries for same user.
		// Response keys: username, password, uid, gid, name, dir, shell
		var user = null;
		
		if (use_cache && this.user_cache[username]) {
			return this.copyHash( this.user_cache[username] );
		}
		
		if (process.platform === 'linux') {
			// use getent on linux
			var cols = null;
			var getent = this.findBinSync('getent');
			if (!getent) return null; // no getent!
			
			var opts = { timeout: 1000, encoding: 'utf8' };
			try { cols = cp.execSync(getent + ' passwd ' + username, opts).trim().split(':'); }
			catch (err) { return null; }
			
			if ((username == cols[0]) || (username == Number(cols[2]))) {
				user = {
					username: cols[0],
					password: cols[1],
					uid: Number(cols[2]),
					gid: Number(cols[3]),
					name: cols[4] && cols[4].split(',')[0],
					dir: cols[5],
					shell: cols[6]
				};
			}
			else {
				// user not found
				return null;
			}
		}
		else if (process.platform === 'darwin') {
			// use /usr/bin/id on darwin / OSX
			var cols = null;
			var opts = { timeout: 1000, encoding: 'utf8', stdio: 'pipe' };
			try { cols = cp.execSync('/usr/bin/id -P ' + username, opts).trim().split(':'); }
			catch (err) { return null; }
			
			if ((username == cols[0]) || (username == Number(cols[2]))) {
				user = {
					username: cols[0],
					password: cols[1],
					uid: Number(cols[2]),
					gid: Number(cols[3]),
					name: cols[7],
					dir: cols[8],
					shell: cols[9]
				};
			}
			else {
				// something went wrong
				return null;
			}
		}
		else {
			// unsupported platform
			return null;
		}
		
		if (use_cache) {
			this.user_cache[ user.username ] = user;
			this.user_cache[ user.uid ] = user;
			return this.copyHash( user );
		}
		else {
			return user;
		}
	},
	
	getgrnam: function(name, use_cache) {
		// Simulate POSIX getgrnam by querying getent on linux, or /etc/group on darwin / OSX.
		// Accepts group name or gid, and can optionally cache results for repeat queries for same group.
		// Response keys: name, gid
		var group = null;
		
		if (use_cache && this.group_cache[name]) {
			return this.copyHash( this.group_cache[name] );
		}
		
		if (process.platform === 'linux') {
			// use getent on linux
			var lines = null;
			var cols = null;
			
			var getent = this.findBinSync('getent');
			if (!getent) return null; // no getent!
			
			var opts = { timeout: 1000, encoding: 'utf8' };
			try { cols = cp.execSync(getent + ' group ' + name, opts).trim().split(':'); }
			catch (err) { return null; }
			
			if ((name == cols[0]) || (name == Number(cols[2]))) {
				group = {
					name: cols[0],
					gid: Number(cols[2])
				};
			}
			else {
				// group not found
				return null;
			}
		}
		else if (process.platform === 'darwin') {
			// use /etc/group on darwin / OSX
			if (!fs.existsSync('/etc/group')) return null; // no /etc/group!
			var lines = fs.readFileSync('/etc/group', 'utf8').trim().split(/\n/);
			
			for (var idx = 0, len = lines.length; idx < len; idx++) {
				var cols = lines[idx].split(':');
				if ((name == cols[0]) || (name == Number(cols[2]))) {
					group = {
						name: cols[0],
						gid: Number(cols[2])
					};
					idx = len;
				}
			}
			
			return group;
		}
		else {
			// unsupported platform
			return null;
		}
		
		if (use_cache) {
			this.group_cache[ group.name ] = group;
			this.group_cache[ group.gid ] = group;
			return this.copyHash( group );
		}
		else {
			return group;
		}
	},
	
	tween: function(start, end, amount, mode, algo) {
		// Calculate the "tween" (value between two other values) using a variety of algorithms.
		// Useful for computing positions for animation frames.
		// Omit mode and algo for 'lerp' (simple linear interpolation).
		if (!mode) mode = 'EaseOut';
		if (!algo) algo = 'Linear';
		amount = this.clamp( amount, 0.0, 1.0 );
		return start + (EASE_MODES[mode]( amount, algo ) * (end - start));
	},
	
	findFiles: function(dir, opts, callback) {
		// find all files matching filespec, optionally recurse into subdirs
		// opts: { filespec, recurse, all (dotfiles), filter }
		var files = [];
		
		if (!callback) { callback = opts; opts = {}; }
		if (!opts) opts = {};
		if (!opts.filespec) opts.filespec = /.+/;
		else if (typeof(opts.filespec) == 'string') opts.filespec = new RegExp(opts.filespec);
		if (!("recurse" in opts)) opts.recurse = true;
		
		this.walkDir( dir,
			function(file, stats, callback) {
				var filename = Path.basename(file);
				if (!opts.all && filename.match(/^\./)) return callback(false); // skip dotfiles
				
				if (stats.isDirectory()) return callback( opts.recurse );
				else {
					if (filename.match( opts.filespec )) {
						if (opts.filter && (opts.filter(file, stats) === false)) return callback(false); // user skip
						else files.push(file);
					}
				}
				callback();
			},
			function(err) {
				callback(err, files);
			}
		); // walkDir
	},
	
	walkDir: function(dir, iterator, callback) {
		// walk directory tree, fire iterator for every file, then callback at end
		// iterator is passed: (path, stats, callback)
		// pass false to iterator callback to prevent descending into a dir
		var self = this;
		
		fs.readdir(dir, function(err, files) {
			if (err) return callback(err);
			if (!files || !files.length) return callback();
			
			self.async.eachSeries( files,
				function(filename, callback) {
					var file = Path.join( dir, filename );
					fs.stat( file, function(err, stats) {
						if (err) {
							return callback(err);
						}
						iterator( file, stats, function(cont) {
							// recurse for dir
							if (stats.isDirectory() && (cont !== false)) {
								self.walkDir( file, iterator, callback );
							}
							else callback();
						} );
					} );
				}, callback
			); // eachSeries
		} ); // fs.readdir
	},
	
	writeFileAtomic: function(file, data, opts, callback) {
		// write a file atomically
		var temp_file = file + '.tmp.' + process.pid + '.' + this.generateShortID();
		if (!callback) {
			// opts is optional
			callback = opts;
			opts = {};
		}
		fs.writeFile( temp_file, data, opts, function(err) {
			if (err) return callback(err);
			
			fs.rename( temp_file, file, function(err) {
				if (err) {
					// cleanup temp file before returning
					fs.unlink( temp_file, function() { callback(err); } );
				}
				else callback();
			});
		}); // fs.writeFile
	},
	
	writeFileAtomicSync: function(file, data, opts) {
		// write a file atomically and synchronously
		var temp_file = file + '.tmp.' + process.pid + '.' + this.generateShortID();
		if (!opts) opts = {};
		
		fs.writeFileSync( temp_file, data, opts );
		try {
			fs.renameSync( temp_file, file );
		}
		catch (err) {
			// try to cleanup temp file before throwing
			fs.unlinkSync( temp_file );
			throw err;
		}
	},
	
	parseJSON: function(text) {
		// parse JSON with improved error messages (i.e. line numbers)
		text = text.toString().replace(/\r\n/g, "\n"); // Unix line endings
		var json = null;
		try { json = JSON.parse(text); }
		catch (err) {
			var lines = text.split(/\n/).map( function(line) { return line + "\n"; } );
			var err_msg = (err.message || err.toString()).replace(/\bat\s+position\s+(\d+)/, function(m_all, m_g1) {
				var pos = parseInt(m_g1);
				var offset = 0;
				var loc = null;
				for (var idx = 0, len = lines.length; idx < len; idx++) {
					offset += lines[idx].length;
					if (offset >= pos) {
						loc = { line: idx + 1 };
						offset -= lines[idx].length;
						loc.column = (pos - offset) + 1;
						idx = len;
					}
				}
				if (loc) {
					return "on line " + loc.line + " column " + loc.column;
				}
				else return m_all;
			});
			throw new Error(err_msg);
		}
		return json;
	},
	
	findBin: function(bin, callback) {
		// locate binary executable using PATH and known set of common dirs
		var dirs = (process.env.PATH || '').split(/\:/).concat(BIN_DIRS).filter( function(item) {
			return item.match(/\S/);
		} );
		var found = false;
		
		this.async.eachSeries( dirs,
			function(dir, callback) {
				var file = Path.join(dir, bin);
				fs.stat( file, function(err, stats) {
					if (!err && stats) {
						found = file;
						return callback("ABORT");
					}
					callback();
				} ); // fs.stat
			},
			function() {
				if (found) callback( false, found );
				else callback( new Error("Binary executable not found: " + bin) );
			}
		); // eachSeries
	},
	
	findBinSync: function(bin) {
		// locate binary executable using PATH and known set of common dirs
		var dirs = (process.env.PATH || '').split(/\:/).concat(BIN_DIRS).filter( function(item) {
			return item.match(/\S/);
		} );
		
		for (var idx = 0, len = dirs.length; idx < len; idx++) {
			var file = Path.join(dirs[idx], bin);
			if (fs.existsSync(file)) return file;
		}
		
		return false;
	},
	
	sortBy: function(orig, key, opts) {
		// sort array of objects by key, asc or desc, and optionally return NEW array
		// opts: { dir, type, copy }
		if (!opts) opts = {};
		if (!opts.dir) opts.dir = 1;
		if (!opts.type) opts.type = 'string';
		
		var arr = opts.copy ? Array.from(orig) : orig;
		
		arr.sort( function(a, b) {
			switch(opts.type) {
				case 'string':
					return( (''+a[key]).localeCompare(b[key]) * opts.dir );
				break;
				
				case 'number':
					return (a[key] - b[key]) * opts.dir;
				break;
			}
		} );
		
		return arr;
	}
	
}; // module.exports

// Replace old npm mkdirp with native implementation (Node v10+)
module.exports.mkdirp = function(path, opts, callback) {
	if (!callback) {
		callback = opts;
		opts = null;
	}
	if (!opts) opts = { mode: 0o777 };
	if (typeof(opts) == 'number') opts = { mode: opts };
	opts.recursive = true;
	fs.mkdir( path, opts, callback );
};

module.exports.mkdirp.sync = function(path, opts) {
	if (!opts) opts = { mode: 0o777 };
	if (typeof(opts) == 'number') opts = { mode: opts };
	opts.recursive = true;
	return fs.mkdirSync( path, opts );
};
