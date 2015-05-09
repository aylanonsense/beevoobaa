define([
	'client/net/GameConnection'
], function(
	GameConnection
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
		var idealBall = futureBall; //TODO (isPlayerControlled ? futureBall : serverBall);

		//measure distance from ball currently to where it should be ideally
		var distX = idealBall.x - ball.x;
		var distY = idealBall.y - ball.y;
		var squareDist = distX * distX + distY * distY;

		//for big mistakes, we snap to the ideal
		if(squareDist > 20 * 20) {
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