if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ui/Console'
], function(
	Console
) {
	var SUPERCLASS = Console;
	function Speedometer() {
		SUPERCLASS.prototype.call(this);
	}
	Speedometer.prototype = Object.create(SUPERCLASS.prototype);
	Speedometer.prototype.receiveUpdate = function(update) {};
	Speedometer.prototype.tick = function() {};
	Speedometer.prototype.render = function(ctx, camera) {};
	return Speedometer;
});