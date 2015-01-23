define([
	'server/net/Server',
	'server/entity/Player',
	'server/entity/Ball',
	'performance-now'
], function(
	Server,
	Player,
	Ball,
	now
) {
	var SECONDS_BETWEEN_SEND_STATES = 0.50;
	var timeToNextSendState = SECONDS_BETWEEN_SEND_STATES;
	var entities = [ new Ball({ radius: 50, x: 300, y: 300, vel: { x: 100, y: 100 } }) ];

	function tick(t) {
		//update each entity
		for(var i = 0; i < entities.length; i++) {
			entities[i].tick(t);
		}

		//send out the full game state every so often
		timeToNextSendState -= t;
		if(timeToNextSendState <= 0) {
			Server.forEach(function(conn) {
				sendState(conn);
			});
			timeToNextSendState += SECONDS_BETWEEN_SEND_STATES;
		}
	}

	function onConnected(conn) {
		console.log("Player " + conn.id + " connected!");
		var player = new Player({ x: 200, y: 200, width: 50, height: 70 });
		entities.push(player);
		conn.gameData.playerId = player.id;
		sendState(conn);
	}

	function onReceive(conn, msg) {
		msg = msg || {};
		if(msg.messageType === 'ping') {
			Server.send(conn, {
				messageType: 'ping-response',
				pingId: msg.pingId,
				time: now()
			});
		}
		else {
			console.log("Unsure how to handle '" + msg.messageType + "' message");
		}
	}

	function onDisconnected(conn) {
		console.log("Player " + conn.id + " disconnected!");
	}

	//helper methods
	function getState() {
		var state = { entities: [] };
		for(var i = 0; i < entities.length; i++) {
			state.entities.push(entities[i].getState());
		}
		return state;
	}

	function sendState(conn) {
		Server.send(conn, {
			messageType: 'game-state',
			time: now(),
			state: getState(),
			playerId: conn.gameData.playerId
		});
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});