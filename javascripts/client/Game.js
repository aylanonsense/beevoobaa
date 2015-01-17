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

	function tick(t, time) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].tick(t);
		}
	}

	function render(ctx) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].render(ctx);
		}
	}

	function onConnected() {
		console.log("Connected!");
	}

	function onReceive(msg) {
		var time = Pinger.getClientTime();
		if(msg.messageType === 'game-state') {
			setState(msg.state);
			Pinger.logThing(msg);
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