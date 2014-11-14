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
	var SPRITE = SpriteLoader.loadSpriteSheet('SHIP_POSITION_CONSOLE');
	var UNITS_PER_PIXEL_CHANGE = 5;
	function ShipPositionConsole(update) {
		SUPERCLASS.call(this, update);
		this._positionX = new DriftingValue({ initial: update.positionX.value });
		this._positionY = new DriftingValue({ initial: update.positionY.value });
	}
	ShipPositionConsole.prototype = Object.create(SUPERCLASS.prototype);
	ShipPositionConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._positionX.receiveUpdate(update.positionX);
		this._positionY.receiveUpdate(update.positionY);
	};
	ShipPositionConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._positionX.tick();
		this._positionY.tick();
	};
	ShipPositionConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var posX = this._positionX.getValue();
		var posY = this._positionY.getValue();
		var k = 8 * 3;
		var gridLineOffsetX = Math.floor(-posX / UNITS_PER_PIXEL_CHANGE) % k;
		if(gridLineOffsetX < 0) { gridLineOffsetX += k; }
		var gridLineOffsetY = Math.floor(posY / UNITS_PER_PIXEL_CHANGE) % k;
		if(gridLineOffsetY < 0) { gridLineOffsetY += k; }
		var majorGridLineOffsetX = Math.floor(-posX / UNITS_PER_PIXEL_CHANGE) % (4 * k);
		if(majorGridLineOffsetX < 0) { majorGridLineOffsetX += 4 * k; }
		var majorGridLineOffsetY = Math.floor(posY / UNITS_PER_PIXEL_CHANGE) % (4 * k);
		if(majorGridLineOffsetY < 0) { majorGridLineOffsetY += 4 * k; }
		var x = 400;
		var y = 300;
		//minor gridlines
		SPRITE.render(ctx, x + gridLineOffsetX, y, 1);
		SPRITE.render(ctx, x, y + gridLineOffsetY - k, 2);
		//major gridlines
		SPRITE.render(ctx, x + majorGridLineOffsetX, y, 3);
		SPRITE.render(ctx, x, y + majorGridLineOffsetY - 4 * k, 4);
		//white border
		var renderArea = SPRITE.render(ctx, x, y, 0);
		//position text
		TextWriter.write(ctx, StringUtils.formatNumber(posX, 0) + ',' + StringUtils.formatNumber(posY, 0),
			renderArea.right, renderArea.bottom, { size: 'small', align: 'right', vAlign: 'top' });
	};
	return ShipPositionConsole;
});