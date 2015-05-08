define([
	'shared/entity/Entity',
	'shared/config'
], function(
	SUPERCLASS,
	config
) {
	function Ball(state) {
		//constants
		this.radius = 25;
		this.gravity = 150;

		//stateful vars
		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.verticalEnergy = 0;
		this._recalculateEnergy();

		SUPERCLASS.call(this, 'Ball', state, [ 'x', 'y', 'velX', 'velY', 'verticalEnergy' ]);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.canPerformAction = function(action) {
		return false;
	};
	Ball.prototype.performAction = function(action) {};
	Ball.prototype.teleportTo = function(x, y) {
		this.x = x;
		this.y = y;
		this._recalculateEnergy();
	};
	Ball.prototype.setVelocity = function(x, y) {
		this.velX = x;
		this.velY = y;
		this._recalculateEnergy();
	};
	Ball.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
	};
	Ball.prototype._recalculateEnergy = function() {
		var height = config.FLOOR_Y - this.bottom;
		this.verticalEnergy = this.velY * this.velY / 2 + height * this.gravity;
	};
	Ball.prototype.startOfFrame = function(t) {
		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Ball.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);

		var oldVelY = this.velY;
		this.velY += this.gravity * t;
		this.x += this.velX * t;
		this.y += (this.velY + oldVelY) / 2 * t;
		//keep in bounds
		if(this.left < config.LEFT_WALL_X) {
			this.left = config.LEFT_WALL_X;
			if(this.velX < 0) {
				this.velX *= -1;
			}
		}
		else if(this.right > config.RIGHT_WALL_X) {
			this.right = config.RIGHT_WALL_X;
			if(this.velX > 0) {
				this.velX *= -1;
			}
		}
		else if(this.bottom > config.FLOOR_Y) {
			this.bottom = config.FLOOR_Y;
			if(this.velY > 0) {
				this.velY = -Math.sqrt(2 * this.verticalEnergy);
			}
		}
	};
	Ball.prototype.endOfFrame = function(t) {
		SUPERCLASS.prototype.endOfFrame.call(this, t);
	};
	Object.defineProperties(Ball.prototype, {
		left: { get: function() { return this.x - this.radius; },
			set: function(left) { this.x = left + this.radius; } },
		right: { get: function() { return this.x + this.radius; },
			set: function(right) { this.x = right - this.radius; } },
		top: { get: function() { return this.y - this.radius; },
			set: function(top) { this.y = top + this.radius; } },
		bottom: { get: function() { return this.y + this.radius; },
			set: function(bottom) { this.y = bottom - this.radius; } },
		centerX: { get: function() { return this.x; },
			set: function(x) { this.x = x; } },
		centerY: { get: function() { return this.y; },
			set: function(y) { this.y = y; } },
		width: { get: function() { return 2 * this.radius; },
			set: function(width) { this.radius = width / 2; } },
		height: { get: function() { return 2 * this.radius; },
			set: function(height) { this.raddius = height / 2; } }
	});
	return Ball;
});