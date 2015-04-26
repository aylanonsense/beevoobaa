define([
	'client/net/GameConnection'
], function(
	GameConnection
) {
	function Entity(entityType, id, SimClass, state) {
		this.entityType = entityType;
		this.id = id;
		this._isPlayerControlled = false;
		this._sim = new SimClass(state);
		this._serverSim = new SimClass(state);
		this._simIsDesynced = false;
		this._bufferedSimActions = [];
		this._bufferedServerSimActions = [];

		//player inputs are propagated to the server
		var self = this;
		this._sim.on('perform-action', function(action) {
			if(self.isPlayerControlled()) {
				GameConnection.bufferSend({
					messageType: 'perform-action',
					action: action
				});
			}
		});
	}
	Entity.prototype.getClientSim = function() {
		return this._sim;
	};
	Entity.prototype.getServerSim = function() {
		return this._serverSim;
	};
	Entity.prototype.onMouseEvent = function(evt) {};
	Entity.prototype.onKeyboardEvent = function(evt, keyboard) {};
	Entity.prototype._tryToPerformAction = function(action) {
		if(action && this._sim.canPerformAction(action)) {
			this._sim.performAction(action);
			return true;
		}
		return false;
	};
	Entity.prototype.render = function(ctx) {};
	Entity.prototype.onInputFromServer = function(action) {
		if(!this.isPlayerControlled()) {
			this._bufferedSimActions.push(action);
		}
		this._bufferedServerSimActions.push(action);
	};
	Entity.prototype.onStateUpdateFromServer = function(state) {
		if(this._simIsDesynced) {
			this._sim.setState(state);
			this._bufferedSimActions = [];
			this._simIsDesynced = false;
			console.log("Syncing desynced sim");
		}
		this._serverSim.setState(state);
		this._bufferedServerSimActions = [];
	};
	Entity.prototype.startOfFrame = function(t) {
		this._sim.startOfFrame(t);
		this._serverSim.startOfFrame(t);

		//perform actions the server sent in the recent past
		while(this._bufferedSimActions.length > 0 &&
				this._sim.canPerformAction(this._bufferedSimActions[0])) {
			this._sim.performAction(this._bufferedSimActions.shift());
		}
		while(this._bufferedServerSimActions.length > 0 &&
				this._serverSim.canPerformAction(this._bufferedServerSimActions[0])) {
			this._serverSim.performAction(this._bufferedServerSimActions.shift());
		}

		//if multiple actions are still buffered, it often means we've gotten a bit desynced
		if(this._bufferedSimActions.length > 1) {
			this._simIsDesynced = true;
		}
	};
	Entity.prototype.tick = function(t) {
		this._sim.tick(t);
		this._serverSim.tick(t);
	};
	Entity.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
		this._serverSim.endOfFrame(t);
	};
	Entity.prototype.isPlayerControlled = function() {
		return this._isPlayerControlled;
	};
	Entity.prototype.setPlayerControl = function(isControlled) {
		this._isPlayerControlled = isControlled;
		if(isControlled) {
			this._bufferedSimActions = [];
		}
	};
	return Entity;
});