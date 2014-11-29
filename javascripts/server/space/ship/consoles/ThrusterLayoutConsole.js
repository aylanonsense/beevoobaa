if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
], function(
	SUPERCLASS
) {
	function ThrusterLayoutConsole(ship, thrusters) {
		SUPERCLASS.call(this, ship);
		this._thrusters = thrusters;
	}
	ThrusterLayoutConsole.prototype = Object.create(SUPERCLASS.prototype);
	ThrusterLayoutConsole.prototype.generateReport = function() {
		return {
			id: this._consoleId,
			type: 'ThrusterLayoutConsole',
			thrusters: this._thrusters.map(function(thruster) {
				return {
					thrustPercent: { value: thruster.getThrust() / thruster.getMaxThrust() },
					angle: thruster.getAngle(),
					offset: thruster.getOffset()
				};
			})
		};
	};
	return ThrusterLayoutConsole;
});