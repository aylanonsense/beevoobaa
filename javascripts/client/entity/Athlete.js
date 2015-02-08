define([
	'client/entity/Entity',
	'create!client/display/Sprite > Athlete',
	'create!client/display/Sprite > AthleteOutline',
	'create!client/display/Sprite > AthleteOutline2',
	'create!client/display/Sprite > Cursor',
	'shared/sim/Athlete',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	SERVER_SPRITE_OUTLINE,
	FUTURE_SPRITE_OUTLINE,
	CURSOR_SPRITE,
	AthleteSim,
	Constants
) {
	var INPUT_BUFFER_TIME = 5.5 / 60;
	function Athlete(params) {
		SUPERCLASS.call(this, AthleteSim, params);
		this._bufferedTask = null;
		this._bufferedTaskDetails = null;
		this._bufferedTaskTimeRemaining = null;
		this._walkCycle = 0.0;
		this._walkDir = 0;
		this._moveDir = 0;
		this._jumpCharge = 0;
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
			return { actionType: 'jump', x: command.x, y: command.y };
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
				this._bufferedTaskDetails = {
					x: this._jumpCharge,
					y: (this._clientSim.currentTask === 'prepare-to-jump' ?
						Math.min(1.00, this._clientSim.currentTaskDuration / 1.00) : 0.00)
				};	
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
				this._moveDir = dir;
				this.processCommand({ commandType: 'move', dir: dir, x: this._clientSim.x });
			}
		}
	};
	Athlete.prototype.tick = function(t) {
		if(this._isPlayerControlled) {
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

			//charge a jump
			if(this._clientSim.currentTask === 'prepare-to-jump') {
				if(this._moveDir > 0) {
					this._jumpCharge += t;
				}
				else if(this._moveDir < 0) {
					this._jumpCharge -= t;
				}
				else if(this._jumpCharge > 0) {
					this._jumpCharge -= t;
					if(this._jumpCharge < 0) {
						this._jumpCharge = 0;
					}
				}
				else if(this._jumpCharge < 0) {
					this._jumpCharge += t;
					if(this._jumpCharge > 0) {
						this._jumpCharge = 0;
					}
				}
			}
			else {
				this._jumpCharge = 0;
			}
		}

		//figure out how long the character has been walking so we can animate
		if(this._clientSim.isGrounded() && this._clientSim.vel.x !== 0) {
			this._walkCycle += t;
		}
		else {
			this._walkCycle = 0.0;
		}

		//adjust moveDir (for use elsewhere)
		if(this._clientSim.vel.x > 0 && this._walkDir <= 0) {
			this._walkDir = 1;
			this._walkCycle = 0.0;
		}
		else if(this._clientSim.vel.x < 0 && this._walkDir >= 0) {
			this._walkDir = -1;
			this._walkCycle = 0.0;
		}
		else if(this._clientSim.vel.x === 0 && this._walkDir !== 0) {
			this._walkDir = 0;
			this._walkCycle = 0.0;
		}

		if(this._isPlayerControlled) {
			//player might be ready to jump
			if(this._clientSim.currentTask === 'prepare-to-jump' &&
				this._clientSim.currentTaskDuration >= 1.00) {
				this.processCommand({
					commandType: 'jump',
					x: this._jumpCharge,
					y: Math.min(1.00, this._clientSim.currentTaskDuration / 1.00)
				});
			}
		}

		SUPERCLASS.prototype.tick.call(this, t);
	};
	Athlete.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw yellow shadow to represent predicted state by the time the server receives input
		if(Constants.DEBUG_RENDER_FUTURE_STATE) {
			this._renderSim(ctx, this._futureSim, FUTURE_SPRITE_OUTLINE);
		}

		//draw red shadow to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			this._renderSim(ctx, this._serverSim, SERVER_SPRITE_OUTLINE);
		}

		//draw blue/green rectangle to represent the client's displayed position
		this._renderSim(ctx, this._clientSim, SPRITE);
		if(this._isPlayerControlled && this._clientSim.currentTask === 'prepare-to-jump') {
			var dur = this._clientSim.currentTaskDuration;
			CURSOR_SPRITE.render(ctx, null,
				this._clientSim.center.x - CURSOR_SPRITE.width / 2 + this._jumpCharge * 10,
				this._clientSim.top - 10 - 10 * dur,
				0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._clientSim.center.x - CURSOR_SPRITE.width / 2 + this._jumpCharge * 20,
				this._clientSim.top - 20 - 20 * dur,
				0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._clientSim.center.x - CURSOR_SPRITE.width / 2 + this._jumpCharge * 30,
				this._clientSim.top - 30 - 30 * dur,
				0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._clientSim.center.x - CURSOR_SPRITE.width / 2 + this._jumpCharge * 40,
				this._clientSim.top - 40 - 40 * dur,
				0, false);
		}
	};
	Athlete.prototype._renderSim = function(ctx, sim, sprite) {
		var frame;
		if(sim.isGrounded()) {
			//walking right
			if(sim.vel.x > 0) {
				frame = Math.floor(this._walkCycle / 0.25) % 4 + 1 * 6;
			}
			//walking left
			else if(sim.vel.x < 0) {
				frame = Math.floor(this._walkCycle / 0.25) % 4 + 2 * 6;
			}
			//preparing to jump
			else if(sim.currentTask === 'prepare-to-jump') {
				frame = 0 + 3 * 6;
			}
			//landing from a jump
			else if(sim.currentTask === 'land-from-jump') {
				frame = 3 + 3 * 6;
			}
			//standing still
			else {
				frame = 0;
			}
		}
		else {
			//falling (during jump)
			if(sim.vel.y > 100) {
				frame = 2 + 3 * 6;
			}
			//rising (during jump)
			else {
				frame = 1 + 3 * 6;
			}
		}
		sprite.render(ctx, null,
			sim.right - Math.floor(SPRITE.width / 2 + sim.width / 2),
			sim.bottom - SPRITE.height, frame, false);
	};
	return Athlete;
});