if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	var COEFFICIENT_OF_RESTITUTION = 0.2;
	var EXTRA_NUDGE_DIST = 1;
	function PhysicsObject(params) {
		this.pos = { x: params.x || 0, y: params.y || 0 };
		this.vel = { x: params.velX || 0 , y: params.velY || 0, rotational: 0 };
		this.acc = { x: 0 , y: 0, rotational: 0 };
		this._forces = { x: 0 , y: 0, forward: 0, lateral: 0, rotational: 0 };
		this.facing = params.facing || 0; //0: right, PI/2: up, PI: left, -PI/2: down
		this.mass = params.mass || 1;
		this.radius = params.radius || 1;
		this._momentOfInertia = this.mass * this.radius * this.radius / 2; //assume a cylinder
		this.friction = 0;
		this.rotationalFriction = 0;
	}
	PhysicsObject.prototype.applyForce = function(x, y, rotational) {
		this._forces.x += x;
		this._forces.y += y;
		this._forces.rotational += rotational;
	};
	PhysicsObject.prototype.applyForceRelativeToFacing = function(forward, lateral, rotational) {
		this._forces.forward += forward;
		this._forces.lateral += lateral;
		this._forces.rotational += rotational;
	};
	PhysicsObject.prototype.planMovement = function(t) {
		//convert force into acceleration
		var forceForward = this._forces.forward;
		var forceLateral = this._forces.lateral;
		var forceRotational = this._forces.rotational;
		var forceX = Math.cos(this.facing) * forceForward - Math.sin(this.facing) * forceLateral + this._forces.x;
		var forceY = Math.sin(this.facing) * forceForward + Math.cos(this.facing) * forceLateral + this._forces.y;
		this.acc = {
			x: forceX / this.mass,
			y: forceY / this.mass,
			rotational: forceRotational / this._momentOfInertia
		};

		//reset forces
		this._forces = { x: 0 , y: 0, forward: 0, lateral: 0, rotational: 0 };

		//adjust velocity and facing
		var friction = (this.friction > 0 ? Math.pow(Math.E, -this.friction * t) : 1.00);
		this.vel.x = (this.vel.x + this.acc.x * t) * friction;
		this.vel.y = (this.vel.y + this.acc.y * t) * friction;
		var rotationalFriction = (this.rotationalFriction > 0 ? Math.pow(Math.E, this.rotationalFriction * t) : 1.00);
		this.vel.rotational = (this.vel.rotational + this.acc.rotational * t) * rotationalFriction;
		this.facing += this.vel.rotational * t;

		//keep facing between PI and -PI
		if(this.facing > Math.PI) {
			this.facing = this.facing % (2 * Math.PI);
			if(this.facing > Math.PI) { this.facing -= 2 * Math.PI; }
		}
		else if(this.facing <= -Math.PI) {
			this.facing = this.facing % (2 * Math.PI);
			if(this.facing <= -Math.PI) { this.facing += 2 * Math.PI; }
		}
	};
	PhysicsObject.prototype.move = function(t) {
		this.pos.x += this.vel.x * t;
		this.pos.y += this.vel.y * t;
	};
	PhysicsObject.prototype.checkForCollision = function(other) {
		var distX = other.pos.x - this.pos.x;
		var distY = other.pos.y - this.pos.y;
		var squareDist = distX * distX + distY * distY;
		if(squareDist <= (this.radius + other.radius) * (this.radius + other.radius)) {
			return true;
		}
		return false;
	};
	PhysicsObject.prototype.handleCollision = function(other) {
		var distX = other.pos.x - this.pos.x;
		var distY = other.pos.y - this.pos.y;
		var squareDist = distX * distX + distY * distY;
		if(squareDist <= (this.radius + other.radius) * (this.radius + other.radius)) {
			//move the objects outside of one another
			var dist = Math.sqrt(squareDist);
			var dirX = distX / dist;
			var dirY = distY / dist;
			var nudgeX = (EXTRA_NUDGE_DIST + this.radius + other.radius - dist) * dirX;
			var nudgeY = (EXTRA_NUDGE_DIST + this.radius + other.radius - dist) * dirY;
			var squareSpeed = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
			var otherSquareSpeed = other.vel.x * other.vel.x + other.vel.y * other.vel.y;
			var percentForOther = otherSquareSpeed / (squareSpeed + otherSquareSpeed);
			this.pos.x -= nudgeX * (1 - percentForOther);
			this.pos.y -= nudgeY * (1 - percentForOther);
			other.pos.x += nudgeX * percentForOther;
			other.pos.y += nudgeY * percentForOther;

			//"bounce" velocities
			var angle = Math.atan2(distY, distX);
			var cos = Math.cos(angle);
			var sin = Math.sin(angle);
			var velTowards = cos * this.vel.x + sin * this.vel.y;
			var velPerpendicular = sin * this.vel.x - cos * this.vel.y;
			var otherVelTowards = cos * other.vel.x + sin * other.vel.y;
			var otherVelPerpendicular = -sin * other.vel.x + cos * other.vel.y;
			var newVelTowards = (this.mass * velTowards + other.mass * otherVelTowards + other.mass *
				COEFFICIENT_OF_RESTITUTION * (otherVelTowards - velTowards)) / (this.mass + other.mass);
			var otherNewVelTowards = (this.mass * velTowards + other.mass * otherVelTowards + this.mass *
				COEFFICIENT_OF_RESTITUTION * (velTowards - otherVelTowards)) / (this.mass + other.mass);
			this.vel.x = cos * newVelTowards + sin * velPerpendicular;
			this.vel.y = sin * newVelTowards - cos * velPerpendicular;
			other.vel.x = cos * otherNewVelTowards - sin * otherVelPerpendicular;
			other.vel.y = sin * otherNewVelTowards + cos * otherVelPerpendicular;

			return true;
		}
		return false;
	};
	return PhysicsObject;
});