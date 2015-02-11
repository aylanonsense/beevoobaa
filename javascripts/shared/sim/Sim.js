define(function() {
	function Sim(params, simType) {
		//private vars (not synced)
		this._simType = simType;
	}
	Sim.prototype.getState = function() {
		return {};
	};
	Sim.prototype.setState = function(state) {};
	Sim.prototype.startOfFrame = function(t) {};
	Sim.prototype.tick = function(t) {};
	Sim.prototype.endOfFrame = function(t) {};
	return Sim;
});