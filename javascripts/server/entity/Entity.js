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
	Entity.prototype._translateCommandToAction = function(command) {
		//to be filled out in subclasses
	};
	Entity.prototype.processCommand = function(command) {
		var action = this._translateCommandToAction(command);
		if(action) {
			//have the simulation apply the action
			this._sim.takeAction(action);

			//add extra data to the action
			action.messageType = 'entity-action';
			action.entityId = this.id;
			action.command = command;
			if(!action.command.commandId) {
				action.command.commandId = '' + Math.random();
			}
			action.time = now();

			//send the action
			Server.bufferSendToAll(action);
		}
	};
	return Entity;
});