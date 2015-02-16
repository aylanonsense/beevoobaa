define([
	'server/entity/Entity',
	'shared/sim/Ball'
], function(
	SUPERCLASS,
	BallSim
) {
	function Ball(params) {
		SUPERCLASS.call(this, 'Ball', BallSim, params);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype._generateActionFromCommand = function(command, action) {
		return null;
	};
	Ball.prototype.checkForNet = function(net) {
		this._sim.checkForNet(net._sim);
	};
	return Ball;
});