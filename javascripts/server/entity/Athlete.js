define([
	'server/entity/Entity',
	'shared/sim/Athlete'
], function(
	SUPERCLASS,
	AthleteSim
) {
	function Athlete(params) {
		SUPERCLASS.call(this, 'Athlete', AthleteSim, params);
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	//TODO server should automatically cause players to jump
	Athlete.prototype._generateActionFromCommand = function(command, action) {
		var charge, dir;
		action = action || {};
		if(command === 'move-left') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof action.x === 'number' ? action.x : this._sim.x),
				dir: -1
			};
		}
		else if(command === 'move-right') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof action.x === 'number' ? action.x : this._sim.x),
				dir: 1
			};
		}
		else if(command === 'stop') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof action.x === 'number' ? action.x : this._sim.x),
				dir: 0
			};
		}
		else if(command === 'charge-jump') {
			return {
				actionType: 'charge-jump',
				x: (typeof action.x === 'number' ? action.x : this._sim.x),
			};
		}
		else if(command === 'jump') {
			charge = 0.0;
			dir = 0.0;
			if(this._sim.currentTask === 'charge-jump') {
				charge = Math.min(1.0, this._sim.currentTaskDuration);
			}
			if(typeof action.charge === 'number') {
				charge = Math.max(charge - 0.15, Math.min(action.charge, charge + 0.15));
			}
			if(typeof action.dir === 'number') {
				dir = action.dir;
				if(dir > 2 * charge || dir > 1.0) { dir = Math.min(1.0, 2 * charge); }
				else if(dir < -2 * charge || dir < -1.0) { dir = Math.max(-1.0, -2 * charge); }
			}
			return {
				actionType: 'jump',
				charge: Math.min(1.0, charge),
				dir: dir,
				x: (typeof action.x === 'number' ? action.x : this._sim.x)
			};
		}
		else if(command === 'charge-strong-hit') {
			return {
				actionType: 'charge-strong-hit'
			};
		}
		else if(command === 'strong-hit') {
			charge = 0.0;
			if(this._sim.currentTask === 'charge-spike') {
				charge = Math.min(this._sim.currentTaskDuration / 0.50 / 4, 1.00);
			}
			if(typeof action.charge === 'number') {
				charge = Math.max(charge - 0.15, Math.min(action.charge, charge + 0.15));
			}
			return { actionType: 'strong-hit', charge: charge, dir: 0.0 };
		}
		return null;
	};
	Athlete.prototype.checkForBallHit = function(ball) {
		var hit = this._sim.checkForBallHit(ball.id, ball._sim);
		if(hit) {
			hit.actionType = 'get-hit';
			hit.freezeTime = 0.2;
			ball.forcePerformAction(hit);
			this.forcePerformAction({ actionType: 'hit-success', freezeTime: 0.2 });
		}
	};
	Athlete.prototype.checkForNet = function(net) {
		this._sim.checkForNet(net._sim);
	};
	return Athlete;
});