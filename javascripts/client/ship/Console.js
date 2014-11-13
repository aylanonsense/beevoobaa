if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function Console(update) {
		this._consoleId = update.id;
	}
	Console.prototype.getId = function() {
		return this._consoleId;
	};
	Console.prototype.receiveUpdate = function(update) {};
	Console.prototype.tick = function(t) {};
	Console.prototype.render = function(ctx) {};
	return Console;
});