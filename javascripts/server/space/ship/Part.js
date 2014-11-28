if (typeof define !== 'function') { var define = require('amdefine')(module); }
define(function() {
	function Part(ship) {
		this._ship = ship;
		this.energyRequirements = null;
	}
	Part.prototype.prep = function(t) {
		if(this.energyRequirements) {
			this.energyRequirements.prep(t);
		}
	};
	Part.prototype.tick = function(t) {
		if(this.energyRequirements) {
			this.energyRequirements.tick(t);
		}
	};
	return Part;
});