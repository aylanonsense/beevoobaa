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
	return Ball;
});