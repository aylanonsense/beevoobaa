if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	function Rect(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	Rect.prototype.containsPoint = function(x, y) {
		return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
	};
	Rect.prototype.render = function(ctx) {
		ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
	return Rect;
});