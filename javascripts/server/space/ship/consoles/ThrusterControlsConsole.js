if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
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
					targetThrust: { value: thruster.getTargetThrust() }
				};
			})
		};
	};
	ThrusterControlsConsole.prototype.processInput = function(player, input) {
		SUPERCLASS.prototype.processInput.call(this, player, input);
		this._thrusters[input.thrusterIndex].setTargetThrust(input.targetThrust);
	};
	return ThrusterControlsConsole;
});