if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
], function(
) {
	function FloatingMass(x, y, facing, mass, radius) {
		this.pos = { x: x || 0, y: y || 0 };
		this.vel = { x: 0 , y: 0, rotational: 0 };
		this.acc = { x: 0 , y: 0, rotational: 0 };
		this._forces = { x: 0 , y: 0, forward: 0, lateral: 0, rotational: 0 };
		this.facing = facing || 0; //0: right, PI/2: up, PI: left, -PI/2: down
		this.mass = mass || 1;
		this.radius = radius || 1;
		this._momentOfInertia = this.mass * this.radius * this.radius / 2; //assume a cylinder
		this.friction = 0;
		this.rotationalFriction = 0;
		this._startPos = null;
		this._endPos = null;
		this._timeOfCurrentFrame = 0;
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
	FloatingMass.prototype.planMovement = function(t) {
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

		//record start (current) and end positions
		this._startPos = { x: this.pos.x, y: this.pos.y };
		this._endPos = { x: this.pos.x + this.vel.x * t, y: this.pos.y + this.vel.y * t };
		this._timeOfCurrentFrame = t;
	};
	FloatingMass.prototype.checkForCollision = function(other) {
		var offset = { x: this._endPos.x - this._startPos.x, y: this._endPos.y - this._startPos.y };

		//reduce problem to a circle and a line
		var circle = { x: this._startPos.x, y: this._startPos.y, radius: this.radius + other.radius };
		var line = {
			start: { x: other._startPos.x, y: other._startPos.y },
			end: { x: other._endPos.x - offset.x, y: other._endPos.y - offset.y }
		};

		//if the line is headed "away from" the circle, we ignore all collisions
		if((line.start.x > circle.x + circle.radius && line.end.x > circle.x + circle.radius) ||
			(line.start.x < circle.x - circle.radius && line.end.x < circle.x - circle.radius) ||
			(line.start.y > circle.y + circle.radius && line.end.y > circle.y + circle.radius) ||
			(line.start.y < circle.y - circle.radius && line.end.y < circle.y - circle.radius)) {
			debugger;
			return false;
		}

		//check to see if the line is colliding with the circle

		//m = line slope
		//b = line y-intercept
		//h = circle x
		//k = circle y
		//r = circle radius

		//y = mx + b
		//(x - h)*(x - h) + (y - k)*(y - k) = r*r
		//solve for x and y
		//(x - h)*(x - h) = r*r - (y - k)*(y - k)
		//x - h = sqrt(r*r - (y - k)*(y - k))
		//x = sqrt(r*r - (y - k)*(y - k)) + h
		//y = m*(sqrt(r*r - (y - k)*(y - k)) + h) + b
		//y = m*sqrt(r*r - (y - k)*(y - k)) + m*h + b

		// compute the euclidean distance between A and B
		var diffX = line.end.x - line.start.x;
		var diffY = line.end.y - line.start.y;
		var lineLength = Math.sqrt(diffX * diffX + diffY * diffY);
		// LAB = sqrt( (Bx-Ax)²+(By-Ay)² )

		// compute the direction vector D from A to B
		var dirX = diffX / lineLength;
		var dirY = diffY / lineLength;
		// Dx = (Bx-Ax)/LAB
		// Dy = (By-Ay)/LAB

		// Now the line equation is x = Dx*t + Ax, y = Dy*t + Ay with 0 <= t <= 1.

		// compute the value t of the closest point to the circle center
		var t = dirX * (circle.x - line.start.x) + dirY * (circle.y - line.start.y);
		// t = Dx*(Cx-Ax) + Dy*(Cy-Ay)    

		// This is the projection of C on the line from A to B.

		// compute the coordinates of the point E on line and closest to C
		var closestPointOnLine = { x: t * dirX + line.start.x, y: t * dirY + line.start.y };
		// Ex = t*Dx+Ax
		// Ey = t*Dy+Ay

		// compute the euclidean distance from E to C
		diffX = closestPointOnLine.x - circle.x;
		diffY = closestPointOnLine.y - circle.y;
		var distFromCircleToPoint = Math.sqrt(diffX * diffX + diffY * diffY);
		//LEC = sqrt( (Ex-Cx)²+(Ey-Cy)² )

		// test if the line intersects the circle
		var intersection = null;
		var squareDistToIntersection = null;
		if(distFromCircleToPoint < circle.radius) {
		//if( LEC < R ) {

			// compute distance from t to circle intersection point
			var dt = Math.sqrt(circle.radius * circle.radius + distFromCircleToPoint * distFromCircleToPoint);
			//dt = sqrt( R² - LEC²)
			
			// compute first intersection point
			var intersection1 = { x: (t - dt) * dirX + line.start.x, y: (t - dt) * dirY + line.start.y };
			//Fx = (t-dt)*Dx + Ax
			// Fy = (t-dt)*Dy + Ay
			
			// compute second intersection point
			var intersection2 = { x: (t + dt) * dirX + line.start.x, y: (t + dt) * dirY + line.start.y };
			//Gx = (t+dt)*Dx + Ax
			//Gy = (t+dt)*Dy + Ay

			//figure out which intersection point to choose
			var intersection1IsOnLineSegment =
				!(intersection1.x > line.start.x && intersection1.x > line.end.x) &&
				!(intersection1.x < line.start.x && intersection1.x < line.end.x) &&
				!(intersection1.y > line.start.y && intersection1.y > line.end.y) &&
				!(intersection1.y < line.start.y && intersection1.y < line.end.y);
			var intersection2IsOnLineSegment =
				!(intersection2.x > line.start.x && intersection2.x > line.end.x) &&
				!(intersection2.x < line.start.x && intersection2.x < line.end.x) &&
				!(intersection2.y > line.start.y && intersection2.y > line.end.y) &&
				!(intersection2.y < line.start.y && intersection2.y < line.end.y);
			if(intersection1IsOnLineSegment && intersection2IsOnLineSegment) {
				//find the intersection point closest to the start of the line
				diffX = intersection1.x - line.start.x;
				diffY = intersection1.y - line.start.y;
				var squareDistToIntersection1 = diffX * diffX + diffY * diffY;
				diffX = intersection2.x - line.start.x;
				diffY = intersection2.y - line.start.y;
				var squareDistToIntersection2 = diffX * diffX + diffY * diffY;
				if(squareDistToIntersection1 < squareDistToIntersection2) {
					intersection = intersection1;
				}
				else {
					intersection = intersection2;
				}
			}
			else if(intersection1IsOnLineSegment) {
				intersection = intersection1;
			}
			else if(intersection2IsOnLineSegment) {
				intersection = intersection2;
			}
		}
		// else test if the line is tangent to circle
		else if(distFromCircleToPoint === circle.radius) {
			var closestPointIsOnLineSegment =
				!(closestPointOnLine.x > line.start.x && closestPointOnLine.x > line.end.x) &&
				!(closestPointOnLine.x < line.start.x && closestPointOnLine.x < line.end.x) &&
				!(closestPointOnLine.y > line.start.y && closestPointOnLine.y > line.end.y) &&
				!(closestPointOnLine.y < line.start.y && closestPointOnLine.y < line.end.y);
			if(closestPointIsOnLineSegment) {
				intersection = closestPointOnLine;
			}
		}

		if(intersection) {
			debugger;
			return true;
		}
		else {
			debugger;
			return false;
		}
	};
	FloatingMass.prototype.adjustTrajectory = function(collision) {
		//find angle between onjects
		var distXToOther = collision.otherPos.x - collision.selfPos.y;
		var distYToOther = collision.otherPos.y - collision.selfPos.y;
		var angle = Math.atan2(distYToOther, distXToOther);

		//calculate rotated velocities
		var selfVelTowards = this.vel.x * Math.cos(angle) + this.vel.y * Math.sin(angle);
		var selfVelPerpendicular = this.vel.x * Math.sin(angle) - this.vel.y * Math.cos(angle);
		var otherVelTowards = collision.other.vel.x * Math.cos(angle) + collision.other.vel.y * Math.sin(angle);
		var otherVelPerpendicular = collision.other.vel.x * Math.sin(angle) - collision.other.vel.y * Math.cos(angle);

		//exchange momentum due to collision
		var newSelfVelTowards = TODO;
		var newOtherVelTowards = TODO;

		//unrotate and apply velocities
		this.vel.x = newSelfVelTowards * Math.___(angle) + selfVelPerpendicular * Math.___(angle);
		this.vel.y = newSelfVelTowards * Math.___(angle) + selfVelPerpendicular * Math.___(angle);
		collision.other.vel.x = newOtherVelTowards * Math.___(angle) + OtherVelPerpendicular * Math.___(angle);
		collision.other.vel.y = newOtherVelTowards * Math.___(angle) + OtherVelPerpendicular * Math.___(angle);

		//extrapolate start and end positions (need to know actual milliseconds for this)
		this._startPos = {
			x: collision.selfPos.x - this.vel.x * collision.time,
			y: collision.selfPos.y - this.vel.y * collision.time
		};
		this._endPos = {
			x: collision.selfPos.x + this.vel.x * collision.timeRemaining,
			y: collision.selfPos.y + this.vel.y * collision.timeRemaining
		};
		collision.other._startPos = {
			x: collision.otherPos.x - collision.other.vel.x * collision.time,
			y: collision.otherPos.y - collision.other.vel.y * collision.time
		};
		collision.other._endPos = {
			x: collision.otherPos.x + collision.other.vel.x * collision.timeRemaining,
			y: collision.otherPos.y + collision.other.vel.y * collision.timeRemaining
		};
	};
	FloatingMass.prototype.move = function() {
		this.pos.x = this._endPos.x;
		this.pos.y = this._endPos.y;
		this._endPos = null;
	};

	function processCollision() {
		//TODO with this being a collision object
	}

	return FloatingMass;
});