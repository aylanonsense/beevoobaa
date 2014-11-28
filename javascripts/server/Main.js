if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'shared/Constants',
	'server/net/Connection',
	'server/SpaceGame'
], function(
	SharedConstants,
	Connection,
	Game
) {
	return function() {
		//add network listeners
		Connection.onConnected(Game.onConnected);
		Connection.onReceive(Game.onReceive);
		Connection.onDisconnected(Game.onDisconnected);

		//kick off the game loop
		setInterval(function() {
			Game.tick(1 / SharedConstants.SERVER_UPDATES_PER_SECOND);
		}, 1000 / SharedConstants.SERVER_UPDATES_PER_SECOND);
	};
});