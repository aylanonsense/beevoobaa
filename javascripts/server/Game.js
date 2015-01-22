define([
	'server/Constants',
	'server/net/Connection',
	'server/entity/Player',
	'server/entity/Ball',
	'performance-now'
], function(
	Constants,
	Connection,
	PlayerEntity,
	Ball,
	now
) {
	var frame = 0;
	var humans = {};
	var entities = [
		new Ball({ radius: 50, x: 300, y: 300, vel: { x: 100, y: 100 } })
	];
	var bufferedUpdates = [];

	function getState() {
		var state = { entities: [] };
		for(var i = 0; i < entities.length; i++) {
			state.entities.push(entities[i].getState());
		}
		return state;
	}

	function tick(t) {
		var time = now();
		for(var i = 0; i < entities.length; i++) {
			entities[i].tick(t);
		}

		//send out the full game state every 0.5 seconds
		if((frame++) % 30 === 0) {
			Connection.forEach(function(player) {
				Connection.sendTo(player, {
					messageType: 'game-state',
					time: time,
					state: getState(),
					playerEntityId: player.gameData.entityId
				});
			});
		}

		//send any buffered messages
		if(bufferedUpdates.length > 0) {
			Connection.sendToAll(bufferedUpdates);
			bufferedUpdates = [];
		}
	}

	function onConnected(player) {
		console.log("Player " + player.id + " connected!");
		var entity = new PlayerEntity({ x: 200, y: 200, width: 50, height: 70 });
		entities.push(entity);
		player.gameData.entityId = entity.id;
		Connection.sendTo(player, {
			messageType: 'game-state',
			time: now(),
			state: getState(),
			playerEntityId: player.gameData.entityId
		});
	}

	function onReceive(player, msg) {
		if(msg.messageType === 'ping') {
			Connection.sendTo(player, {
				messageType: 'ping-response',
				pingId: msg.pingId,
				time: now()
			});
		}
	}

	function onDisconnected(player) {
		console.log("Player " + player.id + " disconnected!");
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});