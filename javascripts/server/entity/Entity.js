define(function() {
	var NEXT_ENTITY_ID = 0;
	function Entity(entityType, SimClass, params) {
		this.id = NEXT_ENTITY_ID++;
		this._entityType = entityType;
		this._sim = new SimClass(params);
	}
	Entity.prototype.getState = function() {
		var state = this._sim.getState();
		state.entityType = this._entityType;
		state.id = this.id;
		return state;
	};
	Entity.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	return Entity;
});