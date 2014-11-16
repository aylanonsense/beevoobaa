if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Part',
	'server/ship/mechanics/EnergyRequirements'
], function(
	SUPERCLASS,
	EnergyRequirements
) {
	function Thruster(ship, maxThrust, x, y, angle) {
		SUPERCLASS.call(this, ship);
		this._maxThrust = maxThrust;
		this._desiredThrust = this._maxThrust;
		this._actualThrust = 0;
		this.energyRequirements = new EnergyRequirements();

		//calculate proportion of thrust that goes to forward/lateral/rotational velocity
		this._offsetX = x || 0;
		this._offsetY = y || 0;
		this._angle = (angle || 0) * Math.PI / 180; //0: thrusting ship forward, PI/2 right, PI: backward, -PI/2: left
		if(this._angle > Math.PI) { this._angle -= Math.PI / 2; }
		//var distX = this._offsetX * ship.getRadius();
		//var distY = this._offsetY * ship.getRadius();
		//var distToCenterOfMass = Math.sqrt(distX * distX + distY * distY);
		//var angleToCenterOfMass = Math.atan2(distY, distX);
		this._multForward = Math.cos(this._angle);
		this._multLateral = -Math.sin(this._angle);
		this._multRotational = 0.00;//distToCenterOfMass * Math.cos(angleToCenterOfMass);
	}
	Thruster.prototype = Object.create(SUPERCLASS.prototype);
	Thruster.prototype.prep = function(t) {
		SUPERCLASS.prototype.prep.call(this, t);
		this.energyRequirements.setRequiredEnergy(calcEnergyUse(this._desiredThrust) * t);
	};
	Thruster.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
		this._actualThrust = calcThrust(this.energyRequirements.getProvidedEnergy()) / t;
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
		return { x: this._offsetX, y: this._offsetY };
	};
	Thruster.prototype.getAngle = function() {
		return this._angle;
	};

	//helper methods
	function calcEnergyUse(thrust) {
		return thrust / 200;
	}
	function calcThrust(energy) {
		return energy * 200;
	}

	return Thruster;
});