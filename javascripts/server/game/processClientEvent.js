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
			}
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
			}
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

	return function(conn, simulation, evt) {
		var playableEntityId = conn.data.playableEntityId;
		if(typeof playableEntityId !== 'number') { return; }
		var entity = simulation.getEntityById(playableEntityId);

		if(evt.type === 'perform-entity-action' && evt.entityId === playableEntityId) {
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
			else {
				return undefined;
			}
		}
	};
});