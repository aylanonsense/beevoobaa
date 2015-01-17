define([
	'server/Constants',
	'server/net/Connection',
	'server/Human',
	'server/Zombie',
	'performance-now'
], function(
	Constants,
	Connection,
	Human,
	Zombie,
	now
) {
	var frame = 0;
	var humans = {};
	var objects = [
		new Zombie({ x: 400, y: 300 }),
		new Zombie({ x: 450, y: 300 }),
		new Zombie({ x: 350, y: 300 })
	];
	var bufferedUpdates = [];

	function getState() {
		var state = { objects: [] };
		for(var i = 0; i < objects.length; i++) {
			state.objects.push(objects[i].getState());
		}
		return state;
	}

	function tick(t) {
		var time = now();
		for(var i = 0; i < objects.length; i++) {
			var update = objects[i].tick(t);
			if(update) {
				bufferedUpdates.push({
					messageType: 'object-update',
					update: update,
					time: time
				});
			}
		}
		if((frame++) % 30 === 0) {
			Connection.sendToAll({
				messageType: 'game-state',
				time: now(),
				state: getState()
			});
		}
		if(bufferedUpdates.length > 0) {
			Connection.sendToAll(bufferedUpdates);
			bufferedUpdates = [];
		}
	}

	function onConnected(player) {
		Connection.sendTo(player, {
			messageType: 'game-state',
			time: now(),
			state: getState()
		});
		var human = new Human({ x: 400, y: 300 });
		humans[player.id] = human;
		objects.push(human);
	}

	function onReceive(player, msg) {
		if(msg.messageType === 'ping') {
			Connection.sendTo(player, {
				messageType: 'ping-response',
				pingId: msg.pingId,
				time: now()
			});
		}
		else if(msg.messageType === 'change-player-dir') {
			var human = humans[player.id];
			human.changeDir(msg.dir);
			bufferedUpdates.push({
				messageType: 'object-update',
				update: human.getState(),
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