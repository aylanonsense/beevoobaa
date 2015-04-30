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
		this.type = params.type;
		var squareOrientationLength = this.orientationX * this.orientationX +
			this.orientationY * this.orientationY;
		if(squareOrientationLength !== 1) {
			var orientationLength = Math.sqrt(squareOrientationLength);
			this.orientationX /= orientationLength;
			this.orientationY /= orientationLength;
		}
	}
	HitBox.prototype._areColliding = function(playerSim, ballSim) {
		//turn the ball into a single point (the center of a ball unless it's really big)
		var ballX = ballSim.x;
		var ballY = ballSim.y;
		if(ballSim.radius > MAX_BALL_RADIUS) {
			var amtToMoveOutwards = ballSim.radius - MAX_BALL_RADIUS;
			ballX += amtToMoveOutwards * this.orientationX;
			ballY += amtToMoveOutwards * this.orientationY;
		}

		//the hitbox is relative to the player
		var hitX = playerSim.x + playerSim.width / 2 + this.offsetX;
		var hitY = playerSim.y + playerSim.height / 2 + this.offsetY;

		//return true if the ball point is inside the hitbox, false otherwise
		return hitX <= ballX && ballX <= hitX + this.width &&
			hitY <= ballY && ballY <= hitY + this.height;
	};
	HitBox.prototype.checkForHit = function(playerSim, ballSim) {
		if(this._areColliding(playerSim, ballSim)) {
			return {
				ballX: ballSim.x,
				ballY: ballSim.y,
				ballVelX: 0,
				ballVelY: -100
			};
		}
		else {
			return null;
		}
	};
	return HitBox;
});