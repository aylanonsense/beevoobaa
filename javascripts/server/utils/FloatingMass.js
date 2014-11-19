if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function FloatingMass(x, y, facing, mass, size) {
		this.pos = { x: x || 0, y: y || 0 };
		this.vel = { x: 0 , y: 0, rotational: 0 };
		this.acc = { x: 0 , y: 0, rotational: 0 };
		this._forces = { x: 0 , y: 0, forward: 0, lateral: 0, rotational: 0 };
		this.facing = facing || 0; //0: right, PI/2: up, PI: left, -PI/2: down
		this.mass = mass || 1;
		var radius = size || 1;
		this._momentOfInertia = this.mass * radius * radius / 2; //assume a cylinder
		this.friction = 0;
		this.rotationalFriction = 0;
	}
	FloatingMass.prototype.applyForce = function(x, y, rotational) {
		this._forces.x += x;
		this._forces.y += y;
		this._forces.rotational += rotational;
	};
	FloatingMass.prototype.applyForceRelativeToFacing = function(forward, lateral, rotational) {
		this._forces.forward += forward;
		this._forces.lateral += lateral;
		this._forces.rotational += rotational;
	};
	FloatingMass.prototype.prep = function(t) {};
	FloatingMass.prototype.tick = function(t) {
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

		//update position and facing
		var friction = (this.friction > 0 ? Math.pow(Math.E, -this.friction * t) : 1.00);
		this.vel.x = (this.vel.x + this.acc.x * t) * friction;
		this.vel.y = (this.vel.y + this.acc.y * t) * friction;
		this.pos.x += this.vel.x * t;
		this.pos.y += this.vel.y * t;
		friction = (this.rotationalFriction > 0 ? Math.pow(Math.E, this.rotationalFriction * t) : 1.00);
		this.vel.rotational = (this.vel.rotational + this.acc.rotational * t) * friction;
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

		//reset forces
		this._forces = { x: 0 , y: 0, forward: 0, lateral: 0, rotational: 0 };
	};
	return FloatingMass;
});