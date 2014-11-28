if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
], function(
	SUPERCLASS
) {
	function MinimapConsole(ship) {
		SUPERCLASS.call(this);
		this._ship = ship;
	}
	MinimapConsole.prototype = Object.create(SUPERCLASS.prototype);
	MinimapConsole.prototype.generateReport = function() {
		var vel = this._ship.physics.vel;
		var heading = this._ship.physics.facing;
		if(heading > Math.PI) { heading -= 2 * Math.PI; }
		else if(heading <= -Math.PI) { heading += 2 * Math.PI; }
		return {
			id: this._consoleId,
			type: 'MinimapConsole',
			velX: { value: vel.x },
			velY: { value: vel.y },
			heading: { value: heading }
		};
	};
	return MinimapConsole;
});