if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/consoles/CompassConsole',
	'client/ship/consoles/CourseDriftConsole',
	'client/ship/consoles/EnergyLevelConsole',
	'client/ship/consoles/MinimapConsole',
	'client/ship/consoles/ShipPositionConsole',
	'client/ship/consoles/SpeedometerConsole',
	'client/ship/consoles/ThrusterControlsConsole'
], function(
	CompassConsole,
	CourseDriftConsole,
	EnergyLevelConsole,
	MinimapConsole,
	ShipPositionConsole,
	SpeedometerConsole,
	ThrusterControlsConsole
) {
	return {
		CompassConsole: CompassConsole,
		CourseDriftConsole: CourseDriftConsole,
		EnergyLevelConsole: EnergyLevelConsole,
		MinimapConsole: MinimapConsole,
		ShipPositionConsole: ShipPositionConsole,
		SpeedometerConsole: SpeedometerConsole,
		ThrusterControlsConsole: ThrusterControlsConsole
	};
});