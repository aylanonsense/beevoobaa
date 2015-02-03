define([
	'client/entity/Entity',
	'shared/sim/Athlete',
	'client/Constants',
	'client/net/Connection',
	'client/Clock'
], function(
	SUPERCLASS,
	AthleteSim,
	Constants,
	Connection,
	Clock
) {
	function Athlete(params) {
		SUPERCLASS.call(this, AthleteSim, params);
	}
	Athlete.prototype = Object.create(SUPERCLASS.prototype);
	Athlete.prototype.onKeyboardEvent = function(evt, keyboard) {
		//may be trying to change direction
		var dir = null;
		if(evt.gameKey === 'MOVE_LEFT') {
			if(evt.isDown) { dir = -1; }
			else { dir = (keyboard.MOVE_RIGHT ? 1 : 0); }
		}
		else if(evt.gameKey === 'MOVE_RIGHT') {
			if(evt.isDown) { dir = 1; }
			else { dir = (keyboard.MOVE_LEFT ? -1 : 0); }
		}
		if(dir !== null) {
			this.processAction({ actionType: 'change-dir', dir: dir, x: this._clientSim.x });
		}
	};
	Athlete.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);

		//draw red shadow to represent server-side values
		if(Constants.DEBUG_RENDER_SERVER_STATE) {
			ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
			ctx.fillRect(this._serverSim.x, this._serverSim.y,
				this._serverSim.width, this._serverSim.height);
		}

		//draw blue/green rectangle to represent the client's displayed position
		ctx.fillStyle = (this._isPlayerControlled ? '#0b4' : '#05f');
		ctx.fillRect(this._clientSim.x, this._clientSim.y,
			this._clientSim.width, this._clientSim.height);
		if(this._clientSim.waypointX !== null) {
			ctx.strokeStyle = '#fff';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(this._clientSim.waypointX, this._clientSim.bottom + 8);
			ctx.lineTo(this._clientSim.waypointX + this._clientSim.width, this._clientSim.bottom + 8);
			ctx.stroke();
		}

		//draw yellow shadow to represent predicted state by the time the server receives input
		if(Constants.DEBUG_RENDER_FUTURE_STATE) {
			ctx.strokeStyle = 'rgba(255, 175, 0, 1.0)';
			ctx.lineWidth = 1;
			ctx.strokeRect(this._futureSim.x, this._futureSim.y,
				this._futureSim.width, this._futureSim.height);
		}
	};
	return Athlete;
});