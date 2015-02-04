define([
	'client/entity/Entity',
	'shared/sim/Athlete',
	'client/Constants'
], function(
	SUPERCLASS,
	AthleteSim,
	Constants
) {
	var INPUT_BUFFER_TIME = 5.5 / 60;
	function Athlete(params) {
		SUPERCLASS.call(this, AthleteSim, params);
		this._bufferedTask = null;
		this._bufferedTaskDetails = null;
		this._bufferedTaskTimeRemaining = null;
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype._translateCommandToAction = function(command) {
		if(command.commandType === 'move') {
			return {
				actionType: 'follow-waypoint',
				x: command.x,
				dir: command.dir
			};
		}
		else if(command.commandType === 'prepare-to-jump') {
			return { actionType: 'prepare-to-jump' };
		}
		else if(command.commandType === 'jump') {
			return { actionType: 'jump' };
		}
	};
	Athlete.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(evt.gameKey === 'JUMP') {
			if(evt.isDown) {
				this._bufferedTask = 'prepare-to-jump';
				this._bufferedTaskTimeRemaining = null;
			}
			else {
				this._bufferedTask = 'jump';
				this._bufferedTaskTimeRemaining = INPUT_BUFFER_TIME;
			}
		}
		else {
			//may be trying to change direction
			var dir = null;
			if(evt.gameKey === 'MOVE_LEFT') {
				if(evt.isDown) { dir = -1; }
				else { dir = (keyboard.MOVE_RIGHT ? 1 : 0); }
			}
			else if(evt.gameKey === 'MOVE_RIGHT') {
				if(evt.isDown) { dir = 1; }
				else { dir = (keyboard.MOVE_LEFT ? -1 : 0); }
			}
			if(dir !== null) {
				this.processCommand({ commandType: 'move', dir: dir, x: this._clientSim.x });
			}
		}
	};
	Athlete.prototype.tick = function(t) {
		//when the buffered task can be performed, queue it up and send out the command
		if(this._bufferedTask !== null && this._clientSim.isReadyForTask(this._bufferedTask)) {
			var command = this._bufferedTaskDetails || {};
			command.commandType = this._bufferedTask;
			this._bufferedTask = null;
			this._bufferedTaskDetails = null;
			this._bufferedTaskTimeRemaining = null;
			this.processCommand(command);
		}

		//if it takes too long to apply, it becomes unbuffered
		if(this._bufferedTaskTimeRemaining !== null) {
			this._bufferedTaskTimeRemaining -= t;
			if(this._bufferedTaskTimeRemaining <= 0) {
				this._bufferedTask = null;
				this._bufferedTaskDetails = null;
				this._bufferedTaskTimeRemaining = null;
			}
		}

		SUPERCLASS.prototype.tick.call(this, t);
	};
	Athlete.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw red shadow to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
			ctx.fillRect(this._serverSim.x, this._serverSim.y,
				this._serverSim.width, this._serverSim.height);
		}

		//draw blue/green rectangle to represent the client's displayed position
		ctx.fillStyle = (this._isPlayerControlled ? '#0b4' : '#05f');
		ctx.fillRect(this._clientSim.x, this._clientSim.y,
			this._clientSim.width, this._clientSim.height);
		if(this._clientSim.waypointX !== null) {
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this._clientSim.waypointX, this._clientSim.bottom + 8);
			ctx.lineTo(this._clientSim.waypointX + this._clientSim.width, this._clientSim.bottom + 8);
			ctx.stroke();
		}

		//draw yellow shadow to represent predicted state by the time the server receives input
		if(Constants.DEBUG_RENDER_FUTURE_STATE) {
			ctx.strokeStyle = 'rgba(255, 175, 0, 1.0)';
			ctx.lineWidth = 1;
			ctx.strokeRect(this._futureSim.x, this._futureSim.y,
				this._futureSim.width, this._futureSim.height);
		}
	};
	return Athlete;
});