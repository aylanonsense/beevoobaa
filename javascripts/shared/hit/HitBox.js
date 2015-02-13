define([
	'shared/geom/Line',
	'shared/geom/Rect'
], function(
	Line,
	Rect
) {
	function HitBox(params) {
		this._rect = new Rect(params.x, params.y, params.width, params.height);
	}
	HitBox.prototype.isOverlappingBall = function(ball) {
		var line = new Line(ball.centerX, ball.centerY, ball.centerX, ball.centerY);
		return this._rect.isOverlapping(line);
	};
	HitBox.prototype.render = function(ctx, color, borderOnly, thickness) {
		this._rect.render(ctx, color, borderOnly, thickness);
	};
	return HitBox;
});