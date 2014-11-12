if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/sprite/SpriteLoader'
], function(
	SpriteLoader
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('SPEEDOMETER');
	function Speedometer() {
		this._frame = 0;
	}
	Speedometer.prototype.receiveUpdate = function(update) {};
	Speedometer.prototype.tick = function() {
		this._frame += 0.2;
	};
	Speedometer.prototype.render = function(ctx) {
		SPRITE.render(ctx, 100, 100, this._frame);
	};
	return Speedometer;
});