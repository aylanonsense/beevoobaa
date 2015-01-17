define([
	'server/net/Player',
	'shared/Constants',
	'shared/Utils',
	'performance-now'
], function(
	Player,
	SharedConstants,
	SharedUtils,
	now
) {
	var socketServer = null;
	var onConnectedCallbacks = [];
	var onDisconnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var sendsDelayedByFakeLag = [];
	var receivesDelayedByFakeLag = [];

	//public methods
	function onConnected(callback) { //callback(player)
		onConnectedCallbacks.push(callback);
	}
	function onReceive(callback) { //callback(player, msg);
		onReceiveCallbacks.push(callback);
	}
	function onDisconnected(callback) { //callback(player)
		onDisconnectedCallbacks.push(callback);
	}
	function sendTo(player, msg) {
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({
				func: 'sendTo',
				to: player,
				msg: msg,
				sendTime: now() + SharedUtils.generateFakeLag() / 2
			});
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			player.socket.emit('message', msg);
		}
	}
	function sendToEach(players, msg) {
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({
				func: 'sendToEach',
				to: players,
				msg: msg,
				sendTime: now() + SharedUtils.generateFakeLag() / 2
			});
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			for(var i = 0; i < players.length; i++) {
				sendTo(players[i], msg);
			}
		}
	}
	function sendToAll(msg) {
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({
				func: 'sendToAll',
				to: null,
				msg: msg,
				sendTime: now() + SharedUtils.generateFakeLag() / 2
			});
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			socketServer.emit('message', msg);
		}
	}
	function sendToAllExcept(player, msg) {
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({
				func: 'sendToAllExcept',
				to: player,
				msg: msg,
				sendTime: now() + SharedUtils.generateFakeLag() / 2
			});
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			player.socket.broadcast('message', msg);
		}
	}

	//methods intended to only be used in app.js
	function setSocketServer(server) {
		socketServer = server;
	}
	function handleSocket(socket) {
		var player = new Player(socket);
		socket.on('message', function(msg) {
			if(SharedConstants.FAKE_LAG) {
				receivesDelayedByFakeLag.push({
					msg: msg,
					player: player,
					receiveTime: now() + SharedUtils.generateFakeLag() / 2
				});
				if(receivesDelayedByFakeLag.length === 1) {
					scheduleReceiveTimer();
				}
			}
			else {
				for(var i = 0; i < onReceiveCallbacks.length; i++) {
					if(msg instanceof Array) {
						for(var j = 0; j < msg.length; j++) {
							onReceiveCallbacks[i](player, msg[j]);
						}
					}
					else {
						onReceiveCallbacks[i](player, msg);
					}
				}
			}
		});
		socket.on('disconnect', function() {
			for(var i = 0; i < onDisconnectedCallbacks.length; i++) {
				onDisconnectedCallbacks[i](player);
			}
		});
		for(var i = 0; i < onConnectedCallbacks.length; i++) {
			onConnectedCallbacks[i](player);
		}
	}
	function scheduleSendTimer() {
		setTimeout(function() {
			var func = sendsDelayedByFakeLag[0].func;
			var msg = sendsDelayedByFakeLag[0].msg;
			var to = sendsDelayedByFakeLag[0].to;
			sendsDelayedByFakeLag.shift();
			if(func === 'sendTo') {
				to.socket.emit('message', msg);
			}
			else if(func === 'sendToAll') {
				socketServer.emit('message', msg);
			}
			else if(func === 'sendToAllExcept') {
				to.socket.broadcast('message', msg);
			}
			else if(func === 'sendToEach') {
				for(var i = 0; i < to.length; i++) {
					to[i].socket.emit('message', msg);
				}
			}
			if(sendsDelayedByFakeLag.length > 0) { scheduleSendTimer(); }
		}, Math.max(0, Math.floor(sendsDelayedByFakeLag[0].sendTime - now())));
	}
	function scheduleReceiveTimer() {
		setTimeout(function() {
			var player = receivesDelayedByFakeLag[0].player;
			var msg = receivesDelayedByFakeLag[0].msg;
			receivesDelayedByFakeLag.shift();
			for(var i = 0; i < onReceiveCallbacks.length; i++) {
				if(msg instanceof Array) {
					for(var j = 0; j < msg.length; j++) {
						onReceiveCallbacks[i](player, msg[j]);
					}
				}
				else {
					onReceiveCallbacks[i](player, msg);
				}
			}
			if(receivesDelayedByFakeLag.length > 0) { scheduleReceiveTimer(); }
		}, Math.max(0, Math.floor(receivesDelayedByFakeLag[0].receiveTime - now())));
	}

	return {
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		sendTo: sendTo,
		sendToEach: sendToEach,
		sendToAll: sendToAll,
		sendToAllExcept: sendToAllExcept,
		setSocketServer: setSocketServer,
		handleSocket: handleSocket
	};
});