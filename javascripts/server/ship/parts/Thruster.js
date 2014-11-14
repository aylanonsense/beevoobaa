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
		this._percentThrust = 1.0;
		this.energyRequirements = new EnergyRequirements();

		//calculate proportion of thrust that goes to forward/lateral/rotational velocity
		this._offsetX = x || 0;
		this._offsetY = y || 0;
		this._angle = (angle || 0) * Math.PI / 180; //0: thrusting ship forward, PI/2 right, PI: backward, -PI/2: left
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
		this.energyRequirements.setRequiredEnergy(calcEnergyUse(this._maxThrust * this._percentThrust) * t);
	};
	Thruster.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
		var thrust = calcThrust(this.energyRequirements.getProvidedEnergy()) * t;
		if(thrust > 0) {
			this._ship.applyForceRelativeToHeading(this._multForward * thrust,
				this._multLateral * thrust, this._multRotational * thrust);
		}
	};

	//helper methods
	function calcEnergyUse(thrust) {
		return thrust / 50;
	}
	function calcThrust(energy) {
		return energy * 50;
	}

	return Thruster;
});