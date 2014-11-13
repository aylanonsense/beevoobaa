if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'shared/Constants',
	'server/SpaceSimulator'
], function(
	SharedConstants,
	SpaceSimulator
) {
	return function() {
		setInterval(function() {
			SpaceSimulator.tick(1 / SharedConstants.SERVER_UPDATES_PER_SECOND);
		}, 1000 / SharedConstants.SERVER_UPDATES_PER_SECOND);
	};
});