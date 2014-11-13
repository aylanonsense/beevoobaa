if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	var onDisconnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var socket = io();

	//public methods
	function onReceive(callback) { //callback(msg);
		onReceiveCallbacks.push(callback);
	}
	function onDisconnected(callback) { //callback()
		onDisconnectedCallbacks.push(callback);
	}
	function send(msg) {
		socket.emit('message', msg);
	}

	//set up socket io
	socket.on('message', function(msg){
		for(var i = 0; i < onReceiveCallbacks.length; i++) {
			onReceiveCallbacks[i](msg);
		}
	});
	socket.on('disconnect', function(){
		for(var i = 0; i < onDisconnectedCallbacks.length; i++) {
			onDisconnectedCallbacks[i]();
		}
	});

	return {
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		send: send
	};
});