define([
	'client/net/GameConnection',
	'shared/game/Simulation',
	'client/game/Clock',
	'client/game/EventGenerator',
	'client/config',
	'shared/config'
], function(
	GameConnection,
	Simulation,
	Clock,
	EventGenerator,
	config,
	sharedConfig
) {
	return function(simulation, ctx, renderMode) {
		var i;
		if(renderMode === 'background') {
			ctx.fillStyle = '#fff';
			ctx.fillRect(0, 0, config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
		}
		else if(renderMode === 'silhouettes') {
			ctx.fillStyle = '#0f6';
			for(i = 0; i < simulation.entities.length; i++) {
				ctx.fillRect(simulation.entities[i].left, simulation.entities[i].top,
					simulation.entities[i].width, simulation.entities[i].height);
			}
		}
		else if(renderMode === 'outlines') {
			ctx.strokeStyle = '#0f6';
			ctx.lineWidth = 1;
			for(i = 0; i < simulation.entities.length; i++) {
				ctx.strokeRect(simulation.entities[i].left, simulation.entities[i].top,
					simulation.entities[i].width, simulation.entities[i].height);
			}
		}
		else {
			ctx.strokeStyle = '#000';
			ctx.lineWidth = 2;
			for(i = 0; i < simulation.entities.length; i++) {
				var entity = simulation.entities[i];
				ctx.fillStyle = '#f00';
				if(entity.entityType === 'Player') {
					if(entity.task === 'charging-swing') {
						ctx.fillStyle = '#f08';
					}
					else if(entity.task === 'swinging') {
						ctx.fillStyle = '#f0f';
					}
				}
				ctx.fillRect(entity.left, entity.top, entity.width, entity.height);
				if(entity.entityType === 'Player') {
					if(entity.isAiming()) {
						ctx.beginPath();
						ctx.moveTo(entity.centerX, entity.centerY);
						ctx.lineTo(entity.centerX + entity.aim * 100, entity.centerY - 50 - entity.charge * 100);
						ctx.stroke();
					}
					var hitBoxes = entity.getActiveHitBoxes();
					for(var j = hitBoxes.length - 1; j >= 0; j--) {
						var hitBox = hitBoxes[j];
						if(hitBox.isSweet) {
							ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
						}
						else if(hitBox.isSour) {
							ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
						}
						else {
							ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
						}
						ctx.fillRect(entity.centerX + hitBox.offsetX, entity.centerY + hitBox.offsetY,
							hitBox.width, hitBox.height);
					}
				}
			}
		}
	};
});