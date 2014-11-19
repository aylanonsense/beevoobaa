if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/Constants',
	'client/sprite/SpriteLoader',
	'client/net/Connection',
	'client/util/TextWriter',
	'client/util/StringUtils',
	'client/util/DriftingValue',
	'client/util/Rect'
], function(
	SUPERCLASS,
	Constants,
	SpriteLoader,
	Connection,
	TextWriter,
	StringUtils,
	DriftingValue,
	Rect
) {
	var BAR_SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_CONTROLS_CONSOLE_BAR');
	var SLIDER_SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_CONTROLS_CONSOLE_SLIDER');
	function ThrusterControlsConsole(x, y, update) {
		var self = this;
		SUPERCLASS.call(this, x, y, update);
		this._thrusters = update.thrusters.map(function(thruster, i) {
			return {
				thrust: new DriftingValue({ initial: thruster.thrust.value, min: 0, max: thruster.maxThrust }),
				targetThrust: new DriftingValue({ initial: thruster.targetThrust.value, min: 0, max: thruster.maxThrust }),
				clickArea: new Rect(self._x + 21, self._y + (12 + BAR_SPRITE.height) * i, 183, 33),
				isHovering: false,
				thrustPercent: null,
				framesToRetainDrag: -1,
				minDragX: self._x + 15,
				maxDragX: self._x + 189
			};
		});
		this._width = 20 + BAR_SPRITE.width;
		this._height = (BAR_SPRITE.height + 12) * this._thrusters.length;
		this._dragIndex = null;
	}
	ThrusterControlsConsole.prototype = Object.create(SUPERCLASS.prototype);
	ThrusterControlsConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		for(var i = 0; i < this._thrusters.length; i++) {
			this._thrusters[i].thrust.receiveUpdate(update.thrusters[i].thrust);
			this._thrusters[i].targetThrust.receiveUpdate(update.thrusters[i].targetThrust);
		}
	};
	ThrusterControlsConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		for(var i = 0; i < this._thrusters.length; i++) {
			this._thrusters[i].thrust.tick();
			this._thrusters[i].targetThrust.tick();
			if(this._thrusters[i].framesToRetainDrag >= 0) {
				this._thrusters[i].framesToRetainDrag--;
			}
		}
	};
	ThrusterControlsConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var paddingBottom = 12;
		var renderArea = { bottom: this._y + 9 - paddingBottom };
		for(var i = 0; i < this._thrusters.length; i++) {
			//determine frames
			var barFrame = Math.ceil(59 * this._thrusters[i].thrust.getValue() / this._thrusters[i].thrust.getMaxValue());
			var sliderFrame = 1;
			if(i === this._dragIndex) { sliderFrame = 2; }
			else if(this._thrusters[i].isHovering) { sliderFrame = 0; }
			//draw bar and text
			renderArea = BAR_SPRITE.render(ctx, this._x + 18, renderArea.bottom + paddingBottom, barFrame);
			TextWriter.write(ctx, '' + (i + 1), renderArea.left - 3, renderArea.top + Math.floor(renderArea.height / 2),
				{ size: 'small', align: 'right', vAlign: 'center' });
			//draw slider
			var sliderPos = renderArea.left - 3 + Math.ceil(174 * this._thrusters[i].targetThrust.getValue() /
				this._thrusters[i].targetThrust.getMaxValue());
			if(this._dragIndex === i || this._thrusters[i].framesToRetainDrag >= 0) {
				sliderPos = this._thrusters[i].minDragX + this._thrusters[i].thrustPercent *
						(this._thrusters[i].maxDragX - this._thrusters[i].minDragX);
			}
			SLIDER_SPRITE.render(ctx, sliderPos, renderArea.top - 9, sliderFrame);
		}
		if(Constants.DEBUG_RENDER_MODE) {
			for(i = 0; i < this._thrusters.length; i++) {
				this._thrusters[i].clickArea.render(ctx);
			}
		}
	};
	ThrusterControlsConsole.prototype.onMouse = function(evt, x, y) {
		var i;
		if(evt === 'mousemove') {
			if(this._dragIndex === null) {
				for(i = 0; i < this._thrusters.length; i++) {
					this._thrusters[i].isHovering = this._thrusters[i].clickArea.containsPoint(x, y);
				}
			}
			else {
				i = this._dragIndex;
				this._thrusters[i].thrustPercent =  Math.max(0, Math.min((x - 11 - this._thrusters[i].minDragX) /
						(this._thrusters[i].maxDragX - this._thrusters[i].minDragX), 1));
				return true;
			}
		}
		else if(evt === 'mousedown') {
			for(i = 0; i < this._thrusters.length; i++) {
				if(this._thrusters[i].clickArea.containsPoint(x, y)) {
					this._dragIndex = i;
					this._thrusters[i].thrustPercent =  Math.max(0, Math.min((x - 11 - this._thrusters[i].minDragX) /
							(this._thrusters[i].maxDragX - this._thrusters[i].minDragX), 1));
					return true;
				}
			}
		}
		else if(evt === 'mouseup' && this._dragIndex !== null) {
			i = this._dragIndex;
			this._thrusters[i].framesToRetainDrag = Constants.TARGET_FRAMES_PER_SECOND;
			this._thrusters[i].thrustPercent =  Math.max(0, Math.min((x - 11 - this._thrusters[i].minDragX) /
					(this._thrusters[i].maxDragX - this._thrusters[i].minDragX), 1));
			this._thrusters[i].isHovering = this._thrusters[i].clickArea.containsPoint(x, y);
			this._sendDragInput();
			this._dragIndex = null;
		}
	};
	ThrusterControlsConsole.prototype._sendDragInput = function() {
		Connection.send({
			id: this._consoleId,
			type: 'console-input',
			thrusterIndex: this._dragIndex,
			targetThrust: this._thrusters[this._dragIndex].thrustPercent *
					this._thrusters[this._dragIndex].targetThrust.getMaxValue()
		});
	};
	return ThrusterControlsConsole;
});