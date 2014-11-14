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
	var SPRITE = SpriteLoader.loadSpriteSheet('SPEEDOMETER_CONSOLE');
	var FRAMES = 38;
	function SpeedometerConsole(update) {
		SUPERCLASS.call(this, update);
		this._speed = new DriftingValue({ initial: update.speed.value, min: 0, max: update.maxSpeed });
	}
	SpeedometerConsole.prototype = Object.create(SUPERCLASS.prototype);
	SpeedometerConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._speed.receiveUpdate(update.speed);
	};
	SpeedometerConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._speed.tick();
	};
	SpeedometerConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var speed = this._speed.getValue();
		var renderArea = SPRITE.render(ctx, 200, 400, Math.ceil((FRAMES - 1) * speed / this._speed.getMaxValue()));
		TextWriter.write(
			ctx,
			StringUtils.formatNumber(speed, 1),
			renderArea.left + Math.floor(renderArea.width / 2),
			renderArea.bottom,
			{ size: 'small', align: 'center', vAlign: 'bottom' }
		);
	};
	return SpeedometerConsole;
});