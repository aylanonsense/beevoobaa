if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/consoles/EnergyLevelConsole'
], function(
	EnergyLevelConsole
) {
	return {
		EnergyLevelConsole: EnergyLevelConsole
	};
});