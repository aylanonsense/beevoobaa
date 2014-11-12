if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/sprite/SpriteLoader'
], function(
	SpriteLoader
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('POWER_LEVEL');
	var FRAMES = 40;
	var MAX_POWER = 100;
	function DummyPowerLevel(x) {
		this._x = x;
		this._powerLevel = MAX_POWER;
	}
	DummyPowerLevel.prototype.setPowerLevel = function(value) {
		this._powerLevel = Math.max(0, Math.min(value, 100));
	};
	DummyPowerLevel.prototype.render = function(ctx) {
		SPRITE.render(ctx, this._x, 100, Math.ceil((FRAMES - 1) * this._powerLevel / MAX_POWER));
	};
	return DummyPowerLevel;
});