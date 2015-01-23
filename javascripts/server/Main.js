define([
	'server/Constants',
	'server/net/Server',
	'server/Game',
	'performance-now'
], function(
	Constants,
	Server,
	Game,
	now
) {
	return function() {
		//add network listeners
		Server.onConnected(Game.onConnected);
		Server.onReceive(Game.onReceive);
		Server.onDisconnected(Game.onDisconnected);

		//kick off the game loop
		var prevTimestamp = now();
		setInterval(function() {
			var timestamp = now();
			Game.tick((timestamp - prevTimestamp) / 1000);
			prevTimestamp = timestamp;
		}, 1000 / Constants.TARGET_FRAME_RATE);
	};
});