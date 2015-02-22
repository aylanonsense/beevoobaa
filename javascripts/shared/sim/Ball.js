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
		this.lastTeamToHit = null;
		this.lastAthleteToHit = null;
		this.numHits = 0;
		this._onHitFloorCallbacks = [];
		this._onDoubleHitCallbacks = [];
		this._onHitLimitCallbacks = [];
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		state.timeSinceLastHit = this.timeSinceLastHit;
		state.lastHitCharge = this.lastHitCharge;
		state.verticalEnergy = this.verticalEnergy;
		state.lastTeamToHit = this.lastTeamToHit;
		state.lastAthleteToHit = this.lastAthleteToHit;
		state.numHits = this.numHits;
		return state;
	};
	Ball.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
		this.timeSinceLastHit = state.timeSinceLastHit;
		this.lastHitCharge = state.lastHitCharge;
		this.verticalEnergy = state.verticalEnergy;
		this.lastTeamToHit = state.lastTeamToHit;
		this.lastAthleteToHit = state.lastAthleteToHit;
		this.numHits = state.numHits;
	};
	Ball.prototype.tick = function(t) {
		//GRAVITY
		if(this.freezeTime === 0) {
			this.vel.y += GRAVITY * t;
		}

		//move the ball (apply velocity)
		SUPERCLASS.prototype.tick.call(this, t);
	};
	Ball.prototype.onHitFloor = function(callback) {
		this._onHitFloorCallbacks.push(callback);
	};
	Ball.prototype.onHitLimitExceeded = function(callback) {
		this._onHitLimitCallbacks.push(callback);
	};
	Ball.prototype.onDoubleHit = function(callback) {
		this._onDoubleHitCallbacks.push(callback);
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
			if(this.lastTeamToHit !== action.team) {
				this.lastTeamToHit = action.team;
				this.numHits = 1;
			}
			else {
				this.numHits++;
			}
			var prevAthlete = this.lastAthleteToHit;
			this.lastAthleteToHit = action.athleteId;
			this.verticalEnergy = Math.min(15000, this.vel.y * this.vel.y / 2 +
				(SharedConstants.BOUNDS.FLOOR - this.bottom) * GRAVITY);
			var i;
			if(this.numHits > 3) {
				for(i = 0; i < this._onHitLimitCallbacks.length; i++) {
					this._onHitLimitCallbacks[i](action.team, action.athleteId);
				}
			}
			else if(this.lastAthleteToHit === prevAthlete) {
				for(i = 0; i < this._onDoubleHitCallbacks.length; i++) {
					this._onDoubleHitCallbacks[i](action.team, action.athleteId);
				}
			}
			return true;
		}
		else if(action.actionType === 'reset') {
			this.x = action.x;
			this.y = action.y;
			this.vel.x = 0;
			this.vel.y = 0;
			this.timeSinceLastHit = null;
			this.lastHitCharge = null;
			this.numHits = 0;
			this.lastTeamToHit = null;
			this.lastAthleteToHit = null;
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
			for(var i = 0; i < this._onHitFloorCallbacks.length; i++) {
				this._onHitFloorCallbacks[i]();
			}
		}
		else if(y < 0 && this.vel.y < 0) {
			this.vel.y *= -1.00;
		}
	};
	Ball.prototype.checkForNet = function(net) {
		if(this.left + 10 < net.right && net.left < this.right - 10 && this.bottom - 10 > net.top) {
			if(this.vel.y > 0 && this.bottom - 20 < net.top) {
				this.bottom = net.top;
				var energy = Math.max(100, this.verticalEnergy -
					(net.top - SharedConstants.BOUNDS.FLOOR) * GRAVITY);
				this.vel.y = -Math.sqrt(2 * energy);
				return true;
			}
			else {
				if(this.centerX < net.centerX) {
					this.right = net.left + 10;
					if(this.vel.x > 0) { this.vel.x *= -1; }
					return true;
				}
				else {
					this.left = net.right - 10;
					if(this.vel.x < 0) { this.vel.x *= -1; }
					return true;
				}
			}
		}
	};
	return Ball;
});