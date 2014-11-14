if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/consoles/EnergyLevelConsole',
	'client/ship/consoles/ShipPositionConsole',
	'client/ship/consoles/SpeedometerConsole'
], function(
	EnergyLevelConsole,
	ShipPositionConsole,
	SpeedometerConsole
) {
	return {
		EnergyLevelConsole: EnergyLevelConsole,
		ShipPositionConsole: ShipPositionConsole,
		SpeedometerConsole: SpeedometerConsole
	};
});