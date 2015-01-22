define([
	'server/entity/Entity',
	'shared/sim/Player'
], function(
	SUPERCLASS,
	PlayerSim
) {
	function Player(params) {
		SUPERCLASS.call(this, 'Player', PlayerSim, params);
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	return Player;
});