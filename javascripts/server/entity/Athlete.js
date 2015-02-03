define([
	'server/entity/Entity2',
	'shared/sim/Athlete',
	'performance-now'
], function(
	SUPERCLASS,
	AthleteSim,
	now
) {
	function Athlete(params) {
		SUPERCLASS.call(this, 'Athlete', AthleteSim, params);
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
	};
	return Athlete;
});