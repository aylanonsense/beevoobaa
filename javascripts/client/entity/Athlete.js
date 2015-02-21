define([
	'client/entity/BufferedInputEntity',
	'create!client/display/Sprite > Athlete',
	'create!client/display/Sprite > AthleteShadow',
	'create!client/display/Sprite > AthleteGhost',
	'create!client/display/Sprite > AthleteGhost2',
	'create!client/display/Sprite > Cursor',
	'create!client/display/Sprite > ChargeFire',
	'create!client/display/Sprite > ChargeSwipe',
	'create!client/display/Sprite > BumpEffects',
	'shared/sim/Athlete',
	'client/Spawner',
	'client/effect/ChargeBurst',
	'shared/Constants',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	SHADOW_SPRITE,
	SERVER_GHOST_SPRITE,
	FUTURE_GHOST_SPRITE,
	CURSOR_SPRITE,
	CHARGE_FIRE_SPRITE,
	SWIPE_FIRE_SPRITE,
	BUMP_EFFECTS_SPRITE,
	AthleteSim,
	Spawner,
	ChargeBurst,
	SharedConstants,
	Constants
) {
	var INPUT_BUFFER_TIME = 5.5 / 60;
	var SEC_PER_CHARGE_LEVEL = 0.5;
	function Athlete(params) {
		SUPERCLASS.call(this, 'Athlete', AthleteSim, params);
		this._sim.hitboxLeeway = false;
		this._serverSim.hitboxLeeway = true;
		this._futureSim.hitboxLeeway = false;
		this._cancelBufferedAction = null;
		this._bufferTimeRemaining = null;
		this._moveDir = null;
		this._chargedDir = 0.0;
		this._walkDuration = 0.0;
		this._walkDir = 0;
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(evt.gameKey === 'JUMP') {
			if(evt.isDown) { this._bufferCommand('charge-jump', null); }
			else { this._bufferCommand('jump', INPUT_BUFFER_TIME); }
		}
		else if(evt.gameKey === 'STRONG_HIT') {
			if(evt.isDown) { this._bufferCommand('charge-strong-hit', INPUT_BUFFER_TIME); }
			else if(this._sim.currentTask === 'charge-spike' || this._sim.currentTask === 'charge-bump') {
				this._bufferCommand('strong-hit', INPUT_BUFFER_TIME);
			}
		}
		else if(evt.gameKey === 'WEAK_HIT') {
			if(evt.isDown) { this._bufferCommand('charge-weak-hit', INPUT_BUFFER_TIME); }
			else if(this._sim.currentTask === 'charge-set' || this._sim.currentTask === 'charge-block') {
				this._bufferCommand('weak-hit', INPUT_BUFFER_TIME);
			}
		}
		else if(evt.gameKey === 'MOVE_LEFT') {
			if(evt.isDown) {
				this._moveDir = -1;
				if(this._sim.currentTask !== 'charge-jump') {
					this._bufferCommand('move-left', null);
				}
			}
			else {
				this._moveDir = (keyboard.MOVE_RIGHT ? 1 : 0);
				if(this._sim.currentTask !== 'charge-jump') {
					this._bufferCommand(keyboard.MOVE_RIGHT ? 'move-right' : 'stop', null);
				}
			}
		}
		else if(evt.gameKey === 'MOVE_RIGHT') {
			if(evt.isDown) {
				this._moveDir = 1;
				if(this._sim.currentTask !== 'charge-jump') {
					this._bufferCommand('move-right', null);
				}
			}
			else {
				this._moveDir = (keyboard.MOVE_LEFT ? -1 : 0, null);
				if(this._sim.currentTask !== 'charge-jump') {
					this._bufferCommand(keyboard.MOVE_LEFT ? 'move-left' : 'stop', null);
				}
			}
		}
	};
	Athlete.prototype._generateActionFromCommand = function(command) {
		var charge, dir;
		if(command === 'move-left') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: -1 };
		}
		else if(command === 'move-right') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: 1 };
		}
		else if(command === 'stop') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: 0 };
		}
		else if(command === 'charge-jump') {
			return { actionType: 'charge-jump', x: this._sim.x };
		}
		else if(command === 'charge-strong-hit') {
			return { actionType: 'charge-strong-hit', allowHit: true };
		}
		else if(command === 'charge-weak-hit') {
			return { actionType: 'charge-weak-hit', allowHit: true };
		}
		else if(command === 'strong-hit') {
			charge = 0.0;
			if(this._sim.currentTask === 'charge-spike' || this._sim.currentTask === 'charge-bump') {
				charge = Math.min(this._sim.currentTaskDuration / SEC_PER_CHARGE_LEVEL / 4, 1.00);
			}
			return { actionType: 'strong-hit', charge: charge, dir: 0.0, allowHit: true };
		}
		else if(command === 'weak-hit') {
			charge = 0.0;
			if(this._sim.currentTask === 'charge-set' || this._sim.currentTask === 'charge-block') {
				charge = Math.min(this._sim.currentTaskDuration / SEC_PER_CHARGE_LEVEL / 4, 1.00);
			}
			return { actionType: 'weak-hit', charge: charge, dir: 0.0, allowHit: true };
		}
		else if(command === 'jump') {
			dir = 0.0;
			charge = 0.0;
			if(this._sim.currentTask === 'charge-jump') {
				charge = Math.min(1.0, this._sim.currentTaskDuration);
				dir = this._chargedDir;
			}
			return { actionType: 'jump', x: this._sim.x, charge: charge, dir: dir };
		}
		return null;
	};
	Athlete.prototype.tick = function(t, tServer) {
		this._walkDuration += t;
		if(this._sim.currentTask === 'follow-waypoint' || this._sim.currentTask === 'reposition') {
			if(this._sim.vel.x > 0) {
				if(this._walkDir <= 0) {
					this._walkDir = 1;
					this._walkDuration = 0.0;
				}
			}
			else if(this._sim.vel.x < 0) {
				if(this._walkDir >= 0) {
					this._walkDir = -1;
					this._walkDuration = 0.0;
				}
			}
			else {
				this._walkDir = 0;
				this._walkDuration = 0.0;
			}
		}
		if(this._isPlayerControlled) {
			if(this._sim.currentTask === 'charge-jump') {
				this._chargedDir += 2.0 * t * this._moveDir;
				if(this._chargedDir > 1.0) { this._chargedDir = 1.0; }
				else if(this._chargedDir < -1.0) { this._chargedDir = -1.0; }
			}
			else {
				this._chargedDir = 0.0;
			}
			if(this._sim.currentTask === 'charge-jump' && this._sim.currentTaskDuration >= 2.0) {
				this._bufferCommand('jump', { charge: 1.0, dir: this._chargedDir });
			}
			else if(this._sim.currentTask === 'charge-spike' || this._sim.currentTask === 'charge-bump') {
				if(this._sim.currentTaskDuration >= 4 * SEC_PER_CHARGE_LEVEL) {
					this._bufferCommand('strong-hit', { charge: 1.0, dir: 0.0 }); //TODO
				}
			}
			//TODO
		}
		SUPERCLASS.prototype.tick.call(this, t, tServer);
	};
	Athlete.prototype.renderShadow = function(ctx) {
		var frame;
		if(SharedConstants.BOUNDS.FLOOR - this._sim.bottom > 175) { frame = 2; }
		else if(SharedConstants.BOUNDS.FLOOR - this._sim.bottom > 65) { frame = 1; }
		else { frame = 0; }

		//draw a shadow
		SHADOW_SPRITE.render(ctx, null,
			this._sim.centerX - SHADOW_SPRITE.width / 2,
			SharedConstants.BOUNDS.FLOOR - SHADOW_SPRITE.height, frame, false);

		SUPERCLASS.prototype.renderShadow.call(this, ctx);
	};
	Athlete.prototype.render = function(ctx) {
		var fireFrame, swingFrame;

		//draw a server ghost
		if(Constants.DEBUG_RENDER_SERVER_GHOSTS) {
			this._renderSim(ctx, this._serverSim, SERVER_GHOST_SPRITE, 'rgba(0, 255, 255, 0.25');
		}

		//draw future ghost
		if(Constants.DEBUG_RENDER_FUTURE_GHOSTS) {
			this._renderSim(ctx, this._futureSim, FUTURE_GHOST_SPRITE, null);
		}

		//draw the sprite
		this._renderSim(ctx, this._sim, SPRITE, 'rgba(255, 0, 0, 0.5');

		if(this._sim.currentTask === 'charge-spike') {
			if(this._sim.currentTaskDuration < SEC_PER_CHARGE_LEVEL) { fireFrame = 0 * 6; }
			else if(this._sim.currentTaskDuration < 2 * SEC_PER_CHARGE_LEVEL) { fireFrame = 1 * 6; }
			else if(this._sim.currentTaskDuration < 3 * SEC_PER_CHARGE_LEVEL) { fireFrame = 2 * 6; }
			else { fireFrame = 3 * 6; }
			CHARGE_FIRE_SPRITE.render(ctx, null, this._sim.x, this._sim.y, fireFrame +
				Math.floor(this._sim.currentTaskDuration / (SEC_PER_CHARGE_LEVEL / 6)) % 6);
		}
		else if(this._sim.currentTask === 'charge-bump') {
			if(this._sim.currentTaskDuration < SEC_PER_CHARGE_LEVEL) { fireFrame = 0 * 10; }
			else if(this._sim.currentTaskDuration < 2 * SEC_PER_CHARGE_LEVEL) { fireFrame = 1 * 10; }
			else if(this._sim.currentTaskDuration < 3 * SEC_PER_CHARGE_LEVEL) { fireFrame = 2 * 10; }
			else { fireFrame = 3 * 10; }
			BUMP_EFFECTS_SPRITE.render(ctx, null, this._sim.x, this._sim.y, fireFrame +
				Math.floor(this._sim.currentTaskDuration / (SEC_PER_CHARGE_LEVEL / 6)) % 6);
		}
		//TODO

		if(this._sim.currentTask === 'spike') {
			swingFrame = Math.floor(this._sim.currentTaskDuration / 0.06);
			if(swingFrame <= 4) {
				if(this._sim.currentTaskDetails.charge < 0.25) { swingFrame += 0; }
				else if(this._sim.currentTaskDetails.charge < 0.50) { swingFrame += 1 * 8; }
				else if(this._sim.currentTaskDetails.charge < 0.75) { swingFrame += 2 * 8; }
				else { swingFrame += 3 * 8; }
				SWIPE_FIRE_SPRITE.render(ctx, null, this._sim.x, this._sim.y,
					swingFrame);
			}
		}
		else if(this._sim.currentTask === 'bump') {
			swingFrame = Math.floor(this._sim.currentTaskDuration / 0.06);
			if(swingFrame <= 3) {
				if(this._sim.currentTaskDetails.charge < 0.25) { swingFrame += 0; }
				else if(this._sim.currentTaskDetails.charge < 0.50) { swingFrame += 1 * 10; }
				else if(this._sim.currentTaskDetails.charge < 0.75) { swingFrame += 2 * 10; }
				else { swingFrame += 3 * 10; }
				BUMP_EFFECTS_SPRITE.render(ctx, null, this._sim.x, this._sim.y,
					6 + swingFrame);
			}
		}
		//TODO

		//draw little trajectory dots
		if(this._isPlayerControlled && this._sim.currentTask === 'charge-jump' &&
			this._sim.currentTaskDuration > 0.15) {
			var charge = Math.min(this._sim.currentTaskDuration, 1.00);
			CURSOR_SPRITE.render(ctx, null,
				this._sim.centerX - CURSOR_SPRITE.width / 2 + this._chargedDir * 20,
				this._sim.top - 15 * (1 + charge), 0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._sim.centerX - CURSOR_SPRITE.width / 2 + this._chargedDir * 35,
				this._sim.top - 30 * (1 + charge), 0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._sim.centerX - CURSOR_SPRITE.width / 2 + this._chargedDir * 50,
				this._sim.top - 42 * (1 + charge), 0, false);
			CURSOR_SPRITE.render(ctx, null,
				this._sim.centerX - CURSOR_SPRITE.width / 2 + this._chargedDir * 65,
				this._sim.top - 51 * (1 + charge), 0, false);
		}

		SUPERCLASS.prototype.render.call(this, ctx);
	};
	Athlete.prototype._renderSim = function(ctx, sim, sprite, hitboxColor) {
		var frame;
		if(sim.isAirborne()) {
			if(sim.currentTask === 'charge-spike') {
				frame = 0 + 6 * 6;
			}
			else if(sim.currentTask === 'spike') {
				frame = Math.min(1 + Math.floor(sim.currentTaskDuration / 0.06), 4) + 6 * 6;
			}
			else if(sim.currentTask === 'spike-success') {
				frame = (sim.currentTaskDuration > 0.5 ? 3 : 2) + 7 * 6;
			}
			else if(sim.currentTask === 'charge-block') {
				frame = 0 + 10 * 6;
			}
			else if(sim.currentTask === 'block') {
				if(sim.currentTaskDuration > 0.5) {
					frame = 3 + 10 * 6;
				}
				else {
					frame = Math.min(1 + Math.floor(sim.currentTaskDuration / 0.10), 2) + 10 * 6;
				}
			}
			else if(sim.currentTask === 'block-success') {
				if(sim.currentTaskDuration > 0.5) {
					frame = 4 + 10 * 6;
				}
				else {
					frame = 2 + 10 * 6;
				}
			}
			else if(sim.vel.y < 100) {
				frame = 1 + 3 * 6;
			}
			else {
				frame = 2 + 3 * 6;
			}
		}
		else if(this._sim.currentTask === 'charge-bump') {
			frame = 0 + 4 * 6;
		}
		else if(this._sim.currentTask === 'bump') {
			frame = Math.min(1 + Math.floor(sim.currentTaskDuration / 0.06), 4) + 4 * 6;
		}
		else if(this._sim.currentTask === 'bump-success') {
			if(sim.currentTaskDuration > 0.5) {
				frame = 4 + 5 * 6;
			}
			else if(sim.currentTaskDuration > 0.2) {
				frame = 3 + 5 * 6;
			}
			else {
				frame = 2 + 5 * 6;
			}
		}
		else if(this._sim.currentTask === 'charge-set') {
			frame = 0 + 8 * 6;
		}
		else if(this._sim.currentTask === 'set') {
			frame = Math.min(1 + Math.floor(sim.currentTaskDuration / 0.10), 4) + 8 * 6;
		}
		else if(this._sim.currentTask === 'set-success') {
			if(sim.currentTaskDuration > 0.5) {
				frame = 4 + 9 * 6;
			}
			else if(sim.currentTaskDuration > 0.2) {
				frame = 3 + 9 * 6;
			}
			else {
				frame = 2 + 9 * 6;
			}
		}
		else if(sim.currentTask === 'land-from-jump') {
			frame = 3 + 3 * 6;
		}
		else if(sim.currentTask === 'follow-waypoint' || sim.currentTask === 'reposition') {
			if(sim.vel.x > 0) {
				frame = Math.floor(this._walkDuration / 0.25) % 4 + 1 * 6;
			}
			else if(sim.vel.x < 0) {
				frame = Math.floor(this._walkDuration / 0.25) % 4 + 2 * 6;
			}
			else {
				frame = 0 + 0 * 6;
			}
		}
		else if(sim.currentTask === 'charge-jump') {
			frame = 0 + 3 * 6;
		}
		else {
			frame = 0 + 0 * 6;
		}

		var jiggleX = 0;
		var jiggleY = 0;
		if(sim.freezeTime > 0) {
			jiggleX = 3 * Math.random() - 3 / 2;
			jiggleY = 3 * Math.random() - 3 / 2;
		}

		sprite.render(ctx, null,
			sim.centerX - sprite.width / 2 + jiggleX,
			sim.bottom - sprite.height + jiggleY, frame, false);

		//draw hitboxes
		if(hitboxColor && Constants.DEBUG_RENDER_HITBOXES) {
			for(var i = 0; i < sim.hitboxes.length; i++) {
				sim.hitboxes[i].render(ctx, hitboxColor);
			}
		}
	};
	Athlete.prototype.checkForBallHit = function(ball) {
		var hit = this._sim.checkForBallHit(ball.id, ball._sim);
		if(hit) {
			hit.actionType = 'get-hit';
			hit.freezeTime = 0.2;
			this._sim.performAction({
				actionType: 'hit-success',
				freezeTime: 0.2,
				charge: hit.charge
			});
			this._sendCommand('suggest-hit-success', {
				actionType: 'hit-success',
				freezeTime: 0.2,
				charge: hit.charge,
				ballPos: { x: ball._sim.x, y: ball._sim.y }
			})
			ball.forcePerformAction(hit);
		}
	};
	Athlete.prototype.checkForNet = function(net) {
		this._sim.checkForNet(net._sim);
		this._serverSim.checkForNet(net._serverSim);
	};
	return Athlete;
});