define([
	'server/net/Server',
	'performance-now'
], function(
	Server,
	now
) {
	var nextEntityId = 0;
	function Entity(entityType, SimClass, params) {
		this.id = nextEntityId++;
		this._entityType = entityType;
		this._sim = new SimClass(params);
	}
	Entity.prototype.getState = function() {
		var state = this._sim.getState();
		state.id = this.id;
		state.entityType = this._entityType;
		return state;
	};
	Entity.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	Entity.prototype.processAction = function(action) {
		//apply the action
		var result = this._sim.processAction(action);

		//not every action warrants sending
		if(result) {
			result.action = action;
			this._sim.applyResult(result);
			this.sendResult(result);
		}
	};
	Entity.prototype.applyResult = function(result) {
		this._sim.applyResult(result);
	};
	Entity.prototype.sendResult = function(result) {
		//add extra data to the action
		result.messageType = 'entity-result';
		result.entityId = this.id;
		if(!result.action.actionId) {
			result.action.actionId = '' + Math.random();
		}
		result.time = now();

		//send the action
		Server.bufferSendToAll(result);
	};
	Entity.prototype.sendState = function() {
		Server.bufferSendToAll({
			messageType: 'entity-state',
			entityId: this.id,
			state: this.getState(),
			time: now()
		});
	};
	return Entity;
});