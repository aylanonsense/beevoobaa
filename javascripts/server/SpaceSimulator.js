if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/net/Connection',
	'server/ship/Ship'
], function(
	Connection,
	Ship
) {
	var ship = new Ship();
	var ships = [ ship ];

	function tick(t) {
		//update the simulation
		ship.tick(t);
	}

	//bind net events
	Connection.onConnected(function(player) {
		ship.addCrewMember(player);
	});
	Connection.onDisconnected(function(player) {
		player.ship.removeCrewMember(player);
	});
	Connection.onReceive(function(player, msg) {
		console.log(msg);
	});

	return {
		tick: tick
	};
});