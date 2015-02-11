define([
	'client/net/Connection',
	'client/Clock'
], function(
	Connection,
	Clock
) {
	function Entity(SimClass, params) {
		this.id = params.id;
		this._isPlayerControlled = false;
		this._outOfSync = false;
		this._sim = new SimClass(params, 'client');
		this._serverSim = new SimClass(params, 'client-server');
	}
	Entity.prototype._sendCommand = function(command, action) {
		Connection.bufferSend({
			messageType: 'entity-command',
			entityId: this.id,
			command: command,
			action: action,
			time: Clock.getServerReceiveTime()
		});
	};
	Entity.prototype.setPlayerControl = function(isPlayerControlled) {
		this._isPlayerControlled = isPlayerControlled;
	};
	Entity.prototype.setState = function(state) {
		if(this._outOfSync && !this._isPlayerControlled) {
			this._outOfSync = false;
			this._sim.setState(state);
		}
		this._serverSim.setState(state);
	};
	Entity.prototype.markAsOutOfSync = function() {
		this._outOfSync = true;
	};
	Entity.prototype.onReceiveAction = function(action) {
		if(!this._isPlayerControlled) {
			this._sim.queueAction(function() { return action; });
		}
		this._serverSim.queueAction(function() { return action; });
	};
	Entity.prototype.onKeyboardEvent = function(evt, keyboard) {
		//to be implemented in subclasses
	};
	Entity.prototype.startOfFrame = function(t, tServer) {
		this._sim.startOfFrame(t);
		this._serverSim.startOfFrame(tServer);
	};
	Entity.prototype.tick = function(t, tServer) {
		this._sim.tick(t);
		this._serverSim.tick(tServer);
	};
	Entity.prototype.endOfFrame = function(t, tServer) {
		this._sim.endOfFrame(t);
		this._serverSim.endOfFrame(tServer);
	};
	Entity.prototype.render = function(ctx) {
		//to be implemented in subclasses
	};
	return Entity;
});