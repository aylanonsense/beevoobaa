define([
	'shared/sim/LocatableTaskSim',
	'shared/Constants',
	'shared/hit/HitBox'
], function(
	SUPERCLASS,
	SharedConstants,
	HitBox
) {
	function Athlete(params, simType) {
		params.width = 28;
		params.height = 64;
		SUPERCLASS.call(this, params, simType);

		//constants (not synced)
		this.moveSpeed = 75;
		this.gravity = 95;
		this.minJumpSpeed = 50;
		this.maxJumpSpeed = 240;

		//team
		this.team = params.team || 'red';

		//hitboxes (deterministic based on other vars, no need to sync)
		this.hitboxes = [];

		//different for each sim
		this.hitboxLeeway = params.hitboxLeeway || false;

		this.ballsHitThisSwing = [];
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);
		state.ballsHitThisSwing = this.ballsHitThisSwing.slice(0);
		state.team = this.team;
		return state;
	};
	Athlete.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
		this.ballsHitThisSwing = state.ballsHitThisSwing.slice(0);
		this.team = state.team;
		this._recalculateHitboxes();
	};
	Athlete.prototype.isSwinging = function() {
		return this.currentTask === 'spike' || this.currentTask === 'bump' ||
				this.currentTask === 'set' || this.currentTask === 'block';
	};
	Athlete.prototype.startOfFrame = function(t) {
		if(!this.isSwinging() && this.ballsHitThisSwing.length > 0) {
			this.ballsHitThisSwing = [];
		}

		//stop animations that last a fixed amount of time
		var DURATIONS = {
			'land-from-jump': 0.50,
			'spike': 1.25,	'spike-success': 1.25,
			'bump': 1.25,	'bump-success': 1.25,
			'set': 1.25,	'set-success': 1.25,
			'block': 2.00,	'block-success': 1.50
		};
		var dur = DURATIONS[this.currentTask];
		if(dur && this.currentTaskDuration >= dur) {
			this._clearTask();
		}

		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	Athlete.prototype.tick = function(t) {
		//gravity
		if(this.freezeTime === 0) {
			this.vel.y += this.velMult * this.gravity * t;
		}

		//if the player is following a waypoint (moving or stationary) we need to change velocity
		if(this.currentTask === 'follow-waypoint') {
			this.currentTaskDetails.x += this.moveSpeed * this.currentTaskDetails.dir * t;
			if(this.currentTaskDetails.x > this.x) { this.vel.x = this.moveSpeed; }
			else if(this.currentTaskDetails.x < this.x) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//if the player is repositioning, it's sort of like following a waypoint
		if(this.currentTask === 'reposition') {
			if(this.currentTaskDetails.x > this.x) { this.vel.x = this.moveSpeed; }
			else if(this.currentTaskDetails.x < this.x) { this.vel.x = -this.moveSpeed; }
			else { this.vel.x = 0; }
		}

		//if the player jumps, that's just a matter of modifying velocity
		if(this.currentTask === 'jump') {
			this.vel.x = 100 * this.currentTaskDetails.dir;
			this.vel.y = -this.minJumpSpeed - (this.maxJumpSpeed - this.minJumpSpeed) *
				this.currentTaskDetails.charge;
			this._clearTask();
		}

		//move the character (apply velocity)
		var xBefore = this.x;
		var wasAirborne = this.isAirborne();
		SUPERCLASS.prototype.tick.call(this, t);

		//the player may be landing from a jump
		if(wasAirborne && this.isGrounded()) {
			this._clearTask();
			var mid = SharedConstants.BOUNDS.LEFT_WALL +
					(SharedConstants.BOUNDS.RIGHT_WALL - SharedConstants.BOUNDS.LEFT_WALL) / 2 ;
			if(this.team === 'red' && this.x > mid) {
				this.vel.y = -350;
				this.vel.x = -60;
			}
			else if(this.team === 'blue' && this.x < mid) {
				this.vel.y = -350;
				this.vel.x = 60;
			}
			else {
				this._setTask('land-from-jump', {}, 2);
				this.vel.x = 0;
			}
		}

		//we may have reached the waypoint, in which case (if it's stationary) we stop on it
		if(this.currentTask === 'follow-waypoint' && this.currentTaskDetails.dir === 0 &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this.vel.x = 0;
			this._clearTask();
		}

		//we do the same check but for repositioning
		if(this.currentTask === 'reposition' &&
			((xBefore <= this.currentTaskDetails.x && this.currentTaskDetails.x <= this.x) ||
			(xBefore >= this.currentTaskDetails.x && this.currentTaskDetails.x >= this.x))) {
			this.x = this.currentTaskDetails.x;
			this.vel.x = 0;
			var nextTask = this.currentTaskDetails.nextTask;
			this._clearTask();
			this._setTask(nextTask.task, nextTask.details, nextTask.priority);
		}

		this._recalculateHitboxes();
	};
	Athlete.prototype._createHitBox = function(params, flip) {
		if(flip) {
			return new HitBox({
				x: this.centerX - (params.x - this.centerX) - params.width,
				y: params.y,
				width: params.width,
				height: params.height
			})
		}
		else {
			return new HitBox(params);
		}
	};
	Athlete.prototype._recalculateHitboxes = function() {
		var flipped = this.team === 'blue';
		if(this.currentTask === 'spike' && 0.06 <= this.currentTaskDuration &&
			this.currentTaskDuration <= (this.hitboxLeeway ? 0.23 : 0.18)) {
			this.hitboxes = [ this._createHitBox({
				x: this.right - 20 + (this.hitboxLeeway ? -10 : 0),
				y: this.top - 40 + (this.hitboxLeeway ? -10 : 0),
				width: 75 + (this.hitboxLeeway ? 20 : 0),
				height: 75 + (this.hitboxLeeway ? 20 : 0)
			}, flipped) ];
		}
		else if(this.currentTask === 'bump' && 0.06 <= this.currentTaskDuration &&
			this.currentTaskDuration <= (this.hitboxLeeway ? 0.23 : 0.18)) {
			this.hitboxes = [ this._createHitBox({
				x: this.right - 20 + (this.hitboxLeeway ? -10 : 0),
				y: this.top - 20 + (this.hitboxLeeway ? -10 : 0),
				width: 65 + (this.hitboxLeeway ? 20 : 0),
				height: 60 + (this.hitboxLeeway ? 20 : 0)
			}, flipped) ];
		}
		else if(this.currentTask === 'set' && 0.10 <= this.currentTaskDuration &&
			this.currentTaskDuration <= (this.hitboxLeeway ? 0.25 : 0.20)) {
			this.hitboxes = [ this._createHitBox({
				x: this.centerX - 25 + (this.hitboxLeeway ? -10 : 0),
				y: this.top - 45 + (this.hitboxLeeway ? -10 : 0),
				width: 60 + (this.hitboxLeeway ? 20 : 0),
				height: 50 + (this.hitboxLeeway ? 20 : 0)
			}, flipped) ];
		}
		else if(this.currentTask === 'block' && 0.10 <= this.currentTaskDuration &&
			this.currentTaskDuration <= (this.hitboxLeeway ? 0.45 : 0.40)) {
			this.hitboxes = [ this._createHitBox({
				x: this.right - 15 + (this.hitboxLeeway ? -10 : 0),
				y: this.top - 30 + (this.hitboxLeeway ? -10 : 0),
				width: 40 + (this.hitboxLeeway ? 20 : 0),
				height: 80 + (this.hitboxLeeway ? 20 : 0)
			}, flipped) ];
		}
		else {
			this.hitboxes = [];
		}
	};
	Athlete.prototype.endOfFrame = function(t) {
		//increment timers (any task I'm ending with counts as being active for the whole frame)
		if(this.currentTask !== null) {
			this.currentTaskDuration += t;
		}

		SUPERCLASS.prototype.endOfFrame.call(this, t);
	};
	Athlete.prototype.performAction = function(action) {
		var allowHit;

		//moving
		if(action.actionType === 'follow-waypoint' && this.isGrounded()) {
			if(this.currentTask === 'follow-waypoint') { this._clearTask(); }
			return this._setTask('follow-waypoint', {
				x: action.x || 0,
				dir: action.dir || 0
			}, 6);
		}

		//getting ready to jump
		else if(action.actionType === 'charge-jump' && this.isGrounded()) {
			this.vel.x = 0;
			return this._repositionAndSetTask(action.x, 'charge-jump', {}, 5);
		}

		//jumping
		else if(action.actionType === 'jump' && this.isGrounded()) {
			if(this.currentTask === 'charge-jump') { this._clearTask(); }
			return this._repositionAndSetTask(action.x, 'jump', {
				charge: action.charge || 0,
				dir: action.dir || 0
			}, 5);
		}

		//hit the ball
		else if(action.actionType === 'charge-weak-hit') {
			if(this.isAirborne()) {
				return this._setTask('charge-block', { allowHit: action.allowHit || false }, 5);
			}
			else {
				this.vel.x = 0;
				return this._setTask('charge-set', { allowHit: action.allowHit || false }, 5);
			}
		}
		else if(action.actionType === 'charge-strong-hit') {
			if(this.isAirborne()) {
				return this._setTask('charge-spike', { allowHit: action.allowHit || false }, 5);
			}
			else {
				this.vel.x = 0;
				return this._setTask('charge-bump', { allowHit: action.allowHit || false }, 5);
			}
		}
		else if(action.actionType === 'weak-hit') {
			allowHit = action.allowHit || false;
			if(this.isAirborne()) {
				if(this.currentTask === 'charge-block') {
					allowHit = allowHit || this.currentTaskDetails.allowHit;
					this._clearTask();
				}
				return this._setTask('block', {
					allowHit: allowHit,
					charge: action.charge || 0,
					dir: action.dir || 0
				}, 5);
			}
			else {
				if(this.currentTask === 'charge-set') {
					allowHit = allowHit || this.currentTaskDetails.allowHit;
					this._clearTask();
				}
				return this._setTask('set', {
					allowHit: allowHit,
					charge: action.charge || 0,
					dir: action.dir || 0
				}, 5);
			}
		}
		else if(action.actionType === 'strong-hit') {
			allowHit = action.allowHit || false;
			if(this.isAirborne()) {
				if(this.currentTask === 'charge-spike') {
					allowHit = allowHit || this.currentTaskDetails.allowHit;
					this._clearTask();
				}
				return this._setTask('spike', {
					allowHit: allowHit,
					charge: action.charge || 0,
					dir: action.dir || 0
				}, 5);
			}
			else {
				if(this.currentTask === 'charge-bump') {
					allowHit = allowHit || this.currentTaskDetails.allowHit;
					this._clearTask();
				}
				return this._setTask('bump', {
					allowHit: allowHit,
					charge: action.charge || 0,
					dir: action.dir || 0
				}, 5);
			}
		}
		else if(action.actionType === 'hit-success') {
			if(this.currentTask === 'spike') {
				this._clearTask();
				if(this.team === 'red') {
					if(this.vel.x > -50) { this.vel.x = -50; }
				}
				else {
					if(this.vel.x < 50) { this.vel.x = 50; }
				}
				if(this.vel.y > -100) { this.vel.y = -100; }
				this.freezeTime = action.freezeTime;
				this._setTask('spike-success', { charge: action.charge }, 5);
			}
			else if(this.currentTask === 'block') {
				this._clearTask();
				this.freezeTime = action.freezeTime;
				this._setTask('block-success', { charge: action.charge }, 5);
			}
			else if(this.currentTask === 'bump') {
				this._clearTask();
				this.freezeTime = action.freezeTime;
				this._setTask('bump-success', { charge: action.charge }, 5);
			}
			else if(this.currentTask === 'set') {
				this._clearTask();
				this.freezeTime = action.freezeTime;
				this._setTask('set-success', { charge: action.charge }, 5);
			}
		}

		return false;
	};
	Athlete.prototype.checkForBallHit = function(ballId, ball) {
		var flipped = (this.team === 'blue');
		var flippable = true;
		if(this.ballsHitThisSwing.indexOf(ballId) === -1) {
			for(var i = 0; i < this.hitboxes.length; i++) {
				if(this.hitboxes[i].isOverlappingBall(ball)) {
					if(!this.currentTaskDetails.allowHit) {
						console.log("Hit rejected because player is not allowed to hit");
						return null;
					}
					this.ballsHitThisSwing.push(ballId);
					var charge = this.currentTaskDetails.charge;
					var level, velX, velY;
					if(charge >= 0.75) { level = 3; }
					else if(charge >= 0.50) { level = 2; }
					else if(charge >= 0.25) { level = 1; }
					else { level = 0; }
					if(this.currentTask === 'spike') {
						if(charge >= 0.75) { velX = 190; velY = 250; }
						else if(charge >= 0.50) { velX = 160; velY = 200; }
						else if(charge >= 0.25) { velX = 130; velY = 140; }
						else { velX = 70; velY = 25; }
					}
					else if(this.currentTask === 'bump') {
						if(charge >= 0.75) { velX = ball.vel.x + 80; velY = -150; }
						else if(charge >= 0.50) { velX = ball.vel.x + 60; velY = -100; }
						else if(charge >= 0.25) { velX = ball.vel.x + 40; velY = -80; }
						else { velX = ball.vel.x + 25; velY = -50; }
						flippable = false;
					}
					else if(this.currentTask === 'set') {
						if(charge >= 0.75) {
							velX = (Math.abs(ball.vel.x) < 50 ? ball.vel.x * 0.10 : ball.vel.x * 0.70);
							velY = -120;
						}
						else if(charge >= 0.50) {
							velX = (Math.abs(ball.vel.x) < 50 ? ball.vel.x * 0.20 : ball.vel.x * 0.80);
							velY = -100;
						}
						else if(charge >= 0.25) {
							velX = (Math.abs(ball.vel.x) < 50 ? ball.vel.x * 0.40 : ball.vel.x * 0.90);
							velY = -85;
						}
						else {
							velX = (Math.abs(ball.vel.x) < 50 ? ball.vel.x * 0.50 : ball.vel.x * 1.00);
							velY = -60;
						}
						flippable = false;
					}
					else if(this.currentTask === 'block') {
						if(charge >= 0.75) { velX = 60; velY = 20; }
						else if(charge >= 0.50) { velX = 40; velY = 10; }
						else if(charge >= 0.25) { velX = 20; velY = 5; }
						else { velX = 0; velY = 0; }
					}
					return {
						vel: { x: (flipped && flippable ? -velX : velX), y: velY },
						charge: charge,
						level: level
					};
				}
			}
		}
		return null;
	};
	Athlete.prototype.checkForNet = function(net) {
		if(this.isGrounded() && this.left < net.right + 10 && net.left - 10 < this.right) {
			if(this.centerX < net.centerX) {
				this.right = net.left - 10;
				this.vel.x = 0;
			}
			else {
				this.left = net.right + 10;
				this.vel.x = 0;
			}
			if(this.currentTask === 'follow-waypoint' || this.currentTask === 'reposition') {
				this._clearTask();
			}
		}
		else if(this.isAirborne() && this.left < net.right &&
			net.left < this.right && this.bottom > net.top) {
			if(this.vel.y > 0 && this.bottom - 15 < net.top) {
				this.vel.y *= -1;
			}
			else {
				if(this.centerX < net.centerX) {
					this.right = net.left;
					if(this.vel.x > 0) { this.vel.x *= -0.3; }
				}
				else {
					this.left = net.right;
					if(this.vel.x < 0) { this.vel.x *= -0.3; }
				}
			}
		}
	};
	Athlete.prototype._repositionAndSetTask = function(x, task, details, priority) {
		if(this.x !== x) {
			return this._setTask('reposition', {
				x: x,
				nextTask: { task: task, details: details, priority: priority }
			}, priority);
		}
		else {
			return this._setTask(task, details, priority);
		}
	};
	Athlete.prototype._onHitWall = function(x, y) {
		if(x > 0 && this.vel.x > 0) {
			this.vel.x *= -0.3;
		}
		else if(x < 0 && this.vel.x < 0) {
			this.vel.x *= -0.3;
		}
		if(y > 0 && this.vel.y > 0) {
			this.vel.y = 0;
		}
		else if(y < 0 && this.vel.y < 0) {
			this.vel.y = 0;
		}
	};
	return Athlete;
});