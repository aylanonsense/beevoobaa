if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants',
], function(
	Constants
) {
	function SpriteSheet(params, spriteKey) {
		//init private vars
		this._canvas = null;
		this._loaded = false;
		this._scale = params.scale || 1;
		this._preLoadedColor = params.loadingColor || '#000';
		this._flipped = params.flip || false;
		this._replacements = params.replacements || null;
		this._crop = params.crop || null;
		this._outlineInDebugMode = params.outlineInDebugMode !== false;

		//init public vars
		this.width = this._scale * params.width; //width of one frame
		this.height = this._scale * params.height; //height of one frame
		this.key = spriteKey;
	}
	SpriteSheet.prototype.onImageLoaded = function(imageData, imageWidth, imageHeight) {
		//we need to adjust things if the image is cropped
		var minX = (this._crop && this._crop.x) || 0;
		var minY = (this._crop && this._crop.y) || 0;
		var maxX = (this._crop && this._crop.x + this._crop.width) || imageWidth;
		var maxY = (this._crop && this._crop.y + this._crop.height) || imageHeight;
		var width = (this._crop && this._crop.width) || imageWidth;
		var height = (this._crop && this._crop.height) || imageHeight;
		//create another canvas, scaled as needed
		this._canvas = document.createElement('canvas');
		this._canvas.width = this._scale * width;
		this._canvas.height = this._scale * height * (this._flipped ? 2 : 1);
		var ctx = this._canvas.getContext('2d');
		//transfer image data from the first canvas onto the scaled canvas
		var i = 4 * (minY * imageWidth + minX);
		for(var y = minY; y < maxY; y++) {
			for(var x = minX; x < maxX; x++) {
				//fill the scaled pixel
				var r = imageData[i++], g = imageData[i++], b = imageData[i++], a = imageData[i++] / 100.0;
				ctx.fillStyle = 'rgba(' + [r, g, b, a].join(',') + ')';
				if(this._replacements) {
					var hex = rgbToHex(r, g, b);
					if(this._replacements[hex]) {
						ctx.fillStyle = this._replacements[hex];
					}
				}
				ctx.fillRect(this._scale * (x - minX), this._scale * (y - minY), this._scale, this._scale);
				if(this._flipped) {
					//fill the flipped pixel too
					ctx.fillRect(this._canvas.width - this._scale * (x - minX + 1),
						this._canvas.height / 2 + this._scale * (y - minY), this._scale, this._scale);
				}
			}
			i += 4 * (imageWidth - width);
		}
		this._loaded = true;
	};
	SpriteSheet.prototype.render = function(ctx, x, y, frame, flip) {
		if(this._loaded) {
			var numCols = this._canvas.width / this.width;
			var numRows = (this._canvas.height / this.height) / (this._flipped ? 2 : 1);
			//locate the frame on the spritesheet
			frame = Math.floor(frame % (numCols * numRows));
			var frameX = frame % numCols;
			var frameY = Math.floor(frame / numCols);
			if(flip && this._flipped) {
				frameX = numCols - frameX - 1;
				frameY += numRows;
			}
			//draw the image
			ctx.drawImage(this._canvas,
				frameX * this.width, frameY * this.height,
				this.width, this.height, x, y, this.width, this.height
			);
		}
		else {
			//if the image hasn't loaded yet, we just show a colored rectangle
			ctx.fillStyle = this._preLoadedColor;
			ctx.fillRect(x, y, this.width, this.height);
		}
		if(Constants.DEBUG_RENDER_MODE && this._outlineInDebugMode) {
			ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
			ctx.lineWidth = 1;
			ctx.strokeRect(x, y, this.width, this.height);
		}
		return {
			width: this.width, height: this.height,
			left: x, right: x + this.width,
			top: y, bottom: y + this.height
		};
	};

	//helper methods
	function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	}
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	return SpriteSheet;
});