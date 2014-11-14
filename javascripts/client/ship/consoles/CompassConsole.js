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
	var SPRITE = SpriteLoader.loadSpriteSheet('COMPASS_CONSOLE');
	function CompassConsole(update) {
		SUPERCLASS.call(this, update);
		this._heading = new DriftingValue({ initial: update.heading.value });
	}
	CompassConsole.prototype = Object.create(SUPERCLASS.prototype);
	CompassConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._heading.receiveUpdate(update.heading);
	};
	CompassConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._heading.tick();
	};
	CompassConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var heading = (this._heading.getValue() * 180 / Math.PI) % 360;
		if(heading < 0) { heading += 360; }
		var renderArea = SPRITE.render(ctx, 440, 240, 0);
		TextWriter.write(
			ctx,
			StringUtils.formatNumber(heading, 0),
			renderArea.left + Math.floor(renderArea.width / 2),
			renderArea.bottom,
			{ size: 'small', align: 'center', vAlign: 'bottom', offsetX: 3, offsetY: -3 }
		);
	};
	return CompassConsole;
});