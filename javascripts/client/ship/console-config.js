if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/consoles/CompassConsole',
	'client/ship/consoles/CourseDriftConsole',
	'client/ship/consoles/EnergyLevelConsole',
	'client/ship/consoles/ShipPositionConsole',
	'client/ship/consoles/SpeedometerConsole'
], function(
	CompassConsole,
	CourseDriftConsole,
	EnergyLevelConsole,
	ShipPositionConsole,
	SpeedometerConsole
) {
	return {
		CompassConsole: CompassConsole,
		CourseDriftConsole: CourseDriftConsole,
		EnergyLevelConsole: EnergyLevelConsole,
		ShipPositionConsole: ShipPositionConsole,
		SpeedometerConsole: SpeedometerConsole
	};
});