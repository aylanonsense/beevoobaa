define([
	'server/Constants',
	'server/net/Connection',
	'server/Game'
], function(
	Constants,
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
			Game.tick(1 / Constants.TARGET_FRAME_RATE);
		}, 1000 / Constants.TARGET_FRAME_RATE);
	};
});