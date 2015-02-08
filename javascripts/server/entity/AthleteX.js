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
	Athlete.prototype._generateActionFromCommand = function(command, predictedAction) {
		predictedAction = predictedAction || {};
		if(command === 'move-left') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof predictedAction.x === 'number' ? predictedAction.x : this._sim.x),
				dir: -1
			};
		}
		else if(command === 'move-right') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof predictedAction.x === 'number' ? predictedAction.x : this._sim.x),
				dir: 1
			};
		}
		else if(command === 'stop') {
			return {
				actionType: 'follow-waypoint',
				x: (typeof predictedAction.x === 'number' ? predictedAction.x : this._sim.x),
				dir: 0
			};
		}
		else if(command === 'charge-jump') {
			return {
				actionType: 'charge-jump'
			};
		}
		else if(command === 'jump') {
			return {
				actionType: 'jump',
				charge: 1.0, //TODO
				dir: 0.0 //TODO
			};
		}
		return null;
	};
	return Athlete;
});