if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Part',
	'server/ship/mechanics/EnergyRequirements'
], function(
	SUPERCLASS,
	EnergyRequirements
) {
	var MAX_THRUST_CHANGE_PER_SECOND = 60;
	function Thruster(ship, maxThrust, x, y, angle) {
		SUPERCLASS.call(this, ship);
		this._maxThrust = maxThrust;
		this._actualThrust = 0;
		this._targetThrust = 0;
		this.energyRequirements = new EnergyRequirements();
		//calculate proportion of thrust that goes to forward/lateral
		this._offset = { x: x || 0, y: y || 0 };
		this._angle = (angle || 0) * Math.PI / 180;
		if(this._angle > Math.PI) { this._angle -= Math.PI * 2; }
		this._multForward = Math.cos(this._angle);
		this._multLateral = Math.sin(this._angle);
		//calculate proportyion of thrust that goes to rotational velocity
		var distX = this._offset.x * ship.getRadius();
		var distY = this._offset.y * ship.getRadius();
		var distFromCenterOfMass = Math.sqrt(distX * distX + distY * distY);
		var angleFromCenterOfMass = Math.atan2(distY, distX);
		var angleDiff = (this._angle - angleFromCenterOfMass) % (2 * Math.PI);
		if(angleDiff < -Math.PI) { angleDiff += 2 * Math.PI; }
		else if(angleDiff > Math.PI) { angleDiff -= 2 * Math.PI; }
		this._multRotational = distFromCenterOfMass * Math.sin(angleDiff);
	}
	Thruster.prototype = Object.create(SUPERCLASS.prototype);
	Thruster.prototype.prep = function(t) {
		SUPERCLASS.prototype.prep.call(this, t);
		var d = MAX_THRUST_CHANGE_PER_SECOND * t;
		var desiredThrust;
		if(this._actualThrust < this._targetThrust - d) { desiredThrust = this._actualThrust + d; }
		else if(this._actualThrust > this._targetThrust + d) { desiredThrust = this._actualThrust - d; }
		else { desiredThrust = this._targetThrust; }
		this.energyRequirements.setRequiredEnergy(calcEnergyUse(desiredThrust) * t);
	};
	Thruster.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
		this._actualThrust = calcThrust(this.energyRequirements.getProvidedEnergy()) / t;
		if(this._actualThrust > this._maxThrust) { this._actualThrust = this._maxThrust; }
		if(this._actualThrust > 0) {
			this._ship.applyForceRelativeToHeading(this._multForward * this._actualThrust,
				this._multLateral * this._actualThrust, this._multRotational * this._actualThrust);
		}
	};
	Thruster.prototype.getThrust = function() {
		return this._actualThrust;
	};
	Thruster.prototype.getMaxThrust = function() {
		return this._maxThrust;
	};
	Thruster.prototype.getOffset = function() {
		return { x: this._offset.x, y: this._offset.y };
	};
	Thruster.prototype.getAngle = function() {
		return this._angle;
	};
	Thruster.prototype.getTargetThrust = function() {
		return this._targetThrust;
	};
	Thruster.prototype.setTargetThrust = function(thrust) {
		this._targetThrust = thrust;
	};

	//helper methods
	function calcEnergyUse(thrust) {
		return thrust / 100;
	}
	function calcThrust(energy) {
		return energy * 100;
	}

	return Thruster;
});