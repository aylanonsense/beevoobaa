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
	return Ball;
});