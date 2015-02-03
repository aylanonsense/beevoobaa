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
	Entity.prototype.applyAction = function(action) {
		//apply the action
		var actionToSend = this._sim.applyAction(action);

		//not every action warrants sending
		if(actionToSend) {
			actionToSend.actionId = action.actionId;
			this.sendAction(actionToSend);
		}
	};
	Entity.prototype.sendAction = function(action) {
		//add extra data to the action
		action.messageType = 'entity-action';
		action.entityId = this.id;
		if(!action.actionId) {
			action.actionId = '' + Math.random();
		}
		action.time = now();

		//send the action
		Server.bufferSendToAll(action);
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