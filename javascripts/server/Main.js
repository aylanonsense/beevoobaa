if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'shared/Constants',
	'server/ship/Ship'
], function(
	SharedConstants,
	Ship
) {
	return function() {
		var ship = new Ship();
		setInterval(function() {
			ship.tick(1 / SharedConstants.SERVER_UPDATES_PER_SECOND);
		}, 1000 / SharedConstants.SERVER_UPDATES_PER_SECOND);
	};
});