if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/sprite/SpriteLoader',
	'client/util/TextWriter',
	'client/util/StringUtils',
	'client/util/DriftingValue'
], function(
	SUPERCLASS,
	SpriteLoader,
	TextWriter,
	StringUtils,
	DriftingValue
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('ENERGY_LEVEL_CONSOLE');
	var FRAMES = 40;
	function EnergyLevelConsole(x, y, update) {
		SUPERCLASS.call(this, x, y, update);
		this._width = SPRITE.width;
		this._height = SPRITE.height;
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
		var renderArea = SPRITE.render(ctx, this._x, this._y, Math.ceil((FRAMES - 1) * val / this._energy.getMaxValue()));
		TextWriter.write(
			ctx,
			StringUtils.formatNumber(val, 0) + '¥',
			renderArea.left + Math.floor(renderArea.width / 2),
			renderArea.bottom,
			{ size: 'small', align: 'center', vAlign: 'top', offsetX: 2 }
		);
	};
	return EnergyLevelConsole;
});