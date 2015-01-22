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
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};
	}
	Player.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			moveDir: this.moveDir,
			vel: { x: this.vel.x, y: this.vel.y }
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
	};
	Player.prototype.tick = function(t) {
		//gravity
		this.vel.y += 50 * t;

		//movement
		if(this.moveDir > 0) { this.vel.x = 50; }
		else if(this.moveDir < 0) { this.vel.x = -50; }
		else { this.vel.x = 0; }

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