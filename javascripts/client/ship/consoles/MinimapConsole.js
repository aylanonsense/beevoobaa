if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/Constants',
	'client/sprite/SpriteLoader',
	'client/util/DriftingValue'
], function(
	SUPERCLASS,
	Constants,
	SpriteLoader,
	DriftingValue
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('MINIMAP_CONSOLE');
	var SHIP_SPRITE = SpriteLoader.loadSpriteSheet('MINI_SHIP');
	var UNITS_PER_PIXEL_CHANGE = 5;
	function MinimapConsole(update) {
		SUPERCLASS.call(this, update);
		this._velX = new DriftingValue({ initial: update.velX.value });
		this._velY = new DriftingValue({ initial: update.velY.value });
		this._heading = new DriftingValue({ intitial: update.heading.value });
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
		var x = 25;
		var y = 250;
		//render grid lines
		SPRITE.render(ctx, x, y, 5 + Math.floor(this._posX / 10) % 5);
		SPRITE.render(ctx, x, y, Math.floor(this._posY / 10) % 5);
		//render white border
		SPRITE.render(ctx, x, y, 10);
		//render ship
		SHIP_SPRITE.render(ctx, x + 3 * 23, y + 3 * 23, Math.round(heading / 10));
	};
	return MinimapConsole;
});