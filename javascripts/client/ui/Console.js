if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function Console() {}
	Console.prototype.receiveUpdate = function(update) {};
	Console.prototype.tick = function() {};
	Console.prototype.render = function(ctx, camera) {};
	return Console;
});