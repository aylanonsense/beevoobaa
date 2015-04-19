define([
	'server/entity/Entity',
	'shared/entity/Ball'
], function(
	SUPERCLASS,
	BallSim
) {
	function Ball(x, y, velX, velY) {
		SUPERCLASS.call(this, 'Ball', BallSim);
		this._sim.setPositionAndVelocity(x, y, velX, velY);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.startOfFrame = function(t) {
		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Ball.prototype._translateClientActionToServerAction = function(action) {
		return null;
	};
	return Ball;
});