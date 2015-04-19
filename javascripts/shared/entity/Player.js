define([
	'shared/utils/EventHelper',
	'shared/utils/capValue',
	'shared/collision/getActivePlayerHitBoxes',
	'shared/Constants'
], function(
	EventHelper,
	capValue,
	getActivePlayerHitBoxes,
	SharedConstants
) {
	var MIN_JUMP_SPEED = 100;
	var MAX_JUMP_SPEED = 200;
	var MAX_HORIZONTAL_JUMP_SPEED = 200;
	var GRAVITY = 100;
	function Player(state) {
		//constants (not stateful)
		this.width = 40;
		this.height = 60;
		this.moveSpeed = 200;
		this.aimSpeed = 2.0;
		this.minJumpChargeTime = 5 / 60;
		this.maxJumpChargeTime = 50 / 60;
		this.absoluteMaxJumpChargeTime = 70 / 60;
		this.swingTime = {
			spike: 60 / 60,
			bump: 100 / 60,
			set: 20 / 60,
			block: 20 / 60
		};
		this.swingChargeTime = {
			spike: 50 / 60,
			bump: 50 / 60,
			set: 50 / 60,
			block: 50 / 60
		};
		this.wallBouncePercent = 0.30;

		//non-stateful non-constants
		this.activeHitBoxes = null;

		//stateful vars
		this.x = 0;
		this.y = SharedConstants.BOTTOM_BOUND - this.height;
		this.waypointX = null;
		this.waypointDir = 0;
		this.aimPos = null;
		this.aimDir = 0;
		this.currentTask = null;
		this.currentTaskTime = null;
		this.currentTaskTimeRemaining = null;
		this.currentHit = null;
		this.jumpVelX = null;
		this.jumpVelY = null;
		this.team = 'red';

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
			//TODO allow auto-release if not charging
			return this.currentTask === 'charging-jump';
		}
		else if(action.actionType === 'aim') {
			return this.isAiming();
		}
		else if(action.actionType === 'charge-hit') {
			if(action.hit === 'spike' || action.hit === 'block') {
				return this.isJumping() && !this.currentTask;
			}
			else {
				return !this.isJumping() && !this.currentTask;
			}
		}
		else if(action.actionType === 'release-hit') {
			//TODO allow auto-release if not charging
			return this.currentTask === 'charging-hit' && this.currentHit === action.hit;
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
			this.aimPos = 0;
			this.aimDir = action.dir;
			this.x = action.x;
			this._events.trigger('perform-action', action);
		}
		else if(action.actionType === 'release-jump') {
			this._setTask(null);
			this.aimPos = null;
			this.aimDir = 0;
			var chargeTime = (action.chargeTime <= this.minJumpChargeTime +
				0.5 / SharedConstants.FRAME_RATE ? 0.0 : action.chargeTime / this.maxJumpChargeTime);
			chargeTime = capValue(0.0, chargeTime, 1.0);
			this.jumpVelY = -(MIN_JUMP_SPEED + (MAX_JUMP_SPEED - MIN_JUMP_SPEED) * chargeTime);
			this.jumpVelX = MAX_HORIZONTAL_JUMP_SPEED * action.dir;
			this._events.trigger('perform-action', action);
		}
		else if(action.actionType === 'aim') {
			if(this.aimPos !== action.pos || this.aimDir !== action.dir) {
				this.aimPos = action.pos;
				this.aimDir = action.dir;
				this._events.trigger('perform-action', action);
			}
		}
		else if(action.actionType === 'charge-hit') {
			this._setTask('charging-hit');
			this.waypointX = null;
			this.waypointDir = 0;
			this.aimPos = 0;
			this.aimDir = action.dir;
			if(!this.isJumping() && action.x !== null) {
				this.x = action.x;
			}
			this.currentHit = action.hit;
			this._events.trigger('perform-action', action);
		}
		else if(action.actionType === 'release-hit') {
			this._setTask('swinging', this.swingTime[action.hit]);
			this.currentHit = action.hit;
			this.waypointX = null;
			this.waypointDir = 0;
			this.aimPos = null;
			this.aimDir = action.dir;
			this._events.trigger('perform-action', action);
		}
	};
	Player.prototype.isAiming = function() {
		return this.aimPos !== null;
	};
	Player.prototype.getEventualAimDir = function() {
		return this.aimDir;
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
			aimPos: this.aimPos,
			aimDir: this.aimDir,
			currentTask: this.currentTask,
			currentTaskTime: this.currentTaskTime,
			currentTaskTimeRemaining: this.currentTaskTimeRemaining,
			currentHit: this.currentHit,
			team: this.team,
			jumpVelX: this.jumpVelX,
			jumpVelY: this.jumpVelY
		};
	};
	Player.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.waypointX = state.waypointX;
		this.waypointDir = state.waypointDir;
		this.aimPos = state.aimPos;
		this.aimDir = state.aimDir;
		this.currentTask = state.currentTask;
		this.currentTaskTime = state.currentTaskTime;
		this.currentTaskTimeRemaining = state.currentTaskTimeRemaining;
		this.currentHit = state.currentHit;
		this.team = state.team;
		this.jumpVelX = state.jumpVelX;
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
		this.activeHitBoxes = getActivePlayerHitBoxes(this);
	};
	Player.prototype.tick = function(t) {
		//player is in the air, jumping
		if(this.isJumping()) {
			this.jumpVelY += GRAVITY * t;
			this.y += this.jumpVelY * t;
			this.x += this.jumpVelX * t;
			if(this.y >= SharedConstants.BOTTOM_BOUND - this.height && this.jumpVelY > 0) {
				//landed on the ground
				this.y = SharedConstants.BOTTOM_BOUND - this.height;
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
		//player is aiming
		if(this.aimPos !== null) {
			this.aimPos = capValue(-1.0, this.aimPos + this.aimDir * this.aimSpeed * t, 1.0);
		}

		//keep player in bounds
		if(this.x < SharedConstants.LEFT_BOUND) {
			this.x = SharedConstants.LEFT_BOUND;
			if(this.jumpVelX !== null) {
				this.jumpVelX *= (this.jumpVelX < 0 ? -1 : 1) * this.wallBouncePercent;
			}
		}
		if(this.x > SharedConstants.RIGHT_BOUND - this.width) {
			this.x = SharedConstants.RIGHT_BOUND - this.width;
			if(this.jumpVelX !== null) {
				this.jumpVelX *= (this.jumpVelX > 0 ? -1 : 1) * this.wallBouncePercent;
			}
		}
	};
	Player.prototype.endOfFrame = function(t) {};
	Player.prototype.on = function(eventName, callback) {
		this._events.on(eventName, callback);
	};
	return Player;
});