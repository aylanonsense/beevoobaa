define([
	'client/Constants',
	'client/net/Connection',
	'client/Pinger',
	'client/entity/Player',
	'client/entity/Ball'
], function(
	Constants,
	Connection,
	Pinger,
	Player,
	Ball
) {
	var player = null;
	var entities = [];
	var bufferedMessages = [];

	function reset() {
		player = null;
		entities = [];
		bufferedMessages = [];
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

		//apply updates that have been buffered
		var numMessagesToRemove = 0;
		for(i = 0; i < bufferedMessages.length; i++) {
			var msg = bufferedMessages[i];
			//if the msg is relevant now, apply it
			if(prevTime - 1000 / 60 < msg.time && msg.time <= time) {
				if(msg.messageType === 'game-state') {
					setState(msg.state);

					//the server may have granted us ownership of an entity
					if(typeof msg.playerEntityId === 'number') {
						player = null;
						for(var j = 0; j < entities.length; j++) {
							if(entities[j].id === msg.playerEntityId) {
								player = entities[j];
								break;
							}
						}
					}
				}
				/*else if(msg.messageType == 'object-update') {
					for(var j = 0; j < entities.length; j++) {
						if(entities[j].id === msg.update.id) {
							entities[j].receiveUpdate(msg.update);
						}
					}
				}*/
				else {
					throw new Error("Unsure how to handle message '" + msg.messageType + "'");
				}
				numMessagesToRemove++;
			}
			//if it occurs in the future, the rest must also occur in the future
			else if(msg.time > time) {
				break;
			}
			//otherwise it's dated, so don't apply it and get rid of it
			else {
				numMessagesToRemove++;
			}
		}
		bufferedMessages = bufferedMessages.slice(numMessagesToRemove, bufferedMessages.length);
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
		if(msg.messageType === 'game-state' || msg.messageType === 'object-update') {
			bufferedMessages.push(msg);
			return true;
		}
		return false;
	}

	function onDisconnected() {
		console.log("Disconnected!");
	}

	function onKeyboardEvent(evt, keyboard) {
		if(player) {
			if(evt.gameKey === 'MOVE_LEFT') {
				if(evt.isDown) { player.setMoveDir(-1); }
				else { player.setMoveDir(keyboard.MOVE_RIGHT ? 1 : 0); }
			}
			else if(evt.gameKey === 'MOVE_RIGHT') {
				if(evt.isDown) { player.setMoveDir(1); }
				else { player.setMoveDir(keyboard.MOVE_LEFT ? -1 : 0); }
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