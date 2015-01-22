define([
	'client/entity/PredictiveEntity',
	'shared/sim/Player',
	'client/Clock'
], function(
	SUPERCLASS,
	PlayerSim,
	Clock
) {
	function Player(params) {
		SUPERCLASS.call(this, PlayerSim, params);
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.setMoveDir = function(dir) { //-1, 0, or 1
		if(this._client.moveDir !== dir) {
			this._client.moveDir = dir;
			//TODO send notification to server
		}
	};
	Player.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw blue rectangle to represent the client's displayed position
		ctx.fillStyle = '#05f';
		ctx.fillRect(this._client.x, this._client.y,
			this._client.width, this._client.height, 0, 2 * Math.PI);

		//draw red outline to represent server-side values
		ctx.strokeStyle = '#f00';
		ctx.lineWidth = 2;
		ctx.strokeRect(this._actual.x, this._actual.y,
			this._actual.width, this._actual.height, 0, 2 * Math.PI);

		//draw yellow outline to represent predicted state by the time the server receives input
		ctx.strokeStyle = '#fb0';
		ctx.lineWidth = 2;
		ctx.strokeRect(this._predicted.x, this._predicted.y,
			this._predicted.width, this._predicted.height, 0, 2 * Math.PI);
	};
	return Player;
});