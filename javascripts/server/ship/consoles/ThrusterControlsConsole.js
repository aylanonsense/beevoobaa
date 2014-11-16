if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Console'
], function(
	SUPERCLASS
) {
	function ThrusterControlsConsole(thrusters) {
		SUPERCLASS.call(this);
		this._thrusters = thrusters;
	}
	ThrusterControlsConsole.prototype = Object.create(SUPERCLASS.prototype);
	ThrusterControlsConsole.prototype.generateReport = function() {
		return {
			id: this._consoleId,
			type: 'ThrusterControlsConsole',
			thrusters: this._thrusters.map(function(thruster) {
				return {
					thrust: { value: thruster.getThrust() },
					maxThrust: thruster.getMaxThrust(),
					targetThrust: { value: Math.floor(thruster.getMaxThrust() / 2) }
				};
			})
		};
	};
	return ThrusterControlsConsole;
});