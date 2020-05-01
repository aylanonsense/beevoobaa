define([
	'client/entity/Entity'
], function(
	SUPERCLASS
) {
	function BufferedInputEntity(entityType, SimClass, params) {
		SUPERCLASS.call(this, entityType, SimClass, params);
		this._cancelBufferedAction = null;
		this._bufferTimeRemaining = null;
	}
	BufferedInputEntity.prototype = Object.create(SUPERCLASS.prototype);
	BufferedInputEntity.prototype._bufferCommand = function(command, dur) {
		var self = this;
		this._bufferTimeRemaining = dur;
		this._cancelBufferedAction = this._sim.queueAction(function() {
			return self._generateActionFromCommand(command);
		}, function(action) {
			self._sendCommand(command, action);
			self._bufferTimeRemaining = null;
			self._cancelBufferedAction = null;
		});
		if(!this._cancelBufferedAction) {
			this._bufferTimeRemaining = null;
		}
	};
	BufferedInputEntity.prototype._generateActionFromCommand = function(command) {
		//to be implemented in subclasses
	};
	BufferedInputEntity.prototype.tick = function(t, tServer) {
		//if it takes too long to apply buffered command, it becomes unbuffered
		if(this._bufferTimeRemaining !== null) {
			this._bufferTimeRemaining -= t;
			if(this._bufferTimeRemaining <= 0) {
				this._bufferTimeRemaining = null;
				this._cancelBufferedAction();
				this._cancelBufferedAction = null;
			}
		}

		SUPERCLASS.prototype.tick.call(this, t, tServer);
	};
	return BufferedInputEntity;
});