	define([
	'server/net/GameConnectionServer',
	'server/game/processClientEvent',
	'shared/config',
	'server/config',
	'shared/game/Simulation'
], function(
	GameConnectionServer,
	processClientEvent,
	sharedConfig,
	config,
	Simulation
) {
	//set up simulation
	var simulation = new Simulation();
	function applyEventAndSend(evt) {
		simulation.applyEvent(evt);
		GameConnectionServer.forEachSynced(function(conn) {
			conn.bufferSend({ type: 'game-event', evt: evt });
		});
	}

	//entity variables
	var nextEntityId = 0;

	//spawn initial entities
	for(var i = 0; i < 3; i++) {
		applyEventAndSend({
			type: 'spawn-ball',
			id: nextEntityId++,
			x: Math.round(100 + 600 * Math.random()),
			y: Math.round(100 + 300 * Math.random()),
			velX: Math.round(100 * Math.random() - 50),
			velY: Math.round(100 * Math.random() - 50)
		});
	}

	//set up network handlers
	GameConnectionServer.on('connect', function(conn) {
		console.log("[" + conn.connId + "] Connected!");
		conn.data.bufferedEvent = null;
		conn.data.playableEntityId = nextEntityId++;
		applyEventAndSend({
			type: 'spawn-player',
			id: conn.data.playableEntityId,
			x: Math.round(100 + 600 * Math.random())
		});
		conn.on('sync', function() {
			console.log("[" + conn.connId + "] Synced!");
			conn.bufferSend({
				type: 'initial-game-state',
				state: simulation.getState(),
				playableEntityId: conn.data.playableEntityId
			});
		});
		conn.on('receive', function(msg, gameTime) {
			if(msg.type === 'game-event') {
				handleClientEvent(conn, msg.evt, msg.inputId,
					config.TIME_TO_BUFFER_CLIENT_INPUT + 0.5 / sharedConfig.FRAME_RATE);
			}
			else {
				throw new Error("Message received of unknown type '" + msg.type + "'");
			}
		});
		conn.on('desync', function() {
			console.log("[" + conn.connId + "] Desynced!");
		});
		conn.on('disconnect', function() {
			console.log("[" + conn.connId + "] Disconnected!");
			applyEventAndSend({
				type: 'despawn-entity',
				entityId: conn.data.playableEntityId
			});
		});
	});

	function handleClientEvent(conn, evt, inputId, bufferTimeLeft) {
		//unbuffer the last event from the client (might be this event)
		conn.data.bufferedEvent = null;
		//check to see if the event is valid or if the client just made something up
		var processedEvent = processClientEvent(conn, simulation, evt);
		//if it is trash input or we want to buffer it but we've been buffering it for a while...
		if(!processedEvent || (processedEvent === 'buffer-input' && bufferTimeLeft <= 0)) {
			//inform the client that nothing happened in response to their input
			conn.bufferSend({ type: 'game-event', evt: null, inputId: inputId });
		}
		//buffer the input for later
		else if(processedEvent === 'buffer-input') {
			conn.data.bufferedEvent = { evt: evt, inputId: inputId, bufferTimeLeft: bufferTimeLeft };
		}
		else {
			//apply the event
			simulation.applyEvent(processedEvent);
			//we include the inputId when sending the events back to the client
			conn.bufferSend({ type: 'game-event', evt: processedEvent, inputId: inputId });
			//but don't include it when sending it to other clients
			GameConnectionServer.forEachSyncedExcept(conn, function(conn) {
				conn.bufferSend({ type: 'game-event', evt: processedEvent });
			});
		}
	}

	var timeUntilStateUpdate = config.TIME_BETWEEN_STATE_UPDATES +
		0.5 / sharedConfig.FRAME_RATE;
	return {
		tick: function(t) {
			//each connection may have a buffered input and we should see if it's relevant now
			GameConnectionServer.forEachSynced(function(conn) {
				if(conn.data.bufferedEvent) {
					handleClientEvent(conn, conn.data.bufferedEvent.evt,
						conn.data.bufferedEvent.inputId, conn.data.bufferedEvent.bufferTimeLeft - t);
				}
			});

			//update the game state
			simulation.tick(t);

			//send a state update every once in a while
			timeUntilStateUpdate -= t;
			if(timeUntilStateUpdate <= 0) {
				GameConnectionServer.forEachSynced(function(conn) {
					conn.bufferSend({
						type: 'periodic-game-state',
						state: simulation.getState(),
						playableEntityId: conn.data.playableEntityId
					});
				});
				timeUntilStateUpdate = config.TIME_BETWEEN_STATE_UPDATES +
					0.5 / sharedConfig.FRAME_RATE;
			}
		}
	};
});