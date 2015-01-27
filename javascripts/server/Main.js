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
		var bufferedMessages = [];

		//add network listeners
		Server.onConnected(Game.onConnected);
		Server.onReceive(function(conn, msg) {
			msg = msg || {};
			if(msg.messageType === 'ping') {
				Server.send(conn, { messageType: 'ping-response', pingId: msg.pingId, time: now() });
			}
			else {
				bufferedMessages.push({ conn: conn, msg: msg });
			}
		});
		Server.onDisconnected(Game.onDisconnected);

		function processBufferedMessages(endTime) {
			var numMessagesToRemove = 0;
			for(var i = 0; i < bufferedMessages.length; i++) {
				var conn = bufferedMessages[i].conn;
				var msg = bufferedMessages[i].msg;
				var time = msg.time;
				//if the msg is relevant now, apply it
				if(!time || time <= endTime) {
					if(!Game.onReceive(conn, msg)) {
						console.log("Unsure how to handle '" + msg.messageType +
							"' message from " + conn.id);
					}
					numMessagesToRemove++;
				}
				//if it occurs in the future, the rest must also occur in the future
				else {
					break;
				}
			}
			if(numMessagesToRemove > 0) {
				bufferedMessages = bufferedMessages.slice(numMessagesToRemove, bufferedMessages.length);
			}
		}

		//kick off the game loop
		var prevTimestamp = now();
		setInterval(function() {
			var timestamp = now();
			processBufferedMessages(timestamp);
			Game.tick((timestamp - prevTimestamp) / 1000);
			prevTimestamp = timestamp;
		}, 1000 / Constants.TARGET_FRAME_RATE);
	};
});