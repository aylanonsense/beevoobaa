define([
	'shared/utils/EventHelper',
	'shared/utils/capValue',
	'shared/Constants'
], function(
	EventHelper,
	capValue,
	SharedConstants
) {
	var MIN_JUMP_SPEED = 100;
	var MAX_JUMP_SPEED = 500;
	var MIN_JUMP_CHARGE_TIME = 5 / 60;
	var MAX_JUMP_CHARGE_TIME = 50 / 60;
	var GRAVITY = 800;
	var GROUND_LEVEL = 400;
	function Player(state) {
		//constants (not stateful)
		this.width = 40;
		this.height = 60;
		this.moveSpeed = 200;

		//stateful vars
		this.x = 0;
		this.y = GROUND_LEVEL - this.height;
		this.waypointX = null;
		this.waypointDir = 0;
		this.currentTask = null;
		this.currentTaskTime = null;
		this.currentTaskTimeRemaining = null;
		this.jumpVelY = null;

		this._events = new EventHelper([ 'perform-action' ]);

		//if a state was given, apply it
		if(state) {
			this.setState(state);
		}
	}
	Player.prototype._setTask = function(task, taskDuration) {
		this.currentTask = task || null;
		this.currentTaskTime = (!this.currentTask ? null : 0.0);
		this.currentTaskTimeRemaining = (!this.currentTask || !taskDuration ?
			null : taskDuration + 0.5 / SharedConstants.FRAME_RATE);
	};
	Player.prototype.canPerformAction = function(action) {
		if(action.actionType === 'follow-waypoint') {
			return !this.isJumping() && this.currentTask === null;
		}
		else if(action.actionType === 'charge-jump') {
			return !this.isJumping() && !this.currentTask;
		}
		else if(action.actionType === 'release-jump') {
			return this.currentTask === 'charging-jump';
		}
		return false;
	};
	Player.prototype.performAction = function(action) {
		if(action.actionType === 'follow-waypoint') {
			if(this.waypointX !== action.x || this.waypointDir !== action.dir) {
				this.waypointX = action.x;
				this.waypointDir = action.dir;
				this._events.trigger('perform-action', action);
			}
		}
		else if(action.actionType === 'charge-jump') {
			this._setTask('charging-jump');
			this.waypointX = null;
			this.waypointDir = 0;
			this.x = action.x;
			this._events.trigger('perform-action', action);
		}
		else if(action.actionType === 'release-jump') {
			this._setTask(null);
			var chargeTime = (action.chargeTime <= MIN_JUMP_CHARGE_TIME +
				0.5 / SharedConstants.FRAME_RATE ? 0.0 : action.chargeTime / MAX_JUMP_CHARGE_TIME);
			chargeTime = capValue(0.0, chargeTime, 1.0);
			this.jumpVelY = -(MIN_JUMP_SPEED + (MAX_JUMP_SPEED - MIN_JUMP_SPEED) * chargeTime);
			this._events.trigger('perform-action', action);
		}
	};
	Player.prototype.canWalk = function() {
		return !this.isJumping();
	};
	Player.prototype.isWalking = function() {
		return this.waypointX !== null;
	};
	Player.prototype.isJumping = function() {
		return this.jumpVelY !== null;
	};
	Player.prototype.getEventualWalkDir = function() {
		return this.waypointDir;
	};
	Player.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			waypointX: this.waypointX,
			waypointDir: this.waypointDir,
			currentTask: this.currentTask,
			currentTaskTime: this.currentTaskTime,
			currentTaskTimeRemaining: this.currentTaskTimeRemaining,
			jumpVelY: this.jumpVelY
		};
	};
	Player.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.waypointX = state.waypointX;
		this.waypointDir = state.waypointDir;
		this.currentTask = state.currentTask;
		this.currentTaskTime = state.currentTaskTime;
		this.currentTaskTimeRemaining = state.currentTaskTimeRemaining;
		this.jumpVelY = state.jumpVelY;
	};
	Player.prototype.startOfFrame = function(t) {
		if(this.currentTask) {
			this.currentTaskTime += t;
			if(this.currentTaskTimeRemaining !== null) {
				this.currentTaskTimeRemaining -= t;
				if(this.currentTaskTimeRemaining <= 0.0) {
					this._setTask(null);
				}
			}
		}
	};
	Player.prototype.tick = function(t) {
		if(this.isJumping()) {
			this.jumpVelY += GRAVITY * t;
			this.y += this.jumpVelY * t;
			if(this.y >= GROUND_LEVEL - this.height && this.jumpVelY > 0) {
				//landed on the ground
				this.y = GROUND_LEVEL - this.height;
				this.jumpVelY = null;
				this._setTask('landing', 25 / 60);
			}
		}
		//player is walking (following a waypoint)
		else if(this.waypointX !== null) {
			//update the waypoint the player is following
			this.waypointX += this.waypointDir * this.moveSpeed * t;
			//move towards the waypoint
			if(this.x < this.waypointX) {
				this.x = Math.min(this.x + this.moveSpeed * t, this.waypointX);
			}
			else if(this.x > this.waypointX) {
				this.x = Math.max(this.x - this.moveSpeed * t, this.waypointX);
			}
		}
	};
	Player.prototype.endOfFrame = function(t) {};
	Player.prototype.on = function(eventName, callback) {
		this._events.on(eventName, callback);
	};
	return Player;
});