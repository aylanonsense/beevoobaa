if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/net/Connection',
	'server/utils/FloatingMass',
	'server/ship/parts/EnergySupply',
	'server/ship/parts/EnergySink',
	'server/ship/parts/Thruster',
	'server/ship/consoles/EnergyLevelConsole',
	'server/ship/consoles/ShipPositionConsole'
], function(
	Connection,
	FloatingMass,
	EnergySupply,
	EnergySink,
	Thruster,
	EnergyLevelConsole,
	ShipPositionConsole
) {
	function Ship() {
		this._parts = [
			new EnergySupply(this, 501),
			new EnergySink(this, 3),
			new Thruster(this, 500, 1, 1, 45)
		];
		this._consoles = [
			new EnergyLevelConsole(this._parts[0]),
			new ShipPositionConsole(this)
		];
		this._crew = [];
		this.heading = 0;
		this._pointMass = new FloatingMass(0, 0, 0, 10, 10);
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
		//move ship
		this._pointMass.tick(t);
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
	Ship.prototype.applyForce = function(x, y, rotational) {
		this._pointMass.applyForce(x, y, rotational);
	};
	Ship.prototype.applyForceRelativeToHeading = function(forward, lateral, rotational) {
		this._pointMass.applyForceRelativeToHeading(forward, lateral, rotational);
	};
	Ship.prototype.getPosition = function() {
		return { x: this._pointMass.pos.x, y: this._pointMass.pos.y };
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