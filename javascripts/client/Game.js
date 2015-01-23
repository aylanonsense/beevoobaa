define([
	'client/entity/Player',
	'client/entity/Ball'
], function(
	Player,
	Ball
) {
	var player = null;
	var entities = [];

	function reset() {
		player = null;
		entities = [];
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

			/*//the server may have granted us ownership of an entity
			if(typeof msg.playerEntityId === 'number') {
				player = null;
				for(var j = 0; j < entities.length; j++) {
					if(entities[j].id === msg.playerEntityId) {
						player = entities[j];
						break;
					}
				}
			}*/
			return true;
		}
		return false;
	}

	function onDisconnected() {
		console.log("Disconnected!");
	}

	function onKeyboardEvent(evt, keyboard) {
		/*if(player) {
			if(evt.gameKey === 'MOVE_LEFT') {
				if(evt.isDown) { player.setMoveDir(-1); }
				else { player.setMoveDir(keyboard.MOVE_RIGHT ? 1 : 0); }
			}
			else if(evt.gameKey === 'MOVE_RIGHT') {
				if(evt.isDown) { player.setMoveDir(1); }
				else { player.setMoveDir(keyboard.MOVE_LEFT ? -1 : 0); }
			}
		}*/
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