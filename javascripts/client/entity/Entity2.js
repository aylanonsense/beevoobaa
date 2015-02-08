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
		this._predictedActions = {};
		this._serverSim = new SimClass(params);
		this._clientSim = new SimClass(params);
		this._futureSim = new SimClass(params);
		this._predictFutureState();
	}
	Entity.prototype.setState = function(state) {
		if(this._outOfSync && !this._isPlayerControlled) {
			this._outOfSync = false;
			this._clientSim.setState(state);
		}
		this._serverSim.setState(state);
		this._predictFutureState();
	};
	Entity.prototype._translateCommandToAction = function(command) {
		//to be filled out in subclasses
	};
	Entity.prototype.setPlayerControl = function(isPlayerControlled) {
		this._isPlayerControlled = isPlayerControlled;
	};
	Entity.prototype.processCommand = function(command) {
		var action = this._translateCommandToAction(command);

		//not every command results in a sendable action
		//(there's an interesting thing here where maybe the client doesn't think anything should
		// happen... but maybe the server does. But we're not even sending the command in that case)
		if(action) {
			//add extra data to the command
			command.messageType = 'entity-command';
			command.entityId = this.id;
			command.commandId = '' + Math.random();
			command.time = Clock.getServerReceiveTime();

			//store the predicted action that results from the command
			action.command = command;
			this._predictedActions[command.commandId] = action;

			//send the command to the server
			Connection.bufferSend(command);

			//apply the results
			this._clientSim.takeAction(action);
		}
	};
	Entity.prototype.takeAction = function(action) {
		//if the action came from something we sent, we should check for inconsistencies
		var predictedAction = this._predictedActions[action.command.commandId];
		if(predictedAction) {
			delete this._predictedActions[action.command.commandId];
			//TODO check for inconsistencies between action and predictedAction
			this._serverSim.takeAction(action);
			this._predictFutureState();
		}

		//otherwise we just apply the action
		else {
			this._clientSim.takeAction(action);
			this._serverSim.takeAction(action);
			this._predictFutureState();
		}
	};
	Entity.prototype.markAsOutOfSync = function() {
		this._outOfSync = true;
	};
	Entity.prototype.startOfFrame = function(t) {
		this._clientSim.startOfFrame(t);
		this._serverSim.startOfFrame(t);
	};
	Entity.prototype.tick = function(t) {
		this._clientSim.tick(t);
		this._serverSim.tick(t);
	};
	Entity.prototype.endOfFrame = function(t) {
		this._clientSim.endOfFrame(t);
		this._serverSim.endOfFrame(t);
		this._predictFutureState();
	};
	Entity.prototype.render = function(ctx) {
		//to be implemented in subclasses
	};

	//helper methods
	Entity.prototype._predictFutureState = function() {
		this._futureSim.setState(this._serverSim.getState());
		var serverReceiveTime = Clock.getServerReceiveTime();
		var clientTime = Clock.getClientTime();
		if(serverReceiveTime !== null && clientTime !== null) {
			//fast forward the predicted state at an effective 60 FPS
			var time = Math.abs(serverReceiveTime - clientTime) / 1000;
			for(var t = time; t > 0; t -= 1 / 60) {
				this._futureSim.startOfFrame(Math.min(t, 1 / 60));
				this._futureSim.tick(Math.min(t, 1 / 60));
				this._futureSim.endOfFrames(Math.min(t, 1 / 60));
			}
		}
	};

	return Entity;
});