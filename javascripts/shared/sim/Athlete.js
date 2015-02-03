define([
	'shared/Constants'
], function(
	SharedConstants
) {
	function Athlete(params) {
		this.x = params.x || 0;
		this.y = params.y || 0;
		this.moveDir = params.moveDir || 0;
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};

		//not stateful
		this.width = 50;
		this.height = 70;
		this.moveSpeed = 50;
	}
	Athlete.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			moveDir: this.moveDir,
			vel: { x: this.vel.x, y: this.vel.y },
		};
	};
	Athlete.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.moveDir = state.moveDir;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;
	};
	Athlete.prototype.tick = function(t) {
		//gravity
		this.vel.y += 200 * t;

		//movement
		if(this.moveDir > 0) { this.vel.x = this.moveSpeed; }
		else if(this.moveDir < 0) { this.vel.x = -this.moveSpeed; }
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
	Athlete.prototype.applyAction = function(action) {
		if(action.actionType === 'change-dir') {
			var dir = this.moveDir;
			if(action.dir > 0) { dir = 1; }
			else if(action.dir < 0) { dir = -1; }
			else { dir = 0; }

			//only if change-dir actually results in changing directions does it matter
			if(dir !== this.moveDir) {
				this.moveDir = dir;
				return { actionType: 'change-dir', dir: this.moveDir };
			}
		}
		return null;
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