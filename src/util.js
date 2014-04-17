var util = {};
util.debug = function debug() {
	if (typeof debugMode !== "undefined" && debugMode)
		console.log.apply(console, Array.prototype.slice.call(arguments));
};

if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
	module.exports = util;
}
