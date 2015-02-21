define([
	'shared/sim/LocatableTaskSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	var GRAVITY = 30;
	function Ball(params, simType) {
		params.width = 44;
		params.height = 44;
		SUPERCLASS.call(this, params, simType);
		this.verticalEnergy = Math.min(15000, this.vel.y * this.vel.y / 2 +
			(SharedConstants.BOUNDS.FLOOR - this.bottom) * GRAVITY);
		this.timeSinceLastHit = null;
		this.lastHitCharge = null;
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		state.timeSinceLastHit = this.timeSinceLastHit;
		state.lastHitCharge = this.lastHitCharge;
		state.verticalEnergy = this.verticalEnergy;
		return state;
	};
	Ball.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
		this.timeSinceLastHit = state.timeSinceLastHit;
		this.lastHitCharge = state.lastHitCharge;
		this.verticalEnergy = state.verticalEnergy;
	};
	Ball.prototype.tick = function(t) {
		//GRAVITY
		if(this.freezeTime === 0) {
			this.vel.y += GRAVITY * t;
		}

		//move the ball (apply velocity)
		SUPERCLASS.prototype.tick.call(this, t);
	};
	Ball.prototype.endOfFrame = function(t) {
		SUPERCLASS.prototype.endOfFrame.call(this, t);
		if(this.timeSinceLastHit !== null) {
			this.timeSinceLastHit += t;
		}
	};
	Ball.prototype.performAction = function(action) {
		if(action.actionType === 'get-hit') {
			this.vel.x = action.vel.x;
			this.vel.y = action.vel.y;
			this.freezeTime = action.freezeTime;
			this.timeSinceLastHit = 0;
			this.lastHitCharge = action.charge;
			this.verticalEnergy = Math.min(15000, this.vel.y * this.vel.y / 2 +
				(SharedConstants.BOUNDS.FLOOR - this.bottom) * GRAVITY);
			return true;
		}
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
			this.vel.y = -Math.sqrt(2 * this.verticalEnergy);
		}
		else if(y < 0 && this.vel.y < 0) {
			this.vel.y *= -1.00;
		}
	};
	Ball.prototype.checkForNet = function(net) {
		//TODO
	};
	return Ball;
});