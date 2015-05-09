define([
	'shared/utils/EventHelper',
	'client/net/GameConnection',
	'client/input/Keyboard'
], function(
	EventHelper,
	GameConnection,
	Keyboard
) {
	var BUFFER_TIME = 5 / 60;
	function EventGenerator(simulation) {
		this._events = new EventHelper([ 'event' ]);
		this._simulation = simulation;
		this._dirX = 0;
		this._heldInput = null;
		this._bufferedInput = null;
		this._bufferedInputTimeRemaining = null;
		var self = this;
		Keyboard.on('key-event', function(key, isDown, keyboard) {
			self._onKeyboardEvent(key, isDown, keyboard);
		});
	}
	EventGenerator.prototype.reset = function() {};
	EventGenerator.prototype._onKeyboardEvent = function(key, isDown, keyboard) {
		//get player entity
		var playableEntityId = GameConnection.data.playableEntityId;
		if(typeof playableEntityId !== 'number') { return; }
		var entity = this._simulation.getEntityById(playableEntityId);

		if(key === 'LEFT') {
			this._dirX = (isDown ? -1 : (keyboard.RIGHT ? 1 : 0));
			if(isDown) {
				this._unbufferInput();
			}
		}
		else if(key === 'RIGHT') {
			this._dirX = (isDown ? 1 : (keyboard.LEFT ? -1 : 0));
			if(isDown) {
				this._unbufferInput();
			}
		}
		else if(key === 'JUMP' && isDown) {
			this._heldInput = 'JUMP';
			this._unbufferInput();
			if(this._tryToChargeJump(entity)) {
				this._heldInput = null;
			}
		}
		else if(key === 'JUMP' && !isDown) {
			if(this._heldInput === 'JUMP') {
				this._heldInput = null;
			}
			//release jump
			if(this._tryToReleaseJump(entity)) {
				this._unbufferInput();
			}
		}
		else if(key === 'STRONG_HIT' && isDown) {
			this._heldInput = 'STRONG_HIT';
			this._unbufferInput();
			if(this._tryToChargeStrongHit(entity)) {
				this._heldInput = null;
			}
		}
		else if(key === 'STRONG_HIT' && !isDown) {
			if(this._heldInput === 'STRONG_HIT') {
				this._heldInput = null;
			}
			//release jump
			if(this._tryToReleaseStrongHit(entity)) {
				this._unbufferInput();
			}
		}
		else if(key === 'WEAK_HIT' && isDown) {
			this._heldInput = 'WEAK_HIT';
			this._unbufferInput();
			if(this._tryToChargeWeakHit(entity)) {
				this._heldInput = null;
			}
		}
		else if(key === 'WEAK_HIT' && !isDown) {
			if(this._heldInput === 'WEAK_HIT') {
				this._heldInput = null;
			}
			//release jump
			if(this._tryToReleaseWeakHit(entity)) {
				this._unbufferInput();
			}
		}
	};
	EventGenerator.prototype._bufferInput = function(input) {
		this._bufferedInput = input;
		this._bufferedInputTimeRemaining = BUFFER_TIME + 0.5 / sharedConfig.FRAME_RATE;
	};
	EventGenerator.prototype._unbufferInput = function() {
		this._bufferedInput = null;
		this._bufferedInputTimeRemaining = null;
	};
	EventGenerator.prototype.tick = function(t) {
		//unbuffer input that's been buffered for a while
		if(this._bufferedInputTimeRemaining !== null) {
			this._bufferedInputTimeRemaining -= t;
			if(this._bufferedInputTimeRemaining <= 0) {
				this._bufferedInput = null;
				this._bufferedInputTimeRemaining = null;
			}
		}

		//get player entity
		var playableEntityId = GameConnection.data.playableEntityId;
		if(typeof playableEntityId !== 'number') { return; }
		var entity = this._simulation.getEntityById(playableEntityId);

		//get all hittable balls
		var balls = this._simulation.entities.filter(function(entity) {
			return entity.entityType === 'Ball';
		});

		//try to charge a jump
		if(this._heldInput === 'JUMP') {
			if(this._tryToChargeJump(entity)) {
				this._heldInput = null;
			}
		}
		//try to charge a swing
		else if(this._heldInput === 'STRONG_HIT') {
			if(this._tryToChargeStrongHit(entity)) {
				this._heldInput = null;
			}
		}
		else if(this._heldInput === 'WEAK_HIT') {
			if(this._tryToChargeWeakHit(entity)) {
				this._heldInput = null;
			}
		}
		//try to change walk direction
		if(entity.canWalk() && (!entity.isWalking() || entity.getWalkDir() !== this._dirX)) {
			this._tryToWalk(entity, this._dirX);
		}
		//try to change aim direction
		if(entity.isAiming() && entity.isAimingHorizontally() &&
			entity.getAimDir() !== this._dirX) {
			this._tryToAim(entity, this._dirX);
		}
		//try to hit balls
		for(var i = 0; i < balls.length; i++) {
			if(this._tryToHitBall(entity, balls[i])) {
				break;
			}
		}
	};
	EventGenerator.prototype._tryToWalk = function(player, dir) {
		return this._tryEntityAction(player, {
			type: 'walk',
			x: player.x,
			walkWaypoint: player.x,
			walkWaypointChange: dir
		});
	};
	EventGenerator.prototype._tryToAim = function(player, dir) {
		return this._tryEntityAction(player, {
			type: 'aim',
			aimWaypoint: player.aim,
			aimWaypointChange: dir
		});
	};
	EventGenerator.prototype._tryToChargeJump = function(player) {
		return this._tryEntityAction(player, {
			type: 'charge-jump',
			x: player.x
		});
	};
	EventGenerator.prototype._tryToReleaseJump = function(player) {
		return this._tryEntityAction(player, {
			type: 'release-jump',
			x: player.x,
			charge: player.charge,
			aim: player.aim
		});
	};
	EventGenerator.prototype._tryToChargeStrongHit = function(player) {
		if(player.isGrounded()) {
			return this._tryEntityAction(player, {
				type: 'charge-swing',
				swingType: 'bump',
				x: player.x
			});
		}
		else {
			return this._tryEntityAction(player, {
				type: 'charge-swing',
				swingType: 'spike'
			});
		}
	};
	EventGenerator.prototype._tryToReleaseStrongHit = function(player) {
		if(player.isGrounded()) {
			return this._tryEntityAction(player, {
				type: 'release-swing',
				swingType: 'bump',
				charge: player.charge,
				aim: player.aim,
				x: player.x
			});
		}
		else {
			return this._tryEntityAction(player, {
				type: 'release-swing',
				swingType: 'spike',
				charge: player.charge,
				aim: player.aim
			});
		}
	};
	EventGenerator.prototype._tryToChargeWeakHit = function(player) {
		if(player.isGrounded()) {
			return this._tryEntityAction(player, {
				type: 'charge-swing',
				swingType: 'set',
				x: player.x
			});
		}
		else {
			return this._tryEntityAction(player, {
				type: 'charge-swing',
				swingType: 'block'
			});
		}
	};
	EventGenerator.prototype._tryToReleaseWeakHit = function(player) {
		if(player.isGrounded()) {
			return this._tryEntityAction(player, {
				type: 'release-swing',
				swingType: 'set',
				charge: player.charge,
				aim: player.aim,
				x: player.x
			});
		}
		else {
			return this._tryEntityAction(player, {
				type: 'release-swing',
				swingType: 'block',
				charge: player.charge,
				aim: player.aim
			});
		}
	};
	EventGenerator.prototype._tryToHitBall = function(player, ball) {
		var hit = player.checkForHit(ball);
		if(hit) {
			this._events.trigger('event', {
				type: 'player-hit-ball',
				playerId: player.entityId,
				playerX: player.x,
				playerY: player.y,
				playerSwingType: player.swingType,
				playerCharge: player.charge,
				playerAim: player.aim,
				hit: hit,
				ballId: ball.entityId,
				ballX: ball.x,
				ballY: ball.y,
				ballVelX: ball.velX,
				ballVelY: ball.velY
			});
			return true;
		}
		else {
			return false;
		}
	};
	EventGenerator.prototype._tryEntityAction = function(entity, action) {
		if(entity.canPerformAction(action)) {
			this._events.trigger('event', {
				type: 'perform-entity-action',
				entityId: entity.entityId,
				action: action
			});
			return true;
		}
		else {
			return false;
		}
	};
	EventGenerator.prototype.on = function(eventName, callback) {
		this._events.on(eventName, callback);
	};
	return EventGenerator;
});