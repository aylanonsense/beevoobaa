define([
	'server/Constants',
	'server/net/Connection'
], function(
	Constants,
	Connection
) {
	function tick(t) {
		//TODO
	}

	function onConnected(player) {
		//TODO
	}

	function onReceive(player, msg) {
		//TODO
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