define([
	'client/entity/Entity',
	'shared/entity/Player',
	'client/Constants',
	'shared/Constants'
], function(
	SUPERCLASS,
	PlayerSim,
	Constants,
	SharedConstants
) {
	function Player(id, state) {
		SUPERCLASS.call(this, id, PlayerSim, state);
		this._heldDir = 0;
		this._bufferedInput = null;
		this._bufferedInputTime = 0.0;
		this._inputBeingHeld = null;
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype._bufferInput = function(input, timeToBuffer) {
		this._bufferedInput = input;
		this._bufferedInputTime = timeToBuffer + 0.5 / SharedConstants.FRAME_RATE;
	};
	Player.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(this.isPlayerControlled()) {
			//changing directions
			if(evt.key === 'MOVE_LEFT') {
				this._heldDir = (evt.isDown ? -1 : (keyboard.MOVE_RIGHT ? 1 : 0));
			}
			else if(evt.key === 'MOVE_RIGHT') {
				this._heldDir = (evt.isDown ? 1 : (keyboard.MOVE_LEFT ? -1 : 0));
			}
			//charging/releasing a jump
			else if(evt.key === 'JUMP') {
				if(evt.isDown) {
					this._inputBeingHeld = 'CHARGE_JUMP';
				}
				else {
					if(this._inputBeingHeld === 'CHARGE_JUMP') {
						this._inputBeingHeld = null;
					}
					this._bufferInput('RELEASE_JUMP', 5 / 60);
				}
			}
			//charging/releasing strong hit (bump/spike)
			else if(evt.key === 'STRONG_HIT') {
				if(evt.isDown) {
					this._inputBeingHeld = 'CHARGE_STRONG_HIT';
				}
				else {
					if(this._inputBeingHeld === 'CHARGE_STRONG_HIT') {
						this._inputBeingHeld = null;
					}
					this._bufferInput('RELEASE_STRONG_HIT', 5 / 60);
				}
			}
			//charging/releasing weak hit (set/block)
			else if(evt.key === 'WEAK_HIT') {
				if(evt.isDown) {
					this._inputBeingHeld = 'CHARGE_WEAK_HIT';
				}
				else {
					if(this._inputBeingHeld === 'CHARGE_WEAK_HIT') {
						this._inputBeingHeld = null;
					}
					this._bufferInput('RELEASE_WEAK_HIT', 5 / 60);
				}
			}
		}
	};
	Player.prototype._applyBufferedInput = function() {
		//translate the buffered input into an action and perform it if able
		if(this._bufferedInput) {
			var action = null;
			if(this._bufferedInput === 'RELEASE_JUMP' &&
				this._sim.currentTask === 'charging-jump') {
				action = {
					actionType: 'release-jump',
					chargeTime: this._sim.currentTaskTime,
					dir: this._sim.aimPos
				};
			}
			else if(this._bufferedInput === 'RELEASE_STRONG_HIT' &&
				this._sim.currentTask === 'charging-hit' &&
				(this._sim.currentHit === 'spike' || this._sim.currentHit === 'bump')) {
				this._sim.performAction({
					actionType: 'release-hit',
					hit: this._sim.currentHit
				});
			}
			else if(this._bufferedInput === 'RELEASE_WEAK_HIT' &&
				this._sim.currentTask === 'charging-hit' &&
				(this._sim.currentHit === 'block' || this._sim.currentHit === 'set')) {
				this._sim.performAction({
					actionType: 'release-hit',
					hit: this._sim.currentHit
				});
			}
			if(this._tryToPerformAction(action)) {
				this._bufferedInput = null;
			}
		}

		//if we're holding down a button, we're waiting for an opportunity to charge
		if(this._inputBeingHeld === 'CHARGE_JUMP') {
			if(this._tryToPerformAction({
				actionType: 'charge-jump',
				x: this._sim.x,
				dir: this._heldDir
			})) {
				this._inputBeingHeld = null;
			}
		}
		else if(this._inputBeingHeld === 'CHARGE_STRONG_HIT') {
			if(this._tryToPerformAction({
				actionType: 'charge-hit',
				x: (this._sim.isJumping() ? null : this._sim.x),
				hit: (this._sim.isJumping() ? 'spike' : 'bump')
			})) {
				this._inputBeingHeld = null;
			}
		}
		else if(this._inputBeingHeld === 'CHARGE_WEAK_HIT') {
			if(this._tryToPerformAction({
				actionType: 'charge-hit',
				x: (this._sim.isJumping() ? null : this._sim.x),
				hit: (this._sim.isJumping() ? 'block' : 'set')
			})) {
				this._inputBeingHeld = null;
			}
		}

		//we're always trying to make the player walk in the direction being held
		if(!this._sim.isWalking() || this._sim.getEventualWalkDir() !== this._heldDir) {
			this._tryToPerformAction({
				actionType: 'follow-waypoint',
				x: this._sim.x,
				dir: this._heldDir
			});
		}

		//when the player is aiming, we adjust the aim direction to the direction being held
		if(this._sim.isAiming() && this._sim.getEventualAimDir() !== this._heldDir) {
			this._tryToPerformAction({
				actionType: 'aim',
				pos: this._sim.aimPos,
				dir: this._heldDir
			});
		}
	};
	Player.prototype.render = function(ctx) {
		if(Constants.DEBUG_DRAW_SERVER_GHOSTS) {
			//draw server "ghost"
			if(this._serverSim.currentTask === 'charging-jump') {
				ctx.strokeStyle = '#0ff';
			}
			else if(this._serverSim.currentTask === 'landing') {
				ctx.strokeStyle = '#0f0';
			}
			else if(this._serverSim.currentTask === 'charging-hit') {
				ctx.strokeStyle = '#b60';
			}
			else if(this._serverSim.currentTask === 'swinging') {
				ctx.strokeStyle = '#f90';
			}
			else {
				ctx.strokeStyle = (this._serverSim.team === 'red' ? '#f00' : '#00f');
			}
			ctx.lineWidth = 1;
			ctx.strokeRect(this._serverSim.x + 0.5, this._serverSim.y + 0.5,
				this._serverSim.width - 1, this._serverSim.height - 1);
			if(this._serverSim.isAiming()) {
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#ddd';
				ctx.beginPath();
				ctx.moveTo(this._serverSim.x + this._serverSim.width / 2,
					this._serverSim.y + this._serverSim.height / 2);
				ctx.lineTo(this._serverSim.x + this._serverSim.width / 2 +
					this._serverSim.aimPos * 100,
					this._serverSim.y + this._serverSim.height / 2 - 100);
				ctx.stroke();
			}
			if(this._serverSim.activeHitBoxes) {
				for(var i = 0; i < this._serverSim.activeHitBoxes.length; i++) {
					var hitBox = this._serverSim.activeHitBoxes[i];
					ctx.strokeStyle = 'rgba(255, 100, 0, 0.2)';
					ctx.lineWidth = 1;
					ctx.strokeRect(this._serverSim.x + this._serverSim.width / 2 +
						hitBox.offsetX,
						this._serverSim.y + this._serverSim.height / 2 +
						hitBox.offsetY,
						hitBox.width, hitBox.height);
				}
			}
		}

		//draw actual entity
		if(this._sim.currentTask === 'charging-jump') {
			ctx.fillStyle = '#0ff';
		}
		else if(this._sim.currentTask === 'landing') {
			ctx.fillStyle = '#0f0';
		}
		else if(this._sim.currentTask === 'charging-hit') {
			ctx.fillStyle = '#b60';
		}
		else if(this._sim.currentTask === 'swinging') {
			ctx.fillStyle = '#f90';
		}
		else {
			ctx.fillStyle = (this._sim.team === 'red' ? '#f00' : '#00f');
		}
		ctx.fillRect(this._sim.x, this._sim.y,
			this._sim.width, this._sim.height);
		if(this._sim.isAiming()) {
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#bbb';
			ctx.beginPath();
			ctx.moveTo(this._sim.x + this._sim.width / 2,
				this._sim.y + this._sim.height / 2);
			ctx.lineTo(this._sim.x + this._sim.width / 2 + this._sim.aimPos * 100,
				this._sim.y + this._sim.height / 2 - 100);
			ctx.stroke();
		}
		if(this._sim.activeHitBoxes) {
			for(var i = 0; i < this._sim.activeHitBoxes.length; i++) {
				var hitBox = this._sim.activeHitBoxes[i];
				ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
				ctx.fillRect(this._sim.x + this._sim.width / 2 + hitBox.offsetX,
					this._sim.y + this._sim.height / 2 + hitBox.offsetY,
					hitBox.width, hitBox.height);
			}
		}
	};
	Player.prototype.startOfFrame = function(t) {
		SUPERCLASS.prototype.startOfFrame.call(this, t);

		//client may have input as well
		if(this.isPlayerControlled()) {
			this._applyBufferedInput();
		}

		//if we've been charging a jump for a while, it may be time to auto-jump
		if(this.isPlayerControlled() && this._sim.currentTask === 'charging-jump' &&
				this._sim.currentTaskTime >= this._sim.absoluteMaxJumpChargeTime +
				0.5 / SharedConstants.FRAME_RATE) {
			this._tryToPerformAction({
				actionType: 'release-jump',
				chargeTime: this._sim.currentTaskTime,
				dir: this._sim.aimPos
			});
		}

		//if we've been charging a hit for a while, it may be time to auto-release the hit
		if(this.isPlayerControlled() && this._sim.currentTask === 'charging-hit' &&
				this._sim.currentTaskTime >= this._sim.swingChargeTime[this._sim.currentHit] +
				0.5 / SharedConstants.FRAME_RATE) {
			this._tryToPerformAction({
				actionType: 'release-hit',
				hit: this._sim.currentHit,
				chargeTime: this._sim.currentTaskTime
			});
		}
	};
	Player.prototype.endOfFrame = function(t) {
		SUPERCLASS.prototype.endOfFrame.call(this, t);

		//input may become unbuffered
		this._bufferedInputTime = Math.max(0.0, this._bufferedInputTime - t);
		if(this._bufferedInputTime <= 0.0) {
			this._bufferedInput = null;
		}
	};
	return Player;
});