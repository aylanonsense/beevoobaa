define([
	'client/entity/Entity',
	'shared/entity/Ball',
	'client/Constants',
	'shared/Constants'
], function(
	SUPERCLASS,
	BallSim,
	Constants,
	SharedConstants
) {
	function Ball(id, state) {
		SUPERCLASS.call(this, 'Ball', id, BallSim, state);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.handleHit = function(hit, applyToClientSideOnly) {
		if(applyToClientSideOnly) {
			this._sim.handleHit(hit);
		}
		else {
			this._sim.handleHit(hit);
			this._serverSim.handleHit(hit);
		}
	};
	Ball.prototype.render = function(ctx) {
		if(Constants.DEBUG_DRAW_SERVER_GHOSTS) {
			//draw ghost
			ctx.strokeStyle = '#60f';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this._serverSim.x, this._serverSim.y , this._serverSim.radius - 0.5, 0, 2 * Math.PI);
			ctx.stroke();

			//draw predicted future state ghost
			ctx.strokeStyle = '#0f6';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(this._futureSim.x, this._futureSim.y , this._futureSim.radius - 0.5, 0, 2 * Math.PI);
			ctx.stroke();
		}

		//draw ball
		ctx.fillStyle = '#60f';
		ctx.beginPath();
		ctx.arc(this._sim.x, this._sim.y , this._sim.radius, 0, 2 * Math.PI);
		ctx.fill();
	};
	return Ball;
});