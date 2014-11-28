if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	var NEXT_CONSOLE_ID = 0;
	function Console() {
		this._consoleId = NEXT_CONSOLE_ID++;
	}
	Console.prototype.tick = function(t) {};
	Console.prototype.processInput = function(player, input) {};
	return Console;
});