define([
	'client/effect/Effect',
	'create!client/display/Sprite > ChargeBurst'
], function(
	SUPERCLASS,
	SPRITE
) {
	function ChargeBurst(athleteSim) {
		SUPERCLASS.call(this);
		this._athleteSim = athleteSim;
	}
	ChargeBurst.prototype = Object.create(SUPERCLASS.prototype);
	ChargeBurst.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		SPRITE.render(ctx, null, this._athleteSim.x, this._athleteSim.y,
			Math.floor(this._timeAlive / 0.05) % 6, false);
	};
	ChargeBurst.prototype.isAlive = function() {
		return this._timeAlive < (0.05 * 6);
	};
	return ChargeBurst;
});