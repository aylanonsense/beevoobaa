define([
], function(
) {
	var MAX_BALL_RADIUS = 20;
	function HitBox(params) {
		this.offsetX = params.offsetX;
		this.offsetY = params.offsetY;
		this.width = params.width;
		this.height = params.height;
		this.vectorX = params.vectorX;
		this.vectorY = params.vectorY;
		var squareVectorLength = this.vectorX * this.vectorX + this.vectorY * this.vectorY;
		if(squareVectorLength !== 1) {
			var vectorLength = Math.sqrt(squareVectorLength);
			this.vectorX /= vectorLength;
			this.vectorY /= vectorLength;
		}
	}
	HitBox.prototype.areColliding = function(playerSim, ballSim) {
		//turn the ball into a single point (the center of a ball unless it's really big)
		var ballX = ballSim.x;
		var ballY = ballSim.y;
		if(ballSim.radius > MAX_BALL_RADIUS) {
			var amtToMoveOutwards = ballSim.radius - MAX_BALL_RADIUS;
			ballX -= amtToMoveOutwards * this.vectorX;
			ballY -= amtToMoveOutwards * this.vectorY;
		}

		//the hitbox is relative to the player
		var hitX = playerSim.x + playerSim.width / 2 + this.offsetX;
		var hitY = playerSim.x + playerSim.height / 2 + this.offsetY;

		//return true if the ball point is inside the hitbox, false otherwise
		return hitX <= ballX && ballX <= hitX + this.width &&
			hitY <= ballY && ballY <= hitY + this.height;
	};
	return HitBox;
});