if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/sprite/SpriteLoader',
	'client/util/DriftingValue'
], function(
	SUPERCLASS,
	SpriteLoader,
	DriftingValue
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('POWER_LEVEL');
	var FRAMES = 40;
	function EnergyLevelConsole(update) {
		SUPERCLASS.call(this, update);
		this._energy = new DriftingValue({ initial: update.energy.value, min: 0, max: update.maxEnergy });
	}
	EnergyLevelConsole.prototype = Object.create(SUPERCLASS.prototype);
	EnergyLevelConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._energy.receiveUpdate(update.energy);
	};
	EnergyLevelConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._energy.tick();
	};
	EnergyLevelConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var val = Math.max(0, Math.min(this._energy.getValue(), this._energy.getMaxValue()));
		SPRITE.render(ctx, 200, 100, Math.ceil((FRAMES - 1) * val / this._energy.getMaxValue()));
	};
	return EnergyLevelConsole;
});