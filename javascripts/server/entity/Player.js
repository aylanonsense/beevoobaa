define([
	'shared/entity/Player',
	'server/net/GameConnectionServer',
	'shared/Constants'
], function(
	PlayerSim,
	GameConnectionServer,
	SharedConstants
) {
	var nextId = 0;
	function Player(x) {
		this.id = nextId++;
		this.entityType = 'Player';
		this._sim = new PlayerSim();
		this._sim.x = x;
		this._bufferedClientActions = [];

		//player inputs are broadcast to clients
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
	Player.prototype.onInputFromClient = function(action) {
		this._bufferedClientActions.push(action);
	};
	Player.prototype.getState = function() {
		return this._sim.getState();
	};
	Player.prototype.startOfFrame = function(t) {
		this._sim.startOfFrame(t);

		//translate client actions to performable actions
		while(this._bufferedClientActions.length > 0) {
			var action = this._bufferedClientActions[0];
			if(action.actionType === 'follow-waypoint') {
				action = { actionType: 'follow-waypoint', x: action.x, dir: action.dir };
			}
			else if(action.actionType === 'charge-jump') {
				var x = this._sim.x;
				if(action.x > x) {
					x = Math.min(x + 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE, action.x);
				}
				else {
					x = Math.max(x - 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE, action.x);
				}
				action = { actionType: 'charge-jump', x: x };
			}
			else if(action.actionType === 'release-jump') {
				action = { actionType: 'release-jump' };
			}
			else if(action.actionType === 'mini-jump') {
				action = { actionType: 'mini-jump' };
			}
			else {
				action = null;
			}
			if(action && this._sim.canPerformAction(action)) {
				this._sim.performAction(action);
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
	Player.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	Player.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
	};
	return Player;
});