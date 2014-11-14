if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Console'
], function(
	SUPERCLASS
) {
	function ShipPositionConsole(ship) {
		SUPERCLASS.call(this);
		this._ship = ship;
	}
	ShipPositionConsole.prototype = Object.create(SUPERCLASS.prototype);
	ShipPositionConsole.prototype.generateReport = function() {
		var pos = this._ship.getPosition();
		return {
			id: this._consoleId,
			type: 'ShipPositionConsole',
			positionX: { value: pos.x },
			positionY: { value: pos.y }
		};
	};
	return ShipPositionConsole;
});