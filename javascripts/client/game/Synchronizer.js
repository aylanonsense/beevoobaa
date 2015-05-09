define([
	'client/net/GameConnection',
	'shared/entity/Ball',
	'shared/config'
], function(
	GameConnection,
	Ball,
	sharedConfig
) {
	function Synchronizer(simulation, serverSimulation, futureSimulation) {
		this._simulation = simulation;
		this._serverSimulation = serverSimulation;
		this._futureSimulation = futureSimulation;
	}
	Synchronizer.prototype.sync = function(t) {
		for(var i = 0; i < this._simulation.entities.length; i++) {
			var id = this._simulation.entities[i].entityId;
			var isPlayerControlled = (id === GameConnection.data.playableEntityId);
			this._syncEntity(t, this._simulation.getEntityById(id), this._serverSimulation.getEntityById(id),
				this._futureSimulation.getEntityById(id), isPlayerControlled);
		}
	};
	Synchronizer.prototype._syncEntity = function(t, entity, serverEntity, futureEntity, isPlayerControlled) {
		if(entity.entityType === 'Player') {
			this._syncPlayer(t, entity, serverEntity, futureEntity, isPlayerControlled);
		}
		else if(entity.entityType === 'Ball') {
			this._syncBall(t, entity, serverEntity, futureEntity, isPlayerControlled);
		}
	};
	Synchronizer.prototype._syncPlayer = function(t, player, serverPlayer, futurePlayer, isPlayerControlled) {
		var idealPlayer = (isPlayerControlled ? futurePlayer : serverPlayer);

		//TODO
	};
	Synchronizer.prototype._syncBall = function(t, ball, serverBall, futureBall, isPlayerControlled) {
		var distX, distY, squareDist;
		var idealBall = serverBall;

		//find the player character
		var player = this._futureSimulation.getEntityById(GameConnection.data.playableEntityId);
		if(player) {
			//figure out how close the player is to the future place ball
			distX = Math.abs(futureBall.x - player.centerX);
			distY = Math.abs(futureBall.y - player.centerY);
			var dist = Math.sqrt(distX * distX + 0.5 * distY * 0.5 * distY);

			//figure out an ideal ball based on that
			if(dist < 100) {
				idealBall = futureBall;
			}
			else if(dist > 200) {
				idealBall = serverBall;
			}
			else {
				//we need to find a place in-between the server and future states
				var closeness = (200 - dist) / 100;
				idealBall = new Ball(serverBall.getState());
				for(var t2 = closeness * (futureBall.lifeTime - serverBall.lifeTime);
					t2 > 0; t2 -= 1 / sharedConfig.FRAME_RATE) {
					idealBall.tick(Math.min(t2, 1 / sharedConfig.FRAME_RATE));
				}
			}
		}

		//measure distance from ball currently to where it should be ideally
		distX = 3 * idealBall.x - ball.x;
		distY = 3 * idealBall.y - ball.y;
		squareDist = distX * distX + distY * distY;

		//for big mistakes, we snap to the ideal
		if(squareDist > 35 * 35) {
			ball.setState(idealBall.getState());
		}
		//otherwise we nudge the ball towards the ideal to fix small mistakes
		else {
			ball.x += distX * t;
			ball.y += distY * t;
		}
	};
	Synchronizer.prototype.reset = function() {};
	return Synchronizer;
});