define([
	'shared/sim/LocatableTaskSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	var gravity = 25;
	function Ball(params, simType) {
		params.width = 44;
		params.height = 44;
		SUPERCLASS.call(this, params, simType);
		this._verticalEnergy = (SharedConstants.BOUNDS.FLOOR - this.bottom) * gravity + this.vel.y * this.vel.y / 2;
		this.timeSinceLastHit = null;
		this.lastHitCharge = null;
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		state.timeSinceLastHit = this.timeSinceLastHit;
		state.lastHitCharge = this.lastHitCharge;
		return state;
	};
	Ball.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
		this.timeSinceLastHit = state.timeSinceLastHit;
		this.lastHitCharge = state.lastHitCharge;
	};
	Ball.prototype.tick = function(t) {
		//gravity
		if(this.freezeTime === 0) {
			this.vel.y += gravity * t;
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
			this.lastHitCharge = Math.random(); //TODO
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
			this.vel.y = -Math.sqrt(2 * this._verticalEnergy);
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