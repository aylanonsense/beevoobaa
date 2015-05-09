define([
	'client/net/GameConnection'
], function(
	GameConnection
) {
	var tLeeway = 2 / 60;

	function processEntityAction(simulation, entity, action) {
		if(entity.entityType === 'Player') {
			return processPlayerAction(simulation, entity, action);
		}
	}

	function processPlayerAction(simulation, player, action) {
		//transform the action, cleaning the client input for the server
		var processedAction;
		if(action.type === 'walk') {
			processedAction = {
				type: 'walk',
				x: Math.max(player.x - player.walkSpeed * tLeeway,
					Math.min(action.x, player.x + player.walkSpeed * tLeeway)),
				walkWaypoint: action.walkWaypoint,
				walkWaypointChange: action.walkWaypointChange
			};
		}
		else if(action.type === 'aim') {
			processedAction = {
				type: 'aim',
				aimWaypoint: action.aimWaypoint,
				aimWaypointChange: action.aimWaypointChange
			};
		}
		else if(action.type === 'charge-jump') {
			processedAction = {
				type: 'charge-jump',
				x: Math.max(player.x - player.walkSpeed * tLeeway,
					Math.min(action.x, player.x + player.walkSpeed * tLeeway)),
			};
		}
		else if(action.type === 'release-jump') {
			processedAction = {
				type: 'release-jump',
				x: Math.max(player.x - player.walkSpeed * tLeeway,
					Math.min(action.x, player.x + player.walkSpeed * tLeeway)),
				charge: Math.max(player.charge - player.chargeRate * tLeeway,
					Math.min(action.charge, player.charge + player.chargeRate * tLeeway)),
				aim: Math.max(player.aim - player.aimSpeed * tLeeway,
					Math.min(action.aim, player.aim + player.aimSpeed * tLeeway)),
			};
		}
		else if(action.type === 'charge-swing') {
			processedAction = {
				type: 'charge-swing',
				swingType: action.swingType
			};
			if(player.isGrounded()) {
				processedAction.x = Math.max(player.x - player.walkSpeed * tLeeway,
					Math.min(action.x, player.x + player.walkSpeed * tLeeway));
			}
		}
		else if(action.type === 'release-swing') {
			processedAction = {
				type: 'release-swing',
				swingType: action.swingType,
				charge: Math.max(player.charge - player.chargeRate * tLeeway,
					Math.min(action.charge, player.charge + player.chargeRate * tLeeway)),
				aim: Math.max(player.aim - player.aimSpeed * tLeeway,
					Math.min(action.aim, player.aim + player.aimSpeed * tLeeway)),
			};
			if(player.isGrounded()) {
				processedAction.x = Math.max(player.x - player.walkSpeed * tLeeway,
					Math.min(action.x, player.x + player.walkSpeed * tLeeway));
			}
		}

		//figure out if the transformed action is even possible
		if(!processedAction) {
			return;
		}
		else if(player.canPerformAction(processedAction)) {
			return processedAction;
		}
		else {
			return 'buffer-input';
		}
	}

	function processPlayerHitBall(simulation, player, ball, evt) {
		//store player and ball state
		var playerState = player.getState();
		var ballState = ball.getState();

		//nudge both entities to account for small differences between client and server
		if(player.isGrounded()) {
			player.x = between(evt.playerX, player.x, player.walkSpeed * tLeeway);
		}
		else {
			player.x = between(evt.playerX, player.x, player.jumpVelX * tLeeway);
			player.y = between(evt.playerY, player.y, player.jumpVelY * tLeeway);
		}
		player.charge = between(evt.playerCharge, player.charge, player.chargeRate * tLeeway);
		player.aim = between(evt.playerAim, player.aim, player.aimSpeed * tLeeway);
		ball.x = between(evt.ballX, ball.x, ball.velX * tLeeway);
		ball.y = between(evt.ballY, ball.y, ball.velY * tLeeway);
		ball.velX = between(evt.ballVelX, ball.velX, 5);
		ball.velY = between(evt.ballVelY, ball.velY, 5);
		ball.spin = between(evt.ballSpin, ball.spin, 2);
		ball.power = between(evt.ballPower, ball.power, 2);

		//check for a hit
		var hit = player.checkForHit(ball);

		//then reset our nudging
		player.setState(playerState);
		ball.setState(ballState);

		//if there was a hit, we process that
		if(hit) {
			return {
				type: 'player-hit-ball',
				playerId: player.entityId,
				playerX: player.x,
				playerY: player.y,
				playerIsGrounded: player.isGrounded(),
				playerSwingType: player.swingType,
				playerCharge: player.charge,
				playerAim: player.aim,
				hit: hit,
				ballId: ball.entityId,
				ballX: ball.x,
				ballY: ball.y,
				ballVelX: ball.velX,
				ballVelY: ball.velY,
			};
		}
		else {
			return 'buffer-input';
		}
	}

	function between(value, idealValue, errorAllowed) {
		if(typeof idealValue !== 'number' || typeof errorAllowed !== 'number') {
			throw new Error("ideal value is not a number");
		}
		else if(typeof value !== 'number') {
			throw new error("value is not a number");
		}
		else {
			errorAllowed = Math.abs(errorAllowed);
			return Math.max(idealValue - errorAllowed, Math.min(value, idealValue + errorAllowed));
		}
	}

	return function(conn, simulation, evt) {
		var playableEntityId = conn.data.playableEntityId;
		if(typeof playableEntityId !== 'number') { return; }
		var entity = simulation.getEntityById(playableEntityId);

		if(evt.type === 'perform-entity-action' && entity && evt.entityId === playableEntityId) {
			var action = processEntityAction(simulation, entity, evt.action);
			if(action === 'buffer-input') {
				return 'buffer-input';
			}
			else if(action) {
				return {
					type: 'perform-entity-action',
					entityId: playableEntityId,
					action: action
				};
			}
		}
		else if(evt.type === 'player-hit-ball' && entity && evt.playerId === playableEntityId) {
			var ball = simulation.getEntityById(evt.ballId);
			if(ball) {
				return processPlayerHitBall(simulation, entity, ball, evt);
			}
		}
	};
});