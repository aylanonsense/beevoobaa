define([
	'client/Constants',
	'client/net/Connection',
	'client/Zombie'
], function(
	Constants,
	Connection,
	Zombie
) {
	var timeToNextPing = 1.00; 
	var pings = [];
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

	function tick(t) {
		timeToNextPing -= t;
		if(timeToNextPing <= 0) {
			pings.push({ sent: performance.now(), received: null });
			Connection.send({ messageType: 'ping', pingId: pings.length - 1 });
			timeToNextPing += 1.00;
		}
		for(var i = 0; i < objects.length; i++) {
			objects[i].tick(t);
		}
	}

	function render(ctx) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].render(ctx);
		}
		ctx.fillStyle = '#ff0';
		ctx.font = "10px Lucida Console";
		var x = Constants.CANVAS_WIDTH - 10;
		for(i = pings.length - 1; i >= 0 && x > 10; i--) {
			if(pings[i].received !== null) {
				var t = pings[i].received - pings[i].sent;
				x -= 20;
				ctx.fillRect(x, Constants.CANVAS_HEIGHT - 20 - t, 16, t);
				ctx.fillText(Math.floor(t), x, Constants.CANVAS_HEIGHT - 10);
			}
		}
	}

	function onConnected() {
		console.log("Connected!");
	}

	function onReceive(msg) {
		if(msg.messageType === 'game-state') {
			setState(msg.state);
		}
		else if(msg.messageType === 'ping-response') {
			pings[msg.pingId].received= performance.now();
		}
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