if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Part',
	'server/space/ship/mechanics/EnergyRequirements'
], function(
	SUPERCLASS,
	EnergyRequirements
) {
	function EnergySink(ship, energyUsagePerSecond) {
		SUPERCLASS.call(this, ship);
		this.energyRequirements = new EnergyRequirements(energyUsagePerSecond);
	}
	EnergySink.prototype = Object.create(SUPERCLASS.prototype);
	return EnergySink;
});