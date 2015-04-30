define([
	'client/net/GameConnection',
	'client/Clock'
], function(
	GameConnection,
	Clock
) {
	function Entity(entityType, id, SimClass, state) {
		this.entityType = entityType;
		this.id = id;
		this._isPlayerControlled = false;
		this._sim = new SimClass(state);
		this._serverSim = new SimClass(state);
		this._futureSim = new SimClass(state);
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
	Entity.prototype.getFutureSim = function() {
		return this._futureSim;
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
		//from the server's current state, fast forward to create a prediction of future state
		this._futureSim.setState(this._serverSim.getState());
		for(var ffTime = Clock.getRoundTripTime(); ffTime > 0; ffTime -= 1 / 60) {
			//fast forward state
			var t2 = Math.min(1 / 60, ffTime);
			this._futureSim.startOfFrame(t2);
			this._futureSim.tick(t2);
			this._futureSim.endOfFrame(t2);
		}

		//start of frame
		this._sim.startOfFrame(t);
		this._serverSim.startOfFrame(t);
		this._futureSim.startOfFrame(t);

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
		this._futureSim.tick(t);
	};
	Entity.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
		this._serverSim.endOfFrame(t);
		this._futureSim.endOfFrame(t);
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