define([
	'shared/Constants',
	'shared/Utils'
], function(
	SharedConstants,
	SharedUtils
) {
	var onConnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var onDisconnectedCallbacks = [];
	var socket = null;
	var delayedByFakeLag = null;

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
	function connect() {
		socket = io();
		//set up socket io
		socket.on('connect', function() {
			for(var i = 0; i < onConnectedCallbacks.length; i++) {
				onConnectedCallbacks[i]();
			}
		});
		socket.on('message', function(msg) {
			if(SharedConstants.FAKE_LAG) {
				if(delayedByFakeLag) {
					delayedByFakeLag.push(msg);
				}
				else {
					delayedByFakeLag = [ msg ];
					setTimeout(function() {
						for(var i = 0; i < delayedByFakeLag.length; i++) {
							for(var j = 0; j < onReceiveCallbacks.length; j++) {
								onReceiveCallbacks[j](delayedByFakeLag[i]);
							}
						}
						delayedByFakeLag = null;
					}, SharedUtils.generateFakeLag());
				}
			}
			else {
				for(var i = 0; i < onReceiveCallbacks.length; i++) {
					onReceiveCallbacks[i](msg);
				}
			}
		});
		socket.on('disconnect', function(){
			for(var i = 0; i < onDisconnectedCallbacks.length; i++) {
				onDisconnectedCallbacks[i]();
			}
		});
	}

	return {
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		send: send,
		connect: connect
	};
});