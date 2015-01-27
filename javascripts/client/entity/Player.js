define([
	'client/entity/Entity',
	'shared/sim/Player',
	'client/Constants',
	'client/net/Connection',
	'client/Clock'
], function(
	SUPERCLASS,
	PlayerSim,
	Constants,
	Connection,
	Clock
) {
	function Player(params) {
		SUPERCLASS.call(this, PlayerSim, params);
		this._isPlayerControlled = false;
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.setPlayerControl = function(isPlayerControlled) {
		this._isPlayerControlled = isPlayerControlled;
	};
	Player.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
		if(!this._isPlayerControlled) {
			this._client.moveDir = this._actual.moveDir;
		}
	};
	Player.prototype.setMoveDir = function(dir) {
		if(this._client.moveDir !== dir) {
			this._client.moveDir = dir;
			console.log("Sending message delayed by " + Math.floor(Clock.getServerReceiveTime() - Clock.getClientTime()) + "ms");
			Connection.bufferSend({
				messageType: 'player-action',
				actionType: 'change-dir',
				dir: dir,
				x: this._client.x,
				time: Clock.getServerReceiveTime()
			});
		}
	};
	Player.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw blue rectangle to represent the client's displayed position
		ctx.fillStyle = '#05f';
		ctx.fillRect(this._client.x, this._client.y,
			this._client.width, this._client.height, 0, 2 * Math.PI);

		//draw red outline to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_OUTLINES) {
			ctx.strokeStyle = '#f00';
			ctx.lineWidth = 3;
			ctx.strokeRect(this._actual.x, this._actual.y,
				this._actual.width, this._actual.height, 0, 2 * Math.PI);
		}

		//draw yellow outline to represent predicted state by the time the server receives input
		if(Constants.DEBUG_RENDER_PREDICTION_OUTLINES) {
			ctx.strokeStyle = '#fb0';
			ctx.lineWidth = 2;
			ctx.strokeRect(this._predicted.x, this._predicted.y,
				this._predicted.width, this._predicted.height, 0, 2 * Math.PI);
		}
	};
	return Player;
});