define([
	'client/Clock',
	'shared/sim/Ball'
], function(
	Clock,
	BallSim
) {
	function Ball(params) {
		this.id = params.id;
		this._actual = new BallSim(params);
		this._displayed = new BallSim(params);
		this._predicted = new BallSim(params);
		this._predictFutureState();
	}
	Ball.prototype._predictFutureState = function() {
		this._predicted.setState(this._actual.getState());
		var serverReceiveTime = Clock.getServerReceiveTime();
		var clientTime = Clock.getClientTime();
		if(serverReceiveTime !== null && clientTime !== null) {
			//fast forward the predicted state at an effective 60 FPS
			var time = Math.abs(serverReceiveTime - clientTime) / 1000;
			for(var t = time; t > 0; t -= 1 / 60) {
				this._predicted.tick(Math.min(t, 1 / 60));
			}
		}
	};
	Ball.prototype.setState = function(state) {
		this._actual.setState(state);
		this._predictFutureState();
	};
	Ball.prototype.tick = function(t) {
		this._displayed.tick(t);
		this._actual.tick(t);
		this._predictFutureState();
	};
	Ball.prototype.render = function(ctx) {
		//draw blue ball to represent the client's displayed ball
		ctx.fillStyle = '#05f';
		ctx.beginPath();
		ctx.arc(this._displayed.x, this._displayed.y, this._displayed.radius, 0, 2 * Math.PI);
		ctx.fill();

		//draw red outline to represent server-side values
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2;
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