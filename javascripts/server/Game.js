define([
	'server/Constants',
	'server/net/Connection',
	'server/Zombie',
	'performance-now'
], function(
	Constants,
	Connection,
	Zombie,
	now
) {
	var frame = 0;
	var objects = [
		new Zombie({ x: 400, y: 300 }),
		new Zombie({ x: 450, y: 300 }),
		new Zombie({ x: 350, y: 300 })
	];

	function getState() {
		var state = { objects: [] };
		for(var i = 0; i < objects.length; i++) {
			state.objects.push(objects[i].getState());
		}
		return state;
	}

	function tick(t) {
		for(var i = 0; i < objects.length; i++) {
			objects[i].tick(t);
		}
		if((frame++) % 30 === 0) {
			Connection.sendToAll({
				messageType: 'game-state',
				time: now(),
				state: getState()
			});
		}
	}

	function onConnected(player) {
		Connection.sendTo(player, {
			messageType: 'game-state',
			time: now(),
			state: getState()
		});
	}

	function onReceive(player, msg) {
		if(msg.messageType === 'ping') {
			Connection.sendTo(player, {
				messageType: 'ping-response',
				pingId: msg.pingId,
				time: now()
			});
		}
	}

	function onDisconnected(player) {
		//TODO
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});