if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/consoles/EnergyLevelConsole',
	'client/ship/consoles/ShipPositionConsole'
], function(
	EnergyLevelConsole,
	ShipPositionConsole
) {
	return {
		EnergyLevelConsole: EnergyLevelConsole,
		ShipPositionConsole: ShipPositionConsole
	};
});