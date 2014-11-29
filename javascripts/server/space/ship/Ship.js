if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/space/SpaceObject',
	'server/net/Connection',
	'server/utils/PhysicsObject',
	'server/space/ship/parts/EnergySupply',
	'server/space/ship/parts/EnergySink',
	'server/space/ship/parts/Thruster',
	'server/space/ship/consoles/CompassConsole',
	'server/space/ship/consoles/CourseDriftConsole',
	'server/space/ship/consoles/EnergyLevelConsole',
	'server/space/ship/consoles/MinimapConsole',
	'server/space/ship/consoles/ShipPositionConsole',
	'server/space/ship/consoles/SpeedometerConsole',
	'server/space/ship/consoles/ThrusterControlsConsole',
	'server/space/ship/consoles/ThrusterLayoutConsole'
], function(
	SUPERCLASS,
	Connection,
	PhysicsObject,
	EnergySupply,
	EnergySink,
	Thruster,
	CompassConsole,
	CourseDriftConsole,
	EnergyLevelConsole,
	MinimapConsole,
	ShipPositionConsole,
	SpeedometerConsole,
	ThrusterControlsConsole,
	ThrusterLayoutConsole
) {
	function Ship() {
		SUPERCLASS.call(this, { radius: 50, mass: 10 });
		this._crew = [];
		this._parts = [
			new EnergySupply(this, 501),
			new EnergySink(this, 0.5),
			new Thruster(this, 500, -1.3, 0, 0), //forward thruster (on back)
			new Thruster(this, 500, 1.25, 0, 180), //reverse thruster (on front)
			new Thruster(this, 500, 0.5, 1, 270), //side thruster (on port)
			new Thruster(this, 500, 0.5, -1, 90) //side thruster (on starboard)
		];
		this._consoles = [
			new CompassConsole(this),
			new CourseDriftConsole(this),
			new EnergyLevelConsole(this, this._parts[0]),
			new MinimapConsole(this),
			new ShipPositionConsole(this),
			new SpeedometerConsole(this),
			new ThrusterControlsConsole(this, [ this._parts[2], this._parts[3], this._parts[4], this._parts[5] ]),
			new ThrusterLayoutConsole(this, [ this._parts[2], this._parts[3], this._parts[4], this._parts[5] ])
		];
	}
	Ship.prototype = Object.create(SUPERCLASS.prototype);
	Ship.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
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
	};
	Ship.prototype.endOfFrame = function(t) {
		SUPERCLASS.prototype.endOfFrame.call(this, t);
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
	Ship.prototype.processConsoleInput = function(player, input) {
		for(var i = 0; i < this._consoles.length ; i++) {
			if(this._consoles[i]._consoleId === input.id) {
				this._consoles[i].processInput(player, input);
				break;
			}
		}
	};
	return Ship;
});