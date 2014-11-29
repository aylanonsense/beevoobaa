if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
	'client/sprite/SpriteLoader'
], function(
	Constants,
	SpriteLoader
) {
	var SCALE = 3;

	function fillCircle(ctx, x, y, radius) {
		for(var dx = -radius; dx < radius; dx += SCALE) {
			var dxAdjusted = dx + SCALE / 2;
			var dy = SCALE * Math.round(Math.sqrt(radius * radius - dxAdjusted * dxAdjusted) / SCALE);
			ctx.fillRect(x + dx, y - dy, SCALE, 2 * dy);
		}
	}

	return {
		fillCircle: fillCircle
	};
});