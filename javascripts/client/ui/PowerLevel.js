if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/sprite/SpriteLoader',
	'client/util/DriftingValue'
], function(
	SpriteLoader,
	DriftingValue
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('POWER_LEVEL');
	var FRAMES = 40;
	var MAX_POWER = 100;
	function PowerLevel() {
		this._powerLevel = new DriftingValue({ initial: MAX_POWER, min: 0, max: MAX_POWER });
	}
	PowerLevel.prototype.receiveUpdate = function(update) {
		this._powerLevel.receiveUpdate(
			update.powerLevel.value,
			update.powerLevel.changePerSecond,
			update.powerLevel.stopValue);
	};
	PowerLevel.prototype.tick = function() {
		this._powerLevel.tick();
	};
	PowerLevel.prototype.render = function(ctx) {
		var val = Math.max(0, Math.min(this._powerLevel.getValue(), MAX_POWER));
		SPRITE.render(ctx, 200, 100, Math.ceil((FRAMES - 1) * val / MAX_POWER));
	};
	return PowerLevel;
});