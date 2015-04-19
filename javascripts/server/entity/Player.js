define([
	'server/entity/Entity',
	'shared/entity/Player',
	'shared/utils/capValue',
	'shared/Constants'
], function(
	SUPERCLASS,
	PlayerSim,
	capValue,
	SharedConstants
) {
	function Player(x, team) {
		SUPERCLASS.call(this, 'Player', PlayerSim);
		this._sim.x = x;
		this._sim.team = team;
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.getTeam = function() {
		return this._sim.team;
	};
	Player.prototype.startOfFrame = function(t) {
		SUPERCLASS.prototype.startOfFrame.call(this, t);

		//if we've been charging a jump for a while, it may be time to auto-jump
		if(this._sim.currentTask === 'charging-jump' &&
			this._sim.currentTaskTime >= this._sim.absoluteMaxJumpChargeTime + 2.5 / SharedConstants.FRAME_RATE) {
			//automatically release jump
			this._tryToPerformAction({
				actionType: 'release-jump',
				chargeTime: this._sim.currentTaskTime,
				dir: this._sim.aimPos
			});
		}
	};
	Player.prototype._translateClientActionToServerAction = function(action) {
		if(action.actionType === 'follow-waypoint') {
			return { actionType: 'follow-waypoint', x: action.x, dir: action.dir };
		}
		else if(action.actionType === 'charge-jump') {
			return {
				actionType: 'charge-jump',
				x: capValue(this._sim.x - 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE,
					action.x, this._sim.x + 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE),
				dir: action.dir
			};
		}
		else if(action.actionType === 'release-jump') {
			return {
				actionType: 'release-jump',
				chargeTime: (this._sim.currentTask !== 'charging-jump' ? 0.0 :
					capValue(this._sim.currentTaskTime - 2 / SharedConstants.FRAME_RATE,
						action.chargeTime, this._sim.currentTaskTime + 2 / SharedConstants.FRAME_RATE)),
				dir: capValue(this._sim.aimPos - 2 * this._sim.aimSpeed / SharedConstants.FRAME_RATE,
					action.dir, this._sim.aimPos + 2 * this._sim.aimSpeed / SharedConstants.FRAME_RATE),
			};
		}
		else if(action.actionType === 'aim') {
			return { actionType: 'aim', pos: action.pos, dir: action.dir };
		}
		else if(action.actionType === 'charge-hit') {
			return {
				actionType: 'charge-hit',
				hit: action.hit,
				x: (this._sim.isJumping() ? null : (action.x === null ? this._sim.x :
					capValue(this._sim.x - 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE,
						action.x, this._sim.x + 2 * this._sim.moveSpeed / SharedConstants.FRAME_RATE))),
			};
		}
		else if(action.actionType === 'release-hit') {
			return {
				actionType: 'release-hit',
				hit: action.hit,
				chargeTime: (this._sim.currentTask === 'charging-hit' &&
					action.hit === this._sim.currentHit ? 0.0 :
					capValue(this._sim.currentTaskTime - 2 / SharedConstants.FRAME_RATE,
						action.chargeTime, this._sim.currentTaskTime + 2 / SharedConstants.FRAME_RATE)),
			};
		}
		else {
			return null;
		}
	};
	return Player;
});