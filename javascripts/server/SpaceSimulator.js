if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/net/Connection',
	'server/ship/Ship',
	'server/spacestuff/Asteroid'
], function(
	Connection,
	Ship,
	Asteroid
) {
	var spaceStuff = [ new Asteroid({ x: 100, y: 0, radius: 100, mass: 100 }) ];
	var playerControlledShips = [ new Ship() ];

	function tick(t) {
		//update the simulation
		for(var i = 0; i < spaceStuff.length; i++) {
			spaceStuff[i].tick(t);
		}
		for(i = 0; i < playerControlledShips.length; i++) {
			playerControlledShips[i].tick(t);
		}
	}

	//bind net events
	Connection.onConnected(function(player) {
		playerControlledShips[0].addCrewMember(player);
	});
	Connection.onDisconnected(function(player) {
		player.ship.removeCrewMember(player);
	});
	Connection.onReceive(function(player, msg) {
		if(msg.type === 'console-input') {
			player.ship.processConsoleInput(player, msg);
		}
	});

	return {
		tick: tick
	};
});