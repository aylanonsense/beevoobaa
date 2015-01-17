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
	var storedMessages = [];
	var objects = [];
	var updatesToApply = [];

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
		var updatesToCheckOff = 0;
		for(i = 0; i < updatesToApply.length; i++) {
			var update = updatesToApply[i];
			//if the update is relevant now, apply it
			if(prevTime - 1000 / 60 < update.time && update.time <= time) {
				setState(update.state);
				updatesToCheckOff++;
			}
			//if it occurs in the future, the rest must also occur in the future
			else if(update.time > time) {
				break;
			}
			//otherwise it's dated, so don't apply it and get rid of it
			else {
				updatesToCheckOff++;
			}
		}
		updatesToApply = updatesToApply.slice(updatesToCheckOff, updatesToApply.length);
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
		if(msg.messageType === 'game-state') {
			updatesToApply.push(msg);
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