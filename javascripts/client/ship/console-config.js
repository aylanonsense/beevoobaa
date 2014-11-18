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
		CompassConsole: { module: CompassConsole, x: 30, y: 30 },
		CourseDriftConsole: { module: CourseDriftConsole, x: 30, y: 80 },
		EnergyLevelConsole: { module: EnergyLevelConsole, x: 155, y: 80 },
		MinimapConsole: { module: MinimapConsole, x: 275, y: 30 },
		ShipPositionConsole: { module: ShipPositionConsole, x: 245, y: 230 },
		SpeedometerConsole: { module: SpeedometerConsole, x: 30, y: 235 },
		ThrusterControlsConsole: { module: ThrusterControlsConsole, x: 460, y: 30 }
	};
});