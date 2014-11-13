if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/Player'
], function(
	Player
) {
	var socketServer = null;
	var onConnectedCallbacks = [];
	var onDisconnectedCallbacks = [];
	var onReceiveCallbacks = [];

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
		player.socket.emit('message', msg);
	}
	function sendToEach(players, msg) {
		for(var i = 0; i < players.length; i++) {
			sendTo(players[i], msg);
		}
	}
	function sendToAll(msg) {
		socketServer.emit('message', msg);
	}
	function sendToAllExcept(player, msg) {
		player.socket.broadcast('message', msg);
	}

	//methods intended to only be used in app.js
	function setSocketServer(server) {
		socketServer = server;
	}
	function handleSocket(socket) {
		var player = new Player(socket);
		socket.on('message', function(msg) {
			for(var i = 0; i < onReceiveCallbacks.length; i++) {
				onReceiveCallbacks[i](player, msg);
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