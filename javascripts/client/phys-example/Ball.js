if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/phys-example/PhysicsObject'
], function(
	PhysicsObject
) {
	function Ball(x, y, velX, velY, radius, mass) {
		this.physics = new PhysicsObject({ x: x, y: y, mass: mass, radius: radius, velX: velX, velY: velY });
	}
	Ball.prototype.tick = function(t) {};
	Ball.prototype.render = function(ctx) {
		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(this.physics.pos.x, this.physics.pos.y, this.physics.radius, 0, 2 * Math.PI);
		ctx.stroke();
	};
	Ball.prototype.checkForCollision = function(other) {
		return this.physics.checkForCollision(other.physics);
	};

	return Ball;
});