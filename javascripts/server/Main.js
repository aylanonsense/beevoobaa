define([
	'server/Constants',
	'server/net/Connection',
	'server/Game',
	'performance-now'
], function(
	Constants,
	Connection,
	Game,
	now
) {
	return function() {
		//add network listeners
		Connection.onConnected(Game.onConnected);
		Connection.onReceive(Game.onReceive);
		Connection.onDisconnected(Game.onDisconnected);

		//kick off the game loop
		var prevTimestamp = now();
		setInterval(function() {
			var timestamp = now();
			Game.tick((timestamp - prevTimestamp) / 1000);
			prevTimestamp = timestamp;
		}, 1000 / Constants.TARGET_FRAME_RATE);
	};
});