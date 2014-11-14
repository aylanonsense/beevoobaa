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
	var SPRITE = SpriteLoader.loadSpriteSheet('COURSE_DRIFT_CONSOLE');
	function CourseDriftConsole(update) {
		SUPERCLASS.call(this, update);
		this._drift = new DriftingValue({ initial: update.drift.value });
	}
	CourseDriftConsole.prototype = Object.create(SUPERCLASS.prototype);
	CourseDriftConsole.prototype.receiveUpdate = function(update) {
		SUPERCLASS.prototype.tick.call(this, update);
		this._drift.receiveUpdate(update.drift);
	};
	CourseDriftConsole.prototype.tick = function() {
		SUPERCLASS.prototype.tick.call(this);
		this._drift.tick();
	};
	CourseDriftConsole.prototype.render = function(ctx) {
		SUPERCLASS.prototype.render.call(this, ctx);
		var drift = (this._drift.getValue() * 180 / Math.PI) % 360;
		if(drift > 180) { drift -= 360; }
		else if(drift <= -180) { drift += 360; }
		var frame = (drift >= -5 ? Math.floor((drift + 5) / 10) : 36 + Math.floor((drift + 5) / 10));
		var renderArea = SPRITE.render(ctx, 500, 100, frame);
		TextWriter.write(
			ctx,
			StringUtils.formatNumber(drift, 1),
			renderArea.left + Math.floor(renderArea.width / 2),
			renderArea.bottom,
			{ size: 'small', align: 'center', vAlign: 'top' }
		);
	};
	return CourseDriftConsole;
});