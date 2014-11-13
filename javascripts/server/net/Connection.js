if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/Player'
], function(
	Player
) {
	var socketServer = null;
	var onConnectedCallbacks = [];

	//public methods
	function onConnected(callback) {
		onConnectedCallbacks.push(callback);
	}
	function sendTo(player, msg) {
		player.socket.emit('message', msg);
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
		for(var i = 0; i < onConnectedCallbacks.length; i++) {
			onConnectedCallbacks[i](player);
		}
	}

	return {
		onConnected: onConnected,
		sendTo: sendTo,
		sendToAll: sendToAll,
		sendToAllExcept: sendToAllExcept,
		setSocketServer: setSocketServer,
		handleSocket: handleSocket
	};
});