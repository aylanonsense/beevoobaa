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
	var NETWORK_SPEED_SLOW_PERCENT = 0.93;
	var NETWORK_SPEED_BOOST_PERCENT = 1.40;
	function Player(params) {
		SUPERCLASS.call(this, PlayerSim, params);
		this._isPlayerControlled = false;
		this._timeSinceLastUpdate = 0;
	}
	Player.prototype = Object.create(SUPERCLASS.prototype);
	Player.prototype.tick = function(t) {
		this._timeSinceLastUpdate += t;

		//the player might have tricked the server and desynced with the server position
		if(this._isPlayerControlled) {
			//moving right and needs to be slowed down
			if(this._client.moveDir > 0 &&
				this._predicted.moveDir > 0 && this._predicted.x < this._client.x) {
				this._client.moveSpeed = this._predicted.moveSpeed * NETWORK_SPEED_SLOW_PERCENT;
			}
			//moving left and needs to be slowed down
			else if(this._client.moveDir < 0 &&
				this._predicted.moveDir < 0 && this._predicted.x > this._client.x) {
				this._client.moveSpeed = this._predicted.moveSpeed * NETWORK_SPEED_SLOW_PERCENT;
			}
			//moving at the appropriate speed
			else {
				this._client.moveSpeed = this._actual.moveSpeed;
			}
		}
		//non-player characters move towards the server actual
		else {
			//the client position moves towards the server position
			if(this._client.x < this._actual.x) {
				this._client.moveDir = 1;
				//might need to be sped up to reach the actual position
				this._client.moveSpeed = this._actual.moveSpeed *
					(this._client.x < this._actual.x - 5 ? NETWORK_SPEED_BOOST_PERCENT : 1.00);
			}
			else if(this._client.x > this._actual.x) {
				this._client.moveDir = -1;
				//might need to be sped up to reach the actual position
				this._client.moveSpeed = this._actual.moveSpeed *
					(this._client.x > this._actual.x + 5 ? NETWORK_SPEED_BOOST_PERCENT : 1.00);
			}
			else {
				this._client.moveDir = this._actual.moveDir;
				this._client.moveSPeed = this._actual.moveSpeed;
			}
		}

		//move!
		var beforeX = this._client.x;
		SUPERCLASS.prototype.tick.call(this, t);
		var afterX = this._client.x;

		//the client position may have reached the server position
		if(!this._isPlayerControlled && this._actual.moveDir === 0) {
			if((beforeX <= this._actual.x && this._actual.x <= afterX) ||
				(beforeX >= this._actual.x && this._actual.x >= afterX)) {
				this._client.x = this._actual.x;
				this._client.moveDir = 0;
			}
		}
	};
	Player.prototype.setPlayerControl = function(isPlayerControlled) {
		this._isPlayerControlled = isPlayerControlled;
	};
	Player.prototype.setState = function(state) {
		this._timeSinceLastUpdate = 0;
		SUPERCLASS.prototype.setState.call(this, state);
		if(!this._isPlayerControlled) {
			this._client.moveDir = this._actual.moveDir;
		}
	};
	Player.prototype.setMoveDir = function(dir) {
		if(this._client.moveDir !== dir) {
			this._client.moveDir = dir;
			this._client.moveSpeed = this._actual.moveSpeed;
			//console.log("Sending message delayed by " + Math.floor(Clock.getServerReceiveTime() - Clock.getClientTime()) + "ms");
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

		//draw blue/green rectangle to represent the client's displayed position
		ctx.fillStyle = (this._isPlayerControlled ? '#0b4' : '#05f');
		ctx.fillRect(this._client.x, this._client.y,
			this._client.width, this._client.height);

		//draw a pulse whenever we receive a state update
		if(Constants.DEBUG_RENDER_STATE_UPDATES) {
			if(this._timeSinceLastUpdate < 0.33) {
				var p = (this._timeSinceLastUpdate / 0.33);
				ctx.strokeStyle = 'rgba(255, 0, 0, ' + Math.round(100 * (1 - p)) / 100 + ')';
				ctx.lineWidth = 4;
				ctx.strokeRect(
					this._actual.x - p * 0.25 * this._actual.width / 2,
					this._actual.y - p * 0.25 * this._actual.height / 2,
					this._actual.width + p * 0.25 * this._actual.width,
					this._actual.height + p * 0.25 * this._actual.height);
			}
		}

		//draw red outline to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_OUTLINES) {
			ctx.strokeStyle = '#f00';
			ctx.lineWidth = 3;
			ctx.strokeRect(this._actual.x, this._actual.y,
				this._actual.width, this._actual.height);
		}

		//draw yellow outline to represent predicted state by the time the server receives input
		if(Constants.DEBUG_RENDER_PREDICTION_OUTLINES) {
			ctx.strokeStyle = '#fb0';
			ctx.lineWidth = 2;
			ctx.strokeRect(this._predicted.x, this._predicted.y,
				this._predicted.width, this._predicted.height);
		}
	};
	return Player;
});