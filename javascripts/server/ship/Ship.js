if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'server/net/Connection',
	'server/utils/FloatingMass',
	'server/ship/parts/EnergySupply',
	'server/ship/parts/EnergySink',
	'server/ship/parts/Thruster',
	'server/ship/consoles/CompassConsole',
	'server/ship/consoles/CourseDriftConsole',
	'server/ship/consoles/EnergyLevelConsole',
	'server/ship/consoles/MinimapConsole',
	'server/ship/consoles/ShipPositionConsole',
	'server/ship/consoles/SpeedometerConsole',
	'server/ship/consoles/ThrusterControlsConsole',
	'server/ship/consoles/ThrusterLayoutConsole'
], function(
	Connection,
	FloatingMass,
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
		this._crew = [];
		this._pointMass = new FloatingMass(0, 0, 0, 50, 10);
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
			new EnergyLevelConsole(this._parts[0]),
			new MinimapConsole(this),
			new ShipPositionConsole(this),
			new SpeedometerConsole(this),
			new ThrusterControlsConsole([ this._parts[2], this._parts[3], this._parts[4], this._parts[5] ]),
			new ThrusterLayoutConsole([ this._parts[2], this._parts[3], this._parts[4], this._parts[5] ])
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
		for(i = 0; i < this._consoles.length; i++) {
			this._consoles[i].tick(t);
		}
		//move ship
		//this._pointMass.tick(t);
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
		this._pointMass.applyForceRelativeToFacing(forward, lateral, rotational);
	};
	Ship.prototype.getPosition = function() {
		return { x: this._pointMass.pos.x, y: this._pointMass.pos.y };
	};
	Ship.prototype.getVelocity = function() {
		return { x: this._pointMass.vel.x, y: this._pointMass.vel.y };
	};
	Ship.prototype.getHeading = function() {
		return this._pointMass.facing;
	};
	Ship.prototype.getRadius = function() {
		return this._pointMass.radius;
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