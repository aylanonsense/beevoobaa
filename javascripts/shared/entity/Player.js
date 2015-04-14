define([
	'shared/utils/EventHelper',
	'shared/Constants'
], function(
	EventHelper,
	SharedConstants
) {
	var JUMP_SPEED = 100;
	var GRAVITY = 100;
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
		this.currentTaskTimeRemaining = null;
		this.jumpVelY = null;

		this._events = new EventHelper([ 'perform-action' ]);

		//if a state was given, apply it
		if(state) {
			this.setState(state);
		}
	}
	Player.prototype.getCurrentTask = function() {
		return this.currentTask;
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
			this.currentTask = 'charging-jump';
			this.waypointX = null;
			this.waypointDir = 0;
			this.x = action.x;
			this._events.trigger('perform-action', action);
		}
		else if(action.actionType === 'release-jump') {
			this.currentTask = null;
			this.jumpVelY = -JUMP_SPEED;
			this._events.trigger('perform-action', action);
		}
	};
	Player.prototype.getCurrentTask = function() {
		return this.currentTask;
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
		this.currentTaskTimeRemaining = state.currentTaskTimeRemaining;
		this.jumpVelY = state.jumpVelY;
	};
	Player.prototype.startOfFrame = function(t) {
		if(this.currentTaskTimeRemaining !== null) {
			this.currentTaskTimeRemaining -= t;
			if(this.currentTaskTimeRemaining <= 0.0) {
				this.currentTask = null;
				this.currentTaskTimeRemaining = null;
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
				this.currentTask = 'landing';
				this.currentTaskTimeRemaining = 25 / 60 + 0.5 / SharedConstants.FRAME_RATE;
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