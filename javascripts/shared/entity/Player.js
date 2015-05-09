define([
	'shared/entity/Entity',
	'shared/hit/HitBox',
	'shared/entity/playerSwingProperties',
	'shared/config'
], function(
	SUPERCLASS,
	HitBox,
	playerSwingProperties,
	config
) {
	function Player(state) {
		//constants
		this.walkSpeed = 100;
		this.aimSpeed = 1.75;
		this.width = 32;
		this.height = 50;
		this.gravity = 60;
		this.jumpProperties = {
			minSpeed: 50,
			maxSpeed: 170,
			maxHorizontalSpeed: 70,
			timeToMaxCharge: 75 / 60,
			landingTime: 30 / 60
		};

		//stateful vars
		this.x = 0;
		this.y = config.FLOOR_Y - this.height;
		this.walkWaypoint = null;
		this.walkWaypointChange = null;
		this.jumpVelX = null;
		this.jumpVelY = null;
		this.task = null;
		this.taskTimeSpent = null;
		this.taskTimeRemaining = null;
		this.swingType = null;
		this.charge = null;
		this.chargeRate = null;
		this.aim = null;
		this.aimWaypoint = null;
		this.aimWaypointChange = null;

		SUPERCLASS.call(this, 'Player', state, [
			'x', 'y', 'walkWaypoint', 'walkWaypointChange', 'jumpVelX', 'jumpVelY',
			'task', 'taskTimeSpent', 'taskTimeRemaining', 'swingType', 'charge', 'chargeRate',
			'aim', 'aimWaypoint', 'aimWaypointChange' ]);
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.clearTask = function() {
		this.setTask(null);
	};
	Player.prototype.setTask = function(task, duration) {
		this.task = task;
		this.taskTimeSpent = 0.0;
		this.taskTimeRemaining = (task && duration ? duration + 0.5 / config.FRAME_RATE : null);
	};
	Player.prototype.clearWaypoint = function() {
		this.walkWaypoint = null;
		this.walkWaypointChange = null;
	};
	Player.prototype.dropToFloor = function() {
		this.bottom = config.FLOOR_Y;
		this.jumpVelX = null;
		this.jumpVelY = null;
	};
	Player.prototype.isGrounded = function() {
		return this.bottom >= config.FLOOR_Y && this.jumpVelY === null;
	};
	Player.prototype.isAirborne = function() {
		return !this.isGrounded();
	};
	Player.prototype.returnToNeutralGroundedState = function() {
		this.dropToFloor();
		this.clearTask();
		this.clearWaypoint();
		this.stopAiming();
		this.stopSwinging();
		this.stopCharging();
	};
	Player.prototype.returnToNeutralAirborneState = function() {
		this.clearTask();
		this.clearWaypoint();
		this.stopAiming();
		this.stopSwinging();
		this.stopCharging();
	};
	Player.prototype.canPerformAction = function(action) {
		var swing;
		if(action.type === 'walk') {
			return this.isGrounded() && !this.task;
		}
		else if(action.type === 'aim') {
			return this.isAiming();
		}
		else if(action.type === 'charge-jump') {
			return this.isGrounded() && !this.task;
		}
		else if(action.type === 'release-jump') {
			return this.isGrounded() && this.task === 'charging-jump';
		}
		else if(action.type === 'charge-swing') {
			swing = playerSwingProperties[action.swingType];
			return !this.task && (swing.isGrounded ? this.isGrounded() : this.isAirborne());
		}
		else if(action.type === 'release-swing') {
			swing = playerSwingProperties[action.swingType];
			return this.task === 'charging-swing' && this.swingType === action.swingType &&
				(swing.isGrounded ? this.isGrounded() : this.isAirborne());
		}
		return false;
	};
	Player.prototype.performAction = function(action) {
		var swing;
		if(action.type === 'walk') {
			this.returnToNeutralGroundedState();
			this.teleportTo(action.x);
			this.walkWaypoint = action.walkWaypoint;
			this.walkWaypointChange = action.walkWaypointChange;
		}
		else if(action.type === 'aim') {
			if(!this.isAiming()) {
				this.startAiming();
			}
			this.aimWaypoint = action.aimWaypoint;
			this.aimWaypointChange = action.aimWaypointChange;
		}
		else if(action.type === 'charge-jump') {
			this.returnToNeutralGroundedState();
			this.teleportTo(action.x);
			this.startAiming();
			this.setTask('charging-jump');
			this.startCharging(this.jumpProperties.timeToMaxCharge);
		}
		else if(action.type === 'release-jump') {
			this.returnToNeutralGroundedState();
			this.teleportTo(action.x);
			this.jumpVelX = this.jumpProperties.maxHorizontalSpeed * action.aim;
			this.jumpVelY = -this.jumpProperties.minSpeed * (1 - action.charge) -
				this.jumpProperties.maxSpeed * (action.charge);
		}
		else if(action.type === 'charge-swing') {
			swing = playerSwingProperties[action.swingType];
			if(swing.isGrounded) {
				this.returnToNeutralGroundedState();
				this.teleportTo(action.x);
			}
			else {
				this.returnToNeutralAirborneState();
			}
			this.setTask('charging-swing');
			this.swingType = action.swingType;
			this.startAiming();
			this.startCharging(swing.timeToMaxCharge);
		}
		else if(action.type === 'release-swing') {
			swing = playerSwingProperties[action.swingType];
			if(swing.isGrounded) {
				this.returnToNeutralGroundedState();
				this.teleportTo(action.x);
			}
			else {
				this.returnToNeutralAirborneState();
			}
			this.setTask('swinging', swing.swingDuration);
			this.swingType = action.swingType;
			this.charge = action.charge;
			this.aim = action.aim;
		}
	};
	Player.prototype.hitBall = function(params) {
		throw new Error("Not sure how to hit ball, but should be pretty easy based on params");
	};
	Player.prototype.getActiveHitBoxes = function() {
		if(this.task === 'swinging' &&
			this.taskTimeSpent >= playerSwingProperties[this.swingType].activeStartTime &&
			this.taskTimeSpent < playerSwingProperties[this.swingType].activeEndTime) {
			return playerSwingProperties[this.swingType].hitBoxes;
		}
		else {
			return [];
		}
	};
	Player.prototype.checkForHit = function(ball) {
		//the player is swinging and has hitboxes active, but which hitbox is the one hitting the ball?
	var activeHitBoxes = this.getActiveHitBoxes();
		for(var i = 0; i < activeHitBoxes.length; i++) {
			if(activeHitBoxes[i].areHitting(this, ball)) {
				return activeHitBoxes[i].getHitProperties(this, ball);
			}
		}
	};
	Player.prototype.startCharging = function(timeToMaxCharge) {
		this.charge = 0;
		this.chargeRate = 1 / (timeToMaxCharge + 0.5 / config.FRAME_RATE);
	};
	Player.prototype.stopCharging = function() {
		this.charge = null;
		this.chargeRate = null;
	};
	Player.prototype.isCharging = function() {
		return this.chargeRate !== null;
	};
	Player.prototype.stopSwinging = function() {
		this.swingType = null;
		this.charge = null;
	};
	Player.prototype.teleportTo = function(x) {
		this.x = x;
	};
	Player.prototype.startAiming = function() {
		this.aim = 0;
		this.aimWaypoint = 0;
		this.aimWaypointChange = 0;
	};
	Player.prototype.stopAiming = function() {
		this.aim = null;
		this.aimWaypoint = null;
		this.aimWaypointChange = null;
	};
	Player.prototype.isAiming = function() {
		return this.aim !== null && this.aimWaypoint !== null && this.aimWaypointChange !== null;
	};
	Player.prototype.isAimingHorizontally = function() {
		return this.isAiming(); //TODO
	};
	Player.prototype.isAimingVertically = function() {
		return this.isAiming(); //TODO
	};
	Player.prototype.getAimDir = function() {
		return this.aimWaypointChange === null ? 0 : this.aimWaypointChange;
	};
	Player.prototype.canWalk = function() {
		return this.isGrounded() && !this.task;
	};
	Player.prototype.isWalking = function() {
		return this.canWalk() && this.walkWaypoint !== null;
	};
	Player.prototype.getWalkDir = function() {
		return this.walkWaypointChange === null ? 0 : this.walkWaypointChange;
	};
	Player.prototype.startOfFrame = function(t) {
		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Player.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);

		//update task
		if(this.task !== null) {
			this.taskTimeSpent += t;
			if(this.taskTimeRemaining !== null) {
				this.taskTimeRemaining -= t;
				if(this.taskTimeRemaining <= 0.0) {
					this.task = null;
					this.taskTimeSpent = null;
					this.taskTimeRemaining = null;
				}
			}
		}
		//keep charging
		if(this.chargeRate !== null) {
			this.charge = Math.min(this.charge + this.chargeRate * t, 1.0);
		}
		//aim
		if(this.isAiming()) {
			this.aimWaypoint += this.aimWaypointChange * this.aimSpeed * t;
			if(this.aim < this.aimWaypoint) {
				this.aim = Math.min(this.aimWaypoint, this.aim + this.aimSpeed * t);
			}
			else if(this.aim > this.aimWaypoint) {
				this.aim = Math.max(this.aimWaypoint, this.aim - this.aimSpeed * t);
			}
			this.aim = Math.max(-1.0, Math.min(this.aim, 1.0));
		}
		//jump
		if(this.isAirborne()) {
			var oldJumpVelY = this.jumpVelY;
			this.jumpVelY += this.gravity * t;
			this.x += this.jumpVelX * t;
			this.y += (this.jumpVelY + oldJumpVelY) / 2 * t;
			if(this.bottom >= config.FLOOR_Y) {
				this.returnToNeutralGroundedState();
				this.setTask('landing', this.jumpProperties.landingTime);
			}
		}
		//follow waypoint
		else if(this.walkWaypoint !== null) {
			this.walkWaypoint += this.walkWaypointChange * this.walkSpeed * t;
			if(this.x < this.walkWaypoint) {
				this.x = Math.min(this.walkWaypoint, this.x + this.walkSpeed * t);
			}
			else if(this.x > this.walkWaypoint) {
				this.x = Math.max(this.walkWaypoint, this.x - this.walkSpeed * t);
			}
		}
		//keep in bounds
		if(this.left < config.LEFT_WALL_X) {
			this.left = config.LEFT_WALL_X;
		}
		else if(this.right > config.RIGHT_WALL_X) {
			this.right = config.RIGHT_WALL_X;
		}
	};
	Player.prototype.endOfFrame = function(t) {
		SUPERCLASS.prototype.endOfFrame.call(this, t);
	};
	Object.defineProperties(Player.prototype, {
		left: { get: function() { return this.x; },
			set: function(left) { this.x = left; } },
		right: { get: function() { return this.x + this.width; },
			set: function(right) { this.x = right - this.width; } },
		top: { get: function() { return this.y; },
			set: function(top) { this.y = top; } },
		bottom: { get: function() { return this.y + this.height; },
			set: function(bottom) { this.y = bottom - this.height; } },
		centerX: { get: function() { return this.x + this.width / 2; },
			set: function(x) { this.x = x - this.width / 2; } },
		centerY: { get: function() { return this.y + this.height / 2; },
			set: function(y) { this.y = y - this.height / 2; } }
	});
	return Player;
});