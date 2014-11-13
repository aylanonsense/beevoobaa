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
	function DriftingValue(params) {
		params = params || {};
		this._value = (typeof params.initial === 'number' ? params.initial : 0);
		this._minValue = (typeof params.min === 'number' ? params.min : null);
		this._maxValue = (typeof params.max === 'number' ? params.max : null);
		this._rateOfChange = 0;
		this._tempRateOfChange = 0;
		this._tempRateOfChangeFramesLeft = 0;
		this._stopValue = null;
		this._stopValueIsUpper = false;
	}
	DriftingValue.prototype.getValue = function() {
		return this._value;
	};
	DriftingValue.prototype.getMinValue = function() {
		return this._minValue;
	};
	DriftingValue.prototype.getMaxValue = function() {
		return this._maxValue;
	};
	DriftingValue.prototype.receiveUpdate = function(value, changePerSecond, stopValue) {
		//can be called with an object as the first param
		if(arguments.length === 1 && value !== null && typeof value === 'object') {
			stopValue = value.stopValue;
			changePerSecond = value.changePerSecond;
			value = value.value;
		}
		if(changePerSecond) {
			var rateOfChange = changePerSecond / ClientConstants.TARGET_FRAMES_PER_SECOND;
			var eventualValue = value + FRAMES_BETWEEN_UPDATES * rateOfChange;
			this._tempRateOfChange = (eventualValue - this._value) / FRAMES_BETWEEN_UPDATES;
			this._tempRateOfChangeFramesLeft = FRAMES_BETWEEN_UPDATES;
			this._rateOfChange = rateOfChange;
			this._stopValue = eventualValue + FRAMES_BETWEEN_UPDATES * rateOfChange;
			this._stopValueIsUpper = (rateOfChange > 0);
			if(typeof stopValue === 'number' &&
				((this._stopValueIsUpper && stopValue < this._stopValue) ||
				(!this._stopValueIsUpper && stopValue > this._stopValue))) {
				this._stopValue = stopValue;
			}
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
		//determine rate of change
		if(this._tempRateOfChangeFramesLeft > 0) {
			this._tempRateOfChangeFramesLeft--;
			this._value += this._tempRateOfChange;
		}
		else if(this._rateOfChange !== 0) {
			//we may hit the stop value
			if(this._stopValue !== null &&
				((this._stopValueIsUpper && this._value + this._rateOfChange >= this._stopValue) ||
				(!this._stopValueIsUpper && this._value + this._rateOfChange <= this._stopValue))) {
				this._value = this._stopValue;
				this._stopValue = null;
				this._rateOfChange = 0;
				this._tempRateOfChange = 0;
				this._tempRateOfChangeFramesLeft = 0;
			}
			//otherwise just increment
			else {
				this._value += this._rateOfChange;
			}
		}
		//check for min and max
		if(this._maxValue !== null && this._value > this._maxValue) {
			this._value = this._maxValue;
		}
		if(this._minValue !== null && this._value < this._minValue) {
			this._value = this._minValue;
		}
	};
	return DriftingValue;
});