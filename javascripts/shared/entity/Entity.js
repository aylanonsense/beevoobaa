define([
	'shared/config',
], function(
	config
) {
	function Entity(entityType, state, statefulVars) {
		this.entityId = null;
		this.entityType = entityType;
		this._statefulVars = statefulVars;
		this.lifeTime = 0;

		//if a state was given, apply it
		if(state) {
			this.setState(state);
		}
	}
	Entity.prototype.canPerformAction = function(action) {
		throw new Error("canPerformAction must be overwritten in subclasses");
	};
	Entity.prototype.performAction = function(action) {
		throw new Error("performAction must be overwritten in subclasses");
	};
	Entity.prototype.getState = function() {
		var state = {
			entityId: this.entityId,
			lifeTime: this.lifeTime
		};
		for(var i = 0; i < this._statefulVars.length; i++) {
			state[this._statefulVars[i]] = this[this._statefulVars[i]];
		}
		return state;
	};
	Entity.prototype.setState = function(state) {
		this.entityId = state.entityId;
		this.lifeTime = state.lifeTime;
		for(var i = 0; i < this._statefulVars.length; i++) {
			this[this._statefulVars[i]] = state[this._statefulVars[i]];
		}
	};
	Entity.prototype.startOfFrame = function(t) {
		this.lifeTime += t;
	};
	Entity.prototype.tick = function(t) {};
	Entity.prototype.endOfFrame = function(t) {};
	return Entity;
});