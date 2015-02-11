define([
	'shared/sim/LocatableTaskSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	var gravity = 200;
	function Ball(params, simType) {
		params.width = 44;
		params.height = 44;
		SUPERCLASS.call(this, params, simType);
		this._verticalEnergy = (SharedConstants.BOUNDS.FLOOR - this.bottom) * gravity + this.vel.y * this.vel.y / 2;
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		return state;
	};
	Ball.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
	};
	Ball.prototype.tick = function(t) {
		//gravity
		this.vel.y += gravity * t;

		//move the ball (apply velocity)
		SUPERCLASS.prototype.tick.call(this, t);
	};
	Ball.prototype.performAction = function(action) {
		return false;
	};
	Ball.prototype._onHitWall = function(x, y) {
		if(x > 0 && this.vel.x > 0) {
			this.vel.x *= -1.00;
		}
		else if(x < 0 && this.vel.x < 0) {
			this.vel.x *= -1.00;
		}
		if(y > 0 && this.vel.y > 0) {
			this.vel.y = -Math.sqrt(2 * this._verticalEnergy);
		}
		else if(y < 0 && this.vel.y < 0) {
			this.vel.y *= -1.00;
		}
	};
	return Ball;
});