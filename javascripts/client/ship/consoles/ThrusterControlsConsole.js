if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/sprite/SpriteLoader',
	'client/util/TextWriter',
	'client/util/StringUtils',
	'client/util/DriftingValue'
], function(
	SUPERCLASS,
	SpriteLoader,
	TextWriter,
	StringUtils,
	DriftingValue
) {
	var BAR_SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_CONTROLS_CONSOLE_BAR');
	var SLIDER_SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_CONTROLS_CONSOLE_SLIDER');
	function ThrusterControlsConsole(update) {
		SUPERCLASS.call(this, update);
		this._thrusters = update.thrusters.map(function(thruster) {
			return {
				thrust: new DriftingValue({ intial: thruster.thrust.value, min: 0, max: thruster.maxThrust }),
				targetThrust: new DriftingValue({ intial: thruster.targetThrust.value, min: 0, max: thruster.maxThrust })
			};
		});
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
		}
	};
	ThrusterControlsConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var x = 0;
		var y = 0;
		var paddingBottom = 12;
		var renderArea = { bottom: x + 9 - paddingBottom };
		for(var i = 0; i < this._thrusters.length; i++) {
			var barFrame = Math.ceil(59 * this._thrusters[i].thrust.getValue() / this._thrusters[i].thrust.getMaxValue());
			renderArea = BAR_SPRITE.render(ctx, x + 18, renderArea.bottom + paddingBottom, barFrame);
			TextWriter.write(ctx, '' + (i + 1), renderArea.left - 3, renderArea.top + Math.floor(renderArea.height / 2),
				{ size: 'small', align: 'right', vAlign: 'center' });
			var sliderPos = Math.ceil(180 * this._thrusters[i].targetThrust.getValue() /
				this._thrusters[i].targetThrust.getMaxValue());
			SLIDER_SPRITE.render(ctx, renderArea.left - 6 + sliderPos, renderArea.top - 9, 0);
		}
	};
	return ThrusterControlsConsole;
});