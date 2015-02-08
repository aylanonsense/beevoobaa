define([
	'server/entity/EntityX',
	'shared/sim/AthleteX'
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
			var charge = 0.0;
			if(this._sim.currentTask === 'charge-jump') {
				charge = Math.min(1.0, this._sim.currentTaskDuration);
			}
			if(typeof action.charge === 'number') {
				charge = Math.max(charge - 0.15, Math.min(action.charge, charge + 0.15));
			}
			return {
				actionType: 'jump',
				charge: Math.min(1.0, charge),
				dir: 0.0, //TODO
				x: (typeof action.x === 'number' ? action.x : this._sim.x)
			};
		}
		return null;
	};
	return Athlete;
});