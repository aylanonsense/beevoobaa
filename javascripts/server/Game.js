define([
	'shared/Constants',
	'server/net/Server',
	'server/entity/Athlete',
	'server/entity/Ball',
	'server/entity/Net',
	'performance-now'
], function(
	SharedConstants,
	Server,
	Athlete,
	Ball,
	Net,
	now
) {
	var SECONDS_BETWEEN_SEND_STATES = 0.40;
	var SECONDS_BETWEEN_FLUSH_MESSAGES = 2.5 / 60;
	var timeToNextSendState = SECONDS_BETWEEN_SEND_STATES;
	var timeToNextFlushMessages = SECONDS_BETWEEN_FLUSH_MESSAGES;
	var ball = new Ball({ x: SharedConstants.BOUNDS.LEFT_WALL + 150, y: 50, vel: { x: 0, y: 0 } });
	var redScore = 0;
	var blueScore = 0;
	var entities = [ new Net({}), ball ];

	function addBlueScore() {
		blueScore++;
		if(blueScore >= 25 && blueScore > redScore + 1) {
			blueScore = 0;
			redScore = 0;
		}
		ball.resetPosition(SharedConstants.BOUNDS.RIGHT_WALL - 194, 50);
	}

	function addRedScore() {
		redScore++;
		if(redScore >= 25 && redScore > blueScore + 1) {
			redScore = 0;
			blueScore = 0;
		}
		ball.resetPosition(SharedConstants.BOUNDS.LEFT_WALL + 150, 50);
	}

	ball.onHitFloor(function() {
		if(ball._sim.centerX < SharedConstants.BOUNDS.LEFT_WALL +
			(SharedConstants.BOUNDS.RIGHT_WALL - SharedConstants.BOUNDS.LEFT_WALL) / 2) {
			addBlueScore();
		}
		else {
			addRedScore();
		}
	});
	ball.onDoubleHit(function(team, athleteId) {
		var numPlayers = (team === 'red' ? getNumRedPlayers() : getNumBluePlayers());
		if(numPlayers > 1) {
			if(team === 'red') {
				addBlueScore();
			}
			else {
				addRedScore();
			}
			Server.forEach(function(conn) {
				Server.bufferSend(conn, {
					messageType: 'double-hit-foul',
					entityId: athleteId,
					time: now()
				});
			});
		}
	});
	ball.onHitLimitExceeded(function(team, athleteId) {
		if(team === 'red') {
			addBlueScore();
		}
		else {
			addRedScore();
		}
		Server.forEach(function(conn) {
			Server.bufferSend(conn, {
				messageType: 'hit-limit-foul',
				entityId: athleteId,
				time: now()
			});
		});
	});

	function tick(t) {
		var i, j;
		//update each entity
		for(i = 0; i < entities.length; i++) {
			entities[i].startOfFrame(t);
		}
		for(i = 0; i < entities.length; i++) {
			entities[i].tick(t);
		}

		//check for entity interactions
		for(i = 0; i < entities.length; i++) {
			if(entities[i].entityType === 'Athlete') {
				for(j = 0; j < entities.length; j++) {
					if(entities[j].entityType === 'Ball') {
						entities[i].checkForBallHit(entities[j]);
					}
				}
			}
		}

		//any player may run into the net
		for(i = 0; i < entities.length; i++) {
			if(entities[i].entityType === 'Athlete') {
				for(j = 0; j < entities.length; j++) {
					if(entities[j].entityType === 'Net') {
						entities[i].checkForNet(entities[j]);
					}
				}
			}
		}

		//the ball may run into the net
		for(i = 0; i < entities.length; i++) {
			if(entities[i].entityType === 'Ball') {
				for(j = 0; j < entities.length; j++) {
					if(entities[j].entityType === 'Net') {
						entities[i].checkForNet(entities[j]);
					}
				}
			}
		}

		for(i = 0; i < entities.length; i++) {
			entities[i].endOfFrame(t);
		}

		//send out the full game state every so often
		timeToNextSendState -= t;
		if(timeToNextSendState <= 0) {
			Server.forEach(function(conn) { sendStateTo(conn); });
			timeToNextSendState += SECONDS_BETWEEN_SEND_STATES;
		}

		//flush all buffered messages
		timeToNextFlushMessages -= t;
		if(timeToNextFlushMessages <= 0) {
			Server.flush();
			timeToNextFlushMessages = SECONDS_BETWEEN_FLUSH_MESSAGES; //set rather than added, intentional
		}
	}

	function getNumRedPlayers() {
		var numRed = 0;
		Server.forEach(function(conn) {
			if(conn.gameData.athlete && conn.gameData.athlete._sim.team === 'red') {
				numRed++;
			}
		});
		return numRed;
	}

	function getNumBluePlayers() {
		var numBlue = 0;
		Server.forEach(function(conn) {
			if(conn.gameData.athlete && conn.gameData.athlete._sim.team === 'blue') {
				numBlue++;
			}
		});
		return numBlue;
	}

	function onConnected(conn) {
		var team = (getNumRedPlayers() <= getNumBluePlayers() ? 'red' : 'blue');
		console.log("Player " + conn.id + " connected! [" + team + "]");

		//create a new athlete for this player
		var athlete = new Athlete({
			x: (team === 'red' ? SharedConstants.BOUNDS.LEFT_WALL + 100 :
				SharedConstants.BOUNDS.RIGHT_WALL - 128),
			y: SharedConstants.BOUNDS.FLOOR - 70,
			team: team
		});
		entities.push(athlete);
		conn.gameData.athlete = athlete;
		sendStateTo(conn);
	}

	function onReceive(conn, msg) {
		if(msg.messageType === 'entity-command') {
			if(conn.gameData.athlete) {
				if(conn.gameData.athlete.id === msg.entityId) {
					conn.gameData.athlete.onReceiveCommand(msg.command, msg.action);
				}
				else {
					console.log("Player " + conn.id + " sent in a command for entity " + msg.entityId +
						" but only owns entity " + conn.gameData.athlete.id, msg);
				}
			}
			return true;
		}
		return false;
	}

	function onDisconnected(conn) {
		console.log("Player " + conn.id + " disconnected!");

		//remove the player entity
		if(conn.gameData.athlete) {
			entities = entities.filter(function(entity) {
				return entity.id !== conn.gameData.athlete.id;
			});
		}
	}

	//helper methods
	function sendStateTo(conn) {
		Server.bufferSend(conn, {
			messageType: 'game-state',
			entities: entities.map(function(entity) { return entity.getState(); }),
			living: entities.map(function(entity) { return entity.id; }),
			athleteId: conn.gameData.athlete.id,
			redScore: redScore,
			blueScore: blueScore,
			time: now()
		});
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});