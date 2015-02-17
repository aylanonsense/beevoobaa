define([
	'client/effect/Effect',
	'create!client/display/Sprite > NetText',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	Constants
) {
	var FRAMES = {
		'Reposition': 0,
		'Speed Up 10%': 1,
		'Tweening': 2,
		'Slow Down 10%': 3,
		'Snapped': 4,
		'Adjusting': 5,
		'Desync': 6
	};
	function NetText(params) {
		SUPERCLASS.call(this);
		this._x = params.x;
		this._y = params.y;
		this._sim = params.sim;
		this._frame = FRAMES[params.text];
		this._isAlive = true;
		this._isHidden = false;
	}
	NetText.prototype = Object.create(SUPERCLASS.prototype);
	NetText.prototype.render = function(ctx) {
		if(!this._isHidden && Constants.DEBUG_RENDER_NETWORK) {
			var x, y;
			if(this._sim) {
				x = this._sim.centerX;
				y = this._sim.top - 10;
			}
			else {
				x = this._x;
				y = this._y;
			}
			SUPERCLASS.prototype.render.call(this, ctx);
			SPRITE.render(ctx, null, x - SPRITE.width / 2, y - SPRITE.height, this._frame, false);
		}
	};
	NetText.prototype.show = function() {
		this._isHidden = false;
	};
	NetText.prototype.hide = function() {
		this._isHidden = true;
	};
	NetText.prototype.die = function() {
		this._isAlive = false;
	};
	NetText.prototype.isAlive = function() {
		return this._isAlive;
	};
	return NetText;
});