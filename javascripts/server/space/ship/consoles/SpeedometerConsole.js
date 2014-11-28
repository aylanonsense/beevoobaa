if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
], function(
	SUPERCLASS
) {
	function SpeedometerConsole(ship) {
		SUPERCLASS.call(this);
		this._ship = ship;
	}
	SpeedometerConsole.prototype = Object.create(SUPERCLASS.prototype);
	SpeedometerConsole.prototype.generateReport = function() {
		var vel = this._ship.physics.vel;
		var speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y);
		return {
			id: this._consoleId,
			type: 'SpeedometerConsole',
			speed: { value: speed },
			maxSpeed: 1000
		};
	};
	return SpeedometerConsole;
});