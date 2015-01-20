define([
	'shared/sim/Ball'
], function(
	BallSim
) {
	var NEXT_BALL_ID = 0;
	function Ball(params) {
		this.id = NEXT_BALL_ID++;
		this._sim = new BallSim(params);
	}
	Ball.prototype.getState = function() {
		var state = this._sim.getState();
		state.entityType = 'Ball';
		state.id = this.id;
		return state;
	};
	Ball.prototype.tick = function(t) {
		this._sim.tick(t);
	};
	return Ball;
});