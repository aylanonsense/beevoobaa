define([
	'shared/sim/LocatableTaskSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	function Athlete(params, simType) {
		params.width = 35;
		params.height = 80;
		SUPERCLASS.call(this, params, simType);

		//constants (not synced)
		this.moveSpeed = 75;
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		return state;
	};
	Athlete.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
	};
	Athlete.prototype.startOfFrame = function(t) {
		//stop animations that last a fixed amount of time
		if(this.currentTask === 'land-from-jump') {
			if(this.currentTaskDuration >= 0.50) {
				this._clearTask();
			}
		}

		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Athlete.prototype.tick = function(t) {
		//gravity
		this.vel.y += 200 * t;

		//if the player is following a waypoint (moving or stationary) we need to change velocity
		if(this.currentTask === 'follow-waypoint') {
			this.currentTaskDetails.x += this.moveSpeed * this.currentTaskDetails.dir * t;
			if(this.currentTaskDetails.x > this.x) { this.vel.x = this.moveSpeed; }
			else if(this.currentTaskDetails.x < this.x) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//if the player jumps, that's just a matter of modifying velocity
		if(this.currentTask === 'jump') {
			this.vel.x = 200 * this.currentTaskDetails.dir;
			this.vel.y = -50 - 150 * this.currentTaskDetails.charge;
			this._clearTask();
		}

		//move the character (apply velocity)
		var xBefore = this.x;
		var wasAirborne = this.isAirborne();
		SUPERCLASS.prototype.tick.call(this, t);

		//the player may be landing from a jump
		if(wasAirborne && this.isGrounded()) {
			this._clearTask();
			this._setTask('land-from-jump', {}, 2);
		}

		//we may have reached the waypoint, in which case (if it's stationary) we stop on it
		if(this.currentTask === 'follow-waypoint' && this.currentTaskDetails.dir === 0 &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this.vel.x = 0;
			this._clearTask();
		}
	};
	Athlete.prototype.endOfFrame = function(t) {
		//increment timers (any task I'm ending with counts as being active for the whole frame)
		if(this.currentTask !== null) {
			this.currentTaskDuration += t;
		}

		SUPERCLASS.prototype.endOfFrame.call(this, t);
	};
	Athlete.prototype.performAction = function(action) {
		//moving
		if(action.actionType === 'follow-waypoint' && this.isGrounded()) {
			if(this.currentTask === 'follow-waypoint') {
				this._clearTask();
			}
			return this._setTask('follow-waypoint', {
				x: action.x || 0,
				dir: action.dir || 0
			}, 6);
		}

		//getting reading to jump
		else if(action.actionType === 'charge-jump' && this.isGrounded()) {
			return this._setTask('charge-jump', {}, 5);
		}

		//jumping
		else if(action.actionType === 'jump' && this.isGrounded()) {
			if(this.currentTask === 'charge-jump') {
				this._clearTask();
			}
			return this._setTask('jump', {
				charge: action.charge || 0,
				dir: action.dir || 0
			}, 5);
		}

		return false;
	};
	return Athlete;
});