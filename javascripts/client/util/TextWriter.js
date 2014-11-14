if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
	'client/sprite/SpriteLoader'
], function(
	Constants,
	SpriteLoader
) {
	var DEFAULT_CHARACTER = ' ';
	var FRAMES = [
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '%', '/',
		'-', '+', ',', '.', "'", '¥'
	];
	var FONTS_BY_SIZE = {
		large: {
			sprite: null,//SpriteLoader.loadSpriteSheet("LARGE_FONT"),
			height: 10,
			defaultWidth: 10,
			widthByChar: {},
			sizeMult: 1
		},
		medium: {
			sprite: null,//SpriteLoader.loadSpriteSheet("MEDIUM_FONT"),
			height: 10,
			defaultWidth: 10,
			widthByChar: {},
			sizeMult: 1
		},
		small: {
			sprite: SpriteLoader.loadSpriteSheet("SMALL_FONT"),
			height: 7,
			defaultWidth: 4,
			widthByChar: { C: 5, G: 5, M: 5, N: 5, O: 5, P: 5, Q: 5, W: 5, X: 5, '%': 5 },
			sizeMult: 3
		}
	};

	function write(ctx, text, x, y, opts) {
		text = ('' + text).toUpperCase();
		opts = opts || {};
		var align = opts.align || 'left';
		var verticalAlign = opts.vAlign || 'top';
		var font = FONTS_BY_SIZE[opts.size || 'medium'];

		//calc text size
		var c;
		var textWidth = 0;
		var textHeight = font.sizeMult * font.height;
		for(var i = 0; i < text.length; i++) {
			c = (FRAMES.indexOf(text[i]) === -1 ? DEFAULT_CHARACTER : text[i]);
			textWidth += font.sizeMult * (font.widthByChar[c] || font.defaultWidth);
		}

		//calc offset from alignment and text width / height
		var offsetX = { left: 0, center: -Math.floor(textWidth / 2), right: -textWidth }[align] || 0;
		var offsetY = { bottom: -textHeight, center: -Math.floor(textHeight / 2), top: 0 }[verticalAlign] || 0;
		if(opts.offsetX) { offsetX += opts.offsetX; }
		if(opts.offsetY) { offsetY += opts.offsetY; }

		//draw each character's sprite
		var widthSoFar = 0;
		for(i = 0; i < text.length; i++) {
			c = (FRAMES.indexOf(text[i]) === -1 ? DEFAULT_CHARACTER : text[i]);
			var frame = FRAMES.indexOf(c);
			font.sprite.render(
				ctx,
				x + widthSoFar + offsetX,
				y + offsetY,
				frame
			);
			widthSoFar += font.sizeMult * (font.widthByChar[c] || font.defaultWidth);
		}

		var renderArea = {
			width: textWidth, height: textHeight,
			left: x + offsetX, right: x + offsetX + textWidth,
			top: y + offsetY, bottom: y + offsetY + textHeight
		};
		if(Constants.DEBUG_RENDER_MODE) {
			ctx.strokeStyle = '#ff0';
			ctx.lineWidth = 1;
			ctx.strokeRect(renderArea.left, renderArea.top, renderArea.width, renderArea.height);
			ctx.fillStyle = '#ff0';
			ctx.fillRect(x - 2, y - 2, 4, 4);
		}
		return renderArea;
	}

	return {
		write: write
	};
});