define([
	'shared/Constants',
	'shared/Utils'
], function(
	SharedConstants,
	SharedUtils
) {
	var socket = null;
	var onConnectedCallbacks = [];
	var onReceiveCallbacks = [];
	var onDisconnectedCallbacks = [];
	var sendsDelayedByFakeLag = [];
	var receivesDelayedByFakeLag = [];
	var bufferedMessages = [];

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
		if(SharedConstants.FAKE_LAG) {
			sendsDelayedByFakeLag.push({ msg: msg, sendTime: performance.now() +
				SharedUtils.generateFakeLag(SharedConstants.FAKE_LAG / 2) });
			if(sendsDelayedByFakeLag.length === 1) {
				scheduleSendTimer();
			}
		}
		else {
			socket.emit('message', msg);
		}
	}

	function bufferSend(msg) {
		bufferedMessages.push(msg);
	}

	function flush() {
		if(bufferedMessages.length > 0) {
			send(bufferedMessages);
			bufferedMessages = [];
		}
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
				receivesDelayedByFakeLag.push({ msg: msg, receiveTime: performance.now() +
					SharedUtils.generateFakeLag(SharedConstants.FAKE_LAG / 2) });
				if(receivesDelayedByFakeLag.length === 1) {
					scheduleReceiveTimer();
				}
			}
			else {
				for(var i = 0; i < onReceiveCallbacks.length; i++) {
					if(msg instanceof Array) {
						for(var j = 0; j < msg.length; j++) {
							onReceiveCallbacks[i](msg[j]);
						}
					}
					else {
						onReceiveCallbacks[i](msg);
					}
				}
			}
		});
		socket.on('disconnect', function(){
			for(var i = 0; i < onDisconnectedCallbacks.length; i++) {
				onDisconnectedCallbacks[i]();
			}
		});
	}

	//private methods
	function scheduleSendTimer() {
		setTimeout(function() {
			socket.emit('message', sendsDelayedByFakeLag.shift().msg);
			if(sendsDelayedByFakeLag.length > 0) { scheduleSendTimer(); }
		}, Math.max(0, Math.floor(sendsDelayedByFakeLag[0].sendTime - performance.now())));
	}

	function scheduleReceiveTimer() {
		setTimeout(function() {
			var msg = receivesDelayedByFakeLag.shift().msg;
			for(var i = 0; i < onReceiveCallbacks.length; i++) {
				if(msg instanceof Array) {
					for(var j = 0; j < msg.length; j++) {
						onReceiveCallbacks[i](msg[j]);
					}
				}
				else {
					onReceiveCallbacks[i](msg);
				}
			}
			if(receivesDelayedByFakeLag.length > 0) { scheduleReceiveTimer(); }
		}, Math.max(0, Math.floor(receivesDelayedByFakeLag[0].receiveTime - performance.now())));
	}

	return {
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected,
		send: send,
		bufferSend: bufferSend,
		flush: flush,
		connect: connect
	};
});