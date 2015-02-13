define([
	'shared/sim/Sim',
	'shared/Constants'
], function(
	SUPERCLASS,
	SharedConstants
) {
	function LocatableSim(params, simType) {
		SUPERCLASS.call(this, params, simType);

		//private vars (not synced)
		this._prevVel = null;

		//constants (not synced)
		this.width = params.width || 0;
		this.height = params.height || 0;

		//positional vars
		this.velMult = 1.0;
		this.vel = {
			x: params.vel && params.vel.x || 0,
			y: params.vel && params.vel.y || 0
		};
		this.x = params.x || 0;
		this.y = params.y || 0;

		//extra vars
		this.freezeTime = params.freezeTime || 0.0;
	}
	LocatableSim.prototype = Object.create(SUPERCLASS.prototype);
	LocatableSim.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);

		//positional vars
		state.x = this.x;
		state.y = this.y;
		state.vel = { x: this.vel.x, y: this.vel.y };
		state.velMult = this.velMult;

		//extra vars
		state.freezeTime = this.freezeTime;

		return state;
	};
	LocatableSim.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);

		//positional vars
		this.x = state.x;
		this.y = state.y;
		this.vel.x = state.vel.x;
		this.vel.y = state.vel.y;
		this.velMult = state.velMult;

		//extra vars
		this.freezeTime = state.freezeTime;
	};
	LocatableSim.prototype.startOfFrame = function(t) {
		this._prevVel = { x: this.vel.x, y: this.vel.y };
		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	LocatableSim.prototype.tick = function(t) {
		if(this.freezeTime > 0) {
			this.freezeTime = Math.max(this.freezeTime - t, 0);
		}
		else {
			this.x += t * this.velMult * (this._prevVel.x + this.vel.x) / 2;
			this.y += t * this.velMult * (this._prevVel.y + this.vel.y) / 2;
		}
		SUPERCLASS.prototype.tick.call(this, t);
	};
	LocatableSim.prototype.isGrounded = function() {
		return this.vel.y >= 0 && this.bottom === SharedConstants.BOUNDS.FLOOR;
	};
	LocatableSim.prototype.isAirborne = function() {
		return !this.isGrounded();
	};
	LocatableSim.prototype._onHitWall = function(x, y) {
		if(x > 0 && this.vel.x > 0) {
			this.vel.x = 0;
		}
		else if(x < 0 && this.vel.x < 0) {
			this.vel.x = 0;
		}
		if(y > 0 && this.vel.y > 0) {
			this.vel.y = 0;
		}
		else if(y < 0 && this.vel.y < 0) {
			this.vel.y = 0;
		}
	};

	//define useful properties
	Object.defineProperty(LocatableSim.prototype, 'x', {
		get: function() { return this._x; },
		set: function(x) {
			this._x = x;
			if(SharedConstants.BOUNDS.LEFT_WALL !== null &&
				this._x < SharedConstants.BOUNDS.LEFT_WALL) {
				this._x = SharedConstants.BOUNDS.LEFT_WALL;
				this._onHitWall(-1, 0);
			}
			if(SharedConstants.BOUNDS.RIGHT_WALL !== null &&
				this._x > SharedConstants.BOUNDS.RIGHT_WALL - this.width) {
				this._x = SharedConstants.BOUNDS.RIGHT_WALL - this.width;
				this._onHitWall(1, 0);
			}
		}
	});
	Object.defineProperty(LocatableSim.prototype, 'y', {
		get: function() { return this._y; },
		set: function(y) {
			this._y = y;
			if(SharedConstants.BOUNDS.CEILING !== null &&
				this._y < SharedConstants.BOUNDS.CEILING) {
				this._y = SharedConstants.BOUNDS.CEILING;
				this._onHitWall(0, -1);
			}
			if(SharedConstants.BOUNDS.FLOOR !== null &&
				this._y > SharedConstants.BOUNDS.FLOOR - this.height) {
				this._y = SharedConstants.BOUNDS.FLOOR - this.height;
				this._onHitWall(0, 1);
			}
		}
	});
	Object.defineProperty(LocatableSim.prototype, 'left', {
		get: function() { return this.x; },
		set: function(x) { this.x = x; }
	});
	Object.defineProperty(LocatableSim.prototype, 'right', {
		get: function() { return this.x + this.width; },
		set: function(x) { this.x = x - this.width; }
	});
	Object.defineProperty(LocatableSim.prototype, 'top', {
		get: function() { return this.y; },
		set: function(y) { this.y = y; }
	});
	Object.defineProperty(LocatableSim.prototype, 'bottom', {
		get: function() { return this.y + this.height; },
		set: function(y) { this.y = y - this.height; }
	});
	Object.defineProperty(LocatableSim.prototype, 'centerX', {
		get: function() { return this.x + this.width / 2; },
		set: function(x) { this.x = x - this.width / 2; }
	});
	Object.defineProperty(LocatableSim.prototype, 'centerY', {
		get: function() { return this.y + this.height / 2; },
		set: function(y) { this.y = y - this.height / 2; }
	});

	return LocatableSim;
});