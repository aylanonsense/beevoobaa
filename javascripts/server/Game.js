define([
	'shared/Constants',
	'server/net/Server',
	'server/entity/Player',
	'server/entity/Ball',
	'performance-now'
], function(
	SharedConstants,
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

		//flush all buffered messages
		Server.flush();
	}

	function onConnected(conn) {
		console.log("Player " + conn.id + " connected!");
		var player = new Player({ x: SharedConstants.BOUNDS.LEFT_WALL + Math.floor(Math.random() *
			(SharedConstants.BOUNDS.RIGHT_WALL - SharedConstants.BOUNDS.LEFT_WALL - 50)),
			y: SharedConstants.BOUNDS.FLOOR - 70, width: 50, height: 70 });
		entities.push(player);
		conn.gameData.playerEntity = player;
		sendState(conn);
	}

	function onReceive(conn, msg) {
		if(msg.messageType === 'player-action') {
			//console.log("Received player action with " + Math.floor(msg.time - now()) + "ms to spare");
			if(conn.gameData.playerEntity) {
				conn.gameData.playerEntity.handleAction(msg);
			}
			return true;
		}
		return false;
	}

	function onDisconnected(conn) {
		console.log("Player " + conn.id + " disconnected!");
		//remove the player entity
		if(conn.gameData.playerEntity) {
			entities = entities.filter(function(entity) {
				return entity.id !== conn.gameData.playerEntity.id;
			});
		}
	}

	//helper methods
	function getState() {
		return {
			entities: entities.map(function(entity) { return entity.getState(); }),
			living: entities.map(function(entity) { return entity.id; })
		};
	}

	function sendState(conn) {
		Server.send(conn, {
			messageType: 'game-state',
			time: now(),
			state: getState(),
			playerEntityId: conn.gameData.playerEntity.id
		});
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});