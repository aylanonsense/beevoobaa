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
		Server.onReceive(function(conn, msg) {
			msg = msg || {};
			if(msg.messageType === 'ping') {
				Server.send(conn, { messageType: 'ping-response', pingId: msg.pingId, time: now() });
			}
			else if(!Game.onReceive(conn, msg)) {
				console.log("Unsure how to handle '" + msg.messageType + "' message from " + conn.id);
			}
		});
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