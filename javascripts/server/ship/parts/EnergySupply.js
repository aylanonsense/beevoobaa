if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/Part'
], function(
	SUPERCLASS
) {
	function EnergySupply(energy) {
		SUPERCLASS.call(this);

		//set vars
		this._maxEnergy = energy;
		this._energy = this._maxEnergy;
		this._allocatedEnergy = 0;

		//flags
		this.providesEnergy = true;
	}
	EnergySupply.prototype = Object.create(SUPERCLASS.prototype);
	EnergySupply.prototype.prep = function(t) {
		SUPERCLASS.prototype.prep.call(this, t);
		this._energy += this._allocatedEnergy;
		this._allocatedEnergy = 0;
	};
	EnergySupply.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
	};
	EnergySupply.prototype.getEnergy = function() {
		return this._energy + this._allocatedEnergy;
	};
	EnergySupply.prototype.allocateEnergy = function(amount, part) {
		if(this._energy >= amount) {
			this._energy -= amount;
			this._allocatedEnergy += amount;
			return amount;
		}
		else {
			var energy = this._energy;
			this._energy = 0;
			this._allocatedEnergy += energy;
			return energy;
		}
	};
	EnergySupply.prototype.deallocateEnergy = function(amount, part) {
		if(this._allocatedEnergy >= amount) {
			this._allocatedEnergy -= amount;
			this._energy += amount;
		}
		else {
			var energy = this._allocatedEnergy;
			this._energy += energy;
			this._allocatedEnergy = 0;
		}
	};
	EnergySupply.prototype.expendEnergy = function(amount, part) {
		if(this._allocatedEnergy >= amount) {
			this._allocatedEnergy -= amount;
			return amount;
		}
		else {
			var energy = this._allocatedEnergy;
			this._allocatedEnergy = 0;
			return energy;
		}
	};
	return EnergySupply;
});