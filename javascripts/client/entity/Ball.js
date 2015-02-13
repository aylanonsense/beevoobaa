define([
	'client/entity/BufferedInputEntity',
	'create!client/display/Sprite > Ball',
	'create!client/display/Sprite > BallShadow',
	'create!client/display/Sprite > BallShadow2',
	'shared/sim/Ball',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	SERVER_SPRITE_OUTLINE,
	FUTURE_SPRITE_OUTLINE,
	BallSim,
	Constants
) {
	function Ball(params) {
		SUPERCLASS.call(this, 'Ball', BallSim, params);
		this._isPlayerControlled = true;
		this._shouldSyncWithFuture = true;
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype._generateActionFromCommand = function(command) {
		return null;
	};
	Ball.prototype.endOfFrame = function(t, tServer) {
		SUPERCLASS.prototype.endOfFrame.call(this, t, tServer);
		if(this._shouldSyncWithFuture) {
			var dx = this._futureSim.x - this._sim.x;
			var dy = this._futureSim.y - this._sim.y;
			var dist = Math.sqrt(dx * dx + dy * dy);

			//client sim and future sim have gotten quite out of sync, snap sim to future sim
			if(dist > 50) {
				this._sim.x = this._futureSim.x;
				this._sim.y = this._futureSim.y;
				this._sim.vel.x = this._futureSim.vel.x;
				this._sim.vel.y = this._futureSim.vel.y;
			}

			//otherwise "ease" them to each other
			else {
				this._sim.x = this._sim.x + t * dx;
				this._sim.y = this._sim.y + t * dy;
				this._sim.vel.x = this._futureSim.vel.x;
				this._sim.vel.y = this._futureSim.vel.y;
			}
		}
	};
	Ball.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw a server shadow
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			this._renderSim(ctx, this._serverSim, SERVER_SPRITE_OUTLINE);
		}

		//draw future shadow
		if(Constants.DEBUG_RENDER_FUTURE_STATE) {
			this._renderSim(ctx, this._futureSim, FUTURE_SPRITE_OUTLINE);
		}

		//draw the sprite
		this._renderSim(ctx, this._sim, SPRITE);
	};
	Ball.prototype.forcePerformAction = function(action) {
		//ball is hit client-side (happens first)
		this._shouldSyncWithFuture = false;
		SUPERCLASS.prototype.forcePerformAction.call(this, action);
	};
	Ball.prototype.onReceiveAction = function(action) {
		//ball is hit server-side (happens second, future state and client state should now be aligned)
		SUPERCLASS.prototype.onReceiveAction.call(this, action);
		this._predictFutureState();
		this._shouldSyncWithFuture = true;
	};
	Ball.prototype._renderSim = function(ctx, sim, sprite) {
		var jiggleX = 0;
		var jiggleY = 0;
		if(sim.freezeTime > 0) {
			jiggleX = 5 * Math.random() - 5 / 2;
			jiggleY = 5 * Math.random() - 5 / 2;
		}
		sprite.render(ctx, null,
			sim.centerX - sprite.width / 2 + jiggleX,
			sim.centerY - sprite.height / 2 + jiggleY, 0, false);
	};
	return Ball;
});