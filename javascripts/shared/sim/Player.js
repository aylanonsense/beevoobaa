define([
	'shared/Constants'
], function(
	SharedConstants
) {
	function Player(params) {
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.width = params.width || 0;
		this.height = params.height || 0;
		this.moveDir = params.moveDir || 0;
		this.moveSpeed = 50;
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};

		//jump vars
		this.chargeJumpWhenAble = false;
		this.isChargingJump = false;
		this.timeSpentChargingJump = 0;
		this.releaseJumpWhenAble = false;
		this.jumpX = 0.0;
		this.jumpY = 0.0;
	}
	Player.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			moveDir: this.moveDir,
			vel: { x: this.vel.x, y: this.vel.y },

			//jump vars
			chargeJumpWhenAble: this.chargeJumpWhenAble,
			isChargingJump: this.isChargingJump,
			releaseJumpWhenAble: this.releaseJumpWhenAble,
			jumpX: this.jumpX,
			jumpY: this.jumpY
		};
	};
	Player.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.width = state.width;
		this.height = state.height;
		this.moveDir = state.moveDir;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;

		//jump vars
		this.chargeJumpWhenAble = state.chargeJumpWhenAble;
		this.isChargingJump = state.isChargingJump;
		this.timeSpentChargingJump = state.timeSpentChargingJump;
		this.releaseJumpWhenAble = state.releaseJumpWhenAble;
		this.jumpX = state.jumpX;
		this.jumpY = state.jumpY;
	};
	Player.prototype.dontChargeJump = function() {
		if(this.chargeJumpWhenAble) {
			this.chargeJumpWhenAble = false;
			this.releaseJumpWhenAble = false;
			this.jumpX = 0.0;
			this.jumpY = 0.0;
		}
	};
	Player.prototype.chargeJump = function() {
		if(!this.isChargingJump) {
			this.chargeJumpWhenAble = true;
		}
	};
	Player.prototype.releaseJump = function(xAmt, yAmt) {
		if(this.isChargingJump || this.chargeJumpWhenAble) {
			this.releaseJumpWhenAble = true;
			this.jumpX = xAmt;
			this.jumpY = yAmt;
		}
	};
	Player.prototype.isAirborne = function() {
		return this.bottom < SharedConstants.BOUNDS.FLOOR;
	};
	Player.prototype.isGrounded = function() {
		return !this.isAirborne();
	};
	Player.prototype.isJumping = function() {
		return this.isAirborne();
	};
	Player.prototype.tick = function(t) {
		//release jump
		if(this.isChargingJump) {
			this.timeSpentChargingJump += t;
			if(this.releaseJumpWhenAble) {
				this.isChargingJump = false;
				this.releaseJumpWhenAble = false;
				this.vel.x = 0;//75 * this.jumpX;
				this.vel.y = -50 + -250 * this.jumpY;
			}
		}

		//gravity
		this.vel.y += 200 * t;

		//movement
		if(this.isGrounded() && this.vel.y >= 0 && !this.isChargingJump) {
			if(this.moveDir > 0) { this.vel.x = this.moveSpeed; }
			else if(this.moveDir < 0) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//apply velocity
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;

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

		//start charging jump
		if(this.chargeJumpWhenAble && this.isGrounded() && !this.isChargingJump) {
			this.isChargingJump = true;
			this.chargeJumpWhenAble = false;
			this.timeSpentChargingJump = 0;
			this.vel.x = 0;
		}
	};

	//define useful properties
	Object.defineProperty(Player.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(Player.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(Player.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(Player.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});

	return Player;
});