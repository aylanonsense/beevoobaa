define([
	'server/net/Connection',
	'shared/Constants',
	'shared/Utils',
	'performance-now'
], function(
	Connection,
	SharedConstants,
	SharedUtils,
	now
) {
	var connections = [];
	var onConnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var onDisconnectedCallbacks = [];
	var sendsDelayedByFakeLag = [];
	var receivesDelayedByFakeLag = [];
	var bufferedMessages = [];

	//public methods
	function onConnected(callback) { //callback(conn)
		onConnectedCallbacks.push(callback);
	}

	function onReceive(callback) { //callback(conn, msg);
		onReceiveCallbacks.push(callback);
	}

	function onDisconnected(callback) { //callback(conn)
		onDisconnectedCallbacks.push(callback);
	}

	function forEach(callback) { //callback(conn)
		for(var i = 0; i < connections.length; i++) {
			callback(connections[i]);
		}
	}

	function send(conn, msg) {
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({ conn: conn, msg: msg, sendTime: now() +
				SharedUtils.generateFakeLag(SharedConstants.FAKE_LAG / 2) });
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			actuallySend(conn, msg);
		}
	}

	function sendToAll(msg) {
		forEach(function(conn) { send(conn, msg); });
	}

	function bufferSend(conn, msg) {
		bufferedMessages.push({ conn: conn, msg: msg });
	}

	function bufferSendToAll(msg) {
		forEach(function(conn) {
			bufferedMessages.push({ conn: conn, msg: msg });
		});
	}

	function flush() {
		if(bufferedMessages.length > 0) {
			for(var i = 0; i < connections.length; i++) {
				var messages = bufferedMessages.filter(function(obj) {
					return obj.conn.id === connections[i].id;
				});
				if(messages.length > 0) {
					send(connections[i], messages.map(function(obj) {
						return obj.msg;
					}));
				}
			}
			bufferedMessages = [];
		}
	}

	//methods intended to only be used in app.js
	function handleSocket(socket) {
		var conn = new Connection(socket);

		//bind onReceive handler
		socket.on('message', function(msg) {
			if(SharedConstants.FAKE_LAG) {
				receivesDelayedByFakeLag.push({ conn: conn, msg: msg, receiveTime: now() +
						SharedUtils.generateFakeLag(SharedConstants.FAKE_LAG / 2) });
				if(receivesDelayedByFakeLag.length === 1) {
					scheduleReceiveTimer();
				}
			}
			else {
				triggerReceive(conn, msg);
			}
		});

		//bind onDisconnected handler
		socket.on('disconnect', function() {
			for(var i = 0; i < onDisconnectedCallbacks.length; i++) {
				onDisconnectedCallbacks[i](conn);
			}
			connections = connections.filter(function(otherConn) {
				return otherConn.id !== conn.id;
			});
		});

		//trigger onConnected handler
		connections.push(conn);
		for(var i = 0; i < onConnectedCallbacks.length; i++) {
			onConnectedCallbacks[i](conn);
		}
	}

	//private methods
	function actuallySend(conn, msg) {
		conn.socket.emit('message', msg);
	}

	function triggerReceive(conn, msg) {
		var i, j;
		if(msg instanceof Array) {
			for(i = 0; i < onReceiveCallbacks.length; i++) {
				for(j = 0; j < msg.length; j++) {
					onReceiveCallbacks[i](conn, msg[j]);
				}
			}
		}
		else {
			for(i = 0; i < onReceiveCallbacks.length; i++) {
				onReceiveCallbacks[i](conn, msg);
			}
		}
	}

	function scheduleSendTimer() {
		setTimeout(function() {
			actuallySend(sendsDelayedByFakeLag[0].conn, sendsDelayedByFakeLag[0].msg);
			sendsDelayedByFakeLag.shift();
			if(sendsDelayedByFakeLag.length > 0) {
				scheduleSendTimer();
			}
		}, Math.max(0, Math.floor(sendsDelayedByFakeLag[0].sendTime - now())));
	}

	function scheduleReceiveTimer() {
		setTimeout(function() {
			triggerReceive(receivesDelayedByFakeLag[0].conn, receivesDelayedByFakeLag[0].msg);
			receivesDelayedByFakeLag.shift();
			if(receivesDelayedByFakeLag.length > 0) {
				scheduleReceiveTimer();
			}
		}, Math.max(0, Math.floor(receivesDelayedByFakeLag[0].receiveTime - now())));
	}

	return {
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		forEach: forEach,
		send: send,
		sendToAll: sendToAll,
		bufferSend: bufferSend,
		bufferSendToAll: bufferSendToAll,
		flush: flush,
		handleSocket: handleSocket
	};
});