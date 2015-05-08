define([
	'client/net/GameConnection',
	'shared/game/Simulation',
	'client/game/Clock',
	'client/game/EventGenerator',
	'client/game/Synchronizer',
	'client/game/renderGame',
	'client/config',
	'shared/config'
], function(
	GameConnection,
	Simulation,
	Clock,
	EventGenerator,
	Synchronizer,
	renderGame,
	config,
	sharedConfig
) {
	//set up simulation
	var simulation = new Simulation();
	var serverSimulation;
	var futureSimulation;
	var synchronizer;
	if(!config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
		serverSimulation = new Simulation();
		futureSimulation = new Simulation();
		synchronizer = new Synchronizer(simulation, serverSimulation, futureSimulation);
	}
	var recentClientEvents = [];

	//set up input handlers
	var nextInputId = 0;
	var eventGenerator = new EventGenerator(simulation);
	eventGenerator.on('event', function(evt) {
		//it did! apply those events and send them
		var inputId = nextInputId++;
		simulation.applyEvent(evt);
		GameConnection.bufferSend({ type: 'game-event', evt: evt, inputId: inputId });
		recentClientEvents.push({ gameTime: Clock.getClientGameTime(), evt: evt, inputId: inputId });
	});

	//set up network handlers
	GameConnection.on('connect', function() {
		console.log("Connected!");
	});
	GameConnection.on('sync', function() {
		console.log("Synced!");
	});
	GameConnection.on('receive', function(msg, gameTime) {
		if(msg.type === 'initial-game-state') {
			GameConnection.data.playableEntityId = msg.playableEntityId;
			simulation.setState(msg.state);
			if(typeof GameConnection.data.playableEntityId === 'number' &&
				!config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
				serverSimulation.setState(msg.state);
			}
		}
		else if(msg.type === 'periodic-game-state') {
			if(!config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
				serverSimulation.setState(msg.state);
			}
		}
		else if(msg.type === 'game-event') {
			if(msg.evt && !config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
				serverSimulation.applyEvent(msg.evt);
			}
			//if the event has an inputId, it originated from this client
			if(typeof msg.inputId === 'number') {
				recentClientEvents = recentClientEvents.filter(function(evt) {
					return evt.inputId !== msg.inputId;
				});
			}
			//if the event does not have an inputId, it means it came from another client
			// or from the server itself
			else {
				simulation.applyEvent(msg.evt);
			}
		}
		else {
			throw new Error("Message received of unknown type '" + msg.type + "'");
		}
	});
	GameConnection.on('desync', function() {
		console.log("Desynced!");
	});
	GameConnection.on('disconnect', function() {
		console.log("Disconnected!");
	});

	function predictFutureState() {
		futureSimulation.setState(serverSimulation.getState());
		var roundTripTime = Clock.getRoundTripTime();
		var currentGameTime = Clock.getClientGameTime();
		var futureGameTime = currentGameTime + roundTripTime;
		var gameTime = currentGameTime;
		while(gameTime < futureGameTime) {
			var t = Math.min(1 / sharedConfig.FRAME_RATE, futureGameTime - gameTime);
			for(var i = 0; i < recentClientEvents.length; i++) {
				var eventGameTime = recentClientEvents[i].gameTime + roundTripTime;
				if(gameTime <= eventGameTime && eventGameTime < gameTime + t) {
					futureSimulation.applyEvent(recentClientEvents[i].evt);
				}
			}
			futureSimulation.tick(t);
			gameTime += t;
		}

		//cull old events
		recentClientEvents = recentClientEvents.filter(function(evt) {
			return evt.gameTime > currentGameTime - 2 * roundTripTime;
		});
	}

	return {
		reset: function() {
			GameConnection.data = {};
			recentClientEvents = [];
			simulation.reset();
			if(!config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
				serverSimulation.reset();
				futureSimulation.reset();
				synchronizer.reset();
			}
			eventGenerator.reset();
		},
		tick: function(t) {
			eventGenerator.tick(t);
			simulation.tick(t);
			if(!config.DEBUG_DISABLE_SERVER_SIMULATIONS) {
				serverSimulation.tick(t);
				predictFutureState();
				synchronizer.sync(t);
			}
		},
		render: function(ctx) {
			renderGame(simulation, ctx, 'background');
			if(!config.DEBUG_DISABLE_SERVER_SIMULATIONS && config.DEBUG_DRAW_SERVER_GHOSTS) {
				renderGame(serverSimulation, ctx, 'silhouettes');
				renderGame(futureSimulation, ctx, 'outlines');
			}
			renderGame(simulation, ctx);
		}
	};
});