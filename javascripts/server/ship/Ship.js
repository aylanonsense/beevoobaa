if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/ship/parts/EnergySupply',
	'server/ship/parts/EnergySink'
], function(
	EnergySupply,
	EnergySink
) {
	function Ship() {
		this._parts = [
			new EnergySupply(501),
			new EnergySink(50)
		];
	}
	Ship.prototype.tick = function(t) {
		//prep phase
		for(var i = 0; i < this._parts.length; i++) {
			this._parts[i].prep(t);
		}
		//fulfill energy requirements
		for(i = 0; i < this._parts.length; i++) {
			if(this._parts[i].energyRequirements && this._parts[i].energyRequirements.getRequiredEnergy() > 0) {
				this._provideEnergy(this._parts[i]);
			}
		}
		//tick
		for(i = 0; i < this._parts.length; i++) {
			this._parts[i].tick(t);
		}
		console.log(this._parts[0].getEnergy());
	};
	Ship.prototype._provideEnergy = function(part) {
		var amount = part.energyRequirements.getRequiredEnergy();
		for(var i = 0; i < this._parts.length; i++) {
			if(this._parts[i].providesEnergy) {
				var energy = this._parts[i].allocateEnergy(amount, part);
				if(energy >= amount) {
					energy = this._parts[i].expendEnergy(energy, part);
					part.energyRequirements.provideEnergy(energy, this._parts[i]);
					return energy;
				}
				else {
					this._parts[i].deallocateEnergy(energy, part);
				}
			}
		}
		return 0;
	};

	return Ship;
});