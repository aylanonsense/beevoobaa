define([
	'shared/utils/EventHelper',
	'shared/Constants'
], function(
	EventHelper,
	SharedConstants
) {
	var GRAVITY = 100;
	function Ball(state) {
		//constants (not stateful)
		this.radius = 40;

		//stateful vars
		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.verticalEnergy = 0;
		this._recalculateVerticalEnergy();

		this._events = new EventHelper([ 'perform-action' ]);

		//if a state was given, apply it
		if(state) {
			this.setState(state);
		}
	}
	Ball.prototype.handleHit = function(hit) {
		//TODO
		this.velY = -150;
		this.velX = 0;
	};
	Ball.prototype.setPositionAndVelocity = function(x, y, velX, velY) {
		this.x = x;
		this.y = y;
		this.velX = velX;
		this.velY = velY;
		this._recalculateVerticalEnergy();
	};
	Ball.prototype.canPerformAction = function(action) {
		return false;
	};
	Ball.prototype.performAction = function(action) {};
	Ball.prototype.getState = function() {
		return {
			x: this.x,
			y: this.y,
			velX: this.velX,
			velY: this.velY,
			verticalEnergy: this.verticalEnergy
		};
	};
	Ball.prototype.setState = function(state) {
		this.x = state.x;
		this.y = state.y;
		this.velX = state.velX;
		this.velY = state.velY;
		this.verticalEnergy = state.verticalEnergy;
	};
	Ball.prototype._recalculateVerticalEnergy = function() {
		var height = SharedConstants.BOTTOM_BOUND - this.y - this.radius;
		this.verticalEnergy = this.velY * this.velY / 2 + height * GRAVITY;
	};
	Ball.prototype.startOfFrame = function(t) {};
	Ball.prototype.tick = function(t) {
		//update velocity
		var oldVelX = this.velX;
		var oldVelY = this.velY;
		this.velY += GRAVITY * t;

		//apply velocity
		this.x += t * (this.velX + oldVelX) / 2;
		this.y += t * (this.velY + oldVelY) / 2;

		//keep ball in bounds
		if(this.x < SharedConstants.LEFT_BOUND + this.radius) {
			this.x = SharedConstants.LEFT_BOUND + this.radius;
			this.velX *= (this.velX < 0 ? -1 : 1);
		}
		if(this.x > SharedConstants.RIGHT_BOUND - this.radius) {
			this.x = SharedConstants.RIGHT_BOUND - this.radius;
			this.velX *= (this.velX > 0 ? -1 : 1);
		}
		if(this.y > SharedConstants.BOTTOM_BOUND - this.radius) {
			this.y = SharedConstants.BOTTOM_BOUND - this.radius;
			this.velY = -Math.sqrt(2 * this.verticalEnergy);
		}
	};
	Ball.prototype.endOfFrame = function(t) {};
	Ball.prototype.on = function(eventName, callback) {
		this._events.on(eventName, callback);
	};
	return Ball;
});