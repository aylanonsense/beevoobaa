if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
], function(
	SUPERCLASS
) {
	function CourseDriftConsole(ship) {
		SUPERCLASS.call(this);
		this._ship = ship;
	}
	CourseDriftConsole.prototype = Object.create(SUPERCLASS.prototype);
	CourseDriftConsole.prototype.generateReport = function() {
		var vel = this._ship.physics.vel;
		var heading = this._ship.physics.facing;
		var course = Math.atan2(vel.y, vel.x);
		var drift = (course - heading) % (2 * Math.PI);
		if(drift > Math.PI) { drift -= 2 * Math.PI; }
		else if(drift <= -Math.PI) { drift += 2 * Math.PI; }
		return {
			id: this._consoleId,
			type: 'CourseDriftConsole',
			drift: { value: drift }
		};
	};
	return CourseDriftConsole;
});