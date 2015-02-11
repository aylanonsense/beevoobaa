define([
	'shared/sim/LocatableTaskSim'
], function(
	SUPERCLASS
) {
	function Athlete(params, simType) {
		params.width = 35;
		params.height = 80;
		SUPERCLASS.call(this, params, simType);

		//constants (not synced)
		this.moveSpeed = 75;
		this.gravity = 95;
		this.minJumpSpeed = 50;
		this.maxJumpSpeed = 240;
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
		if(this.currentTask === 'land-from-jump' && this.currentTaskDuration >= 0.50) {
			this._clearTask();
		}
		if(this.currentTask === 'spike' && this.currentTaskDuration > 1.00) {
			this._clearTask();
		}

		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Athlete.prototype.tick = function(t) {
		if(this.currentTask === 'charge-spike') {
			this.velMult = Math.max(1.0 - 2 * this.currentTaskDuration, 0.15);
		}
		else if(this.currentTask === 'spike') {
			if(this.currentTaskDuration < 0.40) {
				this.velMult = 0.15;
			}
			else {
				this.velMult = Math.min(0.15 + 3 * (this.currentTaskDuration - 0.40), 1.0);
			}
		}
		else {
			this.velMult = 1.0;
		}

		//gravity
		this.vel.y += this.velMult * this.gravity * t;

		//if the player is following a waypoint (moving or stationary) we need to change velocity
		if(this.currentTask === 'follow-waypoint') {
			this.currentTaskDetails.x += this.moveSpeed * this.currentTaskDetails.dir * t;
			if(this.currentTaskDetails.x > this.x) { this.vel.x = this.moveSpeed; }
			else if(this.currentTaskDetails.x < this.x) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//if the player is repositioning, it's sort of like following a waypoint
		if(this.currentTask === 'reposition') {
			if(this.currentTaskDetails.x > this.x) { this.vel.x = this.moveSpeed; }
			else if(this.currentTaskDetails.x < this.x) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//if the player jumps, that's just a matter of modifying velocity
		if(this.currentTask === 'jump') {
			this.vel.x = 100 * this.currentTaskDetails.dir;
			this.vel.y = -this.minJumpSpeed - (this.maxJumpSpeed - this.minJumpSpeed) *
				this.currentTaskDetails.charge;
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
			this.vel.x = 0;
		}

		//we may have reached the waypoint, in which case (if it's stationary) we stop on it
		if(this.currentTask === 'follow-waypoint' && this.currentTaskDetails.dir === 0 &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this.vel.x = 0;
			this._clearTask();
		}

		if(this.currentTask === 'reposition') {
		}
		//we do the same check but for repositioning
		if(this.currentTask === 'reposition' &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this.vel.x = 0;
			var nextTask = this.currentTaskDetails.nextTask;
			this._clearTask();
			this._setTask(nextTask.task, nextTask.details, nextTask.priority);
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
			if(this.currentTask === 'follow-waypoint') { this._clearTask(); }
			return this._setTask('follow-waypoint', {
				x: action.x || 0,
				dir: action.dir || 0
			}, 6);
		}

		//getting ready to jump
		else if(action.actionType === 'charge-jump' && this.isGrounded()) {
			this.vel.x = 0;
			return this._repositionAndSetTask(action.x, 'charge-jump', {}, 5);
		}

		//jumping
		else if(action.actionType === 'jump' && this.isGrounded()) {
			if(this.currentTask === 'charge-jump') { this._clearTask(); }
			return this._repositionAndSetTask(action.x, 'jump', {
				charge: action.charge || 0,
				dir: action.dir || 0
			}, 5);
		}

		//hit the ball
		else if(action.actionType === 'charge-strong-hit') {
			if(this.isAirborne()) {
				return this._setTask('charge-spike', {}, 5);
			}
			else {
				//TODO
			}
		}
		else if(action.actionType === 'strong-hit') {
			if(this.isAirborne()) {
				if(this.currentTask === 'charge-spike') { this._clearTask(); }
				return this._setTask('spike', {
					charge: action.charge || 0,
					dir: action.dir || 0
				}, 5);
			}
			else {
				//TODO
			}
		}

		return false;
	};
	Athlete.prototype._repositionAndSetTask = function(x, task, details, priority) {
		if(this.x !== x) {
			return this._setTask('reposition', {
				x: x,
				nextTask: { task: task, details: details, priority: priority }
			}, priority);
		}
		else {
			return this._setTask(task, details, priority);
		}
	};
	return Athlete;
});