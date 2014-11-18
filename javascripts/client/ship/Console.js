if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/Constants'
], function(
	Constants
) {
	function Console(x, y, update) {
		this._consoleId = update.id;
		this._x = x;
		this._y = y;
	}
	Console.prototype.getId = function() {
		return this._consoleId;
	};
	Console.prototype.receiveUpdate = function(update) {};
	Console.prototype.tick = function(t) {};
	Console.prototype.render = function(ctx) {
		if(Constants.DEBUG_RENDER_MODE) {
			ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
			ctx.lineWidth = 6;
			ctx.strokeRect(this._x - 2, this._y - 2, (this._width || 0) + 4, (this._height || 0) + 4);
		}
	};
	Console.prototype.onMouse = function(evt, x, y) {};
	return Console;
});