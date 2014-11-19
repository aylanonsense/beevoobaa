if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/Constants',
	'client/util/TextWriter',
	'client/util/StringUtils',
	'client/sprite/SpriteLoader',
	'client/util/DriftingValue'
], function(
	SUPERCLASS,
	Constants,
	TextWriter,
	StringUtils,
	SpriteLoader,
	DriftingValue
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('MINIMAP_CONSOLE');
	var SHIP_SPRITE = SpriteLoader.loadSpriteSheet('MINI_SHIP');
	var UNITS_PER_PIXEL_CHANGE = 10;
	function MinimapConsole(x, y, update) {
		SUPERCLASS.call(this, x, y, update);
		this._width = SPRITE.width;
		this._height = SPRITE.height;
		this._velX = new DriftingValue({ initial: update.velX.value });
		this._velY = new DriftingValue({ initial: update.velY.value });
		this._heading = new DriftingValue({ initial: update.heading.value, wrap: { from: -Math.PI, to: Math.PI } });
		this._posX = 0;
		this._posY = 0;
	}
	MinimapConsole.prototype = Object.create(SUPERCLASS.prototype);
	MinimapConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._velX.receiveUpdate(update.velX);
		this._velY.receiveUpdate(update.velY);
		this._heading.receiveUpdate(update.heading);
	};
	MinimapConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._velX.tick();
		this._velY.tick();
		this._heading.tick();
		this._posX += this._velX.getValue() / Constants.TARGET_FRAMES_PER_SECOND;
		this._posY += this._velY.getValue() / Constants.TARGET_FRAMES_PER_SECOND;
	};
	MinimapConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var heading = (this._heading.getValue() * 180 / Math.PI) % 360;
		if(heading < 0) { heading += 360; }
		//render grid lines
		var f = Math.floor(this._posX / UNITS_PER_PIXEL_CHANGE) % 5;
		SPRITE.render(ctx, this._x, this._y, 5 + (f < 0 ? f + 5 : f));
		f = Math.floor(this._posY / UNITS_PER_PIXEL_CHANGE) % 5;
		SPRITE.render(ctx, this._x, this._y, (f < 0 ? f + 5 : f));
		//render white border
		var renderArea = SPRITE.render(ctx, this._x, this._y, 10);
		//render ship
		SHIP_SPRITE.render(ctx, this._x + 3 * 23, this._y + 3 * 23, (9 + 36) - Math.round(heading / 10));
		//render (debug) velocity text
		TextWriter.write(ctx, StringUtils.formatNumber(this._velX.getValue(), 0) +
				', ' + StringUtils.formatNumber(this._velY.getValue(), 0),
			renderArea.left + Math.floor(renderArea.width / 2), renderArea.bottom,
			{ align: 'center', vAlign: 'top', size: 'small' });
	};
	return MinimapConsole;
});