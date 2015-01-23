define([
	'client/entity/PredictiveEntity',
	'shared/sim/Ball',
	'client/Clock'
], function(
	SUPERCLASS,
	BallSim,
	Clock
) {
	function Ball(params) {
		SUPERCLASS.call(this, BallSim, params);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw blue ball to represent the client's displayed ball
		ctx.fillStyle = '#05f';
		ctx.beginPath();
		ctx.arc(this._client.x, this._client.y, this._client.radius, 0, 2 * Math.PI);
		ctx.fill();

		//draw red outline to represent server-side values
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.arc(this._actual.x, this._actual.y, this._actual.radius, 0, 2 * Math.PI);
		ctx.stroke();

		//draw yellow outline to represent predicted state by the time the server receives input
		ctx.strokeStyle = '#fb0';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(this._predicted.x, this._predicted.y, this._predicted.radius, 0, 2 * Math.PI);
		ctx.stroke();
	};
	return Ball;
});