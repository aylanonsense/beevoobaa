if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Part'
], function(
	SUPERCLASS
) {
	function EnergyRequirements(energyUsagePerSecond) {
		SUPERCLASS.call(this);
		this._requiredEnergy = 0;
		this._providedEnergy = 0;
		this._energyUsage = energyUsagePerSecond || 0;
	}
	EnergyRequirements.prototype.prep = function(t) {
		this._requiredEnergy = this._energyUsage * t;
		this._providedEnergy = 0;
	};
	EnergyRequirements.prototype.tick = function(t) {};
	EnergyRequirements.prototype.getRequiredEnergy = function() {
		return this._requiredEnergy;
	};
	EnergyRequirements.prototype.setRequiredEnergy = function(energy) {
		this._requiredEnergy = energy;
	};
	EnergyRequirements.prototype.getProvidedEnergy = function() {
		return this._providedEnergy;
	};
	EnergyRequirements.prototype.provideEnergy = function(energy) {
		this._providedEnergy += energy;
	};
	return EnergyRequirements;
});