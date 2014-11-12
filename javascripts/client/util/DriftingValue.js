if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'shared/Constants',
	'client/Constants'
], function(
	SharedConstants,
	ClientConstants
) {
	var FRAMES_BETWEEN_UPDATES = Math.floor(
		ClientConstants.TARGET_FRAMES_PER_SECOND /
		SharedConstants.SERVER_UPDATES_PER_SECOND);
	function DriftingValue(initialValue) {
		this._value = initialValue || 0;
		this._rateOfChange = 0;
		this._tempRateOfChange = 0;
		this._tempRateOfChangeFramesLeft = 0;
		this._stopValue = null;
		this._stopValueIsUpper = false;
	}
	DriftingValue.prototype.getValue = function() {
		return this._value;
	};
	DriftingValue.prototype.receiveUpdate = function(value, rateOfChange, stopValue) {
		if(rateOfChange) {
			var eventualValue = value + FRAMES_BETWEEN_UPDATES * rateOfChange;
			this._rateOfChange = rateOfChange;
			this._tempRateOfChange = (eventualValue - value) / FRAMES_BETWEEN_UPDATES;
			this._tempRateOfChangeFramesLeft = FRAMES_BETWEEN_UPDATES;
			if(typeof stopValue === 'number') {
				this._stopValue = stopValue;
			}
			else {
				this._stopValue = eventualValue + FRAMES_BETWEEN_UPDATES * rateOfChange;
			}
			this._stopValueIsUpper = (rateOfChange > 0);
		}
		else {
			this._rateOfChange = 2 * (value - this._value) / FRAMES_BETWEEN_UPDATES;
			this._tempRateOfChange = 0;
			this._tempRateOfChangeFramesLeft = 0;
			this._stopValue = value;
			this._stopValueIsUpper = (this._rateOfChange > 0);
		}
	};
	DriftingValue.prototype.tick = function() {
		if(this._rateOfChange !== 0) {
			//determine rate of change
			var d;
			if(this._tempRateOfChangeFramesLeft > 0) {
				this._tempRateOfChangeFramesLeft--;
				d = this._tempRateOfChange / ClientConstants.TARGET_FRAMES_PER_SECOND;
			}
			else {
				d = this._rateOfChange / ClientConstants.TARGET_FRAMES_PER_SECOND;
			}
			//we may hit the stop value
			if(this._stopValue !== null && ((this._stopValueIsUpper && d > 0 && this._value + d >= this._stopValue) ||
				(!this._stopValueIsUpper && d < 0 && this._value + d <= this._stopValue))) {
				this._value = this._stopValue;
				this._stopValue = null;
				this._rateOfChange = 0;
				this._tempRateOfChange = 0;
				this._tempRateOfChangeFramesLeft = 0;
			}
			//otherwise just increment
			else {
				this._value += d;
			}
		}
	};
	return DriftingValue;
});