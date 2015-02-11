define([
	'client/entity/Entity',
	'create!client/display/Sprite > Net',
	'shared/sim/Net'
], function(
	SUPERCLASS,
	SPRITE,
	NetSim
) {
	function Net(params) {
		SUPERCLASS.call(this, NetSim, params);
	}
	Net.prototype = Object.create(SUPERCLASS.prototype);
	Net.prototype._generateActionFromCommand = function(command) {
		return null;
	};
	Net.prototype.render = function(ctx) {
		SPRITE.render(ctx, null,
			this._sim.centerX - SPRITE.width / 2,
			this._sim.bottom - SPRITE.height, 0, false);
		SUPERCLASS.prototype.render.call(this, ctx);
	};
	return Net;
});