define([
	'server/entity/Entity',
	'shared/sim/Player',
	'server/net/Server',
	'performance-now'
], function(
	SUPERCLASS,
	PlayerSim,
	Server,
	now
) {
	function Player(params) {
		SUPERCLASS.call(this, 'Player', PlayerSim, params);
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.setMoveDir = function(dir) {
		if(this._sim.moveDir !== dir) {
			this._sim.moveDir = dir;
			Server.bufferSendToAll({
				messageType: 'entity-update',
				time: now(),
				state: this.getState()
			});
		}
	};
	return Player;
});