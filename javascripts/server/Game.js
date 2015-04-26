define([
	'server/net/GameConnectionServer',
	'server/entity/EntityManager',
	'server/entity/Player',
	'server/entity/Ball',
	'server/Constants'
], function(
	GameConnectionServer,
	EntityManager,
	Player,
	Ball,
	Constants
) {
	//set up entities
	EntityManager.spawnEntity(new Ball(400, 200, 300, 0));

	function getNextTeamColor() {
		var numRedPlayers = 0;
		var numBluePlayers = 0;
		EntityManager.forEach(function(entity) {
			if(entity.entityType === 'Player') {
				if(entity.getTeam() === 'red') { numRedPlayers++; }
				else { numBluePlayers++; }
			}
		});
		if(numRedPlayers > numBluePlayers) { return 'blue'; }
		else if(numRedPlayers < numBluePlayers) { return 'red'; }
		else { return (Math.random() < 0.5 ? 'red' : 'blue'); }
	}

	//set up network handlers
	GameConnectionServer.on('connect', function(conn) {
		console.log("[" + conn.connId + "] Connected!");

		//create a new entity for this client to control
		var player = EntityManager.spawnEntity(new Player(400, getNextTeamColor()));
		GameConnectionServer.forEachSyncedExcept(conn, function(conn) {
			conn.bufferSend({
				messageType: 'spawn-entity',
				type: player.entityType,
				id: player.id,
				state: player.getState()
			});
		});

		//send the full game state when the client is synced and ready for it
		conn.on('sync', function() {
			conn.bufferSend({
				messageType: 'game-state',
				entities: EntityManager.map(function(entity) {
					return {
						type: entity.entityType,
						id: entity.id,
						state: entity.getState()
					};
				}),
				playableEntityId: player.id
			});
		});

		conn.on('receive', function(msg) {
			if(msg.messageType === 'perform-action') {
				player.onInputFromClient(msg.action);
			}
		});
		conn.on('disconnect', function() {
			EntityManager.despawnEntityById(player.id);
			GameConnectionServer.forEachSynced(function(conn) {
				conn.bufferSend({
					messageType: 'despawn-entity',
					id: player.id
				});
			});
		});
	});

	var timeUntilStateUpdate = Constants.TIME_BETWEEN_STATE_UPDATES;
	return {
		tick: function(t) {
			EntityManager.forEach(function(entity) {
				entity.startOfFrame(t);
			});
			EntityManager.forEach(function(entity) {
				entity.tick(t);
			});
			EntityManager.forEach(function(entity) {
				entity.endOfFrame(t);
			});

			//send a state update every so often (keep the clients in sync)
			timeUntilStateUpdate -= t;
			if(timeUntilStateUpdate <= 0) {
				timeUntilStateUpdate = Constants.TIME_BETWEEN_STATE_UPDATES;
				GameConnectionServer.forEachSynced(function(conn) {
					conn.bufferSend({
						messageType: 'game-state-update',
						entities: EntityManager.map(function(entity) {
							return {
								id: entity.id,
								state: entity.getState()
							};
						})
					});
				});
			}
		}
	};
});