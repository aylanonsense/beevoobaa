if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/net/Connection',
	'server/ship/parts/EnergySupply',
	'server/ship/parts/EnergySink',
	'server/ship/consoles/EnergyLevelConsole'
], function(
	Connection,
	EnergySupply,
	EnergySink,
	EnergyLevelConsole
) {
	function Ship() {
		this._parts = [ new EnergySupply(501), new EnergySink(3) ];
		this._consoles = [ new EnergyLevelConsole(this._parts[0]) ];
		this._crew = [];
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
		for(i = 0; i < this._consoles.length; i++) {
			this._consoles[i].tick(t);
		}
		//generate reports
		var reports = [];
		for(i = 0; i < this._consoles.length; i++) {
			reports.push(this._consoles[i].generateReport());
		}
		//send reports to all crew members
		Connection.sendToEach(this._crew, {
			type: 'console-update',
			reports: reports
		});
	};
	Ship.prototype.addCrewMember = function(player) {
		if(player.ship) {
			player.ship.removeCrewMember(player);
		}
		this._crew.push(player);
		player.ship = this;
	};
	Ship.prototype.removeCrewMember = function(player) {
		for(var i = 0; i < this._crew.length; i++) {
			if(this._crew[i].sameAs(player)) {
				this._crew.splice(i, 1);
				player.ship = null;
				break;
			}
		}
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