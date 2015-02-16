define(function() {
	function Effect() {
		this._timeAlive = 0.0;
		this._framesAlive = 0;
	}
	Effect.prototype.tick = function(t) {
		//to be implemented in subclasses
		this._timeAlive += t;
		this._framesAlive++;
	};
	Effect.prototype.renderShadow = function(ctx) {
		//to be implemented in subclasses
	};
	Effect.prototype.render = function(ctx) {
		//to be implemented in subclasses
	};
	Effect.prototype.isAlive = function() {
		return true;
	};
	return Effect;
});