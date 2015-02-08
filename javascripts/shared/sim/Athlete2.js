define([
	'shared/Constants'
], function(
	SharedConstants
) {
	function Athlete(params) {
		//constants (not synced)
		this.width = 35;
		this.height = 80;
		this.moveSpeed = 75;

		//positional vars
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};

		//task vars
		this.currentTask = null;
		this.currentTaskDetails = null;
		this.currentTaskPriority = null;
		this.currentTaskDuration = 0.0;
	}
	Athlete.prototype.getState = function() {
		return {
			//positional vars
			x: this.x,
			y: this.y,
			vel: { x: this.vel.x, y: this.vel.y },

			//task vars
			currentTask: this.currentTask,
			currentTaskDetails: this.currentTaskDetails,
			currentTaskPriority: this.currentTaskPriority,
			currentTaskDuration: this.currentTaskDuration
		};
	};
	Athlete.prototype.setState = function(state) {
		//positional vars
		this.x = state.x;
		this.y = state.y;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;

		//task vars
		this.currentTask = state.currentTask;
		this.currentTaskDetails = state.currentTaskDetails;
		this.currentTaskPriority = state.currentTaskPriority;
		this.currentTaskDuration = state.currentTaskDuration;
	};
	Athlete.prototype.startOfFrame = function(t) {
		//stop animations that last a fixed amount of time
		if(this.currentTask === 'call-hit') {
			if(this.currentTaskDuration >= 0.50) {
				this._clearTask();
			}
		}
		else if(this.currentTask === 'flex') {
			if(this.currentTaskDuration >= 1.00) {
				this._clearTask();
			}
		}
		else if(this.currentTask === 'land-from-jump') {
			if(this.currentTaskDuration >= 0.50) {
				this._clearTask();
			}
		}
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
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;

		//the player may be landing from a jump
		if(wasAirborne && this.isGrounded()) {
			this._clearTask();
			this._setTask('land-from-jump', {}, 2);
		}

		//if the player is charging a move, we don't have much to do with it right now
		if(this.currentTask === 'bump' || this.currentTask === 'set' ||
			this.currentTask === 'spike' || this.currentTask === 'block' ||
			this.currentTask === 'dig') {
			console.log("You " + this.currentTask + "'d the ball! (" +
				this.currentTaskDetails.charge + ", " + this.currentTaskDetails.dir + ")");
			this._clearTask();
		}

		//we may have reached the waypoint, in which case (if it's stationary) we stop on it
		if(this.currentTask === 'follow-waypoint' && this.currentTaskDetails.dir === 0 &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this._clearTask();
		}
	};
	Athlete.prototype.endOfFrame = function(t) {
		//increment timers (any task I'm ending with counts as being active for the whole frame)
		if(this.currentTask !== null) {
			this.currentTaskDuration += t;
		}
	};
	Athlete.prototype.isGrounded = function() {
		return this.vel.y >= 0 && this.y === SharedConstants.BOUNDS.FLOOR;
	};
	Athlete.prototype.isAirborne = function() {
		return !this.isGrounded();
	};

	//actions the player can take
	Athlete.prototype.callHit = function(me) {
		if(this.isGrounded()) {
			return this._setTask('call-hit', { me: me }, 4);
		}
		return false;
	};
	Athlete.prototype.chargeJump = function() {
		if(this.isGrounded()) {
			return this._setTask('charge-jump', {}, 5);
		}
		return false;
	};
	Athlete.prototype.releaseJump = function(charge, dir) {
		if(this.isGrounded()) {
			if(this.currentTask === 'charge-jump') { this._clearTask(); }
			return this._setTask('jump', { charge: charge, dir: dir }, 5);
		}
		return false;
	};
	Athlete.prototype.chargeBump = function() {
		if(this.isGrounded()) {
			return this._setTask('charge-bump', {}, 5);
		}
		return false;
	};
	Athlete.prototype.releaseBump = function(charge, dir) {
		if(this.isGrounded()) {
			if(this.currentTask === 'charge-bump') { this._clearTask(); }
			return this._setTask('bump', { charge: charge, dir: dir }, 5);
		}
		return false;
	};
	Athlete.prototype.chargeSet = function() {
		return this._setTask('charge-set', {}, 5);
	};
	Athlete.prototype.releaseSet = function(charge, dir) {
		if(this.currentTask === 'charge-set') { this._clearTask(); }
		return this._setTask('set', { charge: charge, dir: dir }, 5);
	};
	Athlete.prototype.chargeSpike = function() {
		if(this.isAirborne()) {
			return this._setTask('charge-spike', {}, 5);
		}
		return false;
	};
	Athlete.prototype.releaseSpike = function(charge, dir) {
		if(this.isAirborne()) {
			if(this.currentTask === 'charge-spike') { this._clearTask(); }
			return this._setTask('spike', { charge: charge, dir: dir }, 5);
		}
		return false;
	};
	Athlete.prototype.block = function() {
		if(this.isAirborne()) {
			return this._setTask('block', {}, 5);
		}
		return false;
	};
	Athlete.prototype.dig = function() {
		if(this.isGrounded()) {
			return this._setTask('dig', {}, 5);
		}
		return false;
	};
	Athlete.prototype.followWaypoint = function(x, dir) {
		if(this.isGrounded()) {
			if(this.currentTask === 'follow-waypoint') { this._clearTask(); }
			return this._setTask('follow-waypoint', { x: x, dir: dir }, 6);
		}
		return false;
	};
	Athlete.prototype.flex = function(type) {
		if(this.isGrounded()) {
			return this._setTask('flex', { type: type }, 7);
		}
		return false;
	};

	//helper methods
	Athlete.prototype._setTask = function(task, details, priority) {
		if(this.currentTask === null || this.currentTaskPriority === null ||
			(priority !== null && priority < this.currentTaskPriority)) {
			this.currentTask = task;
			this.currentTaskDetails = details;
			this.currentTaskPriority = priority || null;
			this.currentTaskDuration = 0.0;
			return true;
		}
		return false;
	};
	Athlete.prototype._clearTask = function() {
		this.currentTask = null;
		this.currentTaskDetails = null;
		this.currentTaskPriority = null;
		this.currentTaskDuration = 0.0;
	};

	//define useful properties
	Object.defineProperty(Athlete.prototype, 'x', {
		get: function() { return this._x; },
		set: function(x) {
			this._x = x;
			if(this._x < SharedConstants.BOUNDS.LEFT_WALL) {
				this._x = SharedConstants.BOUNDS.LEFT_WALL;
				if(this.vel.x < 0) {
					this.vel.x = 0;
				}
			}
			if(this._x > SharedConstants.BOUNDS.RIGHT_WALL - this.width) {
				this._x = SharedConstants.BOUNDS.RIGHT_WALL - this.width;
				if(this.vel.x > 0) {
					this.vel.x = 0;
				}
			}
		}
	});
	Object.defineProperty(Athlete.prototype, 'y', {
		get: function() { return this._y; },
		set: function(y) {
			this._y = y;
			if(this._y < SharedConstants.BOUNDS.CEILING) {
				this._y = SharedConstants.BOUNDS.CEILING;
				if(this.vel.y < 0) {
					this.vel.y = 0;
				}
			}
			if(this._y > SharedConstants.BOUNDS.FLOOR - this.height) {
				this._y = SharedConstants.BOUNDS.FLOOR - this.height;
				if(this.vel.y > 0) {
					this.vel.y = 0;
				}
			}
		}
	});
	Object.defineProperty(Athlete.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(Athlete.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(Athlete.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(Athlete.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});
	Object.defineProperty(Athlete.prototype, 'center', {
		get: function() { return { x: this.x + this.width / 2, y: this.y + this.height / 2 }; },
		set: function(center) {
			this.x = center.x - this.width / 2;
			this.y = center.y - this.height / 2;
		}
	});

	return Athlete;
});