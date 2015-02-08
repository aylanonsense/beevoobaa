define([
	'client/entity/Entity2',
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
		this._bufferedInput = null;
		this._bufferTimeRemaining = null;
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.onKeyboardEvent = function(evt, keyboard) {
		//buffer input
		if(evt.gameKey === 'JUMP') {
			if(evt.isDown) {
				this._bufferedInput = 'start-jump';
				this._bufferTimeRemaining = null; //buffered forever (until you let go)
			}
			else {
				this._bufferedInput = 'end-jump';
				this._bufferTimeRemaining = INPUT_BUFFER_TIME;
			}
		}

		//may be trying to change direction
		else if(evt.gameKey === 'MOVE_LEFT') {
			if(evt.isDown) { this._bufferedInput = 'move-left'; }
			else { this._bufferedInput = (keyboard.MOVE_RIGHT ? 'move-right' : 'stop'); }
			this._bufferTimeRemaining = null;
		}
		else if(evt.gameKey === 'MOVE_RIGHT') {
			if(evt.isDown) { this._bufferedInput = 'move-right'; }
			else { this._bufferedInput = (keyboard.MOVE_LEFT ? 'move-left' : 'stop'); }
			this._bufferTimeRemaining = null;
		}
	};
	Athlete.prototype.tick = function(t) {
		if(this._isPlayerControlled) {
			//attempt to apply buffered input
			var actionPerformed = false;
			if(this._bufferedInput === 'move-left') {
				actionPerformed = this._clientSim.followWaypoint(this._clientSim.x, -1);
			}
			else if(this._bufferedInput === 'move-right') {
				actionPerformed = this._clientSim.followWaypoint(this._clientSim.x, 1);
			}
			else if(this._bufferedInput === 'stop') {
				actionPerformed = this._clientSim.followWaypoint(this._clientSim.x, 0);
			}
			else if(this._bufferedInput === 'start-jump') {
				actionPerformed = this._clientSim.chargeJump();
			}
			else if(this._bufferedInput === 'end-jump') {
				actionPerformed = this._clientSim.releaseJump(1.0, 0.0);
			}

			//if an action was performed, we can unbuffer the inputs
			if(actionPerformed) {
				//TODO send action performed to server
				this._bufferedInput = null;
				this._bufferTimeRemaining = null;
			}

			//if it takes too long to apply, it becomes unbuffered
			if(this._bufferTimeRemaining !== null) {
				this._bufferTimeRemaining -= t;
				if(this._bufferTimeRemaining <= 0) {
					this._bufferedInput = null;
					this._bufferTimeRemaining = null;
				}
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
		/*if(this._isPlayerControlled && this._clientSim.currentTask === 'prepare-to-jump') {
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
		}*/
	};
	Athlete.prototype._renderSim = function(ctx, sim, sprite) {
		var frame;
		/*if(sim.isGrounded()) {
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
		}*/
		frame = 0;
		sprite.render(ctx, null,
			sim.right - Math.floor(SPRITE.width / 2 + sim.width / 2),
			sim.bottom - SPRITE.height, frame, false);
	};
	return Athlete;
});