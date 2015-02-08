define([
	'client/entity/EntityX'
], function(
	SUPERCLASS
) {
	function BufferedInputEntity(SimClass, params) {
		SUPERCLASS.call(this, SimClass, params);
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
	};
	BufferedInputEntity.prototype._generateActionFromCommand = function(command) {
		//to be implemented in subclasses
	};
	BufferedInputEntity.prototype.tick = function(t) {
		//if it takes too long to apply buffered command, it becomes unbuffered
		if(this._bufferTimeRemaining !== null) {
			this._bufferTimeRemaining -= t;
			if(this._bufferTimeRemaining <= 0) {
				this._bufferTimeRemaining = null;
				this._cancelBufferedAction();
				this._cancelBufferedAction = null;
			}
		}

		SUPERCLASS.prototype.tick.call(this, t);
	};
	return BufferedInputEntity;
});