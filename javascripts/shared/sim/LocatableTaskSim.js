define([
	'shared/sim/TaskSim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	function LocatableTaskSim(params, simType) {
		SUPERCLASS.call(this, params, simType);

		//constants (not synced)
		this.width = params.width || 0;
		this.height = params.height || 0;

		//positional vars
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};
		this.x = params.x || 0;
		this.y = params.y || 0;
	}
	LocatableTaskSim.prototype = Object.create(SUPERCLASS.prototype);
	LocatableTaskSim.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);

		//positional vars
		state.x = this.x;
		state.y = this.y;
		state.vel = { x: this.vel.x, y: this.vel.y };

		return state;
	};
	LocatableTaskSim.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);

		//positional vars
		this.x = state.x;
		this.y = state.y;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;
	};
	LocatableTaskSim.prototype.tick = function(t) {
		this.x += this.vel.x * t;
		this.y += this.vel.y * t;
		SUPERCLASS.prototype.tick.call(this, t);
	};
	LocatableTaskSim.prototype.isGrounded = function() {
		return this.vel.y >= 0 && this.bottom === SharedConstants.BOUNDS.FLOOR;
	};
	LocatableTaskSim.prototype.isAirborne = function() {
		return !this.isGrounded();
	};

	//define useful properties
	Object.defineProperty(LocatableTaskSim.prototype, 'x', {
		get: function() { return this._x; },
		set: function(x) {
			this._x = x;
			if(this._x < SharedConstants.BOUNDS.LEFT_WALL) {
				this._x = SharedConstants.BOUNDS.LEFT_WALL;
				if(this.vel.x < 0) {
					this.vel.x = 0;
				}
			}
			if(this._x > SharedConstants.BOUNDS.RIGHT_WALL - this.width) {
				this._x = SharedConstants.BOUNDS.RIGHT_WALL - this.width;
				if(this.vel.x > 0) {
					this.vel.x = 0;
				}
			}
		}
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'y', {
		get: function() { return this._y; },
		set: function(y) {
			this._y = y;
			if(this._y < SharedConstants.BOUNDS.CEILING) {
				this._y = SharedConstants.BOUNDS.CEILING;
				if(this.vel.y < 0) {
					this.vel.y = 0;
				}
			}
			if(this._y > SharedConstants.BOUNDS.FLOOR - this.height) {
				this._y = SharedConstants.BOUNDS.FLOOR - this.height;
				if(this.vel.y > 0) {
					this.vel.y = 0;
				}
			}
		}
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});
	Object.defineProperty(LocatableTaskSim.prototype, 'center', {
		get: function() { return { x: this.x + this.width / 2, y: this.y + this.height / 2 }; },
		set: function(center) {
			this.x = center.x - this.width / 2;
			this.y = center.y - this.height / 2;
		}
	});

	return LocatableTaskSim;
});