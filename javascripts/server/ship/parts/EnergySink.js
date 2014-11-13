if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Part',
	'server/ship/mechanics/EnergyRequirements'
], function(
	SUPERCLASS,
	EnergyRequirements
) {
	function EnergySink(energyUsagePerSecond) {
		SUPERCLASS.call(this);
		this.energyRequirements = new EnergyRequirements(energyUsagePerSecond);
	}
	EnergySink.prototype = Object.create(SUPERCLASS.prototype);
	return EnergySink;
});