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
	Athlete.prototype._translateCommandToAction = function(command) {
		if(command.commandType === 'move') {
			return {
				actionType: 'follow-waypoint',
				x: command.x,
				dir: command.dir
			};
		}
		else if(command.commandType === 'prepare-to-jump') {
			return { actionType: 'prepare-to-jump' };
		}
		else if(command.commandType === 'jump') {
			return { actionType: 'jump' };
		}
	};
	return Athlete;
});