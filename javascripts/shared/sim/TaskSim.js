define(function() {
	function TaskSim(params, simType) {
		//private vars (not synced)
		this._simType = simType;
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
	TaskSim.prototype.getState = function() {
		return {
			//task vars
			currentTask: this.currentTask,
			currentTaskDetails: this.currentTaskDetails,
			currentTaskPriority: this.currentTaskPriority,
			currentTaskDuration: this.currentTaskDuration
		};
	};
	TaskSim.prototype.setState = function(state) {
		//task vars
		this.currentTask = state.currentTask;
		this.currentTaskDetails = state.currentTaskDetails;
		this.currentTaskPriority = state.currentTaskPriority;
		this.currentTaskDuration = state.currentTaskDuration;
	};
	TaskSim.prototype.startOfFrame = function(t) {
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
	};
	TaskSim.prototype.tick = function(t) {};
	TaskSim.prototype.endOfFrame = function(t) {};
	TaskSim.prototype.queueAction = function(generateFunc, callback) {
		var action = generateFunc();
		if(action && this.performAction(action)) {
			//we get rid of what WAS queued because this essentially overwrote it
			this._queuedActionGenerateFunc = null;
			this._queuedActionCallback = null;
			this._queuedActionNum = null;
			if(callback) {
				callback(action);
			}
			return function() {};
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
	TaskSim.prototype.performAction = function(action) {
		//to be filled out in subclasses
	};

	//helper methods
	TaskSim.prototype._setTask = function(task, details, priority) {
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
	TaskSim.prototype._clearTask = function() {
		this.currentTask = null;
		this.currentTaskDetails = null;
		this.currentTaskPriority = null;
		this.currentTaskDuration = 0.0;
	};

	return TaskSim;
});