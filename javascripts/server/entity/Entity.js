define([
	'server/net/GameConnectionServer'
], function(
	GameConnectionServer
) {
	var nextId = 0;
	function Entity(entityType, SimClass) {
		this.id = nextId++;
		this.entityType = entityType;
		this._sim = new SimClass();
		this._bufferedClientActions = [];

		//entity actions are broadcast to clients
		var id = this.id;
		this._sim.on('perform-action', function(action) {
			GameConnectionServer.forEachSynced(function(conn) {
				conn.bufferSend({
					messageType: 'perform-action',
					id: id,
					action: action
				});
			});
		});
	}
	Entity.prototype.onInputFromClient = function(action) {
		this._bufferedClientActions.push(action);
	};
	Entity.prototype.getState = function() {
		return this._sim.getState();
	};
	Entity.prototype._translateClientActionToServerAction = function(action) {
		throw new Error("_translateClientActionToServerAction must be implemented in subclasses");
	};
	Entity.prototype.startOfFrame = function(t) {
		this._sim.startOfFrame(t);

		//translate client actions to performable actions
		while(this._bufferedClientActions.length > 0) {
			var action = this._bufferedClientActions[0];
			var translatedAction = this._translateClientActionToServerAction(action);
			if(this._tryToPerformAction(translatedAction)) {
				this._bufferedClientActions.shift();
			}
			else {
				break;
			}
		}

		//if multiple actions are still buffered, we take it to mean
		// those actions are old and no longer valid
		if(this._bufferedClientActions.length > 1) {
			//debug
			for(var i = 0; i < this._bufferedClientActions.length - 1; i++) {
				console.log("Ignoring action:", this._bufferedClientActions[i]);
			}
			//remove all but the most recent action submitted by the client
			this._bufferedClientActions = [
				this._bufferedClientActions[this._bufferedClientActions.length - 1]
			];
		}
	};
	Entity.prototype._tryToPerformAction = function(action) {
		if(action && this._sim.canPerformAction(action)) {
			this._sim.performAction(action);
			return true;
		}
		return false;
	};
	Entity.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	Entity.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
	};
	return Entity;
});