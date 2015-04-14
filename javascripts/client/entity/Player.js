define([
	'shared/entity/Player',
	'client/net/GameConnection'
], function(
	PlayerSim,
	GameConnection
) {
	function Player(id, state) {
		this.id = id;
		this._isPlayerControlled = false;
		this._sim = new PlayerSim(state);
		this._serverSim = new PlayerSim(state);
		this._simIsDesynced = false;
		this._bufferedSimActions = [];
		this._bufferedServerSimActions = [];
		this._moveDir = 0;
		this._bufferedInput = null;
		this._bufferedInputTime = 0.0;

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
	Player.prototype.onMouseEvent = function(evt) {};
	Player.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(this.isPlayerControlled()) {
			//changing directions
			if(evt.key === 'MOVE_LEFT') {
				this._moveDir = (evt.isDown ? -1 : (keyboard.MOVE_RIGHT ? 1 : 0));
			}
			else if(evt.key === 'MOVE_RIGHT') {
				this._moveDir = (evt.isDown ? 1 : (keyboard.MOVE_LEFT ? -1 : 0));
			}
			//charging/releasing a jump
			else if(evt.key === 'JUMP') {
				if(evt.isDown) {
					this._bufferedInput = 'charge-jump';
					this._bufferedInputTime = 5.5 / 60;
				}
				else {
					this._bufferedInput = 'release-jump';
					this._bufferedInputTime = 5.5 / 60;
				}
			}
		}
	};
	Player.prototype._applyBufferedInput = function() {
		var action;
		if(this._bufferedInput) {
			action = null;
			if(this._bufferedInput === 'charge-jump') {
				action = { actionType: 'charge-jump', x: this._sim.x };
			}
			else if(this._bufferedInput === 'release-jump') {
				if(this._sim.currentTask === 'charging-jump') {
					action = {
						actionType: 'release-jump',
						chargeTime: this._sim.currentTaskTime
					};
				}
			}
			if(action && this._sim.canPerformAction(action)) {
				this._sim.performAction(action);
				this._bufferedInput = null;
			}
		}
		if(!this._sim.isWalking() || this._sim.getEventualWalkDir() !== this._moveDir) {
			action = { actionType: 'follow-waypoint', x: this._sim.x, dir: this._moveDir };
			if(this._sim.canPerformAction(action)) {
				this._sim.performAction(action);
			}
		}
	};
	Player.prototype.render = function(ctx) {
		//draw server "ghost"
		if(this._serverSim.currentTask === 'charging-jump') { ctx.strokeStyle = '#00f'; }
		else if(this._serverSim.currentTask === 'landing') { ctx.strokeStyle = '#0f0'; }
		else { ctx.strokeStyle = '#f00'; }
		ctx.lineWidth = 1;
		ctx.strokeRect(this._serverSim.x + 0.5, this._serverSim.y + 0.5,
			this._serverSim.width - 1, this._serverSim.height - 1);

		//draw actual entity
		if(this._sim.currentTask === 'charging-jump') { ctx.fillStyle = '#00f'; }
		else if(this._sim.currentTask === 'landing') { ctx.fillStyle = '#0f0'; }
		else { ctx.fillStyle = '#f00'; }
		ctx.fillRect(this._sim.x, this._sim.y,
			this._sim.width, this._sim.height);
	};



	Player.prototype.onInputFromServer = function(action) {
		if(!this.isPlayerControlled()) {
			this._bufferedSimActions.push(action);
		}
		this._bufferedServerSimActions.push(action);
	};
	Player.prototype.onStateUpdateFromServer = function(state) {
		if(this._simIsDesynced) {
			this._sim.setState(state);
			this._bufferedSimActions = [];
		}
		this._serverSim.setState(state);
		this._bufferedServerSimActions = [];
	};
	Player.prototype.startOfFrame = function(t) {
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

		//client may have input as well
		if(this.isPlayerControlled()) {
			this._applyBufferedInput();
		}
	};
	Player.prototype.tick = function(t) {
		this._sim.tick(t);
		this._serverSim.tick(t);
	};
	Player.prototype.endOfFrame = function(t) {
		this._sim.endOfFrame(t);
		this._serverSim.endOfFrame(t);

		//input may become unbuffered
		this._bufferedInputTime = Math.max(0.0, this._bufferedInputTime - t);
		if(this._bufferedInputTime <= 0.0) {
			this._bufferedInput = null;
		}
	};
	Player.prototype.isPlayerControlled = function() {
		return this._isPlayerControlled;
	};
	Player.prototype.setPlayerControl = function(isControlled) {
		this._isPlayerControlled = isControlled;
		if(isControlled) {
			this._bufferedSimActions = [];
		}
	};
	return Player;
});