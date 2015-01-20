define([
	'shared/Constants'
], function(
	SharedConstants
) {
	function Ball(params) {
		params = params || {};
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.radius = params.radius || 0;
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};
	}
	Ball.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			radius: this.radius,
			vel: { x: this.vel.x, y: this.vel.y }
		};
	};
	Ball.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.radius = state.radius;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;
	};
	Ball.prototype.tick = function(t) {
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;
		if(this.top < SharedConstants.BOUNDS.CEILING) {
			this.top = SharedConstants.BOUNDS.CEILING;
			if(this.vel.y < 0) { this.vel.y *= -1; }
		}
		if(this.bottom > SharedConstants.BOUNDS.FLOOR) {
			this.bottom = SharedConstants.BOUNDS.FLOOR;
			if(this.vel.y > 0) { this.vel.y *= -1; }
		}
		if(this.left < SharedConstants.BOUNDS.LEFT_WALL) {
			this.left = SharedConstants.BOUNDS.LEFT_WALL;
			if(this.vel.x < 0) { this.vel.x *= -1; }
		}
		if(this.right > SharedConstants.BOUNDS.RIGHT_WALL) {
			this.right = SharedConstants.BOUNDS.RIGHT_WALL;
			if(this.vel.x > 0) { this.vel.x *= -1; }
		}
	};

	//define useful properties
	Object.defineProperty(Ball.prototype, 'left', {
		get: function() { return this.x - this.radius; },
		set: function(x) { this.x = x + this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'right', {
		get: function() { return this.x + this.radius; },
		set: function(x) { this.x = x - this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'top', {
		get: function() { return this.y - this.radius; },
		set: function(y) { this.y = y + this.radius; }
	});
	Object.defineProperty(Ball.prototype, 'bottom', {
		get: function() { return this.y + this.radius; },
		set: function(y) { this.y = y - this.radius; }
	});

	return Ball;
});