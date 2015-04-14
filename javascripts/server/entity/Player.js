define([
	'shared/entity/Player',
	'server/net/GameConnectionServer',
	'shared/utils/capValue',
	'shared/Constants'
], function(
	PlayerSim,
	GameConnectionServer,
	capValue,
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
				action = {
					actionType: 'charge-jump',
					x: capValue(this._sim.x - 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE,
						action.x, this._sim.x + 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE),
					dir: action.dir
				};
			}
			else if(action.actionType === 'release-jump') {
				action = {
					actionType: 'release-jump',
					chargeTime: (this._sim.currentTask !== 'charging-jump' ? 0.0 :
						capValue(this._sim.currentTaskTime - 2 / SharedConstants.FRAME_RATE,
							action.chargeTime, this._sim.currentTaskTime + 2 / SharedConstants.FRAME_RATE)),
					dir: capValue(this._sim.aimPos - 2 * this._sim.aimSpeed / SharedConstants.FRAME_RATE,
						action.dir, this._sim.aimPos + 2 * this._sim.aimSpeed / SharedConstants.FRAME_RATE),
				};
			}
			else if(action.actionType === 'aim') {
				action = { actionType: 'aim', pos: action.pos, dir: action.dir };
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