define([
	'client/entity/BufferedInputEntity',
	'create!client/display/Sprite > Ball',
	'create!client/display/Sprite > BallFire',
	'create!client/display/Sprite > AthleteShadow',
	'create!client/display/Sprite > BallGhost',
	'create!client/display/Sprite > BallGhost2',
	'shared/sim/Ball',
	'client/Clock',
	'client/Spawner',
	'client/effect/NetText',
	'shared/Constants',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	FIRE_SPRITE,
	SHADOW_SPRITE,
	SERVER_GHOST_SPRITE,
	FUTURE_GHOST_SPRITE,
	BallSim,
	Clock,
	Spawner,
	NetText,
	SharedConstants,
	Constants
) {
	function Ball(params) {
		SUPERCLASS.call(this, 'Ball', BallSim, params);
		this._isPlayerControlled = true;
		this._timeShouldNotSync = 0.0;
		this._adjustingNetText = new NetText({ sim: this._sim, text: "Adjusting" });
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype._generateActionFromCommand = function(command) {
		return null;
	};
	Ball.prototype.endOfFrame = function(t, tServer) {
		SUPERCLASS.prototype.endOfFrame.call(this, t, tServer);
		this._adjustingNetText.hide();
		if(this._timeShouldNotSync === 0) {
			var dx = this._futureSim.x - this._sim.x;
			var dy = this._futureSim.y - this._sim.y;
			var dist = Math.sqrt(dx * dx + dy * dy);

			//client sim and future sim have gotten quite out of sync, snap sim to future sim
			if(dist > 25) {
				//snapped!
				Spawner.spawnEffect(new NetText({ sim: this._sim, text: "Snapped", duration: 0.8 }));
				this._sim.x = this._futureSim.x;
				this._sim.y = this._futureSim.y;
				this._sim.vel.x = this._futureSim.vel.x;
				this._sim.vel.y = this._futureSim.vel.y;
			}

			//otherwise "ease" them to each other
			else if(dist > 1) {
				if(dist > 5) {
					this._adjustingNetText.show();
				}
				this._sim.x = this._sim.x + t * dx;
				this._sim.y = this._sim.y + t * dy;
				this._sim.vel.x = this._futureSim.vel.x;
				this._sim.vel.y = this._futureSim.vel.y;
			}
		}
		else {
			this._timeShouldNotSync = Math.max(0, this._timeShouldNotSync - t);
		}

		//update net texts
		this._adjustingNetText.tick(t);
	};
	Ball.prototype.renderShadow = function(ctx) {
		var frame;
		if(SharedConstants.BOUNDS.FLOOR - this._sim.bottom > 175) { frame = 2; }
		else if(SharedConstants.BOUNDS.FLOOR - this._sim.bottom > 65) { frame = 1; }
		else { frame = 0; }

		//draw a shadow
		SHADOW_SPRITE.render(ctx, null,
			this._sim.centerX - SHADOW_SPRITE.width / 2,
			SharedConstants.BOUNDS.FLOOR - SHADOW_SPRITE.height, frame, false);

		SUPERCLASS.prototype.renderShadow.call(this, ctx);
		this._adjustingNetText.renderShadow(ctx);
	};
	Ball.prototype.render = function(ctx) {
		//draw a server shadow
		if(Constants.DEBUG_RENDER_SERVER_GHOSTS) {
			this._renderSim(ctx, this._serverSim, SERVER_GHOST_SPRITE);
		}

		//draw future shadow
		if(Constants.DEBUG_RENDER_FUTURE_GHOSTS) {
			this._renderSim(ctx, this._futureSim, FUTURE_GHOST_SPRITE);
		}

		//render "flames" around ball
		if(this._sim.timeSinceLastHit !== null && this._sim.timeSinceLastHit < 0.25) {
			var fireFrame = Math.floor(this._sim.timeSinceLastHit * 6 / 0.25);
			if(this._sim.lastHitCharge < 0.25) { fireFrame += 0; }
			else if(this._sim.lastHitCharge < 0.50) { fireFrame += 1 * 6; }
			else if(this._sim.lastHitCharge < 0.75) { fireFrame += 2 * 6; }
			else { fireFrame += 3 * 6; }
			FIRE_SPRITE.render(ctx, null, this._sim.x, this._sim.y, fireFrame, false);
		}

		//draw the sprite
		this._renderSim(ctx, this._sim, SPRITE);

		SUPERCLASS.prototype.render.call(this, ctx);
		this._adjustingNetText.render(ctx);
	};
	Ball.prototype.forcePerformAction = function(action) {
		//ball is hit client-side (happens first)
		this._timeShouldNotSync = (15 + 1.10 *
			(Clock.getServerReceiveTime() - Clock.getClientTime())) / 1000;
		SUPERCLASS.prototype.forcePerformAction.call(this, action);
	};
	Ball.prototype.onReceiveAction = function(action) {
		//ball is hit server-side (happens second, future state and client state should now be aligned)
		SUPERCLASS.prototype.onReceiveAction.call(this, action);
		this._predictFutureState();
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
	Ball.prototype.checkForNet = function(net) {
		this._sim.checkForNet(net._sim);
		this._serverSim.checkForNet(net._serverSim);
	};
	return Ball;
});