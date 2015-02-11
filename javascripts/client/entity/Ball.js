define([
	'client/entity/BufferedInputEntity',
	'create!client/display/Sprite > Ball',
	'create!client/display/Sprite > BallShadow',
	'shared/sim/Ball',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	SERVER_SPRITE_OUTLINE,
	BallSim,
	Constants
) {
	function Ball(params) {
		SUPERCLASS.call(this, BallSim, params);
	}
	Ball.prototype = Object.create(SUPERCLASS.prototype);
	Ball.prototype._generateActionFromCommand = function(command) {
		return null;
	};
	Ball.prototype.tick = function(t, tServer) {
		SUPERCLASS.prototype.tick.call(this, t, tServer);
	};
	Ball.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw a server shadow
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			this._renderSim(ctx, this._serverSim, SERVER_SPRITE_OUTLINE);
		}

		//draw the sprite
		this._renderSim(ctx, this._sim, SPRITE);
	};
	Ball.prototype._renderSim = function(ctx, sim, sprite) {
		sprite.render(ctx, null,
			sim.centerX - sprite.width / 2,
			sim.centerY - sprite.height / 2, 0, false);
	};
	return Ball;
});