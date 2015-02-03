define([
	'server/entity/Entity',
	'shared/sim/Player',
	'performance-now'
], function(
	SUPERCLASS,
	PlayerSim,
	now
) {
	function Player(params) {
		SUPERCLASS.call(this, 'Player', PlayerSim, params);
		this._stopAtX = null;
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.tick = function(t) {
		//we might be trying to get somewhere
		if(this._stopAtX !== null) {
			//if we need to move right to get there, move right
			if(this._sim.x < this._stopAtX) {
				if(this._sim.moveDir <= 0) {
					this._sim.moveDir = 1;
					this.sendUpdate();
				}
			}
			//if we need to move left to get there, move left
			else if(this._sim.x > this._stopAtX) {
				if(this._sim.moveDir >= 0) {
					this._sim.moveDir = -1;
					this.sendUpdate();
				}
			}
			//if we're there, then stop
			else {
				if(this._sim.moveDir !== 0) {
					this._sim.moveDir = 0;
					this.sendUpdate();
				}
				this._stopAtX = null;
			}
		}

		//move!
		var beforeX = this._sim.x;
		SUPERCLASS.prototype.tick.call(this, t);
		var afterX = this._sim.x;

		//we might have gotten somewhere we're trying to get
		if(this._stopAtX !== null) {
			if((beforeX <= this._stopAtX && this._stopAtX <= afterX) ||
				(beforeX >= this._stopAtX && this._stopAtX >= afterX)) {
				this._sim.x = this._stopAtX;
				this._sim.moveDir = 0;
				this._stopAtX = null;
				this.sendUpdate();
			}
		}
	};
	Player.prototype.handleAction = function(action) {
		if(action.actionType === 'change-dir') {
			//if we are asked to move right, move right
			if(action.dir > 0) {
				this._stopAtX = null;
				if(this._sim.moveDir <= 0) {
					this._sim.moveDir = 1;
					this.sendUpdate();
				}
			}
			//if we are asked to move left, move left
			else if(action.dir < 0) {
				this._stopAtX = null;
				if(this._sim.moveDir >= 0) {
					this._sim.moveDir = -1;
					this.sendUpdate();
				}
			}
			//if we are asked to stop in place, we want to stop at the right place
			else {
				this._stopAtX = action.x;
			}
		}
		else if(action.actionType === 'charge-jump') {
			this._sim.chargeJump();
			this.sendUpdate();
		}
		else if(action.actionType === 'release-jump') {
			this._sim.releaseJump(action.jumpX, action.jumpY);
			this.sendUpdate();
		}
		else {
			console.log("Player unsure how to handle '" + action.actionType + "' action");
		}
	};
	return Player;
});