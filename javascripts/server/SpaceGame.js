if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/Constants',
	'server/net/Connection',
	'server/space/ship/Ship'
], function(
	Constants,
	Connection,
	Ship
) {
	var playerShip = new Ship();
	var objects = [ playerShip ];

	function tick(t) {
		//start of frame
		for(var i = 0; i < objects.length; i++) {
			if(objects[i].physics) {
				objects[i].startOfFrame(t);
			}
		}

		//move each space object
		for(i = 0; i < objects.length; i++) {
			if(objects[i].physics) {
				objects[i].physics.planMovement(t);
			}
		}
		for(var step = 0; step < Constants.PHYSICS_STEPS_PER_FRAME; step++) {
			//move everything a little bit of the way
			for(i = 0; i < objects.length; i++) {
				if(objects[i].physics) {
					objects[i].physics.move(t / Constants.PHYSICS_STEPS_PER_FRAME);
				}
			}
			//check for collisions
			for(i = 0; i < objects.length; i++) {
				if(objects[i].physics) {
					for(j = i + 1; j < objects.length; j++) {
						if(objects[j].physics) {
							objects[i].physics.handleCollision(objects[j].physics);
						}
					}
				}
			}
		}

		//tick
		for(i = 0; i < objects.length; i++) {
			objects[i].tick(t);
		}

		//end of frame
		for(i = 0; i < objects.length; i++) {
			objects[i].endOfFrame(t);
		}
	}

	function onConnected(player) {
		playerShip.addCrewMember(player);
	}

	function onReceive(player, msg) {
		if(msg.type === 'console-input') {
			player.ship.processConsoleInput(player, msg);
		}
	}

	function onDisconnected(player) {
		player.ship.removeCrewMember(player);
	}

	return {
		tick: tick,
		onConnected: onConnected,
		onReceive: onReceive,
		onDisconnected: onDisconnected
	};
});