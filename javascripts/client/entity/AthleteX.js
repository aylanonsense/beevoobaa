define([
	'client/entity/BufferedInputEntityX',
	'create!client/display/Sprite > Athlete',
	'create!client/display/Sprite > AthleteOutline',
	'shared/sim/AthleteX',
	'client/Constants'
], function(
	SUPERCLASS,
	SPRITE,
	SERVER_SPRITE_OUTLINE,
	AthleteSim,
	Constants
) {
	var INPUT_BUFFER_TIME = 5.5 / 60;
	function Athlete(params) {
		SUPERCLASS.call(this, AthleteSim, params);
		this._cancelBufferedAction = null;
		this._bufferTimeRemaining = null;
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.onKeyboardEvent = function(evt, keyboard) {
		if(evt.gameKey === 'JUMP') {
			if(evt.isDown) { this._bufferCommand('charge-jump', null); }
			else { this._bufferCommand('jump', INPUT_BUFFER_TIME); }
		}
		else if(evt.gameKey === 'MOVE_LEFT') {
			if(evt.isDown) { this._bufferCommand('move-left', null); }
			else { this._bufferCommand(keyboard.MOVE_RIGHT ? 'move-right' : 'stop', null); }
		}
		else if(evt.gameKey === 'MOVE_RIGHT') {
			if(evt.isDown) { this._bufferCommand('move-right', null); }
			else { this._bufferCommand(keyboard.MOVE_LEFT ? 'move-left' : 'stop', null); }
		}
	};
	Athlete.prototype._generateActionFromCommand = function(command) {
		if(command === 'move-left') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: -1 };
		}
		else if(command === 'move-right') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: 1 };
		}
		else if(command === 'stop') {
			return { actionType: 'follow-waypoint', x: this._sim.x, dir: 0 };
		}
		else if(command === 'charge-jump') {
			return { actionType: 'charge-jump', x: this._sim.x };
		}
		else if(command === 'jump') {
			return { actionType: 'jump', x: this._sim.x, charge: 1.0, dir: 0.0 }; //TODO
		}
		return null;
	};
	Athlete.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw red shadow to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			this._renderSim(ctx, this._serverSim, SERVER_SPRITE_OUTLINE);
		}

		//draw blue/green rectangle to represent the client's displayed position
		this._renderSim(ctx, this._sim, SPRITE);
	};
	Athlete.prototype._renderSim = function(ctx, sim, sprite) {
		sprite.render(ctx, null,
			sim.right - Math.floor(SPRITE.width / 2 + sim.width / 2),
			sim.bottom - SPRITE.height, 0, false);
	};
	return Athlete;
});