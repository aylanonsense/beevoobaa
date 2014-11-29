if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/ship/Console'
], function(
	SUPERCLASS
) {
	function EnergyLevelConsole(ship, energySupply) {
		SUPERCLASS.call(ship, this);
		this._energySupply = energySupply;
	}
	EnergyLevelConsole.prototype = Object.create(SUPERCLASS.prototype);
	EnergyLevelConsole.prototype.generateReport = function() {
		return {
			id: this._consoleId,
			type: 'EnergyLevelConsole',
			energy: { value: this._energySupply.getEnergy() },
			maxEnergy: this._energySupply.getMaxEnergy()
		};
	};
	return EnergyLevelConsole;
});