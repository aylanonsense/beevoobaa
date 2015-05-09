define([
], function(
) {
	var MAX_BALL_RADIUS = 0;
	function HitBox(params) {
		this.offsetX = params.offsetX;
		this.offsetY = params.offsetY;
		this.width = params.width;
		this.height = params.height;
		this.orientationX = params.orientationX;
		this.orientationY = params.orientationY;
		this.isSweet = params.isSweet || false;
		this.isSour = params.isSour || false;
		this.onHitFunc = params.onHitFunc;
		var squareOrientationLength = this.orientationX * this.orientationX +
			this.orientationY * this.orientationY;
		if(squareOrientationLength !== 1) {
			var orientationLength = Math.sqrt(squareOrientationLength);
			this.orientationX /= orientationLength;
			this.orientationY /= orientationLength;
		}
	}
	HitBox.prototype.areHitting = function(player, ball) {
		//turn the ball into a single point (a bit inset from the edge of the ball)
		var ballX = ball.x;
		var ballY = ball.y;
		if(ball.radius > MAX_BALL_RADIUS) {
			var amtToMoveOutwards = ball.radius - MAX_BALL_RADIUS;
			ballX += amtToMoveOutwards * this.orientationX;
			ballY += amtToMoveOutwards * this.orientationY;
		}

		//the hitbox is relative to the player
		var hitX = player.centerX + this.offsetX;
		var hitY = player.centerY + this.offsetY;

		//return true if the ball point is inside the hitbox, false otherwise
		return hitX <= ballX && ballX <= hitX + this.width &&
			hitY <= ballY && ballY <= hitY + this.height;
	};
	HitBox.prototype.getHitProperties = function(player, ball) {
		return this.onHitFunc.call(this, player, ball);
	};
	return HitBox;
});