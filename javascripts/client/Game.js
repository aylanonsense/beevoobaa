define([
	'client/net/Connection',
	'client/entity/Player',
	'client/entity/Ball'
], function(
	Connection,
	Player,
	Ball
) {
	var myPlayer = null;
	var entities = [];

	function reset() {
		myPlayer = null;
		entities = [];
	}

	function getEntityById(id) {
		for(var i = 0; i < entities.length; i++) {
			if(entities[i].id === id) {
				return entities[i];
			}
		}
		return null;
	}

	function setState(state) {
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
				if(state.entities[i].entityType === 'Ball') {
					entities.push(new Ball(state.entities[i]));
				}
				else if(state.entities[i].entityType === 'Player') {
					entities.push(new Player(state.entities[i]));
				}
				else {
					throw new Error("Unsure how to create '" +
						state.entities[i].entityType + "' entity");
				}
			}
		}
	}

	function tick(t, time, prevTime) {
		for(var i = 0; i < entities.length; i++) {
			entities[i].tick(t, time);
		}
		Connection.flush();
	}

	function render(ctx) {
		for(var i = 0; i < entities.length; i++) {
			entities[i].render(ctx);
		}
	}

	function onConnected() {
		console.log("Connected!");
	}

	function onReceive(msg, time) {
		if(msg.messageType === 'game-state') {
			setState(msg.state);

			//the server may have granted us ownership of an entity
			if(typeof msg.playerEntityId === 'number') {
				myPlayer = null;
				for(var j = 0; j < entities.length; j++) {
					if(entities[j].id === msg.playerEntityId) {
						myPlayer = entities[j];
						break;
					}
				}
			}
			return true;
		}
		else if(msg.messageType === 'entity-update') {
			var entity = getEntityById(msg.state.id);
			if(entity) {
				entity.setState(msg.state);
			}
			return true;
		}
		return false;
	}

	function onDisconnected() {
		console.log("Disconnected!");
	}

	function onKeyboardEvent(evt, keyboard) {
		if(myPlayer) {
			if(evt.gameKey === 'MOVE_LEFT') {
				if(evt.isDown) { myPlayer.setMoveDir(-1); }
				else { myPlayer.setMoveDir(keyboard.MOVE_RIGHT ? 1 : 0); }
			}
			else if(evt.gameKey === 'MOVE_RIGHT') {
				if(evt.isDown) { myPlayer.setMoveDir(1); }
				else { myPlayer.setMoveDir(keyboard.MOVE_LEFT ? -1 : 0); }
			}
		}
	}

	function onMouseEvent(evt) {
		//TODO
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