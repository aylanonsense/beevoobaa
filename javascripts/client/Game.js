define([
	'client/Constants',
	'client/net/Connection',
	'client/Pinger',
	'client/Zombie'
], function(
	Constants,
	Connection,
	Pinger,
	Zombie
) {
	var objects = [];
	var bufferedMessages = [];

	function setState(state) {
		for(var i = 0; i < state.objects.length; i++) {
			var objectAlreadyExists = false;
			for(var j = 0; j < objects.length; j++) {
				if(state.objects[i].id === objects[j].id) {
					objects[j].receiveUpdate(state.objects[i]);
					objectAlreadyExists = true;
					break;
				}
			}
			if(!objectAlreadyExists) {
				if(state.objects[i].objectType === 'Zombie') {
					objects.push(new Zombie(state.objects[i]));
				}
				else {
					throw new Error("Unsure how to create '" +
						state.objects[i].objectType + "' object");
				}
			}
		}
	}

	function tick(t, time, prevTime) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].tick(t, time);
		}

		//apply updates that have been buffered
		var numMessagesToRemove = 0;
		for(i = 0; i < bufferedMessages.length; i++) {
			var msg = bufferedMessages[i];
			//if the msg is relevant now, apply it
			if(prevTime - 1000 / 60 < msg.time && msg.time <= time) {
				if(msg.messageType === 'game-state') {
					setState(msg.state);
				}
				else if(msg.messageType == 'object-update') {
					for(var j = 0; j < objects.length; j++) {
						if(objects[j].id === msg.update.id) {
							objects[j].receiveUpdate(msg.update);
						}
					}
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
		for(var i = 0; i < objects.length; i++) {
			objects[i].render(ctx);
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
		objects = [];
	}

	function onKeyboardEvent(evt, keyboard) {
		//TODO
	}

	function onMouseEvent(evt) {
		//TODO
	}

	return {
		tick: tick,
		render: render,
		onReceive: onReceive,
		onConnected: onConnected,
		onDisconnected: onDisconnected,
		onKeyboardEvent: onKeyboardEvent,
		onMouseEvent: onMouseEvent
	};
});