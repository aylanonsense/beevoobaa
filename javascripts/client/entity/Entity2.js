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
		this._actionsSent = {};
		this._serverSim = new SimClass(params);
		this._clientSim = new SimClass(params);
		this._futureSim = new SimClass(params);
		this._predictFutureState();
	}
	Entity.prototype.setPlayerControl = function(isPlayerControlled) {
		this._isPlayerControlled = isPlayerControlled;
	};
	Entity.prototype._predictFutureState = function() {
		this._futureSim.setState(this._serverSim.getState());
		var serverReceiveTime = Clock.getServerReceiveTime();
		var clientTime = Clock.getClientTime();
		if(serverReceiveTime !== null && clientTime !== null) {
			//fast forward the predicted state at an effective 60 FPS
			var time = Math.abs(serverReceiveTime - clientTime) / 1000;
			for(var t = time; t > 0; t -= 1 / 60) {
				this._futureSim.tick(Math.min(t, 1 / 60));
			}
		}
	};
	Entity.prototype.applyAction = function(action, shouldSend) {
		if(shouldSend) {
			//apply the action
			var actionToSend = this._clientSim.applyAction(action);

			//not every action warrants sending
			if(actionToSend) {
				//add extra data to the action
				actionToSend.messageType = 'entity-action';
				actionToSend.entityId = this.id;
				actionToSend.actionId = '' + Math.random();
				actionToSend.time = Clock.getServerReceiveTime();

				//record that the action will be sent
				this._actionsSent[actionToSend.actionId] = actionToSend;

				//send the action
				Connection.bufferSend(actionToSend);
			}
		}
		else {
			//if the action came from something we sent, we should check for inconsistencies
			var sentAction = this._actionsSent[action.actionId];
			if(sentAction) {
				delete this._actionsSent[action.actionId];
				this.checkForInconsistentAction(action, sentAction);
				this._serverSim.applyAction(action);
				this._predictFutureState();
			}

			//otherwise we just apply the action
			else {
				this._clientSim.applyAction(action);
				this._serverSim.applyAction(action);
				this._predictFutureState();
			}
		}
	};
	Entity.prototype.checkForInconsistentAction = function(action, sentAction) {
		//to be filled out in subclasses
	};
	Entity.prototype.markAsOutOfSync = function() {
		this._outOfSync = true;
	};
	Entity.prototype.setState = function(state) {
		this._serverSim.setState(state);
		this._predictFutureState();
		if(this._outOfSync) {
			this._outOfSync = false;
			this._clientSim.setState(state); //TODO may want to set to predicted
		}
	};
	Entity.prototype.tick = function(t) {
		this._clientSim.tick(t);
		this._serverSim.tick(t);
		this._predictFutureState();
	};
	Entity.prototype.render = function(ctx) {};
	return Entity;
});