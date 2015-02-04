define([
	'shared/Constants'
], function(
	SharedConstants
) {
	function Athlete(params) {
		//constants (not synced)
		this.width = 50;
		this.height = 70;
		this.moveSpeed = 50;

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
		this.queuedTask = null;
		this.queuedTaskDetails = null;

		//movement vars
		this.waypointX = null;
		this.waypointMoveDir = null;
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
			queuedTask: this.queuedTask,
			queuedTaskDetails: this.queuedTaskDetails,

			//movement vars
			waypointX: this.waypointX,
			waypointMoveDir: this.waypointMoveDir
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
		this.queuedTask = state.queuedTask;
		this.queuedTaskDetails = state.queuedTaskDetails;

		//movement vars
		this.waypointX = state.waypointX;
		this.waypointMoveDir = state.waypointMoveDir;
	};
	Athlete.prototype.tick = function(t) {
		//possibly move onto the next task
		if(this.currentTask === null && this.queuedTask !== null) {
			this._nextTask();
		}

		//move slower while jumping or preparing to jump
		var moveSpeed = (this.currentTask === 'prepare-to-jump' || this.currentTask === 'jump' ||
			this.bottom < SharedConstants.BOUNDS.FLOOR ? 0.25 : 1.00) * this.moveSpeed;

		//handle task
		if(this.currentTask === 'prepare-to-jump' && this.queuedTask === 'jump') {
			this._nextTask();
		}
		if(this.currentTask === 'jump') {
			if(this.bottom === SharedConstants.BOUNDS.FLOOR && this.vel.y >= 0) {
				this.vel.y = -200;
				this.currentTask = null;
				this.currentTaskDetails = null;
			}
		}

		//gravity
		this.vel.y += 200 * t;

		//move waypoint
		if(this.waypointX !== null) {
			this.waypointX += this.waypointMoveDir * moveSpeed * t;
		}

		//movement
		if(this.waypointX === null) { this.vel.x = 0; }
		else if(this.waypointX > this.x) { this.vel.x = moveSpeed; }
		else if(this.waypointX < this.x) { this.vel.x = -moveSpeed; }
		else { this.vel.x = 0; }

		//apply velocity
		var wasPassed = (this.waypointX !== null && this.x < this.waypointX);
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;
		var isPassed = (this.waypointX !== null && this.x <= this.waypointX);

		//we may have passed the waypoint, meaning we should stop at it
		if(this.waypointX !== null && wasPassed !== isPassed) {
			this.x = this.waypointX;
			if(this.waypointMoveDir === 0) {
				this.waypointX = null;
				this.waypointMoveDir = null;
			}
		}

		//keep player within bounds
		if(this.top < SharedConstants.BOUNDS.CEILING) {
			this.top = SharedConstants.BOUNDS.CEILING;
			if(this.vel.y < 0) { this.vel.y = 0; }
		}
		if(this.bottom > SharedConstants.BOUNDS.FLOOR) {
			this.bottom = SharedConstants.BOUNDS.FLOOR;
			if(this.vel.y > 0) { this.vel.y = 0; }
		}
		if(this.left < SharedConstants.BOUNDS.LEFT_WALL) {
			this.left = SharedConstants.BOUNDS.LEFT_WALL;
			if(this.vel.x < 0) { this.vel.x = 0; }
		}
		if(this.right > SharedConstants.BOUNDS.RIGHT_WALL) {
			this.right = SharedConstants.BOUNDS.RIGHT_WALL;
			if(this.vel.x > 0) { this.vel.x = 0; }
		}
	};
	Athlete.prototype.takeAction = function(action) {
		if(action.actionType === 'follow-waypoint') {
			this.waypointX = action.x;
			this.waypointMoveDir = action.dir;
		}
		else if(action.actionType === 'prepare-to-jump') {
			this._queueTask('prepare-to-jump', {});
		}
		else if(action.actionType === 'jump') {
			this._queueTask('jump', {});
		}
	};
	Athlete.prototype.isReadyForTask = function(task) {
		if(task === 'prepare-to-jump') {
			return this.bottom === SharedConstants.BOUNDS.FLOOR &&
				this.vel.y >= 0 && this.currentTask === null;
		}
		else if(task === 'jump') {
			return this.bottom === SharedConstants.BOUNDS.FLOOR &&
				this.vel.y >= 0 && (this.currentTask === null || this.currentTask === 'prepare-to-jump');
		}
		return false;
	};

	//helper methods
	Athlete.prototype._queueTask = function(task, details) {
		if(this.currentTask === null) {
			this.currentTask = task;
			this.currentTaskDetails = details;
		}
		else {
			this.queuedTask = task;
			this.queuedTaskDetails = details;
		}
	};
	Athlete.prototype._nextTask = function() {
		this.currentTask = this.queuedTask;
		this.currentTaskDetails = this.queuedTaskDetails;
		this.queuedTask = null;
		this.queuedTaskDetails = null;
	};

	//define useful properties
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

	return Athlete;
});