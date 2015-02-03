define([
	'client/entity/Entity2',
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
	Athlete.prototype.tick = function(t) {
		SUPERCLASS.prototype.tick.call(this, t);
	};
	Athlete.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);
	};
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
		if(dir !== null && dir !== this._clientSim.moveDir) {
			this.applyAction({ actionType: 'change-dir', dir: dir }, true);
		}
	};
	Athlete.prototype.checkForInconsistentAction = function(action, sentAction) {
		Athlete.prototype.checkForInconsistentAction.call(this, action, sentAction);
	};
	Athlete.prototype.markAsOutOfSync = function() {
		SUPERCLASS.prototype.markAsOutOfSync.call(this);
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