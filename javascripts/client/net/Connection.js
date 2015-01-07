define(function() {
	var onConnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var onDisconnectedCallbacks = [];
	var socket = io();

	//public methods
	function onConnected(callback) { //callback()
		onConnectedCallbacks.push(callback);
	}
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
	socket.on('connect', function() {
		for(var i = 0; i < onConnectedCallbacks.length; i++) {
			onConnectedCallbacks[i]();
		}
	});
	socket.on('message', function(msg) {
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
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		send: send
	};
});