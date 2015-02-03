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
		this._predictedResults = {};
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
	Entity.prototype.processAction = function(action) {
		//process the action into a result
		var result = this._clientSim.processAction(action);

		//not every action has sendable results
		if(result) {
			//add extra data to the action
			action.messageType = 'entity-action';
			action.entityId = this.id;
			action.actionId = '' + Math.random();
			action.time = Clock.getServerReceiveTime();

			//send the action
			result.action = action;
			this._predictedResults[result.action.actionId] = result;
			Connection.bufferSend(action);

			//apply the results
			this._clientSim.applyResult(result);
		}
	};
	Entity.prototype.applyResult = function(result) {
		//if the result came from something we sent, we should check for inconsistencies
		var predictedResult = this._predictedResults[result.action.actionId];
		if(predictedResult) {
			delete this._predictedResults[result.action.actionId];
			this.checkForInconsistentResults(result, predictedResult);
			this._serverSim.applyResult(result);
			this._predictFutureState();
		}

		//otherwise we just apply the result
		else {
			this._clientSim.applyResult(result);
			this._serverSim.applyResult(result);
			this._predictFutureState();
		}
	};
	Entity.prototype.checkForInconsistentResults = function(result, predictedResult) {
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
			if(this._isPlayerControlled) {
				this._clientSim.setState(this._futureSim.getState());
			}
			else {
				this._clientSim.setState(state);
			}
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