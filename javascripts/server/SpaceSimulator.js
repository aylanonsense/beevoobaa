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
	var ship = new Ship();
	var spaceStuff = [ ship, new Asteroid({ x: 100, y: 0, radius: 100, mass: 100 }) ];

	function handleSomeCollisions(timeOfLastCollision) {
		timeOfLastCollision = timeOfLastCollision || 0;

		//find collisions
		var collisions = [];
		for(var i = 0; i < spaceStuff.length; i++) {
			for(var j = i + 1; j < spaceStuff.length; j++) {
				var collision = spaceStuff[i].checkForCollision(spaceStuff[j]);
				if(collision) {
					collisions.push(collision);
				}
			}
		}

		//if there is a collision, process collisions until one alters trajectories
		var collisionsRemaining = false;
		if(collisions.length > 0) {
			collisions = collisions.sort(function(a, b) { return a.time - b.time; });
			for(i = 0; i < collisions.length; i++) {
				if(collisions[i].time >= timeOfLastCollision) {
					collisions[i].process();
					if(collisions[i].altersTrajectory) {
						collisionsRemaining = true;
						timeOfLastCollision = collisions[i].time;
						break;
					}
				}
			}
		}

		//if a collisions altered an object's trajectory, well then we have to recursively call this function
		if(collisionsRemaining) {
			handleSomeCollisions(timeOfLastCollision);
		}
	}

	function tick(t) {
		/*for(var i = 0; i < spaceStuff.length; i++) {
			spaceStuff[i].phys.planMovement(t);
		}
		handleSomeCollisions();
		for(i = 0; i < spaceStuff.length; i++) {
			spaceStuff[i].phys.move();
		}*/
		for(i = 0; i < spaceStuff.length; i++) {
			spaceStuff[i].tick(t);
		}
	}

	//bind net events
	Connection.onConnected(function(player) {
		ship.addCrewMember(player);
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