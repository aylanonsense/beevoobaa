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
		this._sim = new SimClass(params, 'server');
	}
	Entity.prototype.getState = function() {
		var state = this._sim.getState();
		state.id = this.id;
		state.entityType = this._entityType;
		return state;
	};
	Entity.prototype.startOfFrame = function(t) {
		this._sim.startOfFrame(t);
	};
	Entity.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	Entity.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
	};
	Entity.prototype.onReceiveCommand = function(command, predictedAction) {
		var self = this;
		this._sim.queueAction(function() {
			return self._generateActionFromCommand(command, predictedAction);
		}, function(action) {
			self._sendAction(action);
		});
	};
	Entity.prototype._sendAction = function(action) {
		Server.bufferSendToAll({
			messageType: 'entity-action',
			entityId: this.id,
			action: action,
			time: now()
		});
	};
	Entity.prototype._generateActionFromCommand = function(command, predictedAction) {
		//to be implemented in subclasses
	};
	return Entity;
});