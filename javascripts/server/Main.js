define([
	'server/game/Game',
	'server/net/GameConnectionServer',
	'shared/config',
	'shared/utils/now'
], function(
	Game,
	GameConnectionServer,
	sharedConfig,
	now
) {
	return function() {
		//set up the game loop
		var prevTime = now();
		var timeToFlush = sharedConfig.SERVER_OUTGOING_MESSAGE_BUFFER_TIME -
			0.5 / sharedConfig.FRAME_RATE;
		function loop() {
			//calculate time since last loop was run
			var time = now();
			var t = time - prevTime;
			prevTime = time;

			//the game moves forward ~one frame
			Game.tick(t);

			//every couple of frames any buffered messages are sent out to clients
			timeToFlush -= t;
			if(timeToFlush <= 0.0) {
				GameConnectionServer.forEach(function(conn) {
					if(conn.isConnected() && conn.isSynced()) {
						conn.flush();
					}
				});
				timeToFlush = sharedConfig.SERVER_OUTGOING_MESSAGE_BUFFER_TIME -
					0.5 / sharedConfig.FRAME_RATE;
			}
		}

		//kick off the game loop
		setInterval(loop, 1000 / sharedConfig.FRAME_RATE);
	};
});