define([
	'shared/sim/LocatableSim'
], function(
	SUPERCLASS
) {
	function LocatableTaskSim(params, simType) {
		SUPERCLASS.call(this, params, simType);

		//private vars (not synced)
		this._queuedActionGenerateFunc = null;
		this._queuedActionCallback = null;
		this._queuedActionNum = null;
		this._nextQueuedActionNum = 0;

		//task vars
		this.currentTask = null;
		this.currentTaskDetails = null;
		this.currentTaskPriority = null;
		this.currentTaskDuration = 0.0;
	}
	LocatableTaskSim.prototype = Object.create(SUPERCLASS.prototype);
	LocatableTaskSim.prototype.getState = function() {
		var state = SUPERCLASS.prototype.getState.call(this);

		//task vars
		state.currentTask = this.currentTask;
		state.currentTaskDetails = this.currentTaskDetails;
		state.currentTaskPriority = this.currentTaskPriority;
		state.currentTaskDuration = this.currentTaskDuration;

		return state;
	};
	LocatableTaskSim.prototype.setState = function(state) {
		SUPERCLASS.prototype.setState.call(this, state);

		//task vars
		this.currentTask = state.currentTask;
		this.currentTaskDetails = state.currentTaskDetails;
		this.currentTaskPriority = state.currentTaskPriority;
		this.currentTaskDuration = state.currentTaskDuration;
	};
	LocatableTaskSim.prototype.startOfFrame = function(t) {
		//mayhaps an action is queued that we are able to perform
		if(this._queuedActionGenerateFunc !== null) {
			var action = this._queuedActionGenerateFunc();
			if(!action) {
				this._queuedActionGenerateFunc = null;
				this._queuedActionCallback = null;
				this._queuedActionNum = null;
			}
			if(action && this.performAction(action)) {
				var callback = this._queuedActionCallback;
				this._queuedActionGenerateFunc = null;
				this._queuedActionCallback = null;
				this._queuedActionNum = null;
				if(callback) {
					callback(action);
				}
			}
		}
		SUPERCLASS.prototype.startOfFrame.call(this, t);
	};
	LocatableTaskSim.prototype.queueAction = function(generateFunc, callback) {
		var action = generateFunc();
		if(action && this.performAction(action)) {
			//we get rid of what WAS queued because this essentially overwrote it
			this._queuedActionGenerateFunc = null;
			this._queuedActionCallback = null;
			this._queuedActionNum = null;
			if(callback) {
				callback(action);
			}
			return null;
		}
		else {
			this._queuedActionGenerateFunc = generateFunc;
			this._queuedActionCallback = callback;
			this._queuedActionNum = this._nextQueuedActionNum++;
			var queuedActionNum = this._queuedActionNum;
			var self = this;
			return function() {
				if(queuedActionNum === self._queuedActionNum) {
					self._queuedActionGenerateFunc = null;
					self._queuedActionCallback = null;
					self._queuedActionNum = null;
				}
			};
		}
	};
	LocatableTaskSim.prototype.performAction = function(action) {
		//to be filled out in subclasses
	};

	//helper methods
	LocatableTaskSim.prototype._setTask = function(task, details, priority) {
		if(this.currentTask === null || this.currentTaskPriority === null ||
			(priority !== null && priority < this.currentTaskPriority)) {
			this.currentTask = task;
			this.currentTaskDetails = details;
			this.currentTaskPriority = priority || null;
			this.currentTaskDuration = 0.0;
			return true;
		}
		return false;
	};
	LocatableTaskSim.prototype._clearTask = function() {
		this.currentTask = null;
		this.currentTaskDetails = null;
		this.currentTaskPriority = null;
		this.currentTaskDuration = 0.0;
	};

	return LocatableTaskSim;
});