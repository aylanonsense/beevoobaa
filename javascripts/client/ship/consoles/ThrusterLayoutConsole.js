if (typeof define !== 'function') { var define = require('amdefine')(module); }
define([
	'client/ship/Console',
	'client/Constants',
	'client/sprite/SpriteLoader',
	'client/util/TextWriter',
	'client/util/StringUtils',
	'client/util/DriftingValue',
	'client/util/Rect'
], function(
	SUPERCLASS,
	Constants,
	SpriteLoader,
	TextWriter,
	StringUtils,
	DriftingValue,
	Rect
) {
	var SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_LAYOUT_CONSOLE');
	var THRUSTER_SPRITE = SpriteLoader.loadSpriteSheet('THRUSTER_LAYOUT_CONSOLE_THRUSTER');
	function ThrusterLayoutConsole(x, y, update) {
		SUPERCLASS.call(this, x, y, update);
		this._thrusters = update.thrusters.map(function(thruster, i) {
			return {
				thrustPercent: new DriftingValue({ initial: thruster.thrustPercent.value, min: 0.00, max: 1.00 }),
				offset: thruster.offset,
				angle: thruster.angle
			};
		});
		this._width = SPRITE.width;
		this._height = SPRITE.height;
	}
	ThrusterLayoutConsole.prototype = Object.create(SUPERCLASS.prototype);
	ThrusterLayoutConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		for(var i = 0; i < this._thrusters.length; i++) {
			this._thrusters[i].thrustPercent.receiveUpdate(update.thrusters[i].thrustPercent);
		}
	};
	ThrusterLayoutConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		for(var i = 0; i < this._thrusters.length; i++) {
			this._thrusters[i].thrustPercent.tick();
		}
	};
	ThrusterLayoutConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		SPRITE.render(ctx, this._x, this._y, 0);
		for(var i = 0; i < this._thrusters.length; i++) {
			var frame = 1 + Math.floor(this._thrusters[i].thrustPercent.getValue() * 4);
			var angle = this._thrusters[i].angle * 180 / Math.PI;
			if(angle < 0) { angle += 360; }
			frame += 6 * Math.round(16 * angle / 360);
			var renderArea = THRUSTER_SPRITE.render(ctx,
				Math.floor(this._x + SPRITE.width * (0.5 - this._thrusters[i].offset.y / 6) - THRUSTER_SPRITE.width / 2),
				Math.floor(this._y + SPRITE.height * (0.5 - this._thrusters[i].offset.x / 6) - THRUSTER_SPRITE.height / 2),
				frame);
			//create labels
			if(Math.abs(this._thrusters[i].offset.x) > Math.abs(this._thrusters[i].offset.y)) {
				//create top label
				if(this._thrusters[i].offset.x > 0) {
					TextWriter.write(ctx, '' + (i + 1), renderArea.center.x + 2, this._y + 6, { size: 'small', align: 'center', vAlign: 'top' });
				}
				//create bottom label
				else {
					TextWriter.write(ctx, '' + (i + 1), renderArea.center.x + 2, this._y + SPRITE.height - 6, { size: 'small', align: 'center', vAlign: 'bottom' });
				}
			}
			else {
				//create left label
				if(this._thrusters[i].offset.y > 0) {
					TextWriter.write(ctx, '' + (i + 1), this._x + 6, renderArea.center.y, { size: 'small', align: 'left', vAlign: 'center' });
				}
				//create right label
				else {
					TextWriter.write(ctx, '' + (i + 1), this._x + SPRITE.width - 6, renderArea.center.y, { size: 'small', align: 'right', vAlign: 'center' });
				}
			}
		}
	};
	return ThrusterLayoutConsole;
});