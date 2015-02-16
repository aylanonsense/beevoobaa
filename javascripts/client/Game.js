define([
	'client/entity/Athlete',
	'client/entity/Ball',
	'client/entity/Net',
	'create!client/display/Sprite > Beach',
	'client/Constants',
	'shared/Constants'
], function(
	Athlete,
	Ball,
	Net,
	BEACH_SPRITE,
	Constants,
	SharedConstants
) {
	var MILLISECONDS_LATE_ALLOWED = 65;
	var myAthlete = null;
	var entities = [];

	function reset() {
		myAthlete = null;
		entities = [];
	}

	function tick(t, tServer) {
		var i, j;
		for(i = 0; i < entities.length; i++) {
			entities[i].startOfFrame(t, tServer);
		}
		for(i = 0; i < entities.length; i++) {
			entities[i].tick(t, tServer);
		}

		//the player may hit the ball, bonk! (all other collisions are sent to us from the server)
		if(myAthlete) {
			for(i = 0; i < entities.length; i++) {
				if(entities[i].entityType === 'Ball') {
					myAthlete.checkForBallHit(entities[i]);
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
			entities[i].endOfFrame(t, tServer);
		}
	}

	function render(ctx) {
		//draw background
		for(var x = 0; x < Constants.CANVAS_WIDTH; x += BEACH_SPRITE.width) {
			BEACH_SPRITE.render(ctx, null, x, Constants.CANVAS_HEIGHT - BEACH_SPRITE.height, 0, false);
		}

		//draw entities
		for(var i = 0; i < entities.length; i++) {
			entities[i].render(ctx);
		}
	}

	function onConnected() {
		// console.log("Connected!");
	}

	function onReceive(msg, msLate) {
		var isLate = (msLate > MILLISECONDS_LATE_ALLOWED);
		var entity;
		if(msg.messageType === 'game-state') {
			if(!isLate) {
				setState(msg);

				//the server may have granted us ownership of an entity
				if(typeof msg.athleteId === 'number') {
					if(myAthlete !== null) {
						myAthlete.setPlayerControl(false);
					}
					myAthlete = null;
					for(var j = 0; j < entities.length; j++) {
						if(entities[j].id === msg.athleteId) {
							myAthlete = entities[j];
							myAthlete.setPlayerControl(true);
							break;
						}
					}
				}
			}
			return true;
		}
		else if(msg.messageType === 'entity-state') {
			entity = getEntityById(msg.entityId);
			if(entity) {
				if(isLate) {
					entity.markAsOutOfSync();
				}
				else {
					entity.setState(msg);
				}
			}
			return true;
		}
		else if(msg.messageType === 'entity-action') {
			entity = getEntityById(msg.entityId);
			if(entity) {
				if(isLate) {
					entity.markAsOutOfSync();
				}
				else {
					entity.onReceiveAction(msg.action);
				}
			}
			return true;
		}
		return false;
	}

	function onDisconnected() {
		// console.log("Disconnected!");
	}

	function onKeyboardEvent(evt, keyboard) {
		if(myAthlete) {
			myAthlete.onKeyboardEvent(evt, keyboard);
		}
	}

	function onMouseEvent(evt) {
		//TODO
	}

	//helper methods
	function getEntityById(id) {
		for(var i = 0; i < entities.length; i++) {
			if(entities[i].id === id) {
				return entities[i];
			}
		}
		return null;
	}

	function setState(state) {
		//remove all except the living entities
		entities = entities.filter(function(entity) {
			return state.living.indexOf(entity.id) >= 0;
		});

		//for each entity, either update it or create it
		for(var i = 0; i < state.entities.length; i++) {
			//update existing entity
			var entityAlreadyExists = false;
			for(var j = 0; j < entities.length; j++) {
				if(state.entities[i].id === entities[j].id) {
					entities[j].setState(state.entities[i]);
					entityAlreadyExists = true;
					break;
				}
			}

			//create new entity
			if(!entityAlreadyExists) {
				if(state.entities[i].entityType === 'Athlete') {
					entities.push(new Athlete(state.entities[i]));
				}
				else if(state.entities[i].entityType === 'Ball') {
					entities.push(new Ball(state.entities[i]));
				}
				else if(state.entities[i].entityType === 'Net') {
					entities.push(new Net(state.entities[i]));
				}
				else {
					throw new Error("Unsure how to create '" +
						state.entities[i].entityType + "' entity");
				}
			}
		}
	}

	return {
		reset: reset,
		tick: tick,
		render: render,
		onReceive: onReceive,
		onConnected: onConnected,
		onDisconnected: onDisconnected,
		onKeyboardEvent: onKeyboardEvent,
		onMouseEvent: onMouseEvent
	};
});